export const config = {
  runtime: 'nodejs',
};

// Link-preview bots (WhatsApp, Instagram, Telegram...) don't run JS, so vercel.json sends them here
// for ?item= links and they get the piece's own photo, name and price; the bare home link gets the store card
// with an absolute image URL, which most preview bots require.

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const UUID = /^[0-9a-f-]{8,64}$/i;

export async function loadProduct(id: string) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !UUID.test(id)) return null;
  const res = await fetch(
    `${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=title,description,price,product_media(media_url,display_order)`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!res.ok) return null;
  const [p] = await res.json();
  if (!p) return null;
  const media = [...(p.product_media || [])].sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
  return {
    title: String(p.title || 'VANT'),
    description: String(p.description || ''),
    price: Number(p.price) || 0,
    image: media[0]?.media_url as string | undefined,
  };
}

export function renderPreview(pageUrl: string, product: Awaited<ReturnType<typeof loadProduct>>, fallbackImage: string) {
  const title = product ? `${product.title} | VANT فانت` : 'VANT | فانت';
  const price = product?.price ? `${Math.round(product.price).toLocaleString('en-US')} د.ع` : '';
  const description = [price, product?.description].filter(Boolean).join(' · ').slice(0, 200) || 'أزياء مختارة، توصيل لكل العراق والدفع عند الاستلام';
  const image = product?.image || fallbackImage;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(pageUrl);
  const i = escapeHtml(image);
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>${t}</title><meta name="description" content="${d}">
<meta property="og:site_name" content="VANT فانت"><meta property="og:type" content="product">
<meta property="og:title" content="${t}"><meta property="og:description" content="${d}">
<meta property="og:url" content="${u}"><meta property="og:image" content="${i}"><meta property="og:image:secure_url" content="${i}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}"><meta name="twitter:image" content="${i}">
</head><body><a href="${u}">${t}</a></body></html>`;
}

export default async function handler(req: any, res: any) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'vant-web.vercel.app';
  const id = String(req.query?.item || '');
  const pageUrl = id ? `https://${host}/?item=${encodeURIComponent(id)}` : `https://${host}/`;
  let product = null;
  try {
    product = await loadProduct(id);
  } catch {
    // Fall back to the store's own card
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(renderPreview(pageUrl, product, `https://${host}/og-image.png`));
}
