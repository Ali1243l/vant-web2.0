import React from 'react';
import { createRoot } from 'react-dom/client';
import { useShopper, useShopperLifecycle, getShopperStore } from '../../../src/hooks/useShopper';
import { newCartItem } from '../../../src/lib/shopperModel';
import { SiteControlsProvider } from '../../../src/context/SiteControlsContext';
import CartDrawer from '../../../src/components/CartDrawer';
import '../../../src/index.css';
if (!import.meta.env.DEV || import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY) throw Error('Isolated local fixture only');
const store = getShopperStore();
const item = newCartItem('local-piece','M','local-black','أسود','تيشيرت اختبار','/tests/fixtures/catalog-image/portrait.svg',25000);
if (!store.getSnapshot().items.length) store.change(item,2);
document.documentElement.classList.add('dark');
function Preview() {
  useShopper();
  useShopperLifecycle();
  return <SiteControlsProvider><CartDrawer isOpen onClose={() => {}} lang="ar"/></SiteControlsProvider>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
