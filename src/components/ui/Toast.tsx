
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  let bgClass = 'bg-slate-900';
  let iconColor = 'text-blue-500';
  let Icon = Info;

  switch (type) {
    case 'success':
      bgClass = 'bg-slate-900 border-emerald-500/30';
      iconColor = 'text-emerald-500';
      Icon = CheckCircle;
      break;
    case 'error':
      bgClass = 'bg-slate-900 border-red-500/30';
      iconColor = 'text-red-500';
      Icon = AlertCircle;
      break;
    default:
      bgClass = 'bg-slate-900 border-blue-500/30';
      iconColor = 'text-blue-500';
      Icon = Info;
      break;
  }

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 animate-fade-in-up">
      <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${bgClass} backdrop-blur-md`}>
        <div className={`p-2 rounded-full bg-white/5 ${iconColor}`}>
          <Icon size={20} />
        </div>
        <p className="flex-1 text-sm font-medium text-white">{message}</p>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
