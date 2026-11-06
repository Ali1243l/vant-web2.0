import type { HeroScene } from './heroAppearance';

// Art-directed clusters stay stable across re-renders; the catalog center stays quiet.
export const seasonalPositions: Record<Exclude<HeroScene, 'none'>, readonly (readonly [number, number])[]> = {
  winter: [[3,8],[92,16],[8,37],[96,52],[2,73],[87,88],[17,92],[79,3],[43,5],[64,96]],
  spring: [[2,68],[7,78],[13,89],[22,96],[94,5],[88,12],[98,24],[4,51]],
  summer: [[84,4],[92,13],[97,29],[78,8],[4,84],[14,92]],
  autumn: [[3,7],[9,21],[4,38],[15,53],[7,69],[19,83],[32,94],[95,81],[88,93]],
  'new-year': [[4,11],[13,7],[23,3],[80,4],[92,12],[98,28],[94,71],[86,85],[74,96],[3,91]],
  ramadan: [[7,2],[17,8],[86,3],[95,14],[3,41],[97,59],[7,87],[92,93]],
  eid: [[3,17],[13,9],[25,4],[74,5],[86,12],[97,22],[4,78],[15,91],[88,86],[97,71]],
  holiday: [[3,72],[12,77],[22,81],[34,85],[81,9],[90,16],[97,26]],
  school: [[3,14],[3,37],[3,62],[3,86],[94,7],[98,27],[91,89]],
  weekend: [[2,24],[8,17],[16,11],[24,6],[78,94],[86,87],[94,79],[98,68]],
  'black-friday': [[3,18],[97,82]],
  'season-end': [[2,8],[9,17],[3,31],[96,69],[89,81],[98,92]],
};

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
