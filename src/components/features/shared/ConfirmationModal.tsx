'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-black mb-8 leading-relaxed font-medium">
        {message}
        <span className="block mt-2 font-bold">This action cannot be undone.</span>
      </p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
        >
          Confirm Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
