export interface ApproximateRegion { country: string | null; region: string | null }

export function normalizeApproximateRegion(value: unknown): ApproximateRegion {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const country = typeof row.country === 'string' && /^[A-Z]{2}$/.test(row.country) && !['XX', 'ZZ'].includes(row.country) ? row.country : null;
  const region = country && typeof row.region === 'string' && /^[A-Z0-9]{1,3}$/.test(row.region) ? row.region : null;
  return { country, region };
}

// CLDR subdivision codes; region-level results such as IQ-KR must not be labelled as a governorate.
const governorates: Record<string, [string, string]> = {
  AN: ['الأنبار', 'Anbar'], AR: ['أربيل', 'Erbil'], BA: ['البصرة', 'Basra'], BB: ['بابل', 'Babil'],
  BG: ['بغداد', 'Baghdad'], DA: ['دهوك', 'Duhok'], DI: ['ديالى', 'Diyala'], DQ: ['ذي قار', 'Dhi Qar'],
  KA: ['كربلاء', 'Karbala'], KI: ['كركوك', 'Kirkuk'], MA: ['ميسان', 'Maysan'], MU: ['المثنى', 'Muthanna'],
  NA: ['النجف', 'Najaf'], NI: ['نينوى', 'Nineveh'], QA: ['القادسية', 'Qadisiyah'], SD: ['صلاح الدين', 'Salah ad-Din'],
  SU: ['السليمانية', 'Sulaymaniyah'], WA: ['واسط', 'Wasit'],
};

export function approximateRegionLabel(value: unknown, language: 'ar' | 'en'): string {
  const { country, region } = normalizeApproximateRegion(value);
  if (!country) return language === 'ar' ? 'غير معروف' : 'Unknown';
  const name = new Intl.DisplayNames([language], { type: 'region' }).of(country) || country;
  const governorate = country === 'IQ' && region ? governorates[region] : null;
  return governorate ? `${governorate[language === 'ar' ? 0 : 1]}، ${name}` : `${name}${region ? ` (${country}-${region})` : ''}`;
}

let pending: Promise<ApproximateRegion> | undefined;
export function getApproximateRegion(): Promise<ApproximateRegion> {
  return pending ??= (async () => {
    try {
      const response = await fetch('/api/visitor-region', { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(2000) });
      return normalizeApproximateRegion(response.ok ? await response.json() : null);
    } catch { return normalizeApproximateRegion(null); }
  })();
}
