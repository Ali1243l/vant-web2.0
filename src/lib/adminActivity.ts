export const ACTIVITY_TABLES: Record<string, { ar: string; en: string }> = {
  objects: { ar: 'ملفات المتجر والصور', en: 'Store files and images' },
  products: { ar: 'المنتجات', en: 'Products' },
  product_media: { ar: 'صور المنتجات', en: 'Product media' },
  orders: { ar: 'الطلبات', en: 'Orders' },
  offers: { ar: 'العروض', en: 'Offers' },
  newsletter_subscribers: { ar: 'المشتركون', en: 'Subscribers' },
  site_settings: { ar: 'إعدادات المتجر', en: 'Store settings' },
  app_settings: { ar: 'إعدادات التطبيق', en: 'App settings' },
  admins: { ar: 'صلاحيات الإدارة', en: 'Admin roles' },
};

export interface ActivityEntry {
  id: number;
  occurred_at: string;
  transaction_id: number;
  actor_id: string | null;
  actor_kind: 'admin' | 'user' | 'database';
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_fields: string[];
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
  file_before?: string | null;
  file_after?: string | null;
}

export function activityChanges(entry: ActivityEntry) {
  return entry.changed_fields.map(field => ({ field,
    before: Object.hasOwn(entry.before_data || {}, field) ? JSON.stringify(entry.before_data![field], null, 2) : '—',
    after: Object.hasOwn(entry.after_data || {}, field) ? JSON.stringify(entry.after_data![field], null, 2) : '—',
  }));
}

export function activityDateBoundary(date: string, end: boolean): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = Date.parse(`${date}T00:00:00+03:00`);
  if (!Number.isFinite(parsed) || new Date(parsed + 10800000).toISOString().slice(0, 10) !== date) return null;
  return new Date(parsed + (end ? 86400000 : 0)).toISOString();
}
