
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Quote, Activity, Zap } from 'lucide-react';
import { WeatherData, AdviceResponse } from '../types';
import { generateSmartAdvice, triggerHapticFeedback } from '../utils/helpers';

interface AdviceCardProps {
  weather: WeatherData;
  cityName: string;
  unit: 'celsius' | 'fahrenheit';
}

const AdviceCard: React.FC<AdviceCardProps> = ({ weather, cityName, unit }) => {
  const [data, setData] = useState<AdviceResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const advice = generateSmartAdvice(weather, unit);
    setData(advice);
  }, [weather, cityName, unit]);

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

  const handleOpenWithDelay = () => {
    triggerHapticFeedback(20);
    setTimeout(() => {
        setIsOpen(true);
        setIsClosing(false);
    }, 200);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
    }, 200);
  };

  const renderModal = () => {
    if (!isOpen || !data) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Cinematic Backdrop with Deep Blur */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-500"
                onClick={handleClose} 
            />
            
            <div className={`relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-3xl overflow-hidden bg-slate-950 flex flex-col shadow-2xl ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                
                {/* Full Screen Cinematic Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black z-0"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full z-0 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-cyan-600/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>

                {/* Close Button */}
                <button 
                    onClick={handleClose} 
                    className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/10 z-50 transition-all active:scale-90 border border-white/5"
                >
                    <X size={24} />
                </button>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar p-8 pt-20 md:p-12">
                    
                    {/* Header Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl">
                                <Sparkles size={40} className="text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]" />
                            </div>
                        </div>
                    </div>

                    {/* Main Title (Cinematic Typography) */}
                    <div className="text-center mb-8">
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-blue-300/80 mb-4 block">Günün Modu</span>
                        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tighter leading-none pb-2">
                            {data.mood}
                        </h2>
                    </div>

                    {/* Quote / Advice Section */}
                    <div className="mb-10 relative">
                        <Quote size={40} className="absolute -top-6 -left-4 text-white/10 rotate-180" />
                        <p className="text-xl md:text-2xl font-light text-slate-200 leading-relaxed text-center px-4 drop-shadow-md">
                            {data.advice}
                        </p>
                        <Quote size={40} className="absolute -bottom-6 -right-4 text-white/10" />
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10"></div>

                    {/* Activities List */}
                    {data.activities && data.activities.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center mb-6">Önerilen Aktiviteler</h3>
                            
                            <div className="grid gap-4">
                                {data.activities.map((act, idx) => (
                                    <div 
                                        key={idx} 
                                        className="group relative overflow-hidden bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all active:scale-98"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="p-2.5 bg-slate-900 rounded-xl shadow-inner text-blue-400 group-hover:text-blue-300 transition-colors">
                                                <Zap size={20} />
                                            </div>
                                            <span className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">{act}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-auto pt-10 text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Atmosfer AI Analysis</p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
  };

  if (!data) return null;

  return (
    <>
    <button 
      onClick={handleOpenWithDelay}
      className="w-full glass-card rounded-3xl p-6 my-5 flex flex-col relative group overflow-hidden border border-white/5 transition-all duration-300 transform active:scale-[0.97] active:brightness-90 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Background Gradient/Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 z-10">
           <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Sparkles size={14} className="text-blue-300" />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200/80">
                Günün Modu
           </span>
      </div>

      {/* Main Content Preview */}
      <h3 className="text-2xl font-bold text-white mb-2 leading-tight pr-4 text-left">
          {data.mood}
      </h3>
      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed opacity-80 text-left font-light">
          {data.advice}
      </p>

      {/* Subtle CTA */}
      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-300 transition-colors">
          <span>Detayları Gör</span>
          <div className="w-4 h-px bg-current opacity-50"></div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors"></div>
    </button>
    {renderModal()}
    </>
  );
};

export default AdviceCard;
