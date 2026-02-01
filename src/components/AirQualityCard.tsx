
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, ShieldAlert, ShieldX, Activity, Info, X, HelpCircle } from 'lucide-react';
import { AirQuality } from '../types';
import { triggerHapticFeedback } from '../utils/helpers';

interface AirQualityCardProps {
  data?: AirQuality;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  if (!data) return null;

  const aqi = data.european_aqi;
  
  // AQI Durum Belirleme
  let status = "Mükemmel";
  let colorClass = "text-emerald-400";
  let ringColor = "ring-emerald-500";
  let barColor = "bg-emerald-500";
  let bgGradient = "from-emerald-500/20 via-emerald-900/10 to-transparent";
  let iconBg = "bg-emerald-500/20";
  let Icon = ShieldCheck;
  let advice = "Hava tertemiz! Pencereleri açabilir, dışarıda spor yapabilirsiniz.";

  if (aqi > 20 && aqi <= 40) {
    status = "İyi";
    colorClass = "text-teal-400";
    ringColor = "ring-teal-500";
    barColor = "bg-teal-500";
    bgGradient = "from-teal-500/20 via-teal-900/10 to-transparent";
    iconBg = "bg-teal-500/20";
    Icon = ShieldCheck;
    advice = "Hava kalitesi gayet iyi. Dışarıdaki aktiviteler için uygun.";
  } else if (aqi > 40 && aqi <= 60) {
    status = "Orta";
    colorClass = "text-yellow-400";
    ringColor = "ring-yellow-500";
    barColor = "bg-yellow-500";
    bgGradient = "from-yellow-500/20 via-yellow-900/10 to-transparent";
    iconBg = "bg-yellow-500/20";
    Icon = Activity;
    advice = "Hava kalitesi kabul edilebilir, ancak hassas bünyeler uzun süre dışarıda kalmamalı.";
  } else if (aqi > 60 && aqi <= 80) {
    status = "Hassas";
    colorClass = "text-orange-400";
    ringColor = "ring-orange-500";
    barColor = "bg-orange-500";
    bgGradient = "from-orange-500/20 via-orange-900/10 to-transparent";
    iconBg = "bg-orange-500/20";
    Icon = ShieldAlert;
    advice = "Hassas gruplar (çocuklar, yaşlılar) için riskli olabilir. Maske takılması önerilir.";
  } else if (aqi > 80) {
    status = "Kötü";
    colorClass = "text-red-400";
    ringColor = "ring-red-500";
    barColor = "bg-red-600";
    bgGradient = "from-red-600/20 via-red-900/10 to-transparent";
    iconBg = "bg-red-600/20";
    Icon = ShieldX;
    advice = "Hava kirliliği yüksek seviyede! Mecbur kalmadıkça dışarı çıkmayın.";
  }

