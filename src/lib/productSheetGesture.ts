export function shouldDismissProductSheet(distance: number, velocity: number): boolean {
  return Number.isFinite(distance) && Number.isFinite(velocity)
    && (distance >= 110 || (distance >= 24 && velocity >= 650));
}
