
import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../constants';
import { formatTime } from '../utils/helpers';
import { Droplets, Navigation } from 'lucide-react';

interface HourlyForecastProps {
  weather: WeatherData;
}

// Sıcaklığa göre arka plan rengi
const getTempGradient = (temp: number, isDay: number) => {
    // Gece ise biraz daha koyu tonlar
    if (isDay === 0) {
        if (temp < 0) return "bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/30";
        if (temp < 10) return "bg-gradient-to-br from-blue-950 to-indigo-950 border-blue-500/30";
        return "bg-gradient-to-br from-slate-900 to-black border-slate-600/30";
    }

    // Gündüz Tonları (Okunabilirlik için koyulaştırıldı)
    if (temp < 0) return "bg-gradient-to-br from-blue-800 to-indigo-900 border-blue-400/30";
    if (temp < 10) return "bg-gradient-to-br from-sky-800 to-blue-900 border-sky-400/30";
    // Yeşil/Turkuaz alanı - Önceden çok parlaktı, şimdi koyu zümrüt
    if (temp < 20) return "bg-gradient-to-br from-teal-800 to-emerald-900 border-teal-500/30";
    // Sarı/Turuncu alanı - Şimdi koyu amber/turuncu
    if (temp < 28) return "bg-gradient-to-br from-amber-700 to-orange-800 border-amber-500/30";
    // Sıcak kırmızı alanı - Koyu kırmızı
    return "bg-gradient-to-br from-red-800 to-rose-900 border-red-500/30";
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  const hoursCount = 24;
  const hours = weather.hourly.time.slice(0, hoursCount); 
  const temps = weather.hourly.temperature_2m.slice(0, hoursCount);
  const codes = weather.hourly.weather_code.slice(0, hoursCount);
  const isDayList = weather.hourly.is_day.slice(0, hoursCount);
  const rainProbs = weather.hourly.precipitation_probability?.slice(0, hoursCount) || new Array(hoursCount).fill(0);
  const windDirs = weather.hourly.wind_direction_10m?.slice(0, hoursCount) || new Array(hoursCount).fill(0);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-0 px-1">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saatlik Akış</h3>
        <span className="text-[10px] text-slate-500">Rüzgar & Yağış Detaylı</span>
      </div>
      
      {/* Scrollable Container with Extra Padding for Scaling */}
      <div className="overflow-x-auto no-scrollbar py-4">
        <div className="flex space-x-2 px-1 min-w-max">
          {hours.map((time, index) => {
            const temp = temps[index];
            const code = codes[index];
            const isDay = isDayList[index];
            const formattedTime = formatTime(time);
            const isNow = index === 0;
            const bgGradient = getTempGradient(temp, isDay);
            const rainProb = rainProbs[index];
            const windDir = windDirs[index];

            return (
              <div 
                key={time} 
                className={`
                  relative flex flex-col items-center justify-between 
                  w-20 h-28 p-2 rounded-3xl transition-all duration-300 border
                  ${isNow ? 'scale-105 z-10 shadow-2xl ring-1 ring-white/30' : 'scale-100 shadow-md opacity-90'}
                  ${bgGradient}
                `}
              >
                {/* Time */}
                <span className="text-[10px] font-bold text-white/90 drop-shadow-md tracking-wide">
                    {isNow ? 'ŞİMDİ' : formattedTime}
                </span>

                {/* Icon */}
                <div className="w-8 h-8 drop-shadow-lg filter transform transition-transform group-hover:scale-110">
                     {getWeatherIcon(code, isDay)}
                </div>

                {/* Info Row: Wind or Rain */}
                <div className="w-full flex justify-center items-center h-4">
                     {rainProb > 15 ? (
                        <div className="flex items-center gap-0.5 bg-black/20 px-1.5 py-0.5 rounded-full">
                            <Droplets size={8} className="text-blue-100" />
                            <span className="text-[9px] font-bold text-blue-50">%{rainProb}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1" title="Rüzgar Yönü">
                            {/* Rüzgar okunu döndür */}
                            <Navigation 
                                size={10} 
                                className="text-white/70" 
                                style={{ transform: `rotate(${windDir}deg)` }} 
                            />
                        </div>
                     )}
                </div>

                {/* Temp */}
                <span className="text-lg font-bold text-white tracking-tighter drop-shadow-md">
                    {Math.round(temp)}°
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
