
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { formatTime } from '../utils/helpers';
import { Droplets, Navigation, X, Wind, Thermometer, Sun, Gauge } from 'lucide-react';

interface HourlyForecastProps {
  weather: WeatherData;
}

// Sıcaklığa göre arka plan rengi (Dark mode ve Light mode uyumlu)
const getTempColor = (temp: number, isDay: number) => {
    if (isDay === 0) return "text-indigo-600 dark:text-indigo-200";
    if (temp < 10) return "text-sky-600 dark:text-sky-300";
    if (temp < 20) return "text-teal-600 dark:text-teal-300";
    if (temp < 30) return "text-amber-600 dark:text-amber-300";
    return "text-rose-600 dark:text-rose-300";
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const tempUnit = '°';
  const speedUnit = 'km/s';

  // Lock body scroll
  useEffect(() => {
    if (selectedHour !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedHour]);

  // Find the index for the current hour to start the forecast
  const now = new Date();
  const currentHourIndex = weather.hourly.time.findIndex(t => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getHours() === now.getHours();
  });

  // If current hour is found, start from there; otherwise default to 0
  const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
  
  const hoursCount = 24;
  // Generate indices for the next 24 hours
  const forecastIndices = Array.from({ length: hoursCount }, (_, i) => startIndex + i);
  
  const handleOpen = (index: number) => {
    setSelectedHour(index);
    setIsClosing(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setSelectedHour(null);
        setIsClosing(false);
    }, 200); 
  };

  const renderModal = () => {
    if (selectedHour === null) return null;

    const index = selectedHour;
    // Check bounds just in case
    if (index >= weather.hourly.time.length) return null;

    const time = weather.hourly.time[index];
    const temp = weather.hourly.temperature_2m[index];
    const code = weather.hourly.weather_code[index];
    const isDay = weather.hourly.is_day[index];
    const rainProb = weather.hourly.precipitation_probability?.[index] ?? 0;
    const windSpeed = weather.hourly.wind_speed_10m?.[index] ?? 0;
    const windDir = weather.hourly.wind_direction_10m?.[index] ?? 0;
    const humidity = weather.hourly.relative_humidity_2m?.[index] ?? 0;
    const feelsLike = weather.hourly.apparent_temperature?.[index] ?? temp;
    const uv = weather.hourly.uv_index?.[index] ?? 0;
    const pressure = weather.hourly.surface_pressure?.[index] ?? 0;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                 <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10">
                     <X size={20} />
                 </button>

                 <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Saat {formatTime(time)}</span>
                 <div className="w-20 h-20 my-2 drop-shadow-2xl scale-125">
                     {getWeatherIcon(code, isDay)}
                 </div>
                 <h2 className="text-5xl font-bold text-slate-800 dark:text-white tracking-tighter mb-1">{Math.round(temp)}{tempUnit}</h2>
                 <p className="text-blue-600 dark:text-blue-200 font-medium text-lg mb-6">{getWeatherLabel(code)}</p>

                 <div className="grid grid-cols-2 gap-3 w-full">
                     <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-transparent">
                         <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400">
                             <Thermometer size={16} /> <span className="text-xs font-bold uppercase">Hissedilen</span>
                         </div>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">{Math.round(feelsLike)}{tempUnit}</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-transparent">
                         <div className="flex items-center gap-2 mb-1 text-blue-500 dark:text-blue-400">
                             <Droplets size={16} /> <span className="text-xs font-bold uppercase">Nem</span>
                         </div>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">%{humidity}</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-transparent">
                         <div className="flex items-center gap-2 mb-1 text-teal-500 dark:text-teal-400">
                             <Wind size={16} /> <span className="text-xs font-bold uppercase">Rüzgar</span>
                         </div>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">{Math.round(windSpeed)} <span className="text-xs font-normal">{speedUnit}</span></span>
                         <Navigation size={12} className="text-slate-500 mt-1" style={{ transform: `rotate(${windDir}deg)` }} />
                     </div>
                      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-transparent">
                         <div className="flex items-center gap-2 mb-1 text-orange-500 dark:text-orange-400">
                             <Sun size={16} /> <span className="text-xs font-bold uppercase">UV</span>
                         </div>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">{uv.toFixed(1)}</span>
                     </div>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Gauge size={12} /> Basınç: {Math.round(pressure)} hPa
                 </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saatlik Akış</h3>
        <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
             <span className="text-[10px] text-slate-500 font-medium">Yağış İhtimali</span>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar py-4 -my-4 px-1">
        <div className="flex space-x-3 min-w-max pb-2">
          {forecastIndices.map((dataIndex, displayIndex) => {
            // Check bounds
            if (dataIndex >= weather.hourly.time.length) return null;

            const time = weather.hourly.time[dataIndex];
            const temp = weather.hourly.temperature_2m[dataIndex];
            const code = weather.hourly.weather_code[dataIndex];
            const isDay = weather.hourly.is_day[dataIndex];
            const formattedTime = formatTime(time);
            const isNow = displayIndex === 0;
            const rainProb = weather.hourly.precipitation_probability?.[dataIndex] ?? 0;
            const windDir = weather.hourly.wind_direction_10m?.[dataIndex] ?? 0;
            const tempColor = getTempColor(temp, isDay);

            return (
              <button 
                key={time} 
                onClick={() => handleOpen(dataIndex)}
                className={`
                  relative flex flex-col items-center justify-between 
                  w-[4.5rem] h-32 p-2 rounded-[1.25rem] transition-all duration-300
                  backdrop-blur-md overflow-hidden group active:scale-95
                  ${isNow 
                    ? 'bg-white dark:bg-slate-800/80 ring-2 ring-blue-500 dark:ring-white/20 shadow-lg dark:shadow-xl scale-105 z-10 border-transparent' 
                    : 'bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/20 shadow-none'}
                `}
              >
                {/* Time */}
                <span className={`text-[10px] font-bold tracking-wide ${isNow ? 'text-blue-600 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>
                    {isNow ? 'ŞİMDİ' : formattedTime}
                </span>

                {/* Rain Bar Visual */}
                {rainProb > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-full w-full rounded-[1.25rem] overflow-hidden pointer-events-none z-0">
                        <div 
                            className="absolute bottom-0 w-full bg-blue-500/20 transition-all duration-500" 
                            style={{ height: `${rainProb}%` }}
                        />
                         <div 
                            className="absolute bottom-0 w-full h-1 bg-blue-500/40 blur-[2px]" 
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
                             <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300">%{rainProb}</span>
                         </div>
                    ) : (
                         <div className="flex items-center justify-center opacity-60" title="Rüzgar Yönü">
                            <Navigation 
                                size={12} 
                                className="text-slate-500 dark:text-slate-300" 
                                style={{ transform: `rotate(${windDir}deg)` }} 
                            />
                        </div>
                    )}
                </div>

                {/* Temp */}
                <span className={`text-lg font-bold tracking-tight z-10 ${tempColor}`}>
                    {Math.round(temp)}{tempUnit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default HourlyForecast;
