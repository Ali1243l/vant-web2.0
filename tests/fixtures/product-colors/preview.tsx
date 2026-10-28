import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Product } from '../../../src/types';
import '../../../src/index.css';

if (!import.meta.env.DEV || import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('This fixture requires local development without a cloud connection.');
}
const { SiteControlsProvider } = await import('../../../src/context/SiteControlsContext');
const { default: ProductDrawer } = await import('../../../src/components/ProductDrawer');
const { default: ProductCard } = await import('../../../src/components/ProductCard');
const colors = ['Black', 'White', 'Grey', 'Brown', 'Navy Blue', 'Olive Green'];
const names = ['أسود', 'أبيض', 'رصاصي', 'بني / جوزي', 'كحلي', 'زيتي'];
const hexes = ['#17191c', '#f8f9fa', '#6b7280', '#4a3528', '#172554', '#4d5f2d'];
const images = colors.map(color => `/demo-colors/shirt_${encodeURIComponent(color)}_1.svg`);
const product: Product = {
  id: 'local-color-check', title: 'Local color check', title_ar: 'تجربة ألوان محلية — غير معروضة للبيع',
  category: 'Local test', category_ar: 'تجريبي', price: 25000, sizes: ['M', 'L'],
  image_url: images[0], images, colors, availability: 'in_stock',
  variants: colors.map((colorNameEn, i) => ({
    id: colorNameEn, colorNameEn, colorNameAr: names[i], colorHex: hexes[i],
    price: i === 1 ? 28000 : 25000, stock: 10, sizes: i === 1 ? ['M'] : ['M', 'L'], images: [images[i]],
  })),
};
function Preview() {
  const [open, setOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(product);
  return <SiteControlsProvider>
    <button type="button" onClick={() => setOpen(true)}>فتح تجربة الألوان</button>
    <div style={{ maxWidth: 280 }}><ProductCard product={product} index={0} lang="ar" onOpen={piece => { setSelectedProduct(piece); setOpen(true); }} /></div>
    <ProductDrawer product={open ? selectedProduct : null} lang="ar" onClose={() => setOpen(false)} />
  </SiteControlsProvider>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
