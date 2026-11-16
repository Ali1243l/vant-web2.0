-- Private customer data; administrator login and the existing catalog are untouched.
create table public.shopper_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null default '{"revision":0,"cart":{},"wishlist":{},"coupon":"","tombstones":{}}',
  updated_at timestamptz not null default now()
);
create table public.shopper_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(user_id,operation_id)
);
alter table public.shopper_state enable row level security;
alter table public.shopper_receipts enable row level security;
revoke all on public.shopper_state, public.shopper_receipts from public, anon, authenticated;

create function public.apply_shopper_operation(doc jsonb, op jsonb) returns jsonb
language plpgsql immutable set search_path=pg_catalog,public as $$
declare kind text := op->>'kind'; k text := op->>'key'; item jsonb := op->'item'; qty integer; delta integer; row_item jsonb; pid text;
begin
  if kind in ('delta','remove','wish') and (k is null or length(k) not between 1 and 500 or k in ('__proto__','constructor','prototype')) then raise exception 'Invalid shopping key'; end if;
  if kind = 'delta' then
    if jsonb_typeof(item) is distinct from 'object' or length(coalesce(item->>'productId','')) not between 1 and 120
      or item->>'id' is distinct from k or length(coalesce(item->>'title','')) > 250 or length(coalesce(item->>'image','')) > 2048
      or length(coalesce(item->>'size','')) > 80 or length(coalesce(item->>'variantId','')) > 120 or length(coalesce(item->>'color','')) > 200
      or coalesce(item->>'price','') !~ '^\d{1,10}$' or coalesce(op->>'delta','') !~ '^-?\d{1,2}$' then raise exception 'Invalid cart item'; end if;
    delta := (op->>'delta')::integer;
    if not coalesce((op->>'restore')::boolean,false) and coalesce((doc->'tombstones'->>k)::bigint,0) > coalesce((op->>'base')::bigint,0) then return doc; end if;
    qty := least(99,greatest(0,coalesce((doc->'cart'->k->>'quantity')::integer,0) + delta));
    if qty = 0 then
      doc := jsonb_set(doc,'{cart}',(doc->'cart')-k);
      return jsonb_set(doc,array['tombstones',k],to_jsonb((doc->>'revision')::bigint+1));
    end if;
    item := jsonb_build_object('id',k,'productId',item->>'productId','variantId',item->>'variantId','title',coalesce(item->>'title',''),'image',coalesce(item->>'image',''),'price',(item->>'price')::bigint,'quantity',qty,'size',item->>'size','color',item->>'color');
    return jsonb_set(doc,array['cart',k],item);
  elsif kind = 'remove' then
    doc := jsonb_set(doc,'{cart}',(doc->'cart')-k);
    return jsonb_set(doc,array['tombstones',k],to_jsonb((doc->>'revision')::bigint+1));
  elsif kind = 'wish' then
    if length(k)>120 or jsonb_typeof(op->'enabled') is distinct from 'boolean' then raise exception 'Invalid wishlist operation'; end if;
    if (op->>'enabled')::boolean then return jsonb_set(doc,array['wishlist',k],'true'); end if;
    return jsonb_set(doc,'{wishlist}',(doc->'wishlist')-k);
  elsif kind = 'coupon' then
    if length(coalesce(op->>'code',''))>40 then raise exception 'Invalid coupon'; end if;
    return jsonb_set(doc,'{coupon}',to_jsonb(upper(trim(coalesce(op->>'code','')))));
  elsif kind = 'merge' then
    if jsonb_typeof(op->'cart') is distinct from 'array' or jsonb_array_length(op->'cart')>200 or jsonb_typeof(op->'wishlist') is distinct from 'array' or jsonb_array_length(op->'wishlist')>2000 then raise exception 'Invalid guest import'; end if;
    for row_item in select value from jsonb_array_elements(op->'cart') loop
      if coalesce(row_item->>'quantity','') !~ '^\d{1,2}$' or (row_item->>'quantity')::integer<1 then raise exception 'Invalid guest quantity'; end if;
      doc := public.apply_shopper_operation(doc,jsonb_build_object('kind','delta','key',row_item->>'id','item',row_item,'delta',(row_item->>'quantity')::integer,'base',0));
    end loop;
    for pid in select value from jsonb_array_elements_text(op->'wishlist') loop
      doc := public.apply_shopper_operation(doc,jsonb_build_object('kind','wish','key',pid,'enabled',true));
    end loop;
    if coalesce(doc->>'coupon','')='' then doc := public.apply_shopper_operation(doc,jsonb_build_object('kind','coupon','code',coalesce(op->>'code',''))); end if;
    return doc;
  end if;
  raise exception 'Unsupported shopping operation';
