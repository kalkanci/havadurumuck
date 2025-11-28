import React from 'react';
import { Wind, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { AirQuality } from '../types';

interface AirQualityCardProps {
  data?: AirQuality;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  if (!data) return null;

  const aqi = data.european_aqi;
  
  let status = "İyi";
  let colorClass = "text-green-400";
  let bgClass = "from-green-500/20 to-emerald-500/20";
  let Icon = ShieldCheck;
  let desc = "Hava temiz, dışarı çıkmak için harika.";

  if (aqi > 20 && aqi <= 40) {
    status = "Orta";
    colorClass = "text-yellow-400";
    bgClass = "from-yellow-500/20 to-orange-500/20";
    Icon = ShieldCheck; // Still okay
    desc = "Hava kalitesi kabul edilebilir seviyede.";
  } else if (aqi > 40 && aqi <= 60) {
    status = "Hassas";
    colorClass = "text-orange-400";
    bgClass = "from-orange-500/20 to-red-500/20";
    Icon = ShieldAlert;
    desc = "Hassas gruplar için sağlıksız olabilir.";
  } else if (aqi > 60) {
    status = "Kötü";
    colorClass = "text-red-400";
    bgClass = "from-red-600/20 to-rose-600/20";
    Icon = ShieldX;
    desc = "Hava kirliliği yüksek. Açık hava aktivitelerini azaltın.";
  }

  return (
    <div className={`glass-card rounded-2xl p-4 mb-6 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-50`} />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-white/10 ${colorClass}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Hava Kalitesi</h3>
            <div className="flex items-baseline space-x-2">
              <span className={`text-xl font-bold ${colorClass}`}>{status}</span>
              <span className="text-xs text-slate-400">AQI: {aqi}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase">PM2.5</span>
            <span className="text-sm font-medium">{data.pm2_5.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-xs text-slate-300 mt-3 font-medium">
        {desc}
      </p>
    </div>
  );
};

export default AirQualityCard;