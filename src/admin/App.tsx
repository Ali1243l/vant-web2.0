import { Sheet } from './Sheet';
import { Button } from './ui';
import React, { useState, lazy, Suspense } from 'react';
import './admin.css';
import { AdminProvider, useAdminBridge } from './useAdminBridge';
import { AdminHeader } from './AdminHeader';
import { AdminDrawer } from './AdminDrawer';
import { Nav } from './Nav';
import { LockScreen } from './LockScreen';
const AdminAnalyticsDashboard = lazy(() => import('./AdminAnalyticsDashboard').then(module => ({ default: module.AdminAnalyticsDashboard })));
const ProductsManager = lazy(() => import('./ProductsManager').then(module => ({ default: module.ProductsManager })));
const AdminOffersManager = lazy(() => import('./AdminOffersManager').then(module => ({ default: module.AdminOffersManager })));
const SubscribersList = lazy(() => import('./SubscribersList').then(module => ({ default: module.SubscribersList })));
const OrdersManager = lazy(() => import('./OrdersManager').then(module => ({ default: module.OrdersManager })));
const ProductFormSheet = lazy(() => import('./ProductFormSheet').then(module => ({ default: module.ProductFormSheet })));
const SettingsView = lazy(() => import('./SettingsView').then(module => ({ default: module.SettingsView })));
const AdminSizesView = lazy(() => import('./AdminSizesView').then(module => ({ default: module.AdminSizesView })));
const AdminSocialView = lazy(() => import('./AdminSocialView').then(module => ({ default: module.AdminSocialView })));
const AdminControlsView = lazy(() => import('./AdminControlsView').then(module => ({ default: module.AdminControlsView })));
const AdminBackupView = lazy(() => import('./AdminBackupView').then(module => ({ default: module.AdminBackupView })));
const AdminSecurityView = lazy(() => import('./AdminSecurityView').then(module => ({ default: module.AdminSecurityView })));
const AdminBannersView = lazy(() => import('./AdminBannersView').then(module => ({ default: module.AdminBannersView })));
const AdminWelcomeModalView = lazy(() => import('./AdminWelcomeModalView').then(module => ({ default: module.AdminWelcomeModalView })));
import { WidgetsStudioView } from '../components/admin/widgets/WidgetsStudioView';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminAppProps {
  onClose?: () => void;
}

function MainLayout({ onClose }: AdminAppProps) {
  const { activeView, setActiveView, lang, setIsOfferModalOpen, pendingView, cancelViewChange, confirmViewChange } = useAdminBridge();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGlobalProductSheetOpen, setIsGlobalProductSheetOpen] = useState(false);

  const isAr = lang === 'ar';

  const settingsViews = ['settings', 'social', 'backup', 'security'];
  const bannerViews = ['banners', 'welcome_modal'];
  const tabs = settingsViews.includes(activeView)
    ? [{ id: 'settings', ar: 'عام', en: 'General' }, { id: 'social', ar: 'التواصل', en: 'Social links' }, { id: 'backup', ar: 'النسخ الاحتياطي', en: 'Backup' }, { id: 'security', ar: 'الأمان', en: 'Security' }]
    : bannerViews.includes(activeView)
    ? [{ id: 'banners', ar: 'البانر وبطاقات الموسم', en: 'Banner & seasonal cards' }, { id: 'welcome_modal', ar: 'نافذة الترحيب', en: 'Welcome popup' }]
    : [];
  return (
    <div className="admin-workspace min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Lock Screen Component */}
      <LockScreen />

      {/* Mobile Drawer */}
      <AdminDrawer onClose={onClose} />

      {/* Global Product Form Sheet */}
      {isGlobalProductSheetOpen && <Suspense fallback={<p role="status">{isAr ? 'جاري فتح المحرر…' : 'Opening editor…'}</p>}><ProductFormSheet
        isOpen={isGlobalProductSheetOpen}
        onClose={() => setIsGlobalProductSheetOpen(false)}
      /></Suspense>}

      <Sheet isOpen={pendingView !== null} onClose={cancelViewChange} title={isAr ? 'مسودة غير محفوظة' : 'Unsaved draft'} footer={<div className="flex flex-wrap gap-2"><Button type="button" className="min-h-11" onClick={cancelViewChange}>{isAr ? 'البقاء والتعديل' : 'Keep editing'}</Button><Button type="button" variant="secondary" className="min-h-11" onClick={confirmViewChange}>{isAr ? 'المتابعة بدون حفظ' : 'Leave without saving'}</Button></div>}><p className="text-sm leading-7 text-slate-300">{isAr ? 'عندك تعديلات غير محفوظة. ابقَ بالصفحة لحفظها أو إلغائها؛ المتابعة تلغي المسودة فقط.' : 'You have unsaved changes. Stay to save or discard them; leaving discards only this draft.'}</p></Sheet>

      {/* Desktop App Layout */}
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col ${isAr ? 'border-l' : 'border-r'} border-slate-800/80 bg-slate-900/95 backdrop-blur-2xl sticky top-0 h-screen transition-all duration-300 z-20 shrink-0 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex-1 overflow-hidden flex flex-col">
            <Nav collapsed={isSidebarCollapsed} onCloseAdmin={onClose} />
          </div>

          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer w-full flex items-center justify-center"
              title={isSidebarCollapsed ? (isAr ? 'توسيع القائمة' : 'Expand Sidebar') : isAr ? 'طي القائمة' : 'Collapse Sidebar'}
            >
              {isAr ? (
                isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            onOpenProductSheet={() => setIsGlobalProductSheetOpen(true)}
            onOpenOfferSheet={() => setIsOfferModalOpen(true)}
            onCloseAdmin={onClose}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full min-w-0 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {tabs.length > 0 && <nav aria-label={isAr ? 'أقسام الصفحة' : 'Page sections'} className={`${bannerViews.includes(activeView) ? 'grid grid-cols-2' : 'grid grid-cols-2 sm:grid-cols-4'} gap-2 border-b border-slate-800 pb-3`}>
                {tabs.map((tab) => <button key={tab.id} type="button" aria-current={activeView === tab.id ? 'page' : undefined} onClick={() => setActiveView(tab.id as any)} className={`min-h-11 min-w-0 shrink-0 rounded-xl px-3 py-2 text-sm transition-colors ${activeView === tab.id ? 'bg-[#004ad7] text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{isAr ? tab.ar : tab.en}</button>)}
              </nav>}
              <Suspense fallback={<p role="status" className="p-6 text-slate-300">{isAr ? 'جاري تحميل القسم…' : 'Loading section…'}</p>}>
              {activeView === 'dashboard' && <AdminAnalyticsDashboard />}
              {activeView === 'orders' && <OrdersManager />}
              {activeView === 'products' && <ProductsManager />}
              {activeView === 'sizes' && <AdminSizesView />}
              {activeView === 'offers' && <AdminOffersManager />}
              {activeView === 'banners' && <AdminBannersView />}
              {activeView === 'welcome_modal' && <AdminWelcomeModalView />}
              {activeView === 'subscribers' && <SubscribersList />}
              {activeView === 'controls' && <AdminControlsView />}
              {activeView === 'social' && <AdminSocialView />}
              {activeView === 'backup' && <AdminBackupView />}
              {activeView === 'settings' && <SettingsView />}
              {activeView === 'security' && <AdminSecurityView />}
              {activeView === 'widgets' && <WidgetsStudioView lang={isAr ? 'ar' : 'en'} />}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App({ onClose }: AdminAppProps) {
  return (
    <AdminProvider>
      <MainLayout onClose={onClose} />
    </AdminProvider>
  );
}
