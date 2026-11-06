import { useEffect, useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import AdminLockScreen from '../components/admin_drawer/AdminLockScreen';

export const LockScreen = () => {
  const { isLocked, unlock, lang } = useAdminBridge();
  const { setIsAdminOpen } = useSiteControls();
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { if (!isLocked) { setPasswordInput(''); setPasswordError(false); setShowPassword(false); } }, [isLocked]);
  if (!isLocked) return null;
  return <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950">
    <AdminLockScreen isAr={lang === 'ar'} passwordInput={passwordInput} setPasswordInput={setPasswordInput} passwordError={passwordError} setPasswordError={setPasswordError} showPassword={showPassword} setShowPassword={setShowPassword} handleUnlock={event => { event?.preventDefault(); setPasswordError(!unlock(passwordInput)); }} onClose={() => setIsAdminOpen(false)} />
  </div>;
};
export default LockScreen;
