import type { Size } from '../types';

// Height and weight ranges provide approximate guidance, not garment measurements.

export interface MasterSizeItem {
  id: string;
  size: string;
  height: string;
  weight: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  length?: string;
  note_ar?: string;
  note_en?: string;
  minHeight: number;
  maxHeight: number;
  minWeight: number;
  maxWeight: number;
  enabled: boolean;
  order?: number;
}

export const DEFAULT_MASTER_SIZES: MasterSizeItem[] = [
  {
    id: 'size_xs',
    size: 'XS',
    height: '150 - 164 سم',
    weight: '45 - 56 كغم',
    note_ar: 'قصة انسيابية مريحة ومضبوطة للقامة الناعمة',
    note_en: 'Refined tailored silhouette for petite frames',
    minHeight: 150,
    maxHeight: 164,
    minWeight: 45,
    maxWeight: 56,
    enabled: true,
    order: 1,
  },
  {
    id: 'size_s',
    size: 'S',
    height: '165 - 172 سم',
    weight: '57 - 65 كغم',
    note_ar: 'قصة عصرية متناسقة ومريحة على الأكتاف',
    note_en: 'Contemporary regular cut with balanced shoulders',
    minHeight: 165,
    maxHeight: 172,
    minWeight: 57,
    maxWeight: 65,
    enabled: true,
    order: 2,
  },
  {
    id: 'size_m',
    size: 'M',
    height: '173 - 178 سم',
    weight: '66 - 75 كغم',
    note_ar: 'المقاس الأكثر توازناً، يمنحك مظهراً راقياً ومريحاً',
    note_en: 'Most balanced fit, delivering effortless luxury styling',
    minHeight: 173,
    maxHeight: 178,
    minWeight: 66,
    maxWeight: 75,
    enabled: true,
    order: 3,
  },
  {
    id: 'size_l',
    size: 'L',
    height: '179 - 184 سم',
    weight: '76 - 85 كغم',
    note_ar: 'قصة فاخرة واسعة بلمسة عصرية راقية',
    note_en: 'Relaxed modern drape with premium ease of motion',
    minHeight: 179,
    maxHeight: 184,
    minWeight: 76,
    maxWeight: 85,
    enabled: true,
    order: 4,
  },
  {
    id: 'size_xl',
    size: 'XL',
    height: '185 - 190 سم',
    weight: '86 - 95 كغم',
    note_ar: 'قصة واسعة مريحة تمنحك إطلالة فخمة وحرية حركة',
    note_en: 'Generous silhouette offering commanding presence',
    minHeight: 185,
    maxHeight: 190,
    minWeight: 86,
    maxWeight: 95,
    enabled: true,
    order: 5,
  },
  {
    id: 'size_xxl',
    size: 'XXL',
    height: '191 - 205 سم',
    weight: '96 - 118 كغم',
    note_ar: 'قصة رحبة جداً للأطوال والأوزان العالية',
    note_en: 'Extra spacious cut engineered for taller & heavier builds',
    minHeight: 191,
    maxHeight: 205,
    minWeight: 96,
    maxWeight: 118,
    enabled: true,
    order: 6,
  },
];

export interface SizeGuideRow {
  size: Size | string;
  height: string;
  weight: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  length?: string;
}

export interface SizeFitRule {
  size: Size;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  idealHeight: number;
  idealWeight: number;
  note_ar: string;
  note_en: string;
}

/**
 * Visual reference table data for the ready-to-wear fit guide
 */
export const SIZE_GUIDE_DATA: SizeGuideRow[] = [
  { size: 'XS', height: '150 - 164', weight: '45 - 56' },
  { size: 'S',  height: '165 - 172', weight: '57 - 65' },
  { size: 'M',  height: '173 - 178', weight: '66 - 75' },
  { size: 'L',  height: '179 - 184', weight: '76 - 85' },
  { size: 'XL', height: '185 - 190', weight: '86 - 95' },
  { size: 'XXL', height: '191 - 205', weight: '96 - 118' },
];

/**
 * Dynamic calculation rules for automatic ready-to-wear size recommendations.
 */
export const DYNAMIC_SIZE_RULES: SizeFitRule[] = [
  {
    size: 'XS',
    minHeight: 150,
    maxHeight: 164,
    minWeight: 45,
    maxWeight: 56,
    idealHeight: 158,
    idealWeight: 52,
    note_ar: 'قصة انسيابية مريحة ومضبوطة للقامة الناعمة',
    note_en: 'Refined tailored silhouette for petite frames',
  },
  {
    size: 'S',
    minHeight: 165,
    maxHeight: 172,
    minWeight: 57,
    maxWeight: 65,
    idealHeight: 168,
    idealWeight: 61,
    note_ar: 'قصة عصرية متناسقة ومريحة على الأكتاف',
    note_en: 'Contemporary regular cut with balanced shoulders',
  },
  {
    size: 'M',
    minHeight: 173,
    maxHeight: 178,
    minWeight: 66,
    maxWeight: 75,
    idealHeight: 175,
    idealWeight: 70,
    note_ar: 'المقاس الأكثر توازناً، يمنحك مظهراً راقياً ومريحاً',
    note_en: 'Most balanced fit, delivering effortless luxury styling',
  },
  {
    size: 'L',
    minHeight: 179,
    maxHeight: 184,
    minWeight: 76,
    maxWeight: 85,
    idealHeight: 181,
    idealWeight: 80,
    note_ar: 'قصة فاخرة واسعة بلمسة عصرية راقية',
    note_en: 'Relaxed modern drape with premium ease of motion',
  },
  {
    size: 'XL',
    minHeight: 185,
    maxHeight: 190,
    minWeight: 86,
    maxWeight: 95,
    idealHeight: 187,
    idealWeight: 90,
    note_ar: 'قصة واسعة مريحة تمنحك إطلالة فخمة وحرية حركة',
    note_en: 'Generous silhouette offering commanding presence',
  },
  {
    size: 'XXL',
    minHeight: 191,
    maxHeight: 205,
    minWeight: 96,
    maxWeight: 118,
    idealHeight: 193,
    idealWeight: 102,
    note_ar: 'قصة رحبة جداً للأطوال والأوزان العالية',
    note_en: 'Extra spacious cut engineered for taller & heavier builds',
  },
];

