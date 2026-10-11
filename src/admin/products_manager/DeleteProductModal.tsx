import React from 'react';
import { Button, Modal } from '../ui';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isAr: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isAr,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'تأكيد حذف المنتج' : 'Confirm Product Deletion'}
      maxWidth="sm"
    >
      <p className="text-sm text-slate-300 mb-6">
        {isAr
          ? 'هل أنت متأكد من رغبتك في إزالة هذا المنتج من الكتالوج؟ لا يمكن التراجع عن هذا الإجراء.'
          : 'Are you sure you want to permanently remove this product? This action cannot be reversed.'}
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {isAr ? 'نعم، حذف الآن' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
};
