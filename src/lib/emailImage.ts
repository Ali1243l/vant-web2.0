const publicImages = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';

export function normalizeEmailImageUrl(source: string): string {
  let value = (source || '').trim();
  // Repair URLs saved by the old uploader, which prepended the bucket to an absolute URL.
  for (let i = 0; i < 4 && value.startsWith(publicImages + publicImages); i++) value = value.slice(publicImages.length);
  if (!value || /^(data|blob|file|javascript):/i.test(value) || value.startsWith('//')) return '';
  if (!/^https?:\/\//i.test(value)) {
    const path = value.replace(/^\/+/, '').replace(/^product-images\//, '');
    if (!/^(newsletter-banners|catalog|banners|trends|optimized)\//.test(path)) return '';
    value = publicImages + path;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || value.startsWith(publicImages + 'https://')) return '';
    if (url.hostname === 'images.unsplash.com') { url.searchParams.delete('auto'); url.searchParams.set('fm', 'jpg'); }
    return url.toString();
  } catch { return ''; }
}

export class EmailImageError extends Error {}

export function normalizeEmailHtmlImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, tag => {
    const source = /(\ssrc\s*=\s*)(["'])(.*?)\2/i;
    const found = tag.match(source);
    if (!found) throw new EmailImageError('الصورة تحتاج رابط HTTPS عاماً. ارفع الصورة مجدداً قبل الإرسال.');
    const normalized = normalizeEmailImageUrl(found[3].replace(/&amp;|&#38;|&#x26;/gi, '&'));
    if (!normalized) throw new EmailImageError('رابط الصورة غير صالح للبريد. ارفع الصورة بدلاً من استعمال رابط محلي أو مؤقت.');
    return tag.replace(source, (_match, prefix) => `${prefix}"${normalized.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"`);
  });
}
