export function catalogImageProps(source: string, sizes?: string) {
  try {
    const url = new URL(source);
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
