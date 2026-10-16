-- ==============================================================================
-- VANT store orders
-- Run once in Supabase > SQL Editor. Safe to re-run.
-- Customers (anon) can only ADD an order; nobody without an admin login can read
-- them, because each row holds a customer's phone number and address.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL DEFAULT '',
    customer_phone TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    shipping_address TEXT NOT NULL DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_payment',
    type TEXT NOT NULL DEFAULT 'ready_to_wear',
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can place new orders" ON public.orders;
CREATE POLICY "Customers can place new orders"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending_payment');

DROP POLICY IF EXISTS "Signed-in admins manage orders" ON public.orders;
CREATE POLICY "Signed-in admins manage orders"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
