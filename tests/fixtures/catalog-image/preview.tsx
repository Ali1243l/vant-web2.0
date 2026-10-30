import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SiteControlsProvider } from '../../../src/context/site_controls/SiteControlsProvider';
import { ProductCatalogImageSection } from '../../../src/admin/productForm/ProductCatalogImageSection';
import ProductCard from '../../../src/components/ProductCard';
import ProductDrawer from '../../../src/components/ProductDrawer';
import { normalizeCatalogImage } from '../../../src/lib/catalogImage';
import type { Product } from '../../../src/types';
import '../../../src/index.css';
const images = ['landscape.svg', 'portrait.svg', 'square.svg'].map(name => `/tests/fixtures/catalog-image/${name}`);
function Preview() {
  const [saved, setSaved] = useState(() => { try { return normalizeCatalogImage(JSON.parse(localStorage.getItem('catalog_image_preview_test') || 'null')); } catch { return normalizeCatalogImage(null); } });
  const [draft, setDraft] = useState(saved);
  const [selected, setSelected] = useState<Product | null>(null);
  return <main className="mx-auto max-w-5xl p-4 text-white space-y-5"><h1>اختبار إطار الكتالوج — معاينة معزولة</h1><ProductCatalogImageSection isAr images={images} value={draft} onChange={setDraft} /><button type="button" className="vant-primary-action" onClick={() => { localStorage.setItem('catalog_image_preview_test', JSON.stringify(draft)); setSaved(draft); }}>حفظ إعداد الاختبار</button><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{images.map((source, index) => <ProductCard key={source} index={index} lang="ar" onOpen={setSelected} product={{ id: String(index), title: ['صورة 4:3', 'صورة 9:16', 'صورة مربعة'][index], category: 'T-Shirts', image_url: source, images: [source], sizes: ['M'], price: 25000, aspect_ratio: ['4:3', '9:16', '1:1'][index], catalog_image: saved }} />)}</div><ProductDrawer product={selected} lang="ar" onClose={() => setSelected(null)} /></main>;
}
createRoot(document.getElementById('root')!).render(<SiteControlsProvider><Preview /></SiteControlsProvider>);
