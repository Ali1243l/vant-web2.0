import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Language } from '../types';
import NewAdminApp from '../admin/App';
import AdminLockScreen from './admin_drawer/AdminLockScreen';

interface Props {
  lang?: Language;
}

export default function AdminDrawer({ lang = 'ar' }: Props) {
  const isAr = lang === 'ar';
  const { isAdminOpen, setIsAdminOpen, isAdminUnlocked, unlockAdmin } = useSiteControls();

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lock background page scrollbars completely when Admin Command Center is open
  useEffect(() => {
    if (isAdminOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isAdminOpen]);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = unlockAdmin(passwordInput.trim());
    if (success) {
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  return (
    <AnimatePresence>
      {isAdminOpen && (
        <motion.div
          key="admin-drawer-root"
          initial={{ opacity: 0, scale: 0.985, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#08090d] text-[#f3f4f6] overflow-hidden select-none font-sans"
        >
          {!isAdminUnlocked ? (
            <AdminLockScreen
              isAr={isAr}
              passwordInput={passwordInput}
              setPasswordInput={setPasswordInput}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleUnlock={handleUnlock}
              onClose={() => setIsAdminOpen(false)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-950">
              <NewAdminApp onClose={() => setIsAdminOpen(false)} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
