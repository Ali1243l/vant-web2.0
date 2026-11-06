/** Shuffled bags cover all ten designs before reusing one, without adjacent repeats. */
export function seasonalVariants(scene: string, count: number): number[] {
  let seed = 2166136261;
  for (const letter of scene) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619) >>> 0;
  const next = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
  const result: number[] = [];
  while (result.length < Math.min(1000, Math.max(0, Math.floor(count)))) {
    const bag = Array.from({ length: 10 }, (_, i) => i);
    for (let i = 9; i > 0; i--) { const j = next() % (i + 1); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (bag[0] === result[result.length - 1]) [bag[0], bag[1]] = [bag[1], bag[0]];
    result.push(...bag);
  }
  return result.slice(0, Math.min(1000, Math.max(0, Math.floor(count))));
}

export const snowCaps = ["/themes/snow-drift-0-3374ed99.svg", "/themes/snow-drift-1-edb2de69.svg", "/themes/snow-drift-2-cad0e112.svg", "/themes/snow-drift-3-a60dc1cd.svg", "/themes/snow-drift-4-9763a73b.svg", "/themes/snow-drift-5-2fa567c4.svg", "/themes/snow-drift-6-8018d7c3.svg", "/themes/snow-drift-7-62632ff2.svg", "/themes/snow-drift-8-df8e9406.svg", "/themes/snow-drift-9-72225e80.svg"];
