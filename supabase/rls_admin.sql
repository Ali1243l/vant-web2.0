-- ==============================================================================
-- VANT: ADMIN-ONLY WRITES (run in Supabase SQL Editor, AFTER the admin account
-- exists in Authentication > Users with the email below).
--
-- Replaces the open "anon" write policies from schema.sql and fix_rls.sql.
-- Public users keep read access. Only a signed-in Supabase Auth session whose
-- email is the admin email can insert, update or delete.
--
-- Do NOT re-run schema.sql or fix_rls.sql after this: they reopen the writes.
-- ==============================================================================

-- 1. Single source of truth for "is this request from the admin?"
CREATE OR REPLACE FUNCTION public.is_vant_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'abutrabali40@gmail.com';
$$;

-- 2. Drop the old open write policies (names come from schema.sql / fix_rls.sql)
DROP POLICY IF EXISTS "Allow insert for products" ON public.products;
DROP POLICY IF EXISTS "Allow update for products" ON public.products;
DROP POLICY IF EXISTS "Allow delete for products" ON public.products;
DROP POLICY IF EXISTS "Allow insert for product media" ON public.product_media;
DROP POLICY IF EXISTS "Allow update for product media" ON public.product_media;
DROP POLICY IF EXISTS "Allow delete for product media" ON public.product_media;
DROP POLICY IF EXISTS "Allow upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from product-images" ON storage.objects;

-- 3. products: public read, admin write
CREATE POLICY "Admin insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_vant_admin());
CREATE POLICY "Admin update products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_vant_admin()) WITH CHECK (public.is_vant_admin());
CREATE POLICY "Admin delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_vant_admin());

-- 4. product_media: public read, admin write
CREATE POLICY "Admin insert product media" ON public.product_media
  FOR INSERT TO authenticated WITH CHECK (public.is_vant_admin());
CREATE POLICY "Admin update product media" ON public.product_media
  FOR UPDATE TO authenticated USING (public.is_vant_admin()) WITH CHECK (public.is_vant_admin());
CREATE POLICY "Admin delete product media" ON public.product_media
  FOR DELETE TO authenticated USING (public.is_vant_admin());

-- 5. Storage bucket product-images: public read, admin write
CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_vant_admin());
CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_vant_admin());
CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_vant_admin());

-- ------------------------------------------------------------------------------
-- NOT COVERED YET (the tables are not defined in this repo):
--   site_settings : the admin saves settings from the client, so its write
--                   policies must also be restricted with public.is_vant_admin().
--   orders        : admin reads and updates; online checkout will need an
--                   anon INSERT-only policy. Do this with the checkout feature.
-- ------------------------------------------------------------------------------
