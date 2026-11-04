const imageWidths = [96, 240, 400, 640, 960, 1280];

export function vercelImageSource(source: string, width: number): string {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.hostname !== 'gjjsdnyfhhbacuciqwbq.supabase.co' || url.port || url.username || url.password || url.search || url.hash || !url.pathname.startsWith('/storage/v1/object/public/product-images/') || !/\.(jpe?g|png|webp)$/i.test(url.pathname) || !imageWidths.includes(width)) return source;
    return `/_vercel/image?url=${encodeURIComponent(url.href)}&w=${width}&q=80`;
  } catch { return source; }
}

export function retryOriginalImage(image: HTMLImageElement): boolean {
  if (!image.hasAttribute('srcset')) return false;
  // The src remains the original: failed optimization must never hide an available photo.
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.src = image.getAttribute('src') || '';
  return true;
}

export function catalogImageProps(source: string, sizes?: string) {
  try {
    const url = new URL(source);
    // shortcut: optimization is Vercel-only; add the custom domain when one is connected.
    if (typeof location !== 'undefined' && location.hostname.endsWith('.vercel.app') && vercelImageSource(source, 400) !== source) {
      return {
        srcSet: imageWidths.map(width => `${vercelImageSource(source, width)} ${width}w`).join(', '),
        sizes: sizes || '(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1919px) 25vw, 440px',
      };
    }
    if (url.hostname !== 'images.unsplash.com') return {};
    return {
      srcSet: [240, 400, 640, 960, 1280].map(width => { const image = new URL(url); image.searchParams.set('w', String(width)); image.searchParams.set('auto', 'format'); return `${image.href} ${width}w`; }).join(', '),
      sizes: sizes || '(max-width: 639px) calc((100vw - 48px) / 2), (max-width: 1023px) 33vw, 25vw',
    };
  } catch { return {}; }
}

export function zoomImageSource(source: string): string {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.hostname !== 'images.unsplash.com' || ['s', 'sig', 'signature', 'token'].some(key => url.searchParams.has(key))) return source;
    url.searchParams.set('w', String(Math.max(1600, Number(url.searchParams.get('w')) || 0)));
    url.searchParams.set('q', String(Math.max(90, Number(url.searchParams.get('q')) || 0)));
    return url.href;
  } catch { return source; }
}
