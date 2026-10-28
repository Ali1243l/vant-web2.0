import React from 'react';
import { Edit2, Tag, Link2, Copy, Trash2, Eye, Check } from 'lucide-react';
import type { Product } from '../useAdminBridge';
import { productLink } from './catalogModel';

export interface ProductActionsProps {
  isAr: boolean; copiedId: string | null;
  onQuickEdit: (product: Product) => void; onOpenOfferModal: (product: Product) => void;
  onCopyLink: (product: Product) => void; onDuplicate: (product: Product) => void; onDeleteConfirm: (id: string) => void;
}
export const ProductActions: React.FC<ProductActionsProps & { product: Product }> = ({ product, isAr, copiedId, ...actions }) => {
  const controls = [
    { label: isAr ? 'تعديل' : 'Edit', icon: Edit2, action: () => actions.onQuickEdit(product) },
    { label: isAr ? 'العرض' : 'Offer', icon: Tag, action: () => actions.onOpenOfferModal(product) },
    { label: isAr ? (copiedId === product.id ? 'تم النسخ' : 'نسخ الرابط') : (copiedId === product.id ? 'Copied' : 'Copy link'), icon: copiedId === product.id ? Check : Link2, action: () => actions.onCopyLink(product) },
    { label: isAr ? 'نسخة جديدة' : 'New copy', icon: Copy, action: () => actions.onDuplicate(product) },
    { label: isAr ? 'حذف' : 'Delete', icon: Trash2, action: () => actions.onDeleteConfirm(product.id) },
  ];
  return <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${isAr ? 'إجراءات' : 'Actions for'} ${product.name}`}>
    <a href={productLink(window.location.origin, product.id)} target="_blank" rel="noopener noreferrer" aria-label={`${isAr ? 'معاينة' : 'Preview'} ${product.name}`} className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:text-white" title={isAr ? 'معاينة المنتج' : 'Preview product'}><Eye className="w-4 h-4" /></a>
    {controls.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} aria-label={`${label} ${product.name}`} title={label} className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-400 ${Icon === Trash2 ? 'text-rose-300' : 'text-indigo-200'}`}><Icon className="w-4 h-4" /></button>)}
  </div>;
};