  const getPollutantColor = (val: number, type: 'pm25' | 'pm10' | 'dust') => {
    if (type === 'pm25') {
        if (val < 10) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
        if (val < 25) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        return 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]';
    }
    if (type === 'pm10') {
        if (val < 20) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
        if (val < 50) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        return 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]';
    }
    return 'bg-slate-400';
  };

  const getPollenStatus = (val: number) => {
      if (val < 10) return { text: 'Düşük', color: 'text-emerald-400', bar: 'bg-emerald-400' };
      if (val < 50) return { text: 'Orta', color: 'text-yellow-400', bar: 'bg-yellow-400' };
      if (val < 200) return { text: 'Yüksek', color: 'text-orange-400', bar: 'bg-orange-400' };
      return { text: 'Çok Yüksek', color: 'text-red-400', bar: 'bg-red-400' };
  };

  const percentage = Math.min((aqi / 100) * 100, 100);

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
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                {/* Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b ${bgGradient} opacity-30 pointer-events-none`} />

                <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/60 hover:text-white z-20 transition-colors">
                    <X size={20} />
                </button>

                <div className="relative z-10 flex flex-col items-center mb-8 pt-4">
                    <div className={`p-5 rounded-full bg-slate-800/80 shadow-2xl ring-2 ${ringColor} ring-offset-2 ring-offset-slate-900 ${colorClass} mb-4 relative`}>
                         <div className={`absolute inset-0 rounded-full ${colorClass} blur-xl opacity-20`}></div>
                        <Icon size={40} />
                    </div>
                    <span className={`text-4xl font-black ${colorClass} drop-shadow-sm`}>{status}</span>
                    <div className="flex items-center gap-2 mt-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <span className="text-xs text-slate-300 uppercase tracking-widest font-bold">AQI Skoru:</span>
                        <span className="text-sm font-bold text-white">{aqi}</span>
                    </div>
                </div>

                <div className="space-y-5 relative z-10">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
                                <Info size={20} className={colorClass} />
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">{advice}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-1">Kirletici Seviyeleri</h4>
                        
                        {/* PM 2.5 Detail */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-10 rounded-full ${getPollutantColor(data.pm2_5, 'pm25')}`}></div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-sm font-bold text-white">PM 2.5</span>
                                        <HelpCircle size={12} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">İnce Partikül</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-white block leading-none">{data.pm2_5.toFixed(1)}</span>
                                <span className="text-[9px] text-slate-500">µg/m³</span>
                            </div>
                        </div>

                         {/* PM 10 Detail */}
                         <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-10 rounded-full ${getPollutantColor(data.pm10, 'pm10')}`}></div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-sm font-bold text-white">PM 10</span>
                                        <HelpCircle size={12} className="text-slate-500" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">Kalın Partikül</span>
                                </div>
                            </div>
                             <div className="text-right">
                                <span className="text-lg font-bold text-white block leading-none">{data.pm10.toFixed(1)}</span>
                                <span className="text-[9px] text-slate-500">µg/m³</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-1">Polen Durumu</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Ağaç (Kızılağaç)', val: data.alder_pollen },
                                { label: 'Huş Ağacı', val: data.birch_pollen },
                                { label: 'Çimen', val: data.grass_pollen },
                                { label: 'Pelin Otu', val: data.mugwort_pollen },
                                { label: 'Zeytin', val: data.olive_pollen },
                                { label: 'Kanarya Otu', val: data.ragweed_pollen },
                            ].map((item, idx) => {
                                if (item.val === undefined) return null;
                                const status = getPollenStatus(item.val);
                                return (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
                                        <span className="text-[10px] text-slate-400 font-bold mb-1">{item.label}</span>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
                                            <div className={`w-2 h-2 rounded-full ${status.bar}`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-black/20 p-4 rounded-2xl leading-relaxed border border-white/5">
                        <strong className="text-slate-300 block mb-1">Biliyor muydunuz?</strong>
                        PM 2.5 partikülleri saç telinden yaklaşık 30 kat daha incedir ve doğrudan kan dolaşımına karışabilir.
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
      onClick={handleOpenWithDelay}
      className="w-full glass-card rounded-[2rem] p-6 mb-6 relative overflow-hidden group text-left transition-all duration-300 transform active:scale-[0.97] active:brightness-90 active:border-white/10 hover:shadow-2xl"
    >
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        
        {/* Header & Main Gauge */}
        <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-4">
                 <div className={`p-3.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/10 ${colorClass}`}>
                     <Icon size={28} />
                 </div>
                 <div>
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                         Hava Kalitesi
                     </h3>
                     <p className={`text-2xl font-black leading-none tracking-tight ${colorClass}`}>{status}</p>
                 </div>
             </div>
             
             <div className="text-right">
                 <div className="relative inline-block">
                    <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">{aqi}</span>
                    <div className={`absolute -right-1.5 top-1 w-2.5 h-2.5 rounded-full ${barColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
                 </div>
             </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 relative group-active:opacity-80 transition-opacity">
             <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">
                 <span>Temiz</span>
                 <span>Tehlikeli</span>
             </div>
             <div className="h-3 w-full bg-slate-900/60 rounded-full overflow-hidden shadow-inner border border-white/5">
                 <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor] relative`} 
                    style={{ width: `${percentage}%` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                 </div>
             </div>
        </div>

        {/* Pollutants Grid (Mini Preview) */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-2">
                 <p className="text-[9px] text-slate-400 uppercase font-bold">PM 2.5</p>
                 <div className={`w-8 h-1.5 rounded-full ${getPollutantColor(data.pm2_5, 'pm25')}`} />
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-2">
                 <p className="text-[9px] text-slate-400 uppercase font-bold">PM 10</p>
                 <div className={`w-8 h-1.5 rounded-full ${getPollutantColor(data.pm10, 'pm10')}`} />
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-2">
                 <p className="text-[9px] text-slate-400 uppercase font-bold">Toz</p>
                 <div className="w-8 h-1.5 rounded-full bg-slate-600" />
            </div>
        </div>
      </div>
    </button>
    {renderModal()}
    </>
  );
};

export default AirQualityCard;
