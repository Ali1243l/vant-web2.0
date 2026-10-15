import React from 'react';
import { KeyRound } from 'lucide-react';
import { ADMIN_EMAIL } from '../../lib/supabase';

interface AdminSecurityTabProps {
  isAr: boolean;
}

// The admin password is managed in Supabase Auth, never stored in the site.
export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ isAr }) => {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-rose-400" />
          <span>{isAr ? 'الأمان والدخول' : 'Security & Sign-in'}</span>
        </h2>
        <p className="text-xs text-white/60 mt-0.5">
          {isAr ? 'دخول الإدارة عبر حساب Supabase Auth' : 'Admin sign-in uses a Supabase Auth account'}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
        <p className="text-xs text-white/70">
          {isAr ? 'الحساب المسموح له بالدخول:' : 'Account allowed to sign in:'}{' '}
          <span className="font-mono text-white">{ADMIN_EMAIL}</span>
        </p>
        <p className="text-xs text-white/50">
          {isAr
            ? 'لتغيير كلمة المرور: من لوحة Supabase > Authentication > Users، أو عبر رابط استرجاع كلمة المرور على الإيميل.'
            : 'To change the password: Supabase Dashboard > Authentication > Users, or use the password-reset email.'}
        </p>
      </div>
    </div>
  );
};

export default AdminSecurityTab;
