-- Public presentation settings remain readable; only verified admins may change them.
alter table public.app_settings enable row level security;
revoke insert, update, delete, truncate, references, trigger on public.app_settings from anon;
revoke truncate, references, trigger on public.app_settings from authenticated;
create policy app_settings_public_read on public.app_settings for select to anon, authenticated using (true);
create policy app_settings_admin_write on public.app_settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());
