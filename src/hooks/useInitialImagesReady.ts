import { useEffect, useState } from 'react';
import { waitForSplashImages } from '../lib/splashLifecycle';

export function useInitialImagesReady(active: boolean, loading: boolean, catalogKey: string): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active || loading) return;
    setReady(false);
    let disposed = false;
    const abort = new AbortController();
    const grid = document.querySelector<HTMLElement>('[data-store-grid]');
    const columns = grid ? Math.max(1, Math.min(4, getComputedStyle(grid).gridTemplateColumns.split(' ').length)) : 0;
    const images = [...(grid?.querySelectorAll<HTMLImageElement>('img[data-catalog-primary]') || [])].slice(0, columns);
    const hero = document.querySelector<HTMLImageElement>('[data-hero-background] img');
    if (hero) images.unshift(hero);
    // An unreliable image must not trap visitors behind the brand screen.
    const timeout = window.setTimeout(() => abort.abort(), 1800);
    void waitForSplashImages(images, abort.signal).then(() => { if (!disposed) setReady(true); window.clearTimeout(timeout); });
    return () => { disposed = true; window.clearTimeout(timeout); abort.abort(); };
  }, [active, loading, catalogKey]);
  return !loading && ready;
}
