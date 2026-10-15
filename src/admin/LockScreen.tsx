import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';

// Admin sign-in with the Supabase Auth account. No PIN and no quick-unlock.
export const LockScreen: React.FC = () => {
  const { isLocked, unlock, lang, currentStore } = useAdminBridge();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const isAr = lang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isChecking) return;
    setIsChecking(true);
    setError(null);
    const success = await unlock(password);
    setIsChecking(false);
    if (success) {
      setPassword('');
    } else {
      setError(isAr ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 select-none animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-950 ring-4 ring-slate-800">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="text-base font-bold text-white">{isAr ? 'دخول الإدارة' : 'Admin sign-in'}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{currentStore}</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          autoComplete="current-password"
          placeholder={isAr ? 'كلمة المرور' : 'Password'}
          className="w-full px-4 py-3 mb-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm outline-none focus:border-indigo-500"
          autoFocus
        />

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!password || isChecking}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isAr ? 'دخول' : 'Sign in'}</span>
        </button>
      </form>
    </div>
  );
};
export default LockScreen;
