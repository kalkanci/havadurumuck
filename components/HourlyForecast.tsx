
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { formatTime, triggerHapticFeedback } from '../utils/helpers';
import { Droplets, Navigation, X, Wind, Thermometer, Sun, Gauge } from 'lucide-react';

interface HourlyForecastProps {
  weather: WeatherData;
}

// Sıcaklığa göre arka plan rengi
const getTempColor = (temp: number, isDay: number) => {
    if (isDay === 0) return "text-indigo-200";
    if (temp < 10) return "text-sky-300";
    if (temp < 20) return "text-teal-300";
    if (temp < 30) return "text-amber-300";
    return "text-rose-300";
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const tempUnit = '°';
  const speedUnit = 'km/s';

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

  const now = new Date();
  const currentHourIndex = weather.hourly.time.findIndex(t => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getHours() === now.getHours();
  });

  const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
  const hoursCount = 24;
  const forecastIndices = Array.from({ length: hoursCount }, (_, i) => startIndex + i);
  
  const handleOpenWithDelay = (index: number) => {
    triggerHapticFeedback(15);
    setTimeout(() => {
        setSelectedHour(index);
        setIsClosing(false);
    }, 200);
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
    if (index >= weather.hourly.time.length) return null;

    const time = weather.hourly.time[index];
    const temp = weather.hourly.temperature_2m[index];
    const code = weather.hourly.weather_code[index];
    const isDay = weather.hourly.is_day[index];
    const humidity = weather.hourly.relative_humidity_2m?.[index] ?? 0;
    const feelsLike = weather.hourly.apparent_temperature?.[index] ?? temp;
    const uv = weather.hourly.uv_index?.[index] ?? 0;
    const pressure = weather.hourly.surface_pressure?.[index] ?? 0;
    const windSpeed = weather.hourly.wind_speed_10m?.[index] ?? 0;
    const windDir = weather.hourly.wind_direction_10m?.[index] ?? 0;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center overflow-hidden ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                 <button onClick={handleClose} className="absolute top-5 right-5 p-2.5 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 z-20">
                     <X size={20} />
                 </button>

                 {/* Decorative Glow */}
                 <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/10 blur-[60px] pointer-events-none rounded-t-[2.5rem]"></div>

                 <div className="relative z-10 flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 bg-white/5 px-3 py-1 rounded-full">{formatTime(time)}</span>
                    <div className="w-32 h-32 my-2 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                        {getWeatherIcon(code, isDay)}
                    </div>
                    <h2 className="text-7xl font-black text-white tracking-tighter mb-2">{Math.round(temp)}{tempUnit}</h2>
                    <p className="text-blue-200 font-bold text-lg mb-8">{getWeatherLabel(code)}</p>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="bg-white/5 p-4 rounded-3xl flex flex-col items-center justify-center border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                <Thermometer size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Hissedilen</span>
                            </div>
                            <span className="text-xl font-bold text-white">{Math.round(feelsLike)}{tempUnit}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl flex flex-col items-center justify-center border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-blue-400">
                                <Droplets size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Nem</span>
                            </div>
                            <span className="text-xl font-bold text-white">%{humidity}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl flex flex-col items-center justify-center border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-teal-400">
                                <Wind size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Rüzgar</span>
                            </div>
                            <span className="text-xl font-bold text-white">{Math.round(windSpeed)} <span className="text-xs font-normal opacity-70">{speedUnit}</span></span>
                            <Navigation size={10} className="text-slate-500 mt-1" style={{ transform: `rotate(${windDir}deg)` }} />
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl flex flex-col items-center justify-center border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-orange-400">
                                <Sun size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">UV</span>
                            </div>
                            <span className="text-xl font-bold text-white">{uv.toFixed(1)}</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saatlik Akış</h3>
        <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
             <span className="text-[10px] text-slate-500 font-medium">Yağış İhtimali</span>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar py-4 -my-4 px-1">
        <div className="flex space-x-3 min-w-max pb-2">
          {forecastIndices.map((dataIndex, displayIndex) => {
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
                onClick={() => handleOpenWithDelay(dataIndex)}
                className={`
                  relative flex flex-col items-center justify-between 
                  w-[4.5rem] h-32 p-2 rounded-[1.25rem] transition-all duration-300 ease-out
                  backdrop-blur-md overflow-hidden group 
                  active:scale-[0.9] active:brightness-90
                  ${isNow 
                    ? 'bg-slate-800/90 ring-1 ring-blue-500/50 shadow-xl shadow-blue-500/10 scale-105 z-10' 
                    : 'bg-white/5 border border-white/5 hover:bg-white/10 shadow-lg'}
                `}
              >
                {/* Time */}
                <span className={`text-[10px] font-bold tracking-wide ${isNow ? 'text-white' : 'text-slate-400'}`}>
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
                <div className="w-9 h-9 drop-shadow-md z-10 transform transition-transform group-hover:scale-110 my-1">
                     {getWeatherIcon(code, isDay)}
                </div>

                {/* Info (Rain % or Wind) */}
                <div className="z-10 h-4 flex items-center justify-center">
                    {rainProb >= 10 ? (
                         <div className="flex flex-col items-center">
                             <span className="text-[9px] font-bold text-blue-300">%{rainProb}</span>
                         </div>
                    ) : (
                         <div className="flex items-center justify-center opacity-50" title="Rüzgar Yönü">
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
