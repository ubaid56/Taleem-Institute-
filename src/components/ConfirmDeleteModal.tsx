import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  itemName,
  confirmText = "Delete Permanently",
  cancelText = "Cancel",
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-[#1A1A1A] animate-fadeIn">
      <div className="bg-white border-2 border-[#1A1A1A] max-w-md w-full p-6 shadow-2xl space-y-4 rounded-lg">
        
        <div className="flex items-start justify-between pb-3 border-b-2 border-[#1A1A1A]">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded ${isDanger ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-[#1A1A1A] font-medium leading-relaxed">{message}</p>
          {itemName && (
            <div className="p-2.5 bg-[#F4F2EE] border border-[#1A1A1A] font-mono font-bold text-xs text-[#1A1A1A] rounded">
              {itemName}
            </div>
          )}
          {isDanger && (
            <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
              ⚠️ Warning: This operation cannot be undone.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t-2 border-[#1A1A1A]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F4F2EE] hover:bg-white text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition rounded"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 font-bold text-xs uppercase tracking-widest text-white transition flex items-center space-x-1.5 rounded shadow-sm ${
              isDanger
                ? 'bg-rose-800 hover:bg-rose-900 border border-rose-900'
                : 'bg-[#1a365d] hover:bg-blue-900 border border-blue-950'
            }`}
          >
            {isDanger && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
