alter table public.products add column admin_metadata jsonb not null default '{}'::jsonb
  check (jsonb_typeof(admin_metadata) = 'object');

create function public.save_catalog_product(p_id uuid, p_fields jsonb, p_metadata jsonb, p_media text[] default null)
returns jsonb language plpgsql security invoker set search_path = pg_catalog, public as $$
declare saved public.products; item text;
begin
  if not public.is_admin() then raise exception 'Admin session required' using errcode = '42501'; end if;
  if jsonb_typeof(p_fields) is distinct from 'object' or jsonb_typeof(p_metadata) is distinct from 'object' then raise exception 'Invalid product payload'; end if;
  if exists(select 1 from jsonb_object_keys(p_fields) as k where k not in ('title','price','category','description','material','fit_details','sizes','colors','status','is_exclusive_drop')) then raise exception 'Unsupported product field'; end if;
  if exists(select 1 from jsonb_object_keys(p_metadata) as k where k not in ('title_ar','description_ar','category_ar','is_offer','original_price','offer_badge_ar','offer_badge_en','tags','catalog_image','image_url','images','colors','variants','sku','stock')) then raise exception 'Unsupported metadata field'; end if;
  if p_fields ? 'price' and (jsonb_typeof(p_fields->'price') is distinct from 'number' or (p_fields->>'price')::numeric <= 0) then raise exception 'Invalid price'; end if;
  if p_metadata ? 'stock' and p_metadata->'stock' <> 'null'::jsonb and ((p_metadata->>'stock')::numeric < 0 or (p_metadata->>'stock')::numeric <> trunc((p_metadata->>'stock')::numeric)) then raise exception 'Invalid stock'; end if;
  if p_media is not null then
    foreach item in array p_media loop
      if item is null or item !~ '^https://' then raise exception 'Upload images before saving'; end if;
    end loop;
  end if;
  if p_id is null then
    if nullif(btrim(p_fields->>'title'),'') is null then raise exception 'Product title required'; end if;
    insert into public.products(title, price, category, description, material, fit_details, sizes, colors, status, is_exclusive_drop, admin_metadata)
      values(p_fields->>'title', (p_fields->>'price')::numeric, coalesce(p_fields->>'category','Outerwear'), coalesce(p_fields->>'description',''), coalesce(p_fields->>'material',''), coalesce(p_fields->>'fit_details',''),
        coalesce(array(select jsonb_array_elements_text(p_fields->'sizes')),array[]::text[]), coalesce(array(select jsonb_array_elements_text(p_fields->'colors')),array[]::text[]), coalesce(p_fields->>'status','AVAILABLE'), coalesce((p_fields->>'is_exclusive_drop')::boolean,false), p_metadata)
      returning * into saved;
  else
    select * into saved from public.products where id=p_id for update;
    if not found then raise exception 'Product not found'; end if;
    update public.products set
      title=case when p_fields ? 'title' then p_fields->>'title' else saved.title end,
      price=case when p_fields ? 'price' then (p_fields->>'price')::numeric else saved.price end,
      category=case when p_fields ? 'category' then p_fields->>'category' else saved.category end,
      description=case when p_fields ? 'description' then p_fields->>'description' else saved.description end,
      material=case when p_fields ? 'material' then p_fields->>'material' else saved.material end,
      fit_details=case when p_fields ? 'fit_details' then p_fields->>'fit_details' else saved.fit_details end,
      sizes=case when p_fields ? 'sizes' then array(select jsonb_array_elements_text(p_fields->'sizes')) else saved.sizes end,
      colors=case when p_fields ? 'colors' then array(select jsonb_array_elements_text(p_fields->'colors')) else saved.colors end,
      status=case when p_fields ? 'status' then p_fields->>'status' else saved.status end,
      is_exclusive_drop=case when p_fields ? 'is_exclusive_drop' then (p_fields->>'is_exclusive_drop')::boolean else saved.is_exclusive_drop end,
      admin_metadata=saved.admin_metadata || p_metadata
      where id=p_id returning * into saved;
  end if;
  if p_media is not null and coalesce((select array_agg(media_url order by display_order, id) from public.product_media where product_id=saved.id),array[]::text[]) is distinct from p_media then
    delete from public.product_media where product_id=saved.id;
    insert into public.product_media(product_id, media_url, display_order)
      select saved.id, url, ordinal::integer from unnest(p_media) with ordinality as m(url, ordinal);
  end if;
  return to_jsonb(saved) || jsonb_build_object('product_media',(select coalesce(jsonb_agg(to_jsonb(m) order by m.display_order, m.id),'[]'::jsonb) from public.product_media m where m.product_id=saved.id));
end $$;
revoke execute on function public.save_catalog_product(uuid,jsonb,jsonb,text[]) from public, anon;
grant execute on function public.save_catalog_product(uuid,jsonb,jsonb,text[]) to authenticated;
