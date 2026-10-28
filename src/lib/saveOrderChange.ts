import type { Order, OrderStatus } from '../admin/useAdminBridge';
import { normalizeOrders, transitionOrder } from './orderModel.ts';

export type OrderChange = { status: OrderStatus; note?: string } | { notes: string };

export async function saveOrderChange(client: any, previous: Order, change: OrderChange): Promise<Order> {
  const apply = (order: Order) => 'status' in change
    ? transitionOrder(order, change.status, change.note)
    : { ...order, bespokeDetails: { ...order.bespokeDetails, artisanNotes: change.notes } };
  if (!client) return apply(previous);
  const { data: row, error: readError } = await client.from('orders').select('*').eq('id', previous.id).single();
  if (readError || !row) throw new Error('Could not load order for saving');
  const current = normalizeOrders([row])[0];
  if (!current || current.id !== previous.id || current.status !== previous.status) throw new Error('Order changed; reload before saving');
  const updated = apply(current);
  const patch = 'status' in change ? { status: updated.status, timeline: updated.timeline }
    : { bespoke_details: { ...(row.bespoke_details || {}), artisanNotes: change.notes } };
  let request = client.from('orders').update(patch).eq('id', previous.id).eq('status', row.status);
  const field = 'status' in change ? 'timeline' : 'bespoke_details';
  request = row[field] == null ? request.is(field, null) : request.eq(field, JSON.stringify(row[field]));
  const { data, error } = await request.select('*').single();
  if (error || !data) throw new Error('Order save failed or a concurrent update occurred');
  const saved = normalizeOrders([data])[0];
  if (!saved || saved.id !== previous.id) throw new Error('Invalid saved order response');
  if ('status' in change ? saved.status !== updated.status : saved.bespokeDetails?.artisanNotes !== change.notes) throw new Error('Saved order did not confirm the requested change');
  return saved;
}
