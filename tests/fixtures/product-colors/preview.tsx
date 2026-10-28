import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Product } from '../../../src/types';
import '../../../src/index.css';

if (!import.meta.env.DEV || import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('This fixture requires local development without a cloud connection.');
}
const { SiteControlsProvider } = await import('../../../src/context/SiteControlsContext');
const { default: ProductDrawer } = await import('../../../src/components/ProductDrawer');
const colors = ['Black', 'White', 'Grey', 'Brown', 'Navy Blue', 'Olive Green'];
const images = colors.map(color => `/demo-colors/shirt_${encodeURIComponent(color)}_1.svg`);
const product: Product = {
  id: 'local-color-check', title: 'Local color check', title_ar: 'تجربة ألوان محلية — غير معروضة للبيع',
  category: 'Local test', category_ar: 'تجريبي', price: 25000, sizes: ['M', 'L'],
  image_url: images[0], images, colors, availability: 'in_stock',
};
function Preview() {
  const [open, setOpen] = useState(true);
  return <SiteControlsProvider>
    <button type="button" onClick={() => setOpen(true)}>فتح تجربة الألوان</button>
    <ProductDrawer product={open ? product : null} lang="ar" onClose={() => setOpen(false)} />
  </SiteControlsProvider>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
