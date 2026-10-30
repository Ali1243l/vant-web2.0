export function campaignAudience<T extends { email: string; status: string; totalSpent: number; tags: string[] }>(rows: T[], kind: 'active' | 'all' | 'vip'): T[] {
  const seen = new Set<string>();
  return rows.filter(row => {
    const email = row.email.trim().toLowerCase();
    if (row.status !== 'active' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || seen.has(email)) return false;
    if (kind === 'vip' && !(row.totalSpent > 150000 || row.tags.includes('VIP'))) return false;
    seen.add(email);
    return true;
  });
}

export function spreadsheetCell(value: unknown): string {
  const text = String(value ?? '');
  return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function subscriberDetails(notes?: string): { name?: string; phone: string } {
  try {
    const value = JSON.parse(notes || '');
    if (value.kind === 'vant-contact' && typeof value.name === 'string' && typeof value.phone === 'string') return value;
  } catch {}
  return { phone: notes && /^[+\d\s()-]{6,25}$/.test(notes) ? notes : '' };
}

export function subscriberOrderTotals(email: string, orders: { customerEmail: string; status: string; totalPrice: number }[]) {
  const delivered = orders.filter(order => order.status === 'delivered' && order.customerEmail?.trim().toLowerCase() === email.trim().toLowerCase());
  return { totalOrders: delivered.length, totalSpent: delivered.reduce((sum, order) => sum + (Number.isFinite(order.totalPrice) && order.totalPrice > 0 ? order.totalPrice : 0), 0) };
}

export function httpUrl(value?: string): string {
  try { const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}
