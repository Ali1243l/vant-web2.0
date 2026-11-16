import type { Product } from '../types';

// One linear merge; repeated IDs update in place without moving the card.
export function mergeProducts(previous: Product[], incoming: Product[]): Product[] {
  const rows = new Map(previous.map(row => [String(row.id), row]));
  for (const row of incoming) rows.set(String(row.id), row);
  return [...rows.values()];
}
