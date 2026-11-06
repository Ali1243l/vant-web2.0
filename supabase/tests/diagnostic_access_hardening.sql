begin;
do $$
begin
  assert not has_function_privilege('anon','public.is_admin()','execute');
  assert not has_function_privilege('anon','public.unsubscribe_newsletter(text)','execute');
  assert has_function_privilege('authenticated','public.is_admin()','execute');
  assert (select count(*) = 8 from pg_trigger where tgname='capture_admin_activity' and not tgisinternal);
  assert (select count(*) = 3 from pg_trigger where tgrelid='storage.objects'::regclass and tgname like 'capture_store_file_%');
  update public.site_settings set settings=coalesce(settings,'{}'::jsonb) || '{"audit_self_check":true,"password":"CHECK_ONLY_NOT_A_SECRET"}'::jsonb where id=1;
  update public.site_settings set settings=settings where id=1;
  assert (select count(*)=1 from public.admin_activity where transaction_id=txid_current());
  assert (select bool_and(before_data is not null and after_data->'settings'->>'password'='[REDACTED]' and occurred_at is not null and 'settings'=any(changed_fields)) from public.admin_activity where transaction_id=txid_current());
end $$;
rollback;

begin;
do $$
begin
  update storage.objects set last_accessed_at=clock_timestamp()
    where bucket_id='product-images' and name='config/site_settings.json';
  assert (select count(*)=0 from public.admin_activity where transaction_id=txid_current());
  update storage.objects set user_metadata=coalesce(user_metadata,'{}'::jsonb) || '{"audit_self_check":true}'::jsonb
    where bucket_id='product-images' and name='config/site_settings.json';
  assert (select count(*)=1 from public.admin_activity where transaction_id=txid_current());
end $$;
rollback;

begin;
set local role anon;
insert into public.logs(event_type,session_id,visitor_id,visit_count,device,data)
values ('system_error','rollback-self-check','rollback-self-check',1,'desktop','{"kind":"diagnostic"}');
do $$
begin
  begin
    insert into public.logs(event_type,session_id,visitor_id,visit_count,device,data)
    values ('invalid_type','rollback-self-check','rollback-self-check',1,'desktop','{}');
    raise exception 'Invalid telemetry was accepted';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.logs(event_type,session_id,visitor_id,visit_count,device,data)
    values ('system_error','rollback-self-check','rollback-self-check',1,'desktop',jsonb_build_object('too_large',repeat('x',33000)));
    raise exception 'Oversized telemetry was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
