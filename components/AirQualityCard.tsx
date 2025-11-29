
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wind, ShieldCheck, ShieldAlert, ShieldX, Activity, Info, X, HelpCircle } from 'lucide-react';
import { AirQuality } from '../types';

interface AirQualityCardProps {
  data?: AirQuality;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  if (!data) return null;

  const aqi = data.european_aqi;
  
  // AQI Durum Belirleme
  let status = "Mükemmel";
  let colorClass = "text-emerald-600 dark:text-emerald-400";
  let barColor = "bg-emerald-500";
  let bgGradient = "from-emerald-100/50 via-emerald-50/30 to-transparent dark:from-emerald-500/20 dark:via-emerald-900/10 dark:to-transparent";
  let Icon = ShieldCheck;
  let advice = "Hava tertemiz! Pencereleri açabilir, dışarıda spor yapabilirsiniz.";

  if (aqi > 20 && aqi <= 40) {
    status = "İyi";
    colorClass = "text-teal-600 dark:text-teal-400";
    barColor = "bg-teal-500";
    bgGradient = "from-teal-100/50 via-teal-50/30 to-transparent dark:from-teal-500/20 dark:via-teal-900/10 dark:to-transparent";
    Icon = ShieldCheck;
    advice = "Hava kalitesi gayet iyi. Dışarıdaki aktiviteler için uygun.";
  } else if (aqi > 40 && aqi <= 60) {
    status = "Orta";
    colorClass = "text-yellow-600 dark:text-yellow-400";
    barColor = "bg-yellow-500";
    bgGradient = "from-yellow-100/50 via-yellow-50/30 to-transparent dark:from-yellow-500/20 dark:via-yellow-900/10 dark:to-transparent";
    Icon = Activity;
    advice = "Hava kalitesi kabul edilebilir, ancak hassas bünyeler uzun süre dışarıda kalmamalı.";
  } else if (aqi > 60 && aqi <= 80) {
    status = "Hassas";
    colorClass = "text-orange-600 dark:text-orange-400";
    barColor = "bg-orange-500";
    bgGradient = "from-orange-100/50 via-orange-50/30 to-transparent dark:from-orange-500/20 dark:via-orange-900/10 dark:to-transparent";
    Icon = ShieldAlert;
    advice = "Hassas gruplar (çocuklar, yaşlılar) için riskli olabilir. Maske takılması önerilir.";
  } else if (aqi > 80) {
    status = "Kötü";
    colorClass = "text-red-600 dark:text-red-500";
    barColor = "bg-red-600";
    bgGradient = "from-red-100/50 via-red-50/30 to-transparent dark:from-red-600/20 dark:via-red-900/10 dark:to-transparent";
    Icon = ShieldX;
    advice = "Hava kirliliği yüksek seviyede! Mecbur kalmadıkça dışarı çıkmayın.";
  }

  const getPollutantColor = (val: number, type: 'pm25' | 'pm10' | 'dust') => {
    if (type === 'pm25') {
        if (val < 10) return 'bg-emerald-400';
        if (val < 25) return 'bg-yellow-400';
        return 'bg-red-400';
    }
    if (type === 'pm10') {
        if (val < 20) return 'bg-emerald-400';
        if (val < 50) return 'bg-yellow-400';
        return 'bg-red-400';
    }
    return 'bg-slate-400';
  };

  const percentage = Math.min((aqi / 100) * 100, 100);

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
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] overflow-y-auto no-scrollbar ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 z-10">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-6 pt-2">
                    <div className={`p-4 rounded-full bg-slate-50 dark:bg-white/5 shadow-xl ring-2 ring-black/5 dark:ring-white/10 ${colorClass} mb-2`}>
                        <Icon size={32} />
                    </div>
                    <span className={`text-3xl font-bold ${colorClass}`}>{status}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold mt-1">Hava Kalitesi İndeksi: {aqi}</span>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-start gap-3">
                            <Info size={18} className={`${colorClass} mt-0.5 flex-shrink-0`} />
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{advice}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Kirletici Detayları</h4>
                        
                        {/* PM 2.5 Detail */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full ${getPollutantColor(data.pm2_5, 'pm25')}`}></div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">PM 2.5</span>
                                        <HelpCircle size={12} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">İnce Partikül Madde</span>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">{data.pm2_5.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span></span>
                        </div>

                         {/* PM 10 Detail */}
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full ${getPollutantColor(data.pm10, 'pm10')}`}></div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">PM 10</span>
                                        <HelpCircle size={12} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Kalın Partikül Madde</span>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">{data.pm10.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span></span>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-600 dark:text-slate-500 bg-slate-200 dark:bg-black/20 p-3 rounded-lg leading-relaxed">
                        <strong>PM 2.5 Nedir?</strong> Saç telinden çok daha ince olan bu partiküller, akciğerlerin derinliklerine ve kana karışabilir. 
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <>
    <button 
      onClick={handleOpen}
      className="w-full glass-card rounded-2xl p-5 mb-6 relative overflow-hidden group text-left transition-transform active:scale-[0.98]"
    >
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-colors duration-500 opacity-60`} />
      
      <div className="relative z-10">
        
        {/* Header & Main Gauge */}
        <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${colorClass}`}>
                     <Icon size={28} />
                 </div>
                 <div>
                     <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                         Hava Kalitesi <Info size={10} />
                     </h3>
                     <p className={`text-2xl font-bold leading-none tracking-tight ${colorClass}`}>{status}</p>
                 </div>
             </div>
             
             <div className="text-right">
                 <div className="relative inline-block">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{aqi}</span>
                    <div className={`absolute -right-2 top-0 w-2 h-2 rounded-full ${barColor} animate-pulse`} />
                 </div>
                 <span className="text-[10px] text-slate-500 block uppercase font-bold mt-1">Avrupa AQI</span>
             </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 relative">
             <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 font-bold uppercase tracking-wider opacity-70">
                 <span>Temiz</span>
                 <span>Tehlikeli</span>
             </div>
             <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                 <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.5)] relative`} 
                    style={{ width: `${percentage}%` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                 </div>
             </div>
        </div>

        {/* Pollutants Grid (Mini Preview) */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/40 dark:bg-slate-800/40 rounded-xl p-2.5 border border-black/5 dark:border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold mb-1">PM 2.5</p>
                 <div className={`w-8 h-1 rounded-full ${getPollutantColor(data.pm2_5, 'pm25')}`} />
            </div>
            <div className="bg-white/40 dark:bg-slate-800/40 rounded-xl p-2.5 border border-black/5 dark:border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold mb-1">PM 10</p>
                 <div className={`w-8 h-1 rounded-full ${getPollutantColor(data.pm10, 'pm10')}`} />
            </div>
            <div className="bg-white/40 dark:bg-slate-800/40 rounded-xl p-2.5 border border-black/5 dark:border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-600 dark:text-slate-400 uppercase font-bold mb-1">Toz</p>
                 <div className="w-8 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
            </div>
        </div>
      </div>
    </button>
    {renderModal()}
    </>
  );
};

export default AirQualityCard;