export type RecommendationStatus = 'standard' | 'petite_note' | 'tall_note' | 'bespoke_needed';

export interface SizeRecommendationResult {
  status: RecommendationStatus;
  size?: string;
  displaySize: string;
  isBespoke: boolean;
  title_ar: string;
  title_en: string;
  note_ar: string;
  note_en: string;
  reason_ar?: string;
  reason_en?: string;
  confidence: 'exact' | 'close';
}

export function parseFitMeasurement(value: string): number | null {
  const normalized = value.trim().replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).replace('٫', '.');
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

export function sizeRange(row: MasterSizeItem, dimension: 'height' | 'weight', isAr = true): string {
  return dimension === 'height'
    ? `${row.minHeight} – ${row.maxHeight} ${isAr ? 'سم' : 'cm'}`
    : `${row.minWeight} – ${row.maxWeight} ${isAr ? 'كغم' : 'kg'}`;
}

export function validateMasterSize(row: MasterSizeItem, rows: MasterSizeItem[] = []): 'name' | 'duplicate' | 'range' | null {
  if (typeof row.size !== 'string' || !row.size.trim()) return 'name';
  if (rows.some(other => other && typeof other.size === 'string' && other.id !== row.id && other.size.trim().toUpperCase() === row.size.trim().toUpperCase())) return 'duplicate';
  if (![row.minHeight, row.maxHeight, row.minWeight, row.maxWeight].every(Number.isFinite)
    || row.minHeight < 120 || row.maxHeight > 220 || row.minHeight > row.maxHeight
    || row.minWeight < 30 || row.maxWeight > 200 || row.minWeight > row.maxWeight) return 'range';
  return null;
}

export function activeSizeRows(rows: MasterSizeItem[]): MasterSizeItem[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter(row => row && typeof row.id === 'string' && row.enabled === true && !validateMasterSize(row, rows));
}

export function calculateRecommendedSize(
  heightCm: number,
  weightKg: number,
  customMasterSizes: MasterSizeItem[] = DEFAULT_MASTER_SIZES
): SizeRecommendationResult | null {
  if (![heightCm, weightKg].every(Number.isFinite) || heightCm < 120 || heightCm > 220 || weightKg < 30 || weightKg > 200) return null;
  const matches = activeSizeRows(customMasterSizes).filter(row =>
    heightCm >= row.minHeight && heightCm <= row.maxHeight && weightKg >= row.minWeight && weightKg <= row.maxWeight);
  // Resolve overlapping ranges by distance from both normalized centers, independent of display order.
  const distance = (row: MasterSizeItem) =>
    Math.abs(heightCm - (row.minHeight + row.maxHeight) / 2) / Math.max(1, row.maxHeight - row.minHeight)
    + Math.abs(weightKg - (row.minWeight + row.maxWeight) / 2) / Math.max(1, row.maxWeight - row.minWeight);
  matches.sort((a, b) => distance(a) - distance(b) || a.size.localeCompare(b.size) || a.id.localeCompare(b.id));
  const match = matches[0];
  if (!match) return {
    status: 'bespoke_needed', isBespoke: true, confidence: 'close',
    displaySize: '—', title_ar: 'لا توجد مطابقة في الدليل', title_en: 'No matching size in this guide',
    note_ar: 'الطول والوزن خارج نطاق مشترك للمقاسات المفعّلة. قارن قياسات القطعة أو تواصل مع المتجر قبل الاختيار.',
    note_en: 'No enabled size covers both measurements. Compare actual garment measurements or contact the store before selecting.',
  };
  return {
    status: 'standard', size: match.size, displaySize: match.size, isBespoke: false, confidence: 'exact',
    title_ar: `مقاس (${match.size})`, title_en: `Size (${match.size})`,
    reason_ar: 'الطول والوزن ضمن حدود هذا المقاس', reason_en: 'Both measurements fall within this size range',
    note_ar: 'اقتراح تقريبي من جدول المتجر، وليس ضماناً للملاءمة. راجع قياسات القطعة وقصّتها قبل الشراء.',
    note_en: 'Approximate guidance from the store chart, not a fit guarantee. Check garment measurements and cut before buying.',
  };
}
