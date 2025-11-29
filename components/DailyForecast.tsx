
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { ChevronDown, Calendar, Wind, Sun, Clock, ThermometerSun, Umbrella, Navigation, Sunrise, Sunset } from 'lucide-react';
import { formatTime, getWindDirection, getDayDuration } from '../utils/helpers';

interface DailyForecastProps {
  weather: WeatherData;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather }) => {
  const { 
    time, 
    weather_code, 
    temperature_2m_max, 
    temperature_2m_min, 
    apparent_temperature_max,
    apparent_temperature_min,
    precipitation_probability_max, 
    precipitation_sum,
    precipitation_hours,
    wind_speed_10m_max, 
    wind_gusts_10m_max,
    wind_direction_10m_dominant,
    sunrise, 
    sunset, 
    uv_index_max 
  } = weather.daily;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (selectedDay !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedDay]);

  const openPage = (index: number) => {
    setSelectedDay(index);
    setIsClosing(false);
  };

  const closePage = () => {
    setIsClosing(true);
    setTimeout(() => {
        setSelectedDay(null);
        setIsClosing(false);
    }, 300);
  };

  const dayData = selectedDay !== null ? {
    date: new Date(time[selectedDay]),
    code: weather_code[selectedDay],
    maxTemp: temperature_2m_max[selectedDay],
    minTemp: temperature_2m_min[selectedDay],
    maxFeels: apparent_temperature_max ? apparent_temperature_max[selectedDay] : temperature_2m_max[selectedDay],
    minFeels: apparent_temperature_min ? apparent_temperature_min[selectedDay] : temperature_2m_min[selectedDay],
    rainProb: precipitation_probability_max ? precipitation_probability_max[selectedDay] : 0,
    rainSum: precipitation_sum ? precipitation_sum[selectedDay] : 0,
    rainHours: precipitation_hours ? precipitation_hours[selectedDay] : 0,
    wind: wind_speed_10m_max ? wind_speed_10m_max[selectedDay] : 0,
    gusts: wind_gusts_10m_max ? wind_gusts_10m_max[selectedDay] : 0,
    windDir: wind_direction_10m_dominant ? wind_direction_10m_dominant[selectedDay] : 0,
    uv: uv_index_max[selectedDay],
    sunrise: sunrise[selectedDay],
    sunset: sunset[selectedDay]
  } : null;

  const modalContent = selectedDay !== null && dayData ? (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
        {/* Backdrop */}
        <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closePage}
        />

        {/* Sheet Card */}
        <div 
            className={`relative w-full max-w-md bg-slate-900 h-[90vh] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isClosing ? 'animate-sheet-down' : 'animate-sheet-up'}`}
        >
            {/* Drag Handle & Header */}
            <div className="pt-4 pb-2 px-6 bg-slate-900/80 backdrop-blur-xl z-50 sticky top-0 border-b border-white/5">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 opacity-50" />
                
                <div className="flex items-center justify-between">
                     <div>
                         <h2 className="text-2xl font-bold text-white tracking-tight">
                            {selectedDay === 0 ? 'Bugün' : dayData.date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                         </h2>
                         <p className="text-sm text-slate-400 font-medium">
                            {dayData.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                         </p>
                     </div>
                     <button 
                        onClick={closePage}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <ChevronDown className="text-white" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-20 space-y-4">
              
              {/* Main Temp Card */}
              <div className="stagger-item bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar size={100} />
                    </div>
                    <div className="flex justify-center mb-4 relative z-10">
                         <div className="scale-[2] drop-shadow-2xl">{getWeatherIcon(dayData.code)}</div>
                    </div>
                    <div className="text-xl font-medium text-blue-100 mb-8 relative z-10">{getWeatherLabel(dayData.code)}</div>
                    
                    <div className="flex items-center justify-center gap-10 relative z-10">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-bold text-white tracking-tighter">{Math.round(dayData.maxTemp)}°</span>
                            <span className="text-xs text-orange-300 font-bold uppercase mt-2 px-2 py-0.5 bg-orange-500/10 rounded-full">Gündüz</span>
                        </div>
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-light text-slate-400 tracking-tighter">{Math.round(dayData.minTemp)}°</span>
                            <span className="text-xs text-blue-300 font-bold uppercase mt-2 px-2 py-0.5 bg-blue-500/10 rounded-full">Gece</span>
                        </div>
                    </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-3">
                  
                  {/* Feels Like */}
                  <div className="stagger-item glass-card p-4 rounded-2xl flex flex-col justify-between h-32" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center gap-2 text-red-300">
                          <ThermometerSun size={20} />
                          <span className="text-xs font-bold uppercase">Hissedilen</span>
                      </div>
                      <div>
                         <div className="flex justify-between items-end">
                            <span className="text-3xl font-bold text-white">{Math.round(dayData.maxFeels)}°</span>
                            <span className="text-lg text-slate-500 mb-1">{Math.round(dayData.minFeels)}°</span>
                         </div>
                         <div className="w-full h-1 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-blue-500 to-red-500 w-full opacity-60"></div>
                         </div>
                      </div>
                  </div>

                  {/* UV & Sun */}
                  <div className="stagger-item glass-card p-4 rounded-2xl flex flex-col justify-between h-32" style={{ animationDelay: '0.25s' }}>
                       <div className="flex items-center gap-2 text-orange-400">
                          <Sun size={20} />
                          <span className="text-xs font-bold uppercase">Güneş</span>
                      </div>
                      <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-center">
                               <span className="text-xs text-slate-400">UV İndeksi</span>
                               <span className={`font-bold ${dayData.uv > 7 ? 'text-red-400' : 'text-white'}`}>{dayData.uv.toFixed(0)}</span>
                           </div>
                           <div className="w-full h-1 bg-slate-700 rounded-full">
                               <div className="h-full bg-orange-400 rounded-full" style={{width: `${Math.min(dayData.uv * 10, 100)}%`}}></div>
                           </div>
                           <div className="flex justify-between items-center mt-1">
                               <span className="text-xs text-slate-400">Gündüz Süresi</span>
                               <span className="text-xs font-bold text-white">{getDayDuration(dayData.sunrise, dayData.sunset)}</span>
                           </div>
                      </div>
                  </div>

                  {/* Wind */}
                  <div className="stagger-item col-span-2 glass-card p-4 rounded-2xl flex items-center justify-between" style={{ animationDelay: '0.3s' }}>
                       <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-teal-400 mb-2">
                                <Wind size={20} />
                                <span className="text-xs font-bold uppercase">Rüzgar Durumu</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{Math.round(dayData.wind)}</span>
                                <span className="text-sm text-slate-400">km/s</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Maksimum Hamle: {Math.round(dayData.gusts)} km/s
                            </div>
                       </div>
                       <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-800/80 rounded-full border border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                            <Navigation 
                                size={28} 
                                className="text-teal-400" 
                                style={{ transform: `rotate(${dayData.windDir}deg)` }} 
                            />
                            <span className="text-[10px] font-bold mt-1 text-teal-200">{getWindDirection(dayData.windDir)}</span>
                       </div>
                  </div>

                  {/* Rain */}
                  <div className="stagger-item col-span-2 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/20 p-5 rounded-2xl" style={{ animationDelay: '0.35s' }}>
                      <div className="flex items-center gap-2 text-blue-300 mb-4">
                          <Umbrella size={20} />
                          <span className="text-xs font-bold uppercase">Yağış Detayları</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-black/20 rounded-xl p-2">
                                <p className="text-2xl font-bold text-blue-100">%{dayData.rainProb}</p>
                                <p className="text-[10px] text-blue-300 uppercase tracking-wide mt-1">İhtimal</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-2">
                                <p className="text-2xl font-bold text-blue-100">{dayData.rainSum}</p>
                                <p className="text-[10px] text-blue-300 uppercase tracking-wide mt-1">mm</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-2">
                                <p className="text-2xl font-bold text-blue-100">{dayData.rainHours}</p>
                                <p className="text-[10px] text-blue-300 uppercase tracking-wide mt-1">Saat</p>
                            </div>
                      </div>
                  </div>
              </div>
            </div>
        </div>
    </div>
  ) : null;

  return (
    <>
      <div className="w-full glass-card rounded-3xl p-5 mb-6">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} />
          7 Günlük Tahmin
        </h3>
        
        <div className="flex flex-col space-y-4">
          {time.map((dateStr, index) => {
            const date = new Date(dateStr);
            const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div 
                key={dateStr} 
                onClick={() => openPage(index)}
                className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer active:scale-95 duration-200"
              >
                <div className="flex items-center gap-2 w-28">
                    <span className={`font-medium ${isWeekend ? 'text-blue-300' : 'text-slate-200'}`}>{dayName}</span>
                </div>
                
                <div className="flex-1 flex justify-center items-center gap-2">
                  <div className="w-6 h-6 text-slate-300">
                    {getWeatherIcon(weather_code[index])}
                  </div>
                  {precipitation_probability_max && precipitation_probability_max[index] > 20 && (
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                      %{precipitation_probability_max[index]}
                    </span>
                  )}
                </div>
                <div className="flex space-x-4 w-24 justify-end">
                  <span className="font-bold text-white">{Math.round(temperature_2m_max[index])}°</span>
                  <span className="text-slate-400 font-medium">{Math.round(temperature_2m_min[index])}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Modal via Portal */}
      {selectedDay !== null && createPortal(modalContent, document.body)}
    </>
  );
};

export default DailyForecast;
