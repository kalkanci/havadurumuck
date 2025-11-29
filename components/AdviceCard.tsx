
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, Bot, MessageSquareQuote, Activity, X, Quote } from 'lucide-react';
import { WeatherData, AdviceResponse } from '../types';
import { generateSmartAdvice } from '../utils/helpers';

interface AdviceCardProps {
  weather: WeatherData;
  cityName: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ weather, cityName }) => {
  const [data, setData] = useState<AdviceResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Use the smart local advice generator immediately
    const advice = generateSmartAdvice(weather);
    setData(advice);
  }, [weather, cityName]);

  // Lock body scroll when modal is open
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

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white z-10">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-4 rounded-full shadow-lg mb-3 bg-gradient-to-br from-indigo-500 to-purple-600">
                         <Sparkles size={32} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Atmosfer Akıllı Asistan
                    </span>
                    <h2 className="text-2xl font-bold text-indigo-300">
                        "{data.mood}"
                    </h2>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto no-scrollbar space-y-5 pb-4">
                    {/* Advice Block */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 relative">
                        <Quote size={20} className="absolute top-3 left-3 text-white/10" />
                        <p className="text-slate-200 text-sm leading-7 font-medium relative z-10 pl-2">
                            {data.advice}
                        </p>
                    </div>

                    {/* Activities */}
                    {data.activities && data.activities.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Önerilen Aktiviteler</h3>
                            <div className="space-y-2">
                                {data.activities.map((act, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                            <Activity size={14} className="text-blue-300" />
                                        </div>
                                        <span className="text-sm text-slate-200 font-medium">{act}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
      onClick={handleOpen}
      className="w-full glass-card rounded-2xl p-5 my-5 flex flex-col relative group overflow-hidden border transition-all duration-500 text-left active:scale-[0.98] border-indigo-500/30"
    >
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 z-10">
           <Sparkles size={16} className="text-indigo-400 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            Günün Tavsiyesi
        </span>
      </div>

      {/* Main Content Preview */}
      <h3 className="text-lg font-bold text-white mb-2 leading-tight pr-4">
          "{data.mood}"
      </h3>
      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed opacity-90">
          {data.advice}
      </p>

      {/* Subtle CTA */}
      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
          <span>Devamını Oku</span>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
    </button>
    {renderModal()}
    </>
  );
};

export default AdviceCard;
