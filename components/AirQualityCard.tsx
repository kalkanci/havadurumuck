
import React from 'react';
import { Wind, ShieldCheck, ShieldAlert, ShieldX, Activity } from 'lucide-react';
import { AirQuality } from '../types';

interface AirQualityCardProps {
  data?: AirQuality;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  if (!data) return null;

  const aqi = data.european_aqi;
  
  let status = "İyi";
  let colorClass = "text-emerald-400";
  let barColor = "bg-emerald-500";
  let bgGradient = "from-emerald-500/10 via-emerald-500/5 to-transparent";
  let Icon = ShieldCheck;
  let desc = "Hava temiz, dışarı çıkmak için harika.";

  // Avrupa AQI Ölçeği Genelde 0-100 arası (Open-Meteo European AQI)
  // 0-20 İyi, 20-40 Orta, 40-60 Hassas, 60-80 Kötü, 80-100+ Çok Kötü
  // Görsel bar için max değeri 100 baz alalım, ama taşabilir.
  const percentage = Math.min((aqi / 100) * 100, 100);

  if (aqi > 20 && aqi <= 40) {
    status = "Orta";
    colorClass = "text-yellow-400";
    barColor = "bg-yellow-500";
    bgGradient = "from-yellow-500/10 via-yellow-500/5 to-transparent";
    Icon = Activity;
    desc = "Hava kalitesi kabul edilebilir seviyede.";
  } else if (aqi > 40 && aqi <= 60) {
    status = "Hassas";
    colorClass = "text-orange-400";
    barColor = "bg-orange-500";
    bgGradient = "from-orange-500/10 via-orange-500/5 to-transparent";
    Icon = ShieldAlert;
    desc = "Hassas gruplar için sağlıksız olabilir.";
  } else if (aqi > 60) {
    status = "Kötü";
    colorClass = "text-red-400";
    barColor = "bg-red-500";
    bgGradient = "from-red-600/10 via-red-600/5 to-transparent";
    Icon = ShieldX;
    desc = "Hava kirliliği yüksek. Açık hava aktivitelerini azaltın.";
  }

  return (
    <div className={`glass-card rounded-2xl p-5 mb-6 relative overflow-hidden`}>
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-colors duration-500`} />
      
      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                 <div className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-md shadow-inner ${colorClass}`}>
                     <Icon size={22} />
                 </div>
                 <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hava Kalitesi</h3>
                     <p className={`text-lg font-bold leading-tight ${colorClass}`}>{status}</p>
                 </div>
             </div>
             <div className="text-right">
                 <span className="text-3xl font-bold text-white">{aqi}</span>
                 <span className="text-[10px] text-slate-500 block uppercase font-bold">AQI İndeksi</span>
             </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
             <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium uppercase">
                 <span>İyi</span>
                 <span>Kötü</span>
             </div>
             <div className="h-3 w-full bg-slate-800/60 rounded-full overflow-hidden shadow-inner border border-white/5">
                 <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)] relative`} 
                    style={{ width: `${percentage}%` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                 </div>
             </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            <div className="text-center">
                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">PM 2.5</p>
                 <p className="text-sm font-semibold text-slate-200">{data.pm2_5.toFixed(1)}</p>
            </div>
            <div className="text-center border-l border-white/5">
                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">PM 10</p>
                 <p className="text-sm font-semibold text-slate-200">{data.pm10.toFixed(1)}</p>
            </div>
            <div className="text-center border-l border-white/5">
                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Toz</p>
                 <p className="text-sm font-semibold text-slate-200">{data.dust ? data.dust.toFixed(1) : '-'}</p>
            </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 font-medium opacity-80 border-t border-white/5 pt-2">
            💡 {desc}
        </p>

      </div>
    </div>
  );
};

export default AirQualityCard;
