import React, { useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from '../motion';
import type { SiteSettings } from '../useAdminBridge';
import { SPLASH_MOTIFS } from './constants';

interface SplashPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  formData: SiteSettings;
}

export const SplashPreviewModal: React.FC<SplashPreviewModalProps> = ({
  isOpen,
  onClose,
  isAr,
  formData,
}) => {
  // Keyboard shortcut (Escape) to close splash preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
        >
          {/* Ambient Background Aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15),_transparent_70%)] pointer-events-none" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse" />

          {/* Close Button Header */}
          <div className="absolute top-6 end-6 z-20 flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {isAr ? 'اضغط ESC أو الزر للخروج' : 'Press ESC or Click Exit'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold transition-all shadow-xl cursor-pointer"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>{isAr ? 'إغلاق المعاينة' : 'Exit Preview'}</span>
            </button>
          </div>

          {/* Central Animated Motif */}
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto space-y-6">
            {/* Golden Ring & Motif */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-indigo-600/30 to-amber-300/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 shadow-2xl shadow-amber-500/20 backdrop-blur-xl">
                {(() => {
                  const activeMotif =
                    SPLASH_MOTIFS.find((m) => m.key === formData.splashMotif) || SPLASH_MOTIFS[0];
                  const IconComp = activeMotif.icon;
                  return <IconComp className="w-14 h-14 sm:w-16 sm:h-16 text-amber-300 drop-shadow-md animate-pulse" />;
                })()}
              </div>
              {/* Pulsing ring around icon */}
              <span className="absolute -inset-2 rounded-3xl border border-amber-500/30 animate-ping pointer-events-none" />
            </motion.div>

            {/* Headlines */}
            <div className="space-y-2">
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow"
              >
                {formData.splashTextAr || 'دار الرافدين للأزياء الرفيعة'}
              </motion.h2>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xs sm:text-sm text-slate-400 tracking-wider uppercase font-medium"
              >
                {formData.splashTextEn || 'Dar Al-Rafidain Haute Couture'}
              </motion.p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-64 sm:w-80 space-y-2 pt-2">
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: (formData.splashDurationMs || 2500) / 1000,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-amber-300 rounded-full shadow-sm shadow-amber-400"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{isAr ? 'جاري التحميل...' : 'Loading bespoke catalog...'}</span>
                <span>{((formData.splashDurationMs || 2500) / 1000).toFixed(1)}s</span>
              </div>
            </div>

            {/* Maintenance badge if enabled */}
            {formData.maintenanceMode && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isAr ? 'وضع الصيانة نشط حالياً' : 'Maintenance Mode Active'}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