end $$;
revoke execute on function public.apply_shopper_operation(jsonb,jsonb) from public,anon,authenticated;

create function public.sync_shopper(p_owner uuid,p_operations jsonb default '[]') returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare actor uuid := auth.uid(); doc jsonb; op jsonb; acknowledged jsonb := '[]'; adjusted jsonb := '[]'; before_doc jsonb; v_operation_id uuid; changed boolean := false;
begin
  if actor is null or actor is distinct from p_owner or not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then raise exception 'Not authorized' using errcode='42501'; end if;
  if jsonb_typeof(p_operations) is distinct from 'array' or jsonb_array_length(p_operations)>200 or octet_length(p_operations::text)>1048576 then raise exception 'Invalid shopping batch'; end if;
  insert into public.shopper_state(user_id) values(actor) on conflict do nothing;
  select document into doc from public.shopper_state where user_id=actor for update;
  for op in select value from jsonb_array_elements(p_operations) loop
    v_operation_id := (op->>'id')::uuid;
    if v_operation_id is null or coalesce(op->>'base','') !~ '^\d{1,15}$' then raise exception 'Invalid operation identity'; end if;
    acknowledged := acknowledged || to_jsonb(v_operation_id::text);
    if exists(select 1 from public.shopper_receipts where user_id=actor and shopper_receipts.operation_id=v_operation_id) then continue; end if;
    before_doc := doc;
    doc := public.apply_shopper_operation(doc,op);
    if op->>'kind' in ('delta','merge') and doc = before_doc then adjusted := adjusted || to_jsonb(v_operation_id::text); end if;
    if op->>'kind'='merge' and exists(select 1 from jsonb_array_elements(op->'cart') as entry(value) where coalesce((before_doc->'cart'->(entry.value->>'id')->>'quantity')::integer,0)+(entry.value->>'quantity')::integer>99) then adjusted := adjusted || to_jsonb(v_operation_id::text); end if;
    if op->>'kind'='delta' and coalesce((before_doc->'cart'->(op->>'key')->>'quantity')::integer,0)+coalesce((op->>'delta')::integer,0)>99 then adjusted := adjusted || to_jsonb(v_operation_id::text); end if;
    doc := jsonb_set(doc,'{revision}',to_jsonb((doc->>'revision')::bigint+1));
    insert into public.shopper_receipts(user_id,operation_id) values(actor,v_operation_id);
    changed := true;
  end loop;
  if (select count(*) from jsonb_object_keys(doc->'cart'))>200 or (select count(*) from jsonb_object_keys(doc->'wishlist'))>2000 or octet_length(doc::text)>1048576 then raise exception 'Shopping list limit reached'; end if;
  if changed then update public.shopper_state set document=doc,updated_at=clock_timestamp() where user_id=actor; end if;
  return jsonb_build_object('document',doc,'acknowledged',acknowledged,'adjusted',adjusted);
end $$;
revoke execute on function public.sync_shopper(uuid,jsonb) from public,anon;
grant execute on function public.sync_shopper(uuid,jsonb) to authenticated;

-- A fixed readiness response avoids sending sign-in mail before sync is installed.
create function public.shopper_sync_ready() returns boolean language sql stable set search_path=pg_catalog as $$select true$$;
revoke execute on function public.shopper_sync_ready() from public;
grant execute on function public.shopper_sync_ready() to anon,authenticated;
