-- Keep visitor telemetry append-only and bounded; diagnostics remain admin-readable only.
drop policy if exists "Visitors can add" on public.logs;
create policy "Visitors can add" on public.logs for insert to anon, authenticated
with check (
  event_type in ('page_view','visitor_region','product_view','wishlist_toggle','size_select','whatsapp_order','search_query','category_filter','availability_filter','fit_calculator','image_slide','size_guide_open','coupon_copied','engagement_heartbeat','system_error')
  and device in ('mobile','desktop','tablet')
  and length(coalesce(session_id,'')) between 1 and 120
  and length(coalesce(visitor_id,'')) between 1 and 120
  and visit_count between 1 and 1000000
  and jsonb_typeof(data) = 'object'
  and octet_length(data::text) <= 32768
  and created_at between now() - interval '90 days' and now() + interval '15 minutes'
);

-- Email alone must never authorize deleting somebody else's subscription.
create or replace function public.unsubscribe_newsletter(p_email text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  delete from public.newsletter_subscribers where lower(email) = lower(trim(p_email));
end;
$$;
revoke execute on function public.unsubscribe_newsletter(text) from public, anon;
grant execute on function public.unsubscribe_newsletter(text) to authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
