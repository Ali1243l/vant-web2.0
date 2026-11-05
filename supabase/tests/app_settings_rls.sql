begin;
do $$
begin
  assert (select relrowsecurity from pg_class where oid = 'public.app_settings'::regclass), 'RLS must be enabled';
  assert has_table_privilege('anon', 'public.app_settings', 'SELECT'), 'Public presentation settings must remain readable';
  assert not has_table_privilege('anon', 'public.app_settings', 'UPDATE'), 'Anonymous updates must be denied';
  assert not has_table_privilege('anon', 'public.app_settings', 'INSERT'), 'Anonymous inserts must be denied';
  assert not has_table_privilege('anon', 'public.app_settings', 'DELETE'), 'Anonymous deletion must be denied';
  assert not has_table_privilege('anon', 'public.app_settings', 'TRUNCATE'), 'Anonymous truncate must be denied';
  assert not has_table_privilege('authenticated', 'public.app_settings', 'TRUNCATE'), 'Truncate must not bypass row policies';
end $$;
set local role anon;
select id from public.app_settings limit 1;
do $$
begin
  begin
    update public.app_settings set splash_enabled = splash_enabled where false;
    raise exception 'Anonymous update unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
