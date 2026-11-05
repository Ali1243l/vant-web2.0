-- Owner-run integration check. No fixture survives the final rollback.
begin;
select set_config('request.jwt.claim.sub', (select user_id::text from public.admins limit 1), true);
set local role authenticated;
do $$ declare saved jsonb; item_id uuid; audit_count bigint;
begin
  saved := public.save_catalog_product(null, '{"title":"ATOMIC-SAVE-SELF-CHECK","price":25000,"category":"Test","sizes":["M"]}', '{"title_ar":"ATOMIC-SAVE-SELF-CHECK","stock":5,"sku":"SELF-CHECK","variants":[{"id":"test","images":["https://example.test/a.jpg"]}]}', array['https://example.test/a.jpg']);
  item_id := (saved->>'id')::uuid;
  if saved #>> '{admin_metadata,stock}' <> '5' or jsonb_array_length(saved->'product_media') <> 1 then raise exception 'Incomplete create'; end if;
  saved := public.save_catalog_product(item_id, '{"price":20000}', '{"stock":0}', null);
  if saved->>'price' <> '20000' and (saved->>'price')::numeric <> 20000 then raise exception 'Price missing'; end if;
  if saved #>> '{admin_metadata,stock}' <> '0' or saved #>> '{admin_metadata,sku}' <> 'SELF-CHECK' or jsonb_array_length(saved->'product_media') <> 1 then raise exception 'Partial update erased existing fields'; end if;
  select count(*) into audit_count from public.admin_activity where record_id=item_id::text;
  begin
    perform public.save_catalog_product(item_id, '{"price":-1}', '{}', array['data:image/png;base64,AA==']);
    raise exception 'Invalid save unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Invalid save unexpectedly succeeded' then raise; end if;
  end;
  if (select price from public.products where id=item_id) <> 20000 or (select count(*) from public.product_media where product_id=item_id) <> 1 then raise exception 'Failed save changed persisted product'; end if;
  if (select count(*) from public.admin_activity where record_id=item_id::text) <> audit_count then raise exception 'Failed save left an audit event'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000000',true);
set local role authenticated;
do $$ begin
  begin
    perform public.save_catalog_product(null, '{"title":"DENIED-SELF-CHECK","price":1}', '{}', null);
    raise exception 'Non-admin save unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
select 'Atomic save checks passed; all fixtures rolled back' as result;
