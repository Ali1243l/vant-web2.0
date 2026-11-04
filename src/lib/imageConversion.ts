const MAX_FILE_BYTES = 20 * 1024 * 1024;
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' };

export function imageBlobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function inspectImage(bytes: Uint8Array): { type: string; animated: boolean } {
  const text = new TextDecoder().decode(bytes.subarray(0, 4096));
  const tag = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: 'image/jpeg', animated: false };
  if (tag(0, 6) === 'GIF87a' || tag(0, 6) === 'GIF89a') return { type: 'image/gif', animated: true };
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const chunk = new TextDecoder().decode(bytes.subarray(offset + 4, offset + 8));
      if (chunk === 'acTL') return { type: 'image/png', animated: true };
      if (chunk === 'IDAT') break;
      offset += 12 + view.getUint32(offset);
    }
    return { type: 'image/png', animated: false };
  }
  if (tag(0, 4) === 'RIFF' && tag(8, 12) === 'WEBP') return { type: 'image/webp', animated: tag(12, 16) === 'VP8X' && Boolean(bytes[20] & 2) };
  if (tag(4, 8) === 'ftyp' && /avif|avis/.test(tag(8, 32))) return { type: 'image/avif', animated: tag(8, 32).includes('avis') };
  if (/<svg[\s>]/i.test(text)) return { type: 'image/svg+xml', animated: false };
  throw new Error('صيغة الصورة غير مدعومة أو الملف ليس صورة صحيحة.');
}

export function imageUploadPath(folder: string, name: string, type: string, version: string = crypto.randomUUID()): string {
  const extension = extensions[type];
  if (!extension) throw new Error('صيغة ناتج الصورة غير مدعومة.');
  const parts = name.replace(/\\/g, '/').split('/').filter(part => part && part !== '.' && part !== '..').map(part => part.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase());
  const stem = (parts.pop() || 'image').replace(/\.[^.]+$/, '') || 'image';
  return [folder, ...parts, `${stem}_${version}.${extension}`].join('/');
}

export function convertedImageChoice(original: Blob, candidates: Blob[], mustRasterize: boolean, resized: boolean): Blob {
  const best = candidates.filter(candidate => candidate.size > 0).sort((a, b) => a.size - b.size)[0];
  if (!best) throw new Error('تعذّر تحويل الصورة. جرّب ملف JPG أو PNG.');
  return !mustRasterize && !resized && best.size >= original.size * .95 ? original : best;
}

/** Decode as an image only: SVG documents never enter the page DOM. */
export async function smartConvertImage(input: Blob, maxWidth = 2048, maxHeight = 2560, quality = .9): Promise<Blob> {
  if (!input.size || input.size > MAX_FILE_BYTES) throw new Error('اختر صورة غير فارغة بحجم لا يتجاوز 20 ميغابايت.');
  if (![maxWidth, maxHeight, quality].every(Number.isFinite) || maxWidth <= 0 || maxHeight <= 0 || maxWidth > 4096 || maxHeight > 4096 || quality < .8 || quality > 1) throw new Error('إعدادات تحويل الصورة غير صالحة.');
  const bytes = new Uint8Array(await input.arrayBuffer());
  const { type, animated } = inspectImage(bytes);
  const original = input.type === type ? input : new Blob([input], { type });
  if (type === 'image/svg+xml') {
    const svg = new TextDecoder().decode(bytes);
    const externalReference = [...svg.matchAll(/\bhref\s*=\s*["']([^"']*)["']/gi)].some(([, value]) => value.trim() && !/^(data:|#)/i.test(value.trim()));
    if (externalReference || /<foreignObject\b|url\(\s*["']?https?:/i.test(svg)) throw new Error('الصورة SVG تعتمد على محتوى خارجي. صدّرها كصورة PNG أو JPG أولاً.');
  }
  const url = URL.createObjectURL(original);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('استغرقت قراءة الصورة وقتاً طويلاً. جرّب ملفاً أصغر.')), 15000);
      image.onload = () => { clearTimeout(timeout); resolve(); };
      image.onerror = () => { clearTimeout(timeout); reject(new Error('تعذّر قراءة الصورة. جرّب تصديرها كملف JPG أو PNG.')); };
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('أبعاد الصورة كبيرة جداً أو غير صالحة. الحد الأقصى 40 ميغابكسل.');
    if (animated) return original;
    const ratio = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('المتصفح لا يدعم تحويل الصور حالياً. جرّب متصفحاً آخر.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = false;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] !== 255) { transparent = true; break; }
    const encode = (format: string) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, format, quality));
    const candidates = [await encode('image/webp'), await encode(transparent ? 'image/png' : 'image/jpeg')].filter((blob): blob is Blob => Boolean(blob));
    // Check the returned MIME: browsers may return PNG when WebP encoding is unsupported.
    return convertedImageChoice(original, candidates, type === 'image/svg+xml', ratio < 1);
  } finally { URL.revokeObjectURL(url); }
}
