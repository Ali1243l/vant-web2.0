import React, { useState } from 'react';
import { KeyRound, Check } from 'lucide-react';
import { useSiteControls } from '../../context/SiteControlsContext';

interface AdminSecurityTabProps {
  isAr: boolean;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({ isAr }) => {
  const { setAdminPin } = useSiteControls();
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSavePassword = () => {
    if (newPassword.trim().length >= 4) {
      try { setAdminPin(newPassword.trim()); }
      catch { window.alert(isAr ? 'تعذّر حفظ الرمز. حاول ثانية.' : 'Could not save code. Retry.'); return; }
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setNewPassword('');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-rose-400" />
          <span>{isAr ? 'الأمان وتغيير كلمة المرور' : 'Security & Access Key'}</span>
        </h2>
        <p className="text-xs text-white/60 mt-0.5">
          {isAr ? 'تغيير كلمة المرور الخاصة بالدخول لمركز العمليات' : 'Change master operations security key'}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-white/70 block mb-1">
            {isAr ? 'كلمة المرور الجديدة' : 'New Master Password'}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-2xl border border-white/15 bg-black/40 px-4 text-sm text-white font-mono outline-none focus:border-[#3b82f6]"
          />
        </div>

        <button
          type="button"
          onClick={handleSavePassword}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#004ad7] font-semibold text-xs text-white shadow-md hover:bg-[#004ad7]/90 transition-all cursor-pointer"
        >
          {passwordSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <KeyRound className="h-4 w-4" />}
          <span>
            {passwordSuccess
              ? isAr
                ? 'تم الحفظ وتحديث كلمة المرور!'
                : 'Saved successfully!'
              : isAr
              ? 'حفظ كلمة المرور'
              : 'Save Password'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSecurityTab;
