import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../constants';
import { formatTime } from '../utils/helpers';
import { Droplets, Wind } from 'lucide-react';

interface HourlyForecastProps {
  weather: WeatherData;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  // Show 24 hours
  const hoursCount = 24;
  const hours = weather.hourly.time.slice(0, hoursCount); 
  const temps = weather.hourly.temperature_2m.slice(0, hoursCount);
  const codes = weather.hourly.weather_code.slice(0, hoursCount);
  const isDay = weather.hourly.is_day.slice(0, hoursCount);
  const rainProbs = weather.hourly.precipitation_probability?.slice(0, hoursCount) || new Array(hoursCount).fill(0);
  const windSpeeds = weather.hourly.wind_speed_10m.slice(0, hoursCount);

  // Min/Max hesabı (Barların yüksekliğini ayarlamak için)
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const range = maxTemp - minTemp || 1; // 0'a bölünmeyi önle

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">24 Saatlik Akış</h3>
        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">Sola kaydır</span>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar pb-4">
        <div className="flex space-x-3 min-w-max px-1">
            
          {hours.map((time, index) => {
            const temp = temps[index];
            const formattedTime = formatTime(time);
            const isNow = index === 0;
            
            // Bar Yüksekliği Hesaplama (%20 ile %100 arası dolsun ki bar hiç kaybolmasın)
            const heightPercent = 20 + ((temp - minTemp) / range) * 80;

            // Sıcaklığa göre renk belirleme
            let barColor = "bg-blue-500";
            if (temp > 30) barColor = "bg-red-500";
            else if (temp > 20) barColor = "bg-orange-500";
            else if (temp > 10) barColor = "bg-yellow-400";
            else if (temp > 0) barColor = "bg-cyan-400";

            return (
              <div 
                key={time} 
                className={`
                  relative flex flex-col items-center justify-between 
                  w-[72px] h-64 p-3 rounded-[2rem] border transition-all duration-300
                  ${isNow 
                    ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10 scale-105 z-10' 
                    : 'glass-card border-white/5 hover:bg-slate-800/40'}
                `}
              >
                {/* 1. Saat */}
                <span className={`text-xs font-bold mb-2 ${isNow ? 'text-blue-300' : 'text-slate-400'}`}>
                  {isNow ? 'Şimdi' : formattedTime}
                </span>

                {/* 2. Hava İkonu */}
                <div className="w-8 h-8 mb-2 drop-shadow-md transition-transform hover:scale-110">
                  {getWeatherIcon(codes[index], isDay[index])}
                </div>

                {/* 3. Bar Grafiği Alanı (Equalizer Style) */}
                <div className="flex-1 w-full flex items-end justify-center my-2">
                  <div className="w-2 h-full bg-slate-700/30 rounded-full relative overflow-hidden">
                    {/* Doluluk Oranı */}
                    <div 
                      className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000 ease-out ${barColor} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                </div>

                {/* 4. Ekstra Bilgiler (Rüzgar veya Yağış varsa göster) */}
                <div className="h-6 flex items-center justify-center mb-1">
                    {rainProbs[index] > 20 ? (
                        <div className="flex flex-col items-center text-blue-300 animate-pulse">
                            <Droplets size={10} />
                            <span className="text-[9px] font-bold">%{rainProbs[index]}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-500">
                            <Wind size={10} />
                            <span className="text-[9px]">{Math.round(windSpeeds[index])}</span>
                        </div>
                    )}
                </div>

                {/* 5. Sıcaklık */}
                <span className="text-lg font-bold text-white tracking-tighter">
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