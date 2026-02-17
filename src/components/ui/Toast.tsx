import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  const bgColors = {
    success: 'bg-green-500/90 border-green-400/50',
    error: 'bg-red-500/90 border-red-400/50',
    info: 'bg-blue-500/90 border-blue-400/50',
  };

  const icons = {
    success: <CheckCircle size={18} className="text-white" />,
    error: <AlertCircle size={18} className="text-white" />,
    info: <Info size={18} className="text-white" />,
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-white transition-all duration-300 ${bgColors[type]} ${show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => setShow(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
