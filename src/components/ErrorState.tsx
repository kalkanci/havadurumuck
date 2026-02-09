import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { triggerHapticFeedback } from '../utils/helpers';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
  icon?: 'wifi' | 'alert';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  title = 'Bir Hata Oluştu',
  icon = 'wifi'
}) => {

  const handleRetry = () => {
    if (onRetry) {
      triggerHapticFeedback(20);
      onRetry();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
      <div className="relative mb-6">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>

        <div className="relative z-10 p-5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full shadow-lg">
          {icon === 'wifi' ? (
            <WifiOff size={32} className="text-red-400" />
          ) : (
            <AlertTriangle size={32} className="text-red-400" />
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-red-100 mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-zinc-400 max-w-xs mx-auto mb-8 leading-relaxed text-sm">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={handleRetry}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-red-600/90 hover:bg-red-500 text-white font-semibold rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Tekrar Dene</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
