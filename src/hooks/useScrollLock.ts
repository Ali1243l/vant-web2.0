import { useEffect } from 'react';

let activeLockCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';
let savedBodyPaddingRight = '';
let savedBodyOverscroll = '';
let savedHtmlOverscroll = '';

function isElementScrollable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;
  const canScrollY =
    (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
    el.scrollHeight > el.clientHeight + 1;
  const canScrollX =
    (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') &&
    el.scrollWidth > el.clientWidth + 1;
  return canScrollY || canScrollX;
}

function findScrollableAncestor(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;
  let current: HTMLElement | null = target;
  while (current && current !== document.body && current !== document.documentElement) {
    if (current.hasAttribute('data-scroll-lock-ignore')) {
      return current;
    }
    if (
      current.hasAttribute('data-scroll-lock-scrollable') ||
      isElementScrollable(current)
    ) {
      // Do not treat locked admin main container as scrollable while a modal/sheet is open
      if (current.getAttribute('data-admin-scroll-locked') === 'true') {
        current = current.parentElement;
        continue;
      }
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function handlePreventBackgroundWheel(e: WheelEvent) {
  if (activeLockCount <= 0) return;
  const scrollable = findScrollableAncestor(e.target);
  if (!scrollable) {
    if (e.cancelable) e.preventDefault();
    return;
  }

  // Prevent scroll chaining at the top/bottom boundaries of the scrollable container
  const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollable;
  const deltaY = e.deltaY;
  const deltaX = e.deltaX;

  if (Math.abs(deltaY) >= Math.abs(deltaX)) {
    const canScrollVertical = scrollHeight > clientHeight + 1;
    if (!canScrollVertical) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    const isAtTop = scrollTop <= 0 && deltaY < 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY > 0;
    if (isAtTop || isAtBottom) {
      if (e.cancelable) e.preventDefault();
    }
  } else {
    const canScrollHorizontal = scrollWidth > clientWidth + 1;
    if (!canScrollHorizontal) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    const isAtLeft = scrollLeft <= 0 && deltaX < 0;
    const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1 && deltaX > 0;
    if (isAtLeft || isAtRight) {
      if (e.cancelable) e.preventDefault();
    }
  }
}

let touchStartY = 0;
let touchStartX = 0;

function handleTouchStart(e: TouchEvent) {
  if (activeLockCount <= 0 || e.touches.length !== 1) return;
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}

function handlePreventBackgroundTouchMove(e: TouchEvent) {
  if (activeLockCount <= 0 || e.touches.length > 1) return;

  const target = e.target;
  if (target instanceof HTMLElement && target.closest('input[type="range"]')) {
    return;
  }

  const scrollable = findScrollableAncestor(target);
  if (!scrollable) {
    if (e.cancelable) e.preventDefault();
    return;
  }

  const currentY = e.touches[0].clientY;
  const currentX = e.touches[0].clientX;
  const deltaY = touchStartY - currentY;
  const deltaX = touchStartX - currentX;

  const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollable;

  if (Math.abs(deltaY) >= Math.abs(deltaX)) {
    const canScrollVertical = scrollHeight > clientHeight + 1;
    if (!canScrollVertical) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    const isAtTop = scrollTop <= 0 && deltaY < 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY > 0;
    if (isAtTop || isAtBottom) {
      if (e.cancelable) e.preventDefault();
    }
  } else {
    const canScrollHorizontal = scrollWidth > clientWidth + 1;
    if (!canScrollHorizontal) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    const isAtLeft = scrollLeft <= 0 && deltaX < 0;
    const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1 && deltaX > 0;
    if (isAtLeft || isAtRight) {
      if (e.cancelable) e.preventDefault();
    }
  }
}

function lockViewportScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (activeLockCount === 0) {
    const html = document.documentElement;
    const body = document.body;

    savedHtmlOverflow = html.style.overflow;
    savedBodyOverflow = body.style.overflow;
    savedBodyPaddingRight = body.style.paddingRight;
    savedHtmlOverscroll = html.style.overscrollBehavior;
    savedBodyOverscroll = body.style.overscrollBehavior;

    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    window.addEventListener('wheel', handlePreventBackgroundWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handlePreventBackgroundTouchMove, { passive: false });
  }

  activeLockCount += 1;
}

function unlockViewportScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (activeLockCount <= 0) return;

  activeLockCount -= 1;

  if (activeLockCount === 0) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = savedHtmlOverflow;
    body.style.overflow = savedBodyOverflow;
    body.style.paddingRight = savedBodyPaddingRight;
    html.style.overscrollBehavior = savedHtmlOverscroll;
    body.style.overscrollBehavior = savedBodyOverscroll;

    window.removeEventListener('wheel', handlePreventBackgroundWheel);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handlePreventBackgroundTouchMove);
  }
}

/**
 * Reference-counted scroll lock hook that locks both `html` and `body`
 * and prevents wheel/touch scroll chaining to the main page on desktop and mobile.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    lockViewportScroll();
    return () => {
      unlockViewportScroll();
    };
  }, [isLocked]);
}
