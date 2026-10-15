// Shrinks photos before upload. Originals from phones are often 3-6 MB; the storefront
// only needs ~1200px WebP (about 100-250 KB). Every visitor downloads these images,
// so this is what keeps bandwidth (egress) low.

const MAX_SIDE = 1200;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 150 * 1024;
const COMPRESSIBLE = ['image/jpeg', 'image/png', 'image/webp'];

export async function compressImageFile(file: File): Promise<File> {
  // Leave GIFs, SVGs, and already-small files alone.
  if (!COMPRESSIBLE.includes(file.type) || file.size <= SKIP_BELOW_BYTES) return file;
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });
    // Keep the original if re-encoding did not actually save space.
    if (blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}
