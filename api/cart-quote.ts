import { createClient } from '@supabase/supabase-js';
import { verifyCart, productForCartQuote } from '../src/lib/cartQuote';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !Array.isArray(body.items) || body.items.length > 200 || JSON.stringify(body).length > 250000 || typeof body.code !== 'string' || body.code.length > 40) return res.status(400).json({ error: 'cart' });
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return res.status(503).json({ error: 'unavailable' });
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const ids = [...new Set(body.items.map((item: any) => item?.productId))];
    if (ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,120}$/.test(id))) return res.status(400).json({ error: 'cart' });
    const { data, error } = await client.from('products').select('id,title,price,category,status,sizes,colors,admin_metadata').in('id', ids).abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    let offers: unknown[] = [];
    if (body.code.trim()) {
      const response = await fetch(`${url}/storage/v1/object/public/product-images/config/offers.json?quote=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw Error('Coupon source unavailable');
      const text = await response.text();
      if (text.length > 1000000) throw Error('Invalid coupon source');
      offers = JSON.parse(text);
      if (!Array.isArray(offers)) throw Error('Invalid coupon source');
    }
    return res.status(200).json(verifyCart(body.items, (data || []).map(productForCartQuote), offers, body.code));
  } catch (error) {
    console.error('Cart quote failed', error instanceof Error ? error.name : 'unknown');
    return res.status(error instanceof SyntaxError || error instanceof Error && error.message === 'cart' ? 400 : 503).json({ error: 'quote_unavailable' });
  }
}
export const config = { api: { bodyParser: { sizeLimit: '256kb' } } };
