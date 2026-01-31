
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Vibrate } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const toggleHaptics = () => {
    onUpdate({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className={`relative w-full max-w-sm bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
        
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
               <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
                   <Settings size={20} className="text-white" />
               </div>
               <h2 className="text-xl font-bold text-white">Ayarlar</h2>
           </div>
           <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
               <X size={20} />
           </button>
        </div>

        <div className="space-y-4">
            {/* Haptics */}
            <button 
                onClick={toggleHaptics}
                className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${settings.hapticsEnabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-500'}`}>
                        <Vibrate size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-slate-200 font-bold text-sm">Titreşim</span>
                        <span className="text-xs text-slate-500">Dokunsal geri bildirim</span>
                    </div>
                </div>
                
                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${settings.hapticsEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </button>
        </div>

        <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-600">
                Veri Sağlayıcı: <a href="https://open-meteo.com/" target="_blank" className="text-blue-400 hover:underline">Open-Meteo</a>
                <br />Atmosfer AI v1.4
            </p>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
