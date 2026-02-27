import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
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
        return <CheckCircle size={20} className="text-emerald-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md border shadow-2xl ${getBackground()} bg-slate-900/90`}>
        {getIcon()}
        <span className="text-sm font-medium text-white">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
          aria-label="Kapat"
        >
          <X size={16} className="text-slate-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
