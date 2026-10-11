import React, { useState, useEffect } from 'react';
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
import { formatCurrency } from './format';
import { Button } from './ui';
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
  const [testEmailAddress, setTestEmailAddress] = useState('fs3211927@gmail.com');
  const [isSendingSimulation, setIsSendingSimulation] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
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
  const getAudienceSubscribers = (type: 'active' | 'all' | 'vip') => {
    if (type === 'active') return subscribers.filter((s) => s.status === 'active');
    if (type === 'vip') return subscribers.filter((s) => s.totalSpent > 150000 || s.tags.includes('VIP'));
    return subscribers;
  };

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
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formName) return;

    addSubscriber({
      name: formName,
      email: formEmail,
      phone: formPhone || '+964 770 000 0000',
      status: 'active',
      tags: formTag ? [formTag] : ['عميل جديد'],
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTag('');
    setIsAddModalOpen(false);

    showToast(isAr ? 'تمت إضافة العميل الجديد بنجاح!' : 'New subscriber added!');
  };

  // HTML Export / Copy
  const handleCopyHtmlCode = () => {
    const html = generateEmailHtml(campaignData);
    navigator.clipboard?.writeText(html);
    showToast(isAr ? 'تم نسخ كود HTML للرسالة بنجاح!' : 'HTML Code copied to clipboard!');
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
  const handleSendTestEmail = () => {
    setIsTestEmailModalOpen(false);
    showToast(
      isAr
        ? `تم إرسال معاينة تجريبية ناجحة إلى ${testEmailAddress}!`
        : `Test preview dispatched to ${testEmailAddress}!`
    );
  };

  const handleBroadcastViaMailto = () => {
    const recipientEmails = currentAudienceList.map((s) => s.email).join(',');
    const subjectEncoded = encodeURIComponent(campaignData.subject);
    const bodyEncoded = encodeURIComponent(
      `${campaignData.headline}\n\n${campaignData.bodyText}\n\n${
        campaignData.discountCode ? `كود الخصم: ${campaignData.discountCode}\n` : ''
      }${campaignData.ctaText}: ${campaignData.ctaUrl}`
    );

    const mailtoUrl = `mailto:?bcc=${recipientEmails}&subject=${subjectEncoded}&body=${bodyEncoded}`;
    window.open(mailtoUrl, '_blank');
    setIsDispatchModalOpen(false);

    showToast(isAr ? 'تم فتح تطبيق البريد مع إدراج إيميلات العملاء في BCC!' : 'Opened mail client with BCC recipients!');
  };

  const handleBroadcastViaSimulator = (channel: 'resend' | 'simulation') => {
    setIsSendingSimulation(true);
    setSimulationProgress(10);

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSendingSimulation(false);
          setIsDispatchModalOpen(false);

          const newRecord: SentCampaignRecord = {
            id: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
            name: campaignData.headline || 'حملة ترويجية',
            subject: campaignData.subject,
            templateType: campaignData.templateType,
            sentDate: new Date().toLocaleDateString('ar-IQ'),
            recipientsCount: currentAudienceList.length,
            openRate: Math.floor(45 + Math.random() * 35),
            clickRate: Math.floor(18 + Math.random() * 20),
            status: 'delivered',
            channel: channel,
            campaignData: { ...campaignData },
          };

          setSentHistory((prevHistory) => [newRecord, ...prevHistory]);
          showToast(
            isAr
              ? `تم بث الحملة بنجاح إلى ${currentAudienceList.length} مشترك!`
              : `Successfully broadcasted to ${currentAudienceList.length} subscribers!`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

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
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 end-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-indigo-400 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Header & Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'إدارة المشتركين وحملات البريد' : 'Subscribers & Email Studio'}
            </h2>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
              {subscribers.length} {isAr ? 'عميل' : 'subscribers'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إدارة قاعدة بيانات العملاء، تصميم واستعراض الرسائل التسويقية وإطلاق الحملات.'
              : 'Manage subscriber directory, compose rich email campaigns, and track dispatch analytics.'}
          </p>
        </div>

        {/* Header Action Buttons & Tabs Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {activeTab === 'directory' && (
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4 text-indigo-400" />}
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                >
                  {isAr ? 'تصدير البيانات' : 'Export Data'}
                </Button>

                {isExportMenuOpen && (
                  <div className="absolute end-0 top-full mt-1.5 w-68 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isAr ? 'اختر صيغة التقرير' : 'Export Format'}
                    </div>

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
                        setIsExportMenuOpen(false);
                        printSubscribersPDF();
                      }}
                      className="w-full text-start px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-semibold">{isAr ? 'طباعة / تقرير PDF' : 'Print / Save as PDF'}</div>
                        <div className="text-[10px] text-slate-400">{isAr ? 'تنسيق طباعة مخصص' : 'Print-ready clean layout'}</div>
                      </div>
                    </button>
                  </div>
                )}
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
                onClick={() => setIsTestEmailModalOpen(true)}
              >
                {isAr ? 'بريد تجريبي' : 'Test Email'}
              </Button>

              <Button
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setIsDispatchModalOpen(true)}
              >
                {isAr ? 'إطلاق الحملة' : 'Dispatch Campaign'}
              </Button>
            </div>
          )}

          {/* Navigation Tabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'دليل العملاء' : 'Directory'}</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'استوديو الحملات' : 'Email Studio'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'أرشيف الإرسال' : 'Sent History'}</span>
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
            deleteSubscriber={deleteSubscriber}
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
