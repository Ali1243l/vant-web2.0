import React from 'react';
import { useAdminBridge } from './useAdminBridge';
import { ADMIN_EMAIL } from '../lib/supabase';
import { KeyRound, ShieldCheck, Lock } from 'lucide-react';

// The admin password lives in Supabase Auth, not in the site. Change it from the
// Supabase dashboard (Authentication > Users) or via its password-reset email.
export const AdminSecurityView: React.FC = () => {
  const { lang, lock } = useAdminBridge();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'الأمان والدخول' : 'Security & Sign-in'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'دخول الإدارة يتم عبر حساب Supabase Auth. ما توجد كلمة مرور أو PIN محفوظة داخل الموقع.'
                : 'Admin sign-in uses a Supabase Auth account. No password or PIN is stored in the site.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'الحساب المسموح له بالدخول:' : 'Account allowed to sign in:'}</span>
          <span className="font-mono text-white">{ADMIN_EMAIL}</span>
        </div>

        <p className="text-xs text-slate-500">
          {isAr
            ? 'لتغيير كلمة المرور: من لوحة Supabase > Authentication > Users، أو عبر رابط استرجاع كلمة المرور على الإيميل.'
            : 'To change the password: Supabase Dashboard > Authentication > Users, or use the password-reset email.'}
        </p>

        <button
          type="button"
          onClick={lock}
          className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'تسجيل الخروج وقفل الشاشة' : 'Sign out & lock'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSecurityView;
