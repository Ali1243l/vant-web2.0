export function maintenanceContactUrl(phone: string | undefined, enabled: boolean): string | null {
  const digits = (phone || '').replace(/[+\s()-]/g, '');
  if (!enabled || !/^\d{8,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent('مرحباً فانت، أود الاستفسار أثناء فترة صيانة المتجر.')}`;
}
