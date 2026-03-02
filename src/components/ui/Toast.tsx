import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return createPortal(
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl ${getBgColor()}`}>
        {getIcon()}
        <span className="text-sm font-medium text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/50 hover:text-white transition-colors">
            <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
