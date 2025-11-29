
import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../constants';
import { formatTime } from '../utils/helpers';
import { Droplets, Navigation } from 'lucide-react';

interface HourlyForecastProps {
  weather: WeatherData;
}

// Sıcaklığa göre arka plan rengi (Daha yumuşak geçişler)
const getTempColor = (temp: number, isDay: number) => {
    if (isDay === 0) return "text-indigo-200";
    if (temp < 10) return "text-sky-300";
    if (temp < 20) return "text-teal-300";
    if (temp < 30) return "text-amber-300";
    return "text-rose-300";
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
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saatlik Akış</h3>
        <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
             <span className="text-[10px] text-slate-500 font-medium">Yağış İhtimali</span>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar py-4 -my-4 px-1">
        <div className="flex space-x-3 min-w-max pb-2">
          {hours.map((time, index) => {
            const temp = temps[index];
            const code = codes[index];
            const isDay = isDayList[index];
            const formattedTime = formatTime(time);
            const isNow = index === 0;
            const rainProb = rainProbs[index];
            const windDir = windDirs[index];
            const tempColor = getTempColor(temp, isDay);

            return (
              <div 
                key={time} 
                className={`
                  relative flex flex-col items-center justify-between 
                  w-[4.5rem] h-32 p-2 rounded-[1.25rem] transition-all duration-300
                  ${isNow 
                    ? 'bg-slate-800/80 ring-1 ring-white/20 shadow-xl scale-105 z-10' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/5'}
                `}
              >
                {/* Time */}
                <span className={`text-[10px] font-bold tracking-wide ${isNow ? 'text-white' : 'text-slate-400'}`}>
                    {isNow ? 'ŞİMDİ' : formattedTime}
                </span>

                {/* Rain Bar Visual (Behind Icon) */}
                {rainProb > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-full w-full rounded-[1.25rem] overflow-hidden pointer-events-none z-0">
                        <div 
                            className="absolute bottom-0 w-full bg-blue-500/10 transition-all duration-500" 
                            style={{ height: `${rainProb}%` }}
                        />
                         <div 
                            className="absolute bottom-0 w-full h-1 bg-blue-500/30 blur-[2px]" 
                            style={{ bottom: `${rainProb}%` }} 
                        />
                    </div>
                )}

                {/* Icon */}
                <div className="w-9 h-9 drop-shadow-lg z-10 transform transition-transform group-hover:scale-110 my-1">
                     {getWeatherIcon(code, isDay)}
                </div>

                {/* Info (Rain % or Wind) */}
                <div className="z-10 h-4 flex items-center justify-center">
                    {rainProb >= 10 ? (
                         <div className="flex flex-col items-center">
                             <span className="text-[9px] font-bold text-blue-300">%{rainProb}</span>
                         </div>
                    ) : (
                         <div className="flex items-center justify-center opacity-60" title="Rüzgar Yönü">
                            <Navigation 
                                size={12} 
                                className="text-slate-300" 
                                style={{ transform: `rotate(${windDir}deg)` }} 
                            />
                        </div>
                    )}
                </div>

                {/* Temp */}
                <span className={`text-lg font-bold tracking-tight z-10 ${tempColor}`}>
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
