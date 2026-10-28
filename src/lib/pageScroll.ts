export interface ScrollDriver {
  readY: () => number;
  maxY: () => number;
  writeY: (position: number) => void;
  requestFrame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
  onActiveChange?: (active: boolean) => void;
}

/** A single owner for page navigation. New requests replace old ones. */
export function createPageScroller(driver: ScrollDriver) {
  let frame: number | undefined;
  let generation = 0;
  let active = false;
  const cancel = () => {
    generation++;
    if (frame !== undefined) driver.cancelFrame(frame);
    frame = undefined;
    if (active) driver.onActiveChange?.(false);
    active = false;
  };
  const to = (resolveTarget: () => number, options: { settleLayout?: boolean; reducedMotion?: boolean } = {}) => {
    cancel();
    const request = generation;
    active = true;
    driver.onActiveChange?.(true);
    let requestedAt: number | undefined;
    let startedAt: number | undefined;
    let stableSince = 0;
    let lastTarget = NaN;
    let startY = driver.readY();
    const step = (now: number) => {
      if (request !== generation) return;
      requestedAt ??= now;
      const destination = resolveTarget();
      if (!Number.isFinite(destination)) { cancel(); return; }
      const target = Math.max(0, Math.min(driver.maxY(), destination));
      if (!Number.isFinite(lastTarget) || Math.abs(target - lastTarget) > 1) stableSince = now;
      lastTarget = target;
      // Let collapsing banners finish before calculating the journey's starting point.
      if (startedAt === undefined) {
        if (options.settleLayout && now - stableSince < 80 && now - requestedAt < 600) {
          frame = driver.requestFrame(step);
          return;
        }
        startedAt = now;
        startY = driver.readY();
      }
      const progress = options.reducedMotion ? 1 : Math.min(1, (now - startedAt) / 500);
      const eased = 1 - Math.pow(1 - progress, 3);
      driver.writeY(startY + (target - startY) * eased);
      if (progress === 1) { cancel(); return; }
      frame = driver.requestFrame(step);
    };
    frame = driver.requestFrame(step);
  };
  return { to, cancel, isActive: () => active };
}

export function catalogScrollTarget(currentY: number, catalogViewportTop: number, headerSlot: number): number {
  return Math.max(0, currentY + catalogViewportTop - headerSlot - 16);
}

let browserScroller: ReturnType<typeof createPageScroller> | undefined;

export function scrollStorefrontTo(target: 'top' | 'catalog') {
  if (typeof window === 'undefined' || document.documentElement.style.overflow === 'hidden') return;
  if (!browserScroller) {
    const interrupt = (event: Event) => {
      if (event instanceof KeyboardEvent && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return;
      browserScroller?.cancel();
    };
    browserScroller = createPageScroller({
      readY: () => window.scrollY,
      maxY: () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      writeY: top => window.scrollTo({ top, left: 0, behavior: 'instant' }),
      requestFrame: callback => window.requestAnimationFrame(callback),
      cancelFrame: id => window.cancelAnimationFrame(id),
      onActiveChange: active => {
        document.documentElement.toggleAttribute('data-storefront-scrolling', active);
        for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
          if (active) window.addEventListener(event, interrupt, { passive: true });
          else window.removeEventListener(event, interrupt);
        }
      },
    });
  }
  browserScroller.to(() => {
    if (target === 'top') return 0;
    const catalog = document.getElementById('catalog-grid');
    const header = document.querySelector<HTMLElement>('[data-store-header]');
    return catalog ? catalogScrollTarget(window.scrollY, catalog.getBoundingClientRect().top, header?.offsetHeight || 0) : window.scrollY;
  }, { settleLayout: target === 'catalog', reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
}
