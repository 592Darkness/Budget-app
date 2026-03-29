import React from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-app-card rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-app-border">
        <div className="p-6">
          <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-6 ${isDestructive ? 'bg-red-500/10' : 'bg-[#6366F1]/10'}`}>
            <X className={`w-8 h-8 ${isDestructive ? 'text-red-500' : 'text-[#6366F1]'}`} />
          </div>
          <h2 className="text-2xl font-bold text-center text-app-text mb-2">{title}</h2>
          <p className="text-center text-app-muted mb-8">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`w-full py-4 text-app-text rounded-2xl font-bold text-lg transition-colors shadow-lg ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-[#6366F1] hover:bg-[#4F46E5] shadow-[#6366F1]/20'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 bg-app-hover hover:bg-app-hover text-app-text rounded-2xl font-bold text-lg transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
