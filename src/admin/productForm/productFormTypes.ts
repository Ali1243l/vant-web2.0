import type { Product, ProductVariant } from '../useAdminBridge';

export interface ProductFormData {
  name: string;
  nameEn: string;
  sku: string;
  category: string;
  price: string;
  salePrice: string;
  stock: string;
  status: 'active' | 'draft' | 'outOfStock' | 'lowStock';
  images: string[];
  sizes: string[];
  descriptionAr: string;
  descriptionEn: string;
  materialDetails: string;
  availabilityStatus: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out';
  hasVariants: boolean;
  variants: ProductVariant[];
}

export interface MagicNoticeState {
  title: string;
  subtitle: string;
  swatches: string[];
  count?: number;
}

export interface LuxuryColorPreset {
  ar: string;
  en: string;
  hex: string;
}

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'];

// Commercial retail preset palettes for quick 1-click addition
export const LUXURY_COLOR_PRESETS: LuxuryColorPreset[] = [
  { ar: 'أسود', en: 'Black', hex: '#0f172a' },
  { ar: 'أبيض', en: 'White', hex: '#f8fafc' },
  { ar: 'كحلي', en: 'Navy Blue', hex: '#172554' },
  { ar: 'زيتي', en: 'Olive Green', hex: '#4d5f2d' },
  { ar: 'ماروني / عنابي', en: 'Maroon', hex: '#800f2f' },
  { ar: 'بيج', en: 'Beige', hex: '#e2c7a8' },
  { ar: 'رصاصي', en: 'Grey', hex: '#64748b' },
  { ar: 'أزرق نيلي', en: 'Royal Blue', hex: '#1e40af' },
];

export interface ProductFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}
