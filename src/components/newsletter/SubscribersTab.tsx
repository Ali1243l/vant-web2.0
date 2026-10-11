import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Download,
  Plus,
  Mail,
  Check,
  Trash2,
} from 'lucide-react';
import {
  type NewsletterSubscriber,
  getStoredSubscribers,
  addSubscriber,
  removeSubscriber,
  exportSubscribersToCSV,
} from '../../lib/newsletter';

interface SubscribersTabProps {
  isAr: boolean;
  subscribers: NewsletterSubscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<NewsletterSubscriber[]>>;
  setFeedbackMsg: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>
  >;
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  isAr,
  subscribers,
  setSubscribers,
  setFeedbackMsg,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.source && s.source.toLowerCase().includes(q)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [subscribers, searchQuery]);

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === 'active').length,
    [subscribers]
  );

  const handleAddManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address',
      });
      return;
    }

    const res = await addSubscriber(clean, isAr ? 'إضافة يدوية من لوحة التحكم' : 'Admin Manual Entry');
    if (res.success) {
      setSubscribers(getStoredSubscribers());
      setNewEmailInput('');
      setFeedbackMsg({
        type: 'success',
        text: res.isNew
          ? isAr
            ? `تمت إضافة المشترك (${clean}) بنجاح`
            : `Added subscriber (${clean}) successfully`
          : isAr
          ? `البريد (${clean}) موجود مسبقاً في القائمة`
          : `Email (${clean}) already exists in the list`,
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف المشترك (${email})؟` : `Remove subscriber (${email})?`)) {
      await removeSubscriber(id);
      setSubscribers(getStoredSubscribers());
      setFeedbackMsg({
        type: 'success',
        text: isAr ? `تم حذف (${email}) من القائمة` : `Removed (${email})`,
      });
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  const handleCopyBCCList = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'active')
      .map((s) => s.email.trim())
      .join(', ');

    if (!activeEmails) {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'لا يوجد مشتركون نشطون للنسخ' : 'No active subscribers to copy',
      });
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedKey('bcc-list');
    setTimeout(() => setCopiedKey(null), 2500);
    setFeedbackMsg({
      type: 'success',
      text: isAr
        ? `تم نسخ (${activeCount}) بريد إلكتروني كـ BCC وجاهزة للإرسال الجماعي!`
        : `Copied ${activeCount} emails to clipboard (BCC ready)!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#14171d] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالإيميل أو المصدر...' : 'Search email or source...'}
            className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 pr-10 pl-3 py-2 text-xs text-black dark:text-white placeholder-zinc-500 font-mono outline-none focus:border-[#004ad7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBCCList}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold text-black dark:text-white cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{isAr ? 'نسخ الكل BCC' : 'Copy BCC'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportSubscribersToCSV(subscribers)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004ad7]/10 dark:bg-[#004ad7]/20 hover:bg-[#004ad7]/20 dark:hover:bg-[#004ad7]/30 border border-[#004ad7]/30 rounded-xl text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Manual Email Add Form */}
      <form
        onSubmit={handleAddManualEmail}
        className="flex items-center gap-2 bg-white dark:bg-[#14171d] p-3 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs"
      >
        <input
          type="email"
          value={newEmailInput}
          onChange={(e) => setNewEmailInput(e.target.value)}
          placeholder={isAr ? 'إضافة إيميل مشترك جديد يدوياً...' : 'Add subscriber email manually...'}
          className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white placeholder-zinc-500 font-mono outline-none focus:border-[#004ad7]"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#004ad7]/20"
        >
          <Plus className="h-4 w-4" />
          <span>{isAr ? 'إضافة' : 'Add'}</span>
        </button>
      </form>

      {/* Subscribers Table */}
      <div className="border border-black/5 dark:border-white/10 rounded-2xl bg-white dark:bg-[#14171d] overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-black/5 dark:bg-[#0f1218] border-b border-black/5 dark:border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-5">{isAr ? 'البريد الإلكتروني' : 'Subscriber Email'}</div>
          <div className="col-span-4 sm:col-span-3">{isAr ? 'تاريخ الاشتراك' : 'Date'}</div>
          <div className="hidden sm:block sm:col-span-2">{isAr ? 'المصدر' : 'Source'}</div>
          <div className="col-span-3 sm:col-span-2 text-center">{isAr ? 'إجراءات' : 'Actions'}</div>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[380px] overflow-y-auto">
          {filteredSubscribers.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Mail className="h-6 w-6 text-[#004ad7] dark:text-[#3b82f6] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-bold text-zinc-500">
                {isAr ? 'لا يوجد مشتركون في القائمة حالياً' : 'No subscribers found'}
              </p>
            </div>
          ) : (
            filteredSubscribers.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-black/5 dark:hover:bg-white/[0.02] text-xs transition-colors"
              >
                <div className="col-span-5 sm:col-span-5 truncate font-medium font-mono text-black dark:text-white" title={sub.email}>
                  {sub.email}
                </div>

                <div className="col-span-4 sm:col-span-3 text-xs text-zinc-500">
                  {new Date(sub.subscribed_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                <div className="hidden sm:block sm:col-span-2 text-[11px] text-zinc-500">
                  {sub.source || 'الموقع'}
                </div>

                <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sub.email);
                      setCopiedKey(sub.id);
                      setTimeout(() => setCopiedKey(null), 1500);
                    }}
                    className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title={isAr ? 'نسخ' : 'Copy'}
                  >
                    {copiedKey === sub.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                    className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribersTab;
