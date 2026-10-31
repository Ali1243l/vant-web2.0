export const IMAGE_ZOOM_HOLD_MS = 320;

export function imageLensOpacity(x: number, y: number, left: number, top: number, width: number, height: number): number {
  if (![x, y, left, top, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return 0;
  const edge = Math.min(x - left, left + width - x, y - top, top + height - y);
  const span = Math.min(width, height);
  const progress = Math.max(0, Math.min(1, (edge - span * .04) / Math.min(40, span * .12)));
  return progress * progress * (3 - 2 * progress);
}

export function imageLensAxis(point: number, start: number, extent: number, diameter: number) {
  const radius = diameter / 2;
  const inset = Math.min(Math.max(4, Math.min(12, extent * .04)), (extent - diameter) / 2);
  const ring = Math.max(start + inset, Math.min(start + extent - diameter - inset, point - radius));
  return {
    sample: ring + radius,
    ring,
  };
}

export function imageDetailScale(naturalWidth: number, paintedWidth: number, requested: number, pixelRatio = 1): number {
  if (![naturalWidth, paintedWidth, requested, pixelRatio].every(Number.isFinite) || paintedWidth <= 0 || pixelRatio <= 0) return 1;
  return Math.max(1, Math.min(requested, naturalWidth / (paintedWidth * pixelRatio)));
}

export function measureZoomImage(container: HTMLElement) {
  const image = container.querySelector('img');
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return null;
  const bounds = container.getBoundingClientRect();
  const box = image.getBoundingClientRect();
  const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  return { image, bounds, width, height, left: box.left - bounds.left + (box.width - width) / 2, top: box.top - bounds.top + (box.height - height) / 2 };
}

export function cancelsImageHold(startX: number, startY: number, x: number, y: number): boolean {
  return ![startX, startY, x, y].every(Number.isFinite) || Math.hypot(x - startX, y - startY) > 8;
}

export function imageZoomPan(point: number, extent: number, factor: number): number {
  if (![point, extent, factor].every(Number.isFinite) || extent <= 0 || factor <= 1) return 0;
  return (.5 - Math.max(0, Math.min(1, point / extent))) * extent * (factor - 1);
}
