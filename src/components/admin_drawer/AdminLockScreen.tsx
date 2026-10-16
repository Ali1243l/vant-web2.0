import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Unlock,
  Mail,
} from 'lucide-react';

export interface AdminLockScreenProps {
  isAr?: boolean;
  emailInput: string;
  setEmailInput: React.Dispatch<React.SetStateAction<string>>;
  isSigningIn: boolean;
  passwordInput: string;
  setPasswordInput: React.Dispatch<React.SetStateAction<string>>;
  passwordError: string | null;
  setPasswordError: React.Dispatch<React.SetStateAction<string | null>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handleUnlock: (e?: React.FormEvent) => void;
  onClose: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  isAr = true,
  emailInput,
  setEmailInput,
  isSigningIn,
  passwordInput,
  setPasswordInput,
  passwordError,
  setPasswordError,
  showPassword,
  setShowPassword,
  handleUnlock,
  onClose,
}) => {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131726] via-[#090b12] to-[#05060a]">
      {/* Ambient luxury glow ring */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#004ad7]/10 blur-3xl" />

      {/* Quick discreet close button for anyone who opened by mistake */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 sm:top-6 ltr:right-4 sm:ltr:right-6 rtl:left-4 sm:rtl:left-6 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        aria-label={isAr ? 'إغلاق والرجوع للمتجر' : 'Close and return to boutique'}
        title={isAr ? 'إغلاق والرجوع للمتجر' : 'Close and return to boutique'}
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={
          passwordError
            ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: 1, opacity: 1 }
            : { x: 0, scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#10131d]/95 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      >
        {/* Shield Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#004ad7]/25 to-[#004ad7]/5 border border-[#004ad7]/30 text-[#3b82f6] shadow-lg shadow-[#004ad7]/15 mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <h2 className="text-lg font-bold text-white tracking-tight">
          {isAr ? 'بوابة فانت · وصول محمي' : 'VANT · Secure Portal'}
        </h2>
        <p className="mt-2 text-xs text-white/50 leading-relaxed">
          {isAr
            ? 'سجل دخول بحساب الإدارة حتى تكمل'
            : 'Sign in with the admin account to continue'}
        </p>

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-white/40" />
            <input
              type="email"
              dir="ltr"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder="email@example.com"
              autoComplete="username"
              autoFocus
              required
              aria-label={isAr ? 'الإيميل' : 'Email'}
              className="h-12 w-full rounded-2xl border border-white/15 bg-black/60 px-10 text-center text-sm outline-none transition-all placeholder:text-white/20 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 text-white"
            />
          </div>
          <div className="relative flex items-center">
            <KeyRound className="pointer-events-none absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-white/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              aria-label={isAr ? 'كلمة السر' : 'Password'}
              className={`h-12 w-full rounded-2xl border bg-black/60 px-10 text-center text-sm tracking-widest outline-none transition-all placeholder:text-white/20 ${
                passwordError
                  ? 'border-[#3b82f6] ring-2 ring-[#3b82f6]/35 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'border-white/15 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 text-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute ltr:right-3 rtl:left-3 flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              title={showPassword ? 'إخفاء' : 'إظهار'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 text-xs text-[#93c5fd] font-medium"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-[#3b82f6] shrink-0" />
              <span>{passwordError}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className="disabled:opacity-60 disabled:cursor-wait flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#004ad7] to-[#2563eb] font-semibold text-xs text-white shadow-lg shadow-[#004ad7]/30 hover:from-[#004ad7]/90 hover:to-[#2563eb]/90 active:scale-98 transition-all cursor-pointer"
          >
            <Unlock className="h-4 w-4" />
            <span>{isSigningIn ? (isAr ? 'جاري الدخول...' : 'Signing in...') : isAr ? 'دخول' : 'Sign in'}</span>
          </button>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[11.5px] font-medium text-white/45 hover:text-white/80 transition-colors cursor-pointer"
            >
              {isAr ? 'الرجوع إلى المتجر والتشكيلة' : 'Return to Boutique & Collection'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLockScreen;
