import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import {
  Users,
  Download,
  Plus,
  Send,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAdminBridge } from './useAdminBridge';
import { campaignAudience } from '../lib/adminAudience';
import { formatCurrency } from './format';
import { Button } from './ui';
import { Sheet } from './Sheet';
import {
  generateEmailHtml,
  EmailCampaignData,
  defaultCampaignData,
} from './WelcomeEmailTemplate';

import type { TabType, SentCampaignRecord } from './subscribers/types';
import { templatePresets, initialSentHistory } from './subscribers/presets';
import {
  exportSubscribersCSV,
  exportSubscribersExcel,
  exportSubscribersJSON,
  exportSubscribersMarkdown,
  copySubscribersClipboard,
  printSubscribersPDF,
} from './subscribers/exportUtils';

import { SubscribersDirectoryTab } from './subscribers/SubscribersDirectoryTab';
import { CampaignStudioTab } from './subscribers/CampaignStudioTab';
import { CampaignHistoryTab } from './subscribers/CampaignHistoryTab';
import { SubscriberModals } from './subscribers/SubscriberModals';

export const SubscribersList: React.FC = () => {
  const { subscribers, addSubscriber, deleteSubscriber, lang, products } = useAdminBridge();
  const isAr = lang === 'ar';

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('directory');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Subscriber Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTag, setFormTag] = useState('');

  // Email Campaign Studio State
  const [campaignData, setCampaignData] = useState<EmailCampaignData>(() => {
    const welcomePreset = templatePresets.welcome;
    return {
      ...defaultCampaignData,
      ctaUrl: window.location.origin,
      templateType: 'welcome',
      subject: welcomePreset.defaults.subject || defaultCampaignData.subject,
      preheader: welcomePreset.defaults.preheader || defaultCampaignData.preheader,
      headline: welcomePreset.defaults.headline || defaultCampaignData.headline,
      bodyText: welcomePreset.defaults.bodyText || defaultCampaignData.bodyText,
      discountCode: welcomePreset.defaults.discountCode || 'WELCOME20',
      discountPercent: welcomePreset.defaults.discountPercent || '20% خصم فوري',
      expireDate: welcomePreset.defaults.expireDate || 'خلال 7 أيام',
      ctaText: welcomePreset.defaults.ctaText || 'استكشف التشكيلة',
      heroImage: welcomePreset.defaults.heroImage || defaultCampaignData.heroImage,
    };
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'active' | 'all' | 'vip'>('active');

  // Dispatch & Simulation State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const isSendingSimulation = false;
  const simulationProgress = 0;
  const [sentHistory, setSentHistory] = useState<SentCampaignRecord[]>(initialSentHistory);
  const [previewingHistoryItem, setPreviewingHistoryItem] = useState<SentCampaignRecord | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered subscribers logic
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchSearch =
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.phone.includes(search);

    const matchStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalSpentAll = subscribers.reduce((acc, sub) => acc + sub.totalSpent, 0);

  // Audience calculator
  const getAudienceSubscribers = (type: 'active' | 'all' | 'vip') => campaignAudience(subscribers, type);

  const currentAudienceList = getAudienceSubscribers(selectedAudience);

  // Switch template preset
  const handleSelectTemplate = (tKey: EmailCampaignData['templateType']) => {
    const preset = templatePresets[tKey];
    if (!preset) return;

    setCampaignData({
      ...campaignData,
      templateType: tKey,
      subject: preset.defaults.subject || campaignData.subject,
      preheader: preset.defaults.preheader || campaignData.preheader,
      headline: preset.defaults.headline || campaignData.headline,
      bodyText: preset.defaults.bodyText || campaignData.bodyText,
      discountCode: preset.defaults.discountCode ?? campaignData.discountCode,
      discountPercent: preset.defaults.discountPercent ?? campaignData.discountPercent,
      expireDate: preset.defaults.expireDate ?? campaignData.expireDate,
      ctaText: preset.defaults.ctaText || campaignData.ctaText,
      heroImage: preset.defaults.heroImage || campaignData.heroImage,
    });

    showToast(isAr ? `تم اختيار قالب "${preset.nameAr}"` : `Template "${preset.nameEn}" selected`);
  };

  // Create new subscriber
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) return;
    if (subscribers.some(row => row.email.toLowerCase() === formEmail.trim().toLowerCase())) { showToast(isAr ? 'البريد مسجّل مسبقاً.' : 'Email already registered.'); return; }
    try {
    await addSubscriber({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      status: 'active',
      tags: formTag ? [formTag] : ['عميل جديد'],
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTag('');
    setIsAddModalOpen(false);

    showToast(isAr ? 'تم حفظ المشترك.' : 'Subscriber saved.');
    } catch { showToast(isAr ? 'تعذّر حفظ المشترك. راجع الاتصال وحاول ثانية.' : 'Could not save subscriber; retry.'); }
  };

  // HTML Export / Copy
  const handleCopyHtmlCode = async () => {
    const html = generateEmailHtml(campaignData);
    try { await navigator.clipboard.writeText(html); showToast(isAr ? 'تم نسخ HTML.' : 'HTML copied.'); } catch { showToast(isAr ? 'تعذّر النسخ؛ استخدم تحميل HTML.' : 'Copy failed; download HTML instead.'); }
  };

  const handleDownloadHtmlFile = () => {
    const html = generateEmailHtml(campaignData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email_campaign_${campaignData.templateType}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تحميل ملف HTML للرسالة!' : 'Downloaded HTML file!');
  };

  // Dispatch Actions
  const handleSendTestEmail = () => showToast(isAr ? 'الإرسال متوقف؛ استعمل معاينة القالب أو تحميل HTML.' : 'Sending is disabled; preview or download HTML.');

  const handleBroadcastViaMailto = () => {
    if (!currentAudienceList.length) { showToast(isAr ? 'لا يوجد مشتركون نشطون ضمن الجمهور.' : 'No active subscribers in audience.'); return; }
    const recipientEmails = currentAudienceList.map((s) => encodeURIComponent(s.email.trim())).join(',');
    const subjectEncoded = encodeURIComponent(campaignData.subject);
    const bodyEncoded = encodeURIComponent(
      `${campaignData.headline}\n\n${campaignData.bodyText}\n\n${
        campaignData.discountCode ? `كود الخصم: ${campaignData.discountCode}\n` : ''
      }${campaignData.ctaText}: ${campaignData.ctaUrl}`
    );

    const mailtoUrl = `mailto:?bcc=${recipientEmails}&subject=${subjectEncoded}&body=${bodyEncoded}`;
    if (mailtoUrl.length > 1800) { showToast(isAr ? 'المسودة أكبر من حد تطبيق البريد؛ صدّر الجمهور والقالب.' : 'Draft exceeds mail-client limit; export audience and HTML.'); return; }
    window.location.href = mailtoUrl;
    setIsDispatchModalOpen(false);

    showToast(isAr ? 'تم فتح تطبيق البريد مع إدراج إيميلات العملاء في BCC!' : 'Opened mail client with BCC recipients!');
  };

  const handleBroadcastViaSimulator = (_channel: 'resend' | 'simulation') => showToast(isAr ? 'الإرسال الآلي غير مفعّل. لا تُسجّل مسودة البريد كرسالة مُرسلة.' : 'Automated sending is disabled. Mail drafts are not recorded as sent.');

  // History controls
  const handleLoadCampaignFromHistory = (item: SentCampaignRecord) => {
    setCampaignData({ ...item.campaignData });
    setActiveTab('studio');
    showToast(isAr ? 'تم تحميل بيانات القالب إلى الاستوديو للتعديل!' : 'Loaded campaign template to studio!');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSentHistory((prev) => prev.filter((item) => item.id !== id));
    showToast(isAr ? 'تم حذف السجل من تاريخ الحملات' : 'Deleted from history log');
  };

  return (
    <div className="subscribers-manager min-w-0 space-y-5">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <div role="status" className="fixed bottom-6 inset-x-4 sm:start-auto sm:end-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-indigo-400 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Header & Tabs Navigation */}
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'المشتركون والحملات' : 'Subscribers & campaigns'}
            </h2>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
              {subscribers.length} {isAr ? 'عميل' : 'subscribers'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'دليل المشتركين وتصميم الرسائل. الإرسال الآلي متوقف؛ المعاينة والتصدير متاحان.'
              : 'Manage subscribers and design messages. Automated sending is disabled; preview and export are available.'}
          </p>
        </div>

        {/* Header Action Buttons & Tabs Switcher */}
        <div className="flex items-center gap-3 flex-wrap justify-between [&_button]:min-h-11 [&_button]:h-auto [&_button]:py-2">
          {activeTab === 'directory' && (
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4 text-indigo-400" />}
                  onClick={() => setIsExportMenuOpen(true)}
                  aria-haspopup="dialog" aria-expanded={isExportMenuOpen}
                >
                  {isAr ? 'تصدير البيانات' : 'Export Data'}
                </Button>


              </div>

              {/* Add Subscriber Button */}
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                {isAr ? 'إضافة عميل' : 'Add Subscriber'}
              </Button>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                leftIcon={<Send className="w-4 h-4 text-amber-400" />}
                disabled title={isAr ? 'الإرسال الآلي متوقف' : 'Automated sending disabled'}
              >
                {isAr ? 'بريد تجريبي' : 'Test Email'}
              </Button>

              <Button
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setIsDispatchModalOpen(true)}
              >
                {isAr ? 'مسودة البريد' : 'Mail draft'}
              </Button>
            </div>
          )}

          {/* Navigation Tabs Switcher */}
          <div className="grid w-full grid-cols-3 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 justify-center flex-col sm:flex-row ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'المشتركون' : 'Directory'}</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 justify-center flex-col sm:flex-row ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'الرسائل' : 'Studio'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 justify-center flex-col sm:flex-row ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'السجل' : 'History'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'directory' && (
          <SubscribersDirectoryTab
            subscribers={subscribers}
            filteredSubscribers={filteredSubscribers}
            totalSpentAll={totalSpentAll}
            search={search}
            setSearch={setSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            deleteSubscriber={async id => {
              if (!window.confirm(isAr ? 'حذف هذا المشترك نهائياً؟' : 'Permanently delete this subscriber?')) return;
              try { await deleteSubscriber(id); showToast(isAr ? 'تم الحذف.' : 'Deleted.'); }
              catch { showToast(isAr ? 'تعذّر الحذف؛ حاول ثانية.' : 'Delete failed; retry.'); }
            }}
            isAr={isAr}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'studio' && (
          <CampaignStudioTab
            campaignData={campaignData}
            setCampaignData={setCampaignData}
            handleSelectTemplate={handleSelectTemplate}
            subscribers={subscribers}
            currentAudienceList={currentAudienceList}
            selectedAudience={selectedAudience}
            setSelectedAudience={setSelectedAudience}
            getAudienceSubscribers={getAudienceSubscribers}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            showHtmlCode={showHtmlCode}
            setShowHtmlCode={setShowHtmlCode}
            handleCopyHtmlCode={handleCopyHtmlCode}
            handleDownloadHtmlFile={handleDownloadHtmlFile}
            products={products}
            isAr={isAr}
          />
        )}

        {activeTab === 'history' && (
          <CampaignHistoryTab
            sentHistory={sentHistory}
            setPreviewingHistoryItem={setPreviewingHistoryItem}
            handleLoadCampaignFromHistory={handleLoadCampaignFromHistory}
            handleDeleteHistoryItem={handleDeleteHistoryItem}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      <Sheet isOpen={isExportMenuOpen} onClose={() => setIsExportMenuOpen(false)} title={isAr ? 'تصدير المشتركين' : 'Export subscribers'} description={isAr ? `يشمل التصدير نتائج البحث والتصفية الحالية: ${filteredSubscribers.length} مشترك.` : `Exports the current search and filters: ${filteredSubscribers.length} subscribers.`} widthClass="max-w-md">
        <div className="space-y-2 [&_button]:min-h-14 [&_button]:border [&_button]:border-slate-700 [&_button]:rounded-xl [&_button]:text-sm [&_button]:p-4">
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        exportSubscribersExcel(filteredSubscribers, showToast, isAr);
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف إكسل Excel (.xls)' : 'Excel Spreadsheet (.xls)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'جدول منسق بالدينار العراقي' : 'Formatted styled sheet'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        exportSubscribersCSV(filteredSubscribers, showToast, isAr);
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف CSV (.csv)' : 'CSV File (.csv)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'ترميز UTF-8 المتوافق عالمياً' : 'Universal UTF-8 CSV'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        exportSubscribersJSON(filteredSubscribers, showToast, isAr);
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'ملف برمجيات JSON (.json)' : 'JSON Data (.json)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'هيكل برمجي لقواعد البيانات' : 'Developer DB structure'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        exportSubscribersMarkdown(filteredSubscribers, totalSpentAll, showToast, isAr);
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'جدول ماركداون Markdown (.md)' : 'Markdown Table (.md)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'جاهز للتوثيق و GitHub' : 'Docs / GitHub ready'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        copySubscribersClipboard(filteredSubscribers, showToast, isAr);
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'نسخ للحافظة (TSV)' : 'Copy to Clipboard (TSV)'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'للصق المباشر في Google Sheets' : 'Paste into Excel / Sheets'}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        flushSync(() => setIsExportMenuOpen(false));
                        printSubscribersPDF();
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'طباعة الصفحة' : 'Print / Save as PDF'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'خيارات الطباعة في المتصفح' : 'Print-ready clean layout'}</div>
                      </div>
                    </button>

        </div>
      </Sheet>

      {/* Modals */}
      <SubscriberModals
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        formName={formName}
        setFormName={setFormName}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formTag={formTag}
        setFormTag={setFormTag}
        handleCreate={handleCreate}

        isTestEmailModalOpen={isTestEmailModalOpen}
        setIsTestEmailModalOpen={setIsTestEmailModalOpen}
        testEmailAddress={testEmailAddress}
        setTestEmailAddress={setTestEmailAddress}
        handleSendTestEmail={handleSendTestEmail}

        isDispatchModalOpen={isDispatchModalOpen}
        setIsDispatchModalOpen={setIsDispatchModalOpen}
        campaignData={campaignData}
        currentAudienceList={currentAudienceList}
        isSendingSimulation={isSendingSimulation}
        simulationProgress={simulationProgress}
        handleBroadcastViaSimulator={handleBroadcastViaSimulator}
        handleBroadcastViaMailto={handleBroadcastViaMailto}

        previewingHistoryItem={previewingHistoryItem}
        setPreviewingHistoryItem={setPreviewingHistoryItem}
        handleLoadCampaignFromHistory={handleLoadCampaignFromHistory}

        isAr={isAr}
      />
    </div>
  );
};
