-- ==============================================================================
-- VANT store security: real admin login + locked-down writes
-- Run once in Supabase > SQL Editor, AFTER creating your admin user in
-- Authentication > Users > Add user (email + password). Safe to re-run.
--
-- After this runs:
--   * Visitors can read products, settings and offers, place orders, sign up for the
--     newsletter and leave it. Nothing else.
--   * Only users listed in public.admins can change products, images, settings,
--     offers, orders or read subscribers/logs.
-- ==============================================================================

-- 1. Who is an admin -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY; -- no policies: not readable or writable through the API

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) $$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Put your admin email here (the user you created in Authentication > Users)
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('ADMIN_EMAIL_HERE')
ON CONFLICT DO NOTHING;

-- 2. Newsletter subscribers table (created if missing) -------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    tags TEXT[],
    subscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key ON public.newsletter_subscribers (lower(email));
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate emails already exist in newsletter_subscribers; remove them and re-run to stop future duplicates.';
END $$;

-- A visitor can remove their own email without being able to read the list
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_email TEXT)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ DELETE FROM public.newsletter_subscribers WHERE lower(email) = lower(trim(p_email)) $$;
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter(TEXT) TO anon, authenticated;

-- 3. Drop every old policy on the store's tables (the old ones let anyone write) -
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('products', 'product_media', 'orders', 'site_settings', 'offers', 'logs', 'newsletter_subscribers')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;

    FOR r IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND (coalesce(qual, '') || coalesce(with_check, '')) LIKE '%product-images%'
    LOOP
        EXECUTE format('DROP POLICY %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- 4. New policies ---------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
    -- Catalog and public config: everyone reads, admins write
    FOREACH t IN ARRAY ARRAY['products', 'product_media', 'site_settings', 'offers'] LOOP
        IF to_regclass('public.' || t) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('CREATE POLICY "Anyone can read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
            EXECUTE format('CREATE POLICY "Admins manage" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
        END IF;
    END LOOP;

    -- Orders: customers add a new pending order, only admins see or change them
    IF to_regclass('public.orders') IS NOT NULL THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Customers can place new orders" ON public.orders FOR INSERT TO anon, authenticated
            WITH CHECK (
                status = 'pending_payment'
                AND total_price >= 0
                AND jsonb_typeof(items) = 'array'
                AND jsonb_array_length(items) BETWEEN 1 AND 50
                AND length(customer_name) <= 120
                AND length(customer_phone) <= 40
                AND length(shipping_address) <= 600
            );
        CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
            USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;

    -- Newsletter and visit logs: visitors only add rows, admins read and manage
    FOREACH t IN ARRAY ARRAY['newsletter_subscribers', 'logs'] LOOP
        IF to_regclass('public.' || t) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('CREATE POLICY "Visitors can add" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
            EXECUTE format('CREATE POLICY "Admins manage" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
        END IF;
    END LOOP;
END $$;

-- 5. Images bucket: public to view, only admins upload/replace/delete -------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can view product-images" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload to product-images" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins delete from product-images" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

-- 6. Old public files that held customer emails or visit data -----------------
DELETE FROM storage.objects
WHERE bucket_id = 'product-images'
  AND name IN ('config/newsletter_subscribers.json', 'config/newsletter_campaigns.json', 'telemetry/events_stream.json');

-- Check: this should return true when run while signed in as the admin in the app,
-- and the next line should list exactly one row (your admin).
SELECT u.email FROM public.admins a JOIN auth.users u ON u.id = a.user_id;
