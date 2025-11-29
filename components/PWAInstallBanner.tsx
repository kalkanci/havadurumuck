
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
      {/* Banner at the bottom */}
      <div className="fixed bottom-24 left-4 right-4 z-40 animate-fade-in-up">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                  <Smartphone size={20} className="text-white" />
              </div>
              <div>
                  <h4 className="font-bold text-white text-sm">Uygulamayı Yükle</h4>
                  <p className="text-xs text-slate-400">Daha hızlı erişim ve tam ekran deneyimi.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
               <button 
                 onClick={handleClose}
                 className="p-2 text-slate-400 hover:text-white transition-colors"
               >
                 <X size={18} />
               </button>
               <button 
                 onClick={handleClick}
                 className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors shadow-lg"
               >
                 Yükle
               </button>
           </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && createPortal(
         <div className="fixed inset-0 z-[600] flex items-end justify-center sm:items-center">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIOSInstructions(false)} />
             
             <div className="relative w-full max-w-sm bg-slate-900 border-t border-white/10 sm:border sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-fade-in-up">
                 <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-white">iOS'a Nasıl Yüklenir?</h3>
                     <button onClick={() => setShowIOSInstructions(false)} className="bg-white/5 p-2 rounded-full text-slate-400">
                         <X size={20} />
                     </button>
                 </div>

                 <div className="space-y-4 text-sm text-slate-300">
                     <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">1</span>
                         <p>Tarayıcının altındaki <Share size={16} className="inline mx-1 text-blue-400" /> <strong>Paylaş</strong> butonuna dokunun.</p>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">2</span>
                         <p>Aşağı kaydırın ve <PlusSquare size={16} className="inline mx-1 text-white" /> <strong>Ana Ekrana Ekle</strong>'yi seçin.</p>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">3</span>
                         <p>Sağ üst köşedeki <strong>Ekle</strong> butonuna basın.</p>
                     </div>
                 </div>
                 
                 <div className="mt-6 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
                     <p className="text-xs text-blue-300 font-medium">Bu işlem uygulamayı ana ekranınıza ekleyecektir.</p>
                 </div>
             </div>
         </div>,
         document.body
      )}
    </>
  );
};

export default PWAInstallBanner;
