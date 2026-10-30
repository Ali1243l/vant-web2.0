import { Sheet } from './Sheet';
import { Button } from './ui';
import React, { useState } from 'react';
import './admin.css';
import { AdminProvider, useAdminBridge } from './useAdminBridge';
import { AdminHeader } from './AdminHeader';
import { AdminDrawer } from './AdminDrawer';
import { Nav } from './Nav';
import { LockScreen } from './LockScreen';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { ProductsManager } from './ProductsManager';
import { AdminOffersManager } from './AdminOffersManager';
import { SubscribersList } from './SubscribersList';
import { OrdersManager } from './OrdersManager';
import { ProductFormSheet } from './ProductFormSheet';
import { SettingsView } from './SettingsView';
import { AdminSizesView } from './AdminSizesView';
import { AdminSocialView } from './AdminSocialView';
import { AdminControlsView } from './AdminControlsView';
import { AdminBackupView } from './AdminBackupView';
import { AdminSecurityView } from './AdminSecurityView';
import { AdminBannersView } from './AdminBannersView';
import { AdminWelcomeModalView } from './AdminWelcomeModalView';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Lock Screen Component */}
      <LockScreen />

      {/* Mobile Drawer */}
      <AdminDrawer onClose={onClose} />

      {/* Global Product Form Sheet */}
      <ProductFormSheet
        isOpen={isGlobalProductSheetOpen}
        onClose={() => setIsGlobalProductSheetOpen(false)}
      />

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
