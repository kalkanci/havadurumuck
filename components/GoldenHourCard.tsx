import React from 'react';
import { Camera, Sun, Moon } from 'lucide-react';
import { WeatherData } from '../types';
import { formatTime } from '../utils/helpers';

interface GoldenHourCardProps {
  weather: WeatherData;
}

const GoldenHourCard: React.FC<GoldenHourCardProps> = ({ weather }) => {
  const sunriseStr = weather.daily.sunrise[0];
  const sunsetStr = weather.daily.sunset[0];

  if (!sunriseStr || !sunsetStr) return null;

  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);

  // Simple Golden Hour Calc (approx 1 hour after sunrise, 1 hour before sunset)
  const morningGoldenStart = formatTime(sunriseStr);
  const morningGoldenEnd = formatTime(new Date(sunrise.getTime() + 60 * 60 * 1000).toISOString());

  const eveningGoldenStart = formatTime(new Date(sunset.getTime() - 60 * 60 * 1000).toISOString());
  const eveningGoldenEnd = formatTime(sunsetStr);

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-900/10" />
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-orange-300 uppercase tracking-widest flex items-center gap-2">
          <Camera size={14} /> Golden Hour
        </h3>
        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-full">Fotoğrafçılık için ideal</span>
      </div>

      <div className="relative z-10 flex justify-between items-center gap-4">
        {/* Morning */}
        <div className="flex-1 bg-gradient-to-br from-orange-400/20 to-yellow-400/10 rounded-xl p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
                <Sun size={14} className="text-orange-400" />
                <span className="text-xs text-orange-200 font-semibold">Sabah</span>
            </div>
            <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-white">{morningGoldenStart}</span>
                 <span className="text-xs text-orange-300/50">-</span>
                 <span className="text-sm font-bold text-slate-300">{morningGoldenEnd}</span>
            </div>
        </div>

        {/* Evening */}
         <div className="flex-1 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-xl p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
                <Moon size={14} className="text-purple-400" />
                <span className="text-xs text-purple-200 font-semibold">Akşam</span>
            </div>
             <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-300">{eveningGoldenStart}</span>
                 <span className="text-xs text-purple-300/50">-</span>
                 <span className="text-sm font-bold text-white">{eveningGoldenEnd}</span>
            </div>
        </div>
      </div>
      
      {/* Visual Timeline Bar */}
      <div className="relative z-10 mt-4 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden flex">
          <div className="h-full bg-slate-800 w-[20%]" /> {/* Night */}
          <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-300 w-[10%]" /> {/* Golden Morning */}
          <div className="h-full bg-blue-400/20 w-[40%]" /> {/* Day */}
          <div className="h-full bg-gradient-to-r from-yellow-300 to-purple-600 w-[10%]" /> {/* Golden Evening */}
          <div className="h-full bg-slate-800 w-[20%]" /> {/* Night */}
      </div>
    </div>
  );
};

export default GoldenHourCard;