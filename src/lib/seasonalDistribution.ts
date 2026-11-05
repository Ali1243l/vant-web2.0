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
  'M0 0H200V7Q180 2 163 9T126 7T88 10T52 6T17 10L0 7Z',
  'M0 0H200V4Q170 3 147 10L139 22L131 9Q110 4 85 9T40 5L26 16L19 6L0 8Z',
  'M0 0H200V9Q188 16 174 9Q160 1 139 5Q119 12 97 6T54 11T0 5Z',
  'M0 0H200V5L182 6L175 20L170 7Q150 1 128 8T81 4L67 18L60 6L32 9L0 4Z',
  'M0 0H200V3Q170 8 146 4T108 10T65 5Q30 18 0 8Z',
  'M0 0H200V8Q180 8 170 4L159 8L151 25L145 10Q123 3 100 9Q72 14 53 5T0 7Z',
  'M0 0H200V6Q190 2 179 8T151 5Q128 16 112 8T77 6Q54 16 36 9T0 5Z',
  'M0 0H200V10Q174 19 155 9T121 5L107 16L101 6Q80 15 63 9Q35 1 0 11Z',
  'M0 0H200V5L185 11L167 8L155 4Q133 4 126 13L120 26L114 10Q83 3 62 9T0 4Z',
  'M0 0H200V9Q181 4 165 11T128 6Q110 1 92 9L83 20L79 10Q62 5 44 12T0 6Z',
];
