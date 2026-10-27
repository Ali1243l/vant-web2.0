export interface HeaderScrollState {
  y: number;
  direction: 'up' | 'down' | null;
  travel: number;
  detached: boolean;
  categoriesVisible: boolean;
}

export const INITIAL_HEADER_SCROLL: HeaderScrollState = {
  y: 0, direction: null, travel: 0, detached: false, categoriesVisible: true,
};

export function nextHeaderScroll(previous: HeaderScrollState, position: number): HeaderScrollState {
  if (!Number.isFinite(position)) return previous;
  const y = Math.max(0, position);
  const delta = y - previous.y;
  const direction = delta > 0 ? 'down' : delta < 0 ? 'up' : previous.direction;
  const travel = direction === previous.direction ? previous.travel + Math.abs(delta) : Math.abs(delta);
  const detached = y > 96 ? true : y < 32 ? false : previous.detached;
  const categoriesVisible = y <= 48 ? true
    : direction === 'down' && travel >= 24 ? false
    : direction === 'up' && travel >= 18 ? true
    : previous.categoriesVisible;
  return { y, direction, travel: y <= 48 ? 0 : travel, detached, categoriesVisible };
}
