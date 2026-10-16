import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import BrandLogo from './splash/BrandLogo';

interface Props {
  maintenanceMessage?: string;
  maintenanceMessageAr?: string;
  isPreview?: boolean;
  onClosePreview?: () => void;
  whatsappPhone?: string;
}

export default function MaintenanceScreen({
  maintenanceMessage,
  maintenanceMessageAr,
  isPreview = false,
  onClosePreview,
  whatsappPhone,
}: Props) {
  const reduceMotion = useReducedMotion();
  const root = document.documentElement;
  const isAr = root.dir === 'rtl' || root.lang.startsWith('ar');

  const message = isAr
    ? maintenanceMessageAr?.trim() || 'نشتغل على تحديث المتجر، ونرجع نستقبل طلباتكم قريباً.'
    : maintenanceMessage?.trim() || "We're updating the store and will be taking orders again soon.";
  const phone = whatsappPhone?.replace(/\D/g, '') ?? '';
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        isAr ? 'مرحباً فانت، أريد أستفسر عن الطلبات' : 'Hello VANT, I have a question about orders'
      )}`
    : '';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`flex min-h-[100dvh] w-full flex-col bg-[#f8f9fa] font-sans text-[#15171c] dark:bg-[#0d0f12] dark:text-[#f3f4f6] ${
        isPreview ? 'fixed inset-0 z-[9999] overflow-y-auto' : ''
      }`}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {isPreview && (
        <div className="mx-auto mb-4 flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-[#004ad7]/20 bg-[#004ad7]/[0.06] py-2 ps-4 pe-2 text-sm font-semibold text-[#004ad7] dark:border-[#3b82f6]/30 dark:bg-[#3b82f6]/10 dark:text-[#93c5fd]">
          <span>{isAr ? 'معاينة شاشة الصيانة' : 'Maintenance screen preview'}</span>
          <button
            type="button"
            onClick={onClosePreview}
            aria-label={isAr ? 'إغلاق المعاينة' : 'Close preview'}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#004ad7]/10 dark:hover:bg-[#3b82f6]/15"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <main className="my-auto flex w-full justify-center">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-black/10 bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:px-10 sm:py-12 dark:border-white/15 dark:bg-[#181b22] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          <BrandLogo className="text-[20px] sm:text-[24px]" />

          <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-[#004ad7] dark:bg-[#3b82f6]" />

          <div className="space-y-3">
            <h1 className="text-2xl font-bold sm:text-3xl">{isAr ? 'نرجع قريب' : 'Back soon'}</h1>
            <p className="text-[15px] leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">{message}</p>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isAr ? 'تواصل معنا على واتساب' : 'Contact us on WhatsApp'}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#004ad7] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#003db3] sm:w-auto dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'تواصل معنا على واتساب' : 'Message us on WhatsApp'}</span>
            </a>
          )}
        </motion.div>
      </main>
    </div>
  );
}
