
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, X, Smartphone, CloudSun } from 'lucide-react';
import { triggerHapticFeedback } from '../utils/helpers';

interface PWAInstallBannerProps {
  deferredPrompt: any;
  onInstall: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ deferredPrompt, onInstall }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (isStandalone) {
      setIsVisible(false);
    } else {
      // Show immediately if prompt exists OR if iOS (unless dismissed in this session)
      // Small delay to allow app to render first
      const timer = setTimeout(() => {
          if (deferredPrompt || ios) {
            const hasDismissed = sessionStorage.getItem('pwa_dismissed');
            if (!hasDismissed) {
                setIsVisible(true);
                triggerHapticFeedback(20);
            }
          }
      }, 2000); // 2 saniye sonra aç

      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleClose = () => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    sessionStorage.setItem('pwa_dismissed', 'true'); // Don't show again in this session
    triggerHapticFeedback(10);
  };

  const handleClick = () => {
    triggerHapticFeedback(20);
    if (isIOS) {
      setIsVisible(false);
      setShowIOSInstructions(true);
    } else {
      onInstall();
      setIsVisible(false);
    }
  };

  if (!isMounted) return null;

  // --- iOS Instruction Modal ---
  if (showIOSInstructions) {
      return createPortal(
         <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setShowIOSInstructions(false)} />
             
             <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 pb-10 sm:pb-6 shadow-2xl animate-fade-in-up">
                 <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Share size={18} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">iOS Kurulumu</h3>
                     </div>
                     <button onClick={() => setShowIOSInstructions(false)} className="bg-white/5 p-2 rounded-full text-slate-400 hover:text-white transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 <div className="space-y-4 text-sm text-slate-300">
                     <div className="flex items-start gap-4">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">1</span>
                         <p>Tarayıcının alt menüsündeki <span className="text-blue-400 font-bold">Paylaş</span> butonuna dokunun.</p>
                     </div>
                     <div className="flex items-start gap-4">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">2</span>
                         <p>Menüyü yukarı kaydırın ve <span className="text-white font-bold">Ana Ekrana Ekle</span> seçeneğini bulun.</p>
                     </div>
                     <div className="flex items-start gap-4">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">3</span>
                         <p>Sağ üst köşedeki <span className="text-white font-bold">Ekle</span> butonuna basarak tamamlayın.</p>
                     </div>
                 </div>
             </div>
         </div>,
         document.body
      );
  }

  // --- Main Install Prompt Modal (Automatic) ---
  if (isVisible) {
    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />
            
            <div className="relative w-full max-w-xs bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-pop-in text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <CloudSun size={32} className="text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Atmosfer'i Yükle</h3>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Daha hızlı erişim ve tam ekran deneyimi için uygulamayı ana ekranınıza ekleyin.
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-colors"
                    >
                        Daha Sonra
                    </button>
                    <button 
                        onClick={handleClick}
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-colors"
                    >
                        Yükle
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
  }

  return null;
};

export default PWAInstallBanner;
