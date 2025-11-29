
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { triggerHapticFeedback } from '../utils/helpers';

interface PWAInstallBannerProps {
  deferredPrompt: any;
  onInstall: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ deferredPrompt, onInstall }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (isStandalone) {
      setIsVisible(false);
    } else {
      // If Android (deferredPrompt exists) OR iOS (always show unless dismissed)
      if (deferredPrompt || ios) {
         // Check if user dismissed it previously in this session (optional, kept simple for now)
         setIsVisible(true);
      }
    }
  }, [deferredPrompt]);

  const handleClose = () => {
    setIsVisible(false);
    triggerHapticFeedback(10);
  };

  const handleClick = () => {
    triggerHapticFeedback(20);
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      onInstall();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* In-Flow Banner (High Visibility) */}
      <div className="w-full max-w-sm mx-auto mb-6 px-2 animate-fade-in-up relative z-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-xl shadow-blue-500/20 flex items-center justify-between gap-3 border border-blue-400/30">
           
           <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                  <Download size={22} className="text-white animate-bounce" />
              </div>
              <div className="text-left">
                  <h4 className="font-bold text-white text-sm leading-tight">Uygulamayı Yükle</h4>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">Daha hızlı ve tam ekran deneyim.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 shrink-0">
               <button 
                 onClick={handleClick}
                 className="bg-white text-blue-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-50 transition-transform active:scale-95 shadow-md tracking-wide"
               >
                 YÜKLE
               </button>
               <button 
                 onClick={handleClose}
                 className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
               >
                 <X size={18} />
               </button>
           </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && createPortal(
         <div className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setShowIOSInstructions(false)} />
             
             <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-fade-in-up">
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
      )}
    </>
  );
};

export default PWAInstallBanner;
