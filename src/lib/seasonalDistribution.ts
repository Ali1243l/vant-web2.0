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
