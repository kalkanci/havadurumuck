import React, { useEffect } from 'react';
import { WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (onClose && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const Icon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle : WifiOff;
  const bgColor = type === 'error' ? 'bg-red-500/90' : type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90';

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full shadow-lg backdrop-blur flex items-center gap-2 text-white ${bgColor} animate-fade-in-up`}>
      <Icon size={16} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Toast;
