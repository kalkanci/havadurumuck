
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Vibrate, Thermometer, Download } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
  onInstall?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate, onInstall }) => {
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

  const toggleUnit = () => {
    onUpdate({ ...settings, temperatureUnit: settings.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className={`relative w-full max-w-sm bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
        
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
            {/* Install PWA Button - Only visible if available */}
            {onInstall && (
                <button
                    onClick={onInstall}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl border border-white/10 flex items-center justify-between group active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20 text-white">
                            <Download size={18} />
                        </div>
                        <div className="text-left">
                            <span className="block text-white font-bold text-sm">Uygulamayı Yükle</span>
                            <span className="text-xs text-blue-100">Ana ekrana ekle</span>
                        </div>
                    </div>
                </button>
            )}

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

            {/* Temperature Unit */}
            <button
                onClick={toggleUnit}
                className="w-full bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${settings.temperatureUnit === 'celsius' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        <Thermometer size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-slate-200 font-bold text-sm">Sıcaklık Birimi</span>
                        <span className="text-xs text-slate-500">{settings.temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</span>
                    </div>
                </div>

                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-bold text-slate-300">
                    {settings.temperatureUnit === 'celsius' ? '°C' : '°F'}
                </div>
            </button>
        </div>

        <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-600">
                Veri Sağlayıcı: <a href="https://open-meteo.com/" target="_blank" className="text-blue-400 hover:underline">Open-Meteo</a>
                <br />Atmosfer AI v1.5
            </p>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
