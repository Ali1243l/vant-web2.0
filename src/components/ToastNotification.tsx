import React from 'react';
import { CheckCircle2, Sparkles, Cloud, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from '../admin/motion';

export interface ToastMessage {
  text: string;
  sub?: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastNotificationProps {
  message: ToastMessage | null;
  onClose: () => void;
  position?: 'top-end' | 'bottom-start' | 'bottom-center' | 'top-center';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  position = 'top-end',
}) => {
  if (!message) return null;

  const positionClasses = {
    'top-end': 'top-5 end-5',
    'bottom-start': 'bottom-6 start-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-center': 'top-5 left-1/2 -translate-x-1/2',
  }[position];

  const type = message.type || 'success';

  const styleMap = {
    success: {
      container: 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-2xl',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      Icon: CheckCircle2,
    },
    info: {
      container: 'bg-indigo-950/95 border-indigo-500/40 text-indigo-200 shadow-2xl',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      Icon: Sparkles,
    },
    error: {
      container: 'bg-rose-950/95 border-rose-500/40 text-rose-200 shadow-2xl',
      iconBg: 'bg-rose-500/20 text-rose-400',
      Icon: AlertCircle,
    },
  }[type];

  const IconComponent = styleMap.Icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: position.startsWith('top') ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.startsWith('top') ? -20 : 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${positionClasses} z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md max-w-md ${styleMap.container}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styleMap.iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">{message.text}</p>
            {message.sub && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Cloud className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{message.sub}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 ms-2 cursor-pointer shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
