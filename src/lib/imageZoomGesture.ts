export const IMAGE_ZOOM_HOLD_MS = 320;

export function cancelsImageHold(startX: number, startY: number, x: number, y: number): boolean {
  return ![startX, startY, x, y].every(Number.isFinite) || Math.hypot(x - startX, y - startY) > 8;
}

export function imageZoomPan(point: number, extent: number, factor: number): number {
  if (![point, extent, factor].every(Number.isFinite) || extent <= 0 || factor <= 1) return 0;
  return (.5 - Math.max(0, Math.min(1, point / extent))) * extent * (factor - 1);
}
