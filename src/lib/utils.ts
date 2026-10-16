export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean> | (string | undefined | null | boolean)[])[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ').trim();
}

/**
 * Smaller copy of a product photo for grid cards. Supabase serves resized images from its
 * render endpoint; callers must fall back to the original URL on error, because image
 * transformations are a paid Supabase feature and may be off for this project.
 */
export function cardImageUrl(url: string, width = 600): string {
  if (url.includes('/storage/v1/object/public/')) {
    return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}${url.includes('?') ? '&' : '?'}width=${width}&quality=70`;
  }
  if (url.includes('images.unsplash.com')) {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', '70');
    return u.toString();
  }
  return url;
}
