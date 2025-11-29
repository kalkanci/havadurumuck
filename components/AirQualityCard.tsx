
import React from 'react';
import { Wind, ShieldCheck, ShieldAlert, ShieldX, Activity, Info } from 'lucide-react';
import { AirQuality } from '../types';

interface AirQualityCardProps {
  data?: AirQuality;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  if (!data) return null;

  const aqi = data.european_aqi;
  
  // AQI Durum Belirleme (Avrupa Standartları: 0-20 İyi, 20-40 Orta, 40-60 Hassas, 60-80 Kötü, 80+ Çok Kötü)
  let status = "Mükemmel";
  let colorClass = "text-emerald-400";
  let barColor = "bg-emerald-500";
  let bgGradient = "from-emerald-500/20 via-emerald-900/10 to-transparent";
  let Icon = ShieldCheck;
  let advice = "Hava tertemiz! Pencereleri açabilir, dışarıda spor yapabilirsiniz.";

  if (aqi > 20 && aqi <= 40) {
    status = "İyi";
    colorClass = "text-teal-400";
    barColor = "bg-teal-500";
    bgGradient = "from-teal-500/20 via-teal-900/10 to-transparent";
    Icon = ShieldCheck;
    advice = "Hava kalitesi gayet iyi. Dışarıdaki aktiviteler için uygun.";
  } else if (aqi > 40 && aqi <= 60) {
    status = "Orta";
    colorClass = "text-yellow-400";
    barColor = "bg-yellow-500";
    bgGradient = "from-yellow-500/20 via-yellow-900/10 to-transparent";
    Icon = Activity;
    advice = "Hava kalitesi kabul edilebilir, ancak hassas bünyeler uzun süre dışarıda kalmamalı.";
  } else if (aqi > 60 && aqi <= 80) {
    status = "Hassas";
    colorClass = "text-orange-400";
    barColor = "bg-orange-500";
    bgGradient = "from-orange-500/20 via-orange-900/10 to-transparent";
    Icon = ShieldAlert;
    advice = "Hassas gruplar (çocuklar, yaşlılar) için riskli olabilir. Maske takılması önerilir.";
  } else if (aqi > 80) {
    status = "Kötü";
    colorClass = "text-red-500";
    barColor = "bg-red-600";
    bgGradient = "from-red-600/20 via-red-900/10 to-transparent";
    Icon = ShieldX;
    advice = "Hava kirliliği yüksek seviyede! Mecbur kalmadıkça dışarı çıkmayın.";
  }

  // Kirletici Renk Fonksiyonu (Basitleştirilmiş Eşikler)
  const getPollutantColor = (val: number, type: 'pm25' | 'pm10' | 'dust') => {
    // PM2.5 Eşikleri: <10 İyi, <20 Orta, >20 Kötü
    if (type === 'pm25') {
        if (val < 10) return 'bg-emerald-400';
        if (val < 25) return 'bg-yellow-400';
        return 'bg-red-400';
    }
    // PM10 Eşikleri: <20 İyi, <40 Orta, >40 Kötü
    if (type === 'pm10') {
        if (val < 20) return 'bg-emerald-400';
        if (val < 50) return 'bg-yellow-400';
        return 'bg-red-400';
    }
    return 'bg-slate-400';
  };

  const percentage = Math.min((aqi / 100) * 100, 100);

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 relative overflow-hidden group">
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-colors duration-500 opacity-60`} />
      
      <div className="relative z-10">
        
        {/* Header & Main Gauge */}
        <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-2xl bg-white/5 backdrop-blur-md shadow-inner ring-1 ring-white/10 ${colorClass}`}>
                     <Icon size={28} />
                 </div>
                 <div>
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hava Kalitesi</h3>
                     <p className={`text-2xl font-bold leading-none tracking-tight ${colorClass}`}>{status}</p>
                 </div>
             </div>
             
             <div className="text-right">
                 <div className="relative inline-block">
                    <span className="text-4xl font-black text-white tracking-tighter">{aqi}</span>
                    <div className={`absolute -right-2 top-0 w-2 h-2 rounded-full ${barColor} animate-pulse`} />
                 </div>
                 <span className="text-[10px] text-slate-500 block uppercase font-bold mt-1">Avrupa AQI</span>
             </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 relative">
             <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider opacity-70">
                 <span>Temiz (0)</span>
                 <span>Tehlikeli (100+)</span>
             </div>
             <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-white/5">
                 <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.5)] relative`} 
                    style={{ width: `${percentage}%` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                 </div>
             </div>
        </div>

        {/* Pollutants Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
            {/* PM 2.5 */}
            <div className="bg-slate-800/40 rounded-xl p-2.5 border border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">PM 2.5</p>
                 <p className="text-sm font-bold text-white mb-1">{data.pm2_5.toFixed(1)}</p>
                 <div className={`w-8 h-1 rounded-full ${getPollutantColor(data.pm2_5, 'pm25')}`} />
            </div>
            
            {/* PM 10 */}
            <div className="bg-slate-800/40 rounded-xl p-2.5 border border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">PM 10</p>
                 <p className="text-sm font-bold text-white mb-1">{data.pm10.toFixed(1)}</p>
                 <div className={`w-8 h-1 rounded-full ${getPollutantColor(data.pm10, 'pm10')}`} />
            </div>

            {/* Toz / Dust */}
            <div className="bg-slate-800/40 rounded-xl p-2.5 border border-white/5 flex flex-col items-center">
                 <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Toz</p>
                 <p className="text-sm font-bold text-white mb-1">{data.dust ? data.dust.toFixed(1) : '-'}</p>
                 <div className="w-8 h-1 rounded-full bg-slate-600" />
            </div>
        </div>

        {/* Advice Footer */}
        <div className="bg-white/5 rounded-xl p-3 flex gap-3 items-start border border-white/5">
            <Info size={16} className={`mt-0.5 flex-shrink-0 ${colorClass}`} />
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {advice}
            </p>
        </div>

      </div>
    </div>
  );
};

export default AirQualityCard;
