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

export const snowCaps = [
  "/themes/snow-crown-0-8450d361.svg",
  "/themes/snow-crown-1-9ca24f7c.svg",
  "/themes/snow-crown-2-07b186f7.svg",
  "/themes/snow-crown-3-657a3298.svg",
  "/themes/snow-crown-4-12f6b534.svg",
  "/themes/snow-crown-5-532e6861.svg",
  "/themes/snow-crown-6-3b4e2a05.svg",
  "/themes/snow-crown-7-438e8c7e.svg",
  "/themes/snow-crown-8-5264a75f.svg",
  "/themes/snow-crown-9-2a7e1af9.svg"
];
