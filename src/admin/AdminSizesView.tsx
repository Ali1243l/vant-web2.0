import React from 'react';
import { useAdminBridge } from './useAdminBridge';
import AdminSizesManager from '../components/AdminSizesManager';

export const AdminSizesView: React.FC = () => {
  const { lang } = useAdminBridge();
  return <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"><AdminSizesManager isAr={lang === 'ar'} /></div>;
};
export default AdminSizesView;
