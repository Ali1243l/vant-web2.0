import React, { useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { supabase } from '../lib/supabase';
import { KeyRound, Check, LogOut, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminSecurityView: React.FC = () => {
  const { lang, lock } = useAdminBridge();
  const isAr = lang === 'ar';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg(isAr ? 'كلمة السر لازم تكون 8 أحرف أو أكثر' : 'Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isAr ? 'التأكيد ما يطابق كلمة السر' : 'Confirmation does not match');
      return;
    }
    if (!supabase) return;

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSaving(false);
    if (error) {
      setErrorMsg(isAr ? `ما انحفظت: ${error.message}` : `Not saved: ${error.message}`);
      return;
    }
    setSuccessMsg(isAr ? 'تغيرت كلمة السر. استخدمها بالدخول الجاي.' : 'Password changed. Use it next time you sign in.');
    setNewPassword('');
    setConfirmPassword('');
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 outline-none';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{isAr ? 'الأمان وكلمة السر' : 'Security & password'}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'غيّر كلمة سر حساب الإدارة، أو اطلع من الحساب على هذا الجهاز.'
                : 'Change the admin account password, or sign out on this device.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">{isAr ? 'كلمة السر الجديدة' : 'New password'}</span>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">{isAr ? 'تأكيد كلمة السر' : 'Confirm password'}</span>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
                required
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPasswords ? (isAr ? 'إخفاء' : 'Hide') : isAr ? 'إظهار' : 'Show'}</span>
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ كلمة السر' : 'Save password'}
            </button>
            <button
              type="button"
              onClick={lock}
              className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAr ? 'تسجيل خروج' : 'Sign out'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSecurityView;
