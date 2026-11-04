-- Successful row changes only; storage JSON contents and failed requests need a separate server write path.
create table public.admin_activity (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default clock_timestamp(),
  transaction_id bigint not null default txid_current(),
  actor_id uuid,
  actor_kind text not null check (actor_kind in ('admin', 'user', 'database')),
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  changed_fields text[] not null,
  before_data jsonb,
  after_data jsonb
);
create index admin_activity_time_idx on public.admin_activity (occurred_at desc, id desc);
create index admin_activity_table_time_idx on public.admin_activity (table_name, occurred_at desc, id desc);
alter table public.admin_activity enable row level security;
revoke all on public.admin_activity from public, anon, authenticated;
revoke all on sequence public.admin_activity_id_seq from public, anon, authenticated;
grant select on public.admin_activity to authenticated;
create policy admin_activity_read on public.admin_activity for select to authenticated
  using ((select public.is_admin()));

create function public.redact_admin_activity(value jsonb) returns jsonb
language plpgsql immutable set search_path = pg_catalog, public as $$
declare result jsonb; entry record;
begin
  if value is null then return null; end if;
  if jsonb_typeof(value) = 'object' then
    result := '{}'::jsonb;
    for entry in select key, val from jsonb_each(value) as e(key, val) loop
      result := result || jsonb_build_object(entry.key,
        case when entry.key ~* '(password|passwd|secret|token|api.?key|authorization|cookie|credential|^pin$|admin.?pin)'
          then '"[REDACTED]"'::jsonb else public.redact_admin_activity(entry.val) end);
    end loop;
    return result;
  elsif jsonb_typeof(value) = 'array' then
    select coalesce(jsonb_agg(public.redact_admin_activity(element) order by ordinal), '[]'::jsonb)
      into result from jsonb_array_elements(value) with ordinality as e(element, ordinal);
    return result;
  elsif jsonb_typeof(value) = 'string' and (value #>> '{}') ~* '^data:' then
    return '"[INLINE MEDIA OMITTED]"'::jsonb;
  end if;
  return value;
end $$;
revoke execute on function public.redact_admin_activity(jsonb) from public, anon, authenticated;

create function public.capture_admin_activity() returns trigger
language plpgsql security definer set search_path = pg_catalog, public as $$
declare old_row jsonb; new_row jsonb; fields text[]; actor uuid := auth.uid();
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  if tg_op = 'UPDATE' and old_row = new_row then return new; end if;
  select array_agg(key order by key) into fields from (
    select jsonb_object_keys(coalesce(old_row, '{}'::jsonb) || coalesce(new_row, '{}'::jsonb)) as key
  ) as keys where old_row -> key is distinct from new_row -> key;
  insert into public.admin_activity(actor_id, actor_kind, table_name, record_id, action, changed_fields, before_data, after_data)
    values (actor, case when actor is null then 'database' when public.is_admin() then 'admin' else 'user' end,
      tg_table_name, coalesce(new_row ->> 'id', old_row ->> 'id', new_row ->> 'user_id', old_row ->> 'user_id', ''),
      tg_op, coalesce(fields, array[]::text[]), public.redact_admin_activity(old_row), public.redact_admin_activity(new_row));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
revoke execute on function public.capture_admin_activity() from public, anon, authenticated;

do $$ declare target text;
begin
  foreach target in array array['products', 'product_media', 'orders', 'offers', 'newsletter_subscribers', 'site_settings', 'app_settings', 'admins'] loop
    execute format('create trigger capture_admin_activity after insert or update or delete on public.%I for each row execute function public.capture_admin_activity()', target);
  end loop;
end $$;
