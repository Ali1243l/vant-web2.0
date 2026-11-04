-- Run as the database owner. Every fixture and audit event is rolled back.
begin;
create temporary table audit_selfcheck (id text primary key, payload jsonb) on commit drop;
create trigger capture_admin_activity after insert or update or delete on audit_selfcheck
  for each row execute function public.capture_admin_activity();
insert into audit_selfcheck values ('AUDIT-SELF-CHECK', '{"price":10,"nested":{"password":"fixture-secret","apiKey":"fixture-key"},"images":["data:image/png;base64,AA=="]}');
update audit_selfcheck set payload = jsonb_set(payload, '{price}', '0') where id = 'AUDIT-SELF-CHECK';
update audit_selfcheck set payload = payload where id = 'AUDIT-SELF-CHECK';
do $$ begin
  if (select count(*) from public.admin_activity where table_name = 'audit_selfcheck' and record_id = 'AUDIT-SELF-CHECK' and transaction_id = txid_current()) <> 2 then raise exception 'Expected insert/update and no no-op event'; end if;
  if exists(select 1 from public.admin_activity where table_name = 'audit_selfcheck' and transaction_id = txid_current() and (coalesce(before_data::text,'') || coalesce(after_data::text,'')) ~ '(fixture-secret|fixture-key|base64)') then raise exception 'Secret or inline media leaked'; end if;
  if not exists(select 1 from public.admin_activity where table_name = 'audit_selfcheck' and transaction_id = txid_current() and action='UPDATE' and before_data #>> '{payload,price}' = '10' and after_data #>> '{payload,price}' = '0' and changed_fields = array['payload']) then raise exception 'Before/after snapshot incorrect'; end if;
  if has_table_privilege('anon','public.admin_activity','SELECT') or has_table_privilege('authenticated','public.admin_activity','INSERT,UPDATE,DELETE') then raise exception 'Unsafe table grants'; end if;
  if has_function_privilege('authenticated','public.capture_admin_activity()','EXECUTE') or has_function_privilege('anon','public.capture_admin_activity()','EXECUTE') then raise exception 'Trigger function is externally callable'; end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000000', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.admin_activity where table_name='audit_selfcheck' and transaction_id=txid_current()) then raise exception 'Non-admin can read activity'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', (select user_id::text from public.admins limit 1), true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.admin_activity where table_name='audit_selfcheck' and transaction_id=txid_current()) <> 2 then raise exception 'Admin cannot read activity'; end if;
end $$;
reset role;
rollback;
select 'Audit self-check passed; all fixtures rolled back' as result;
