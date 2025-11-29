
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { ChevronDown, Calendar, Wind, Sun, ThermometerSun, Umbrella, Navigation, ChevronRight, ArrowLeft } from 'lucide-react';
import { getWindDirection, getDayDuration } from '../utils/helpers';

interface DailyForecastProps {
  weather: WeatherData;
  onClose: () => void; // Parent component will handle closing this view
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather, onClose }) => {
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

  // Haftanın en düşük ve en yüksek sıcaklıklarını bul (Bar görselleştirmesi için)
  const minTempOfWeek = Math.min(...temperature_2m_min);
  const maxTempOfWeek = Math.max(...temperature_2m_max);

  useEffect(() => {
    // This component acts as a full screen modal now, so lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

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

  // Day Detail Modal (iOS Sheet Style)
  const modalContent = selectedDay !== null && dayData ? (
    <div className="fixed inset-0 z-[300] flex items-end justify-center">
        {/* Backdrop for day detail */}
        <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closePage}
        />

        {/* Sheet Card */}
        <div 
            className={`relative w-full max-w-md bg-slate-900 h-[85vh] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isClosing ? 'animate-sheet-down' : 'animate-sheet-up'}`}
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
              {/* Reuse the detail cards logic (same as before) */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
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

              <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-32">
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

                  <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-32">
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

                  <div className="col-span-2 glass-card p-4 rounded-2xl flex items-center justify-between">
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

                  <div className="col-span-2 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/20 p-5 rounded-2xl">
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

  // Main 15-Day List View (Full Screen)
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-hidden flex flex-col animate-sheet-up">
        {/* Full Screen Header */}
        <div className="pt-4 pb-2 px-4 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 z-10 flex items-center justify-between" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
             <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
             >
                <ArrowLeft size={24} />
             </button>
             
             <h3 className="text-base font-bold text-white flex items-center gap-2">
                 <Calendar size={18} className="text-blue-400" />
                 15 Günlük Tahmin
             </h3>
             
             <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {time.map((dateStr, index) => {
            const date = new Date(dateStr);
            const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
            const dateNum = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const currentMin = temperature_2m_min[index];
            const currentMax = temperature_2m_max[index];
            const rainProb = precipitation_probability_max ? precipitation_probability_max[index] : 0;

            const range = maxTempOfWeek - minTempOfWeek;
            const leftPos = ((currentMin - minTempOfWeek) / range) * 100;
            const widthPos = ((currentMax - currentMin) / range) * 100;
            
            return (
              <div 
                key={dateStr} 
                onClick={() => openPage(index)}
                className="group relative flex items-center py-4 px-3 rounded-2xl glass-card hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer shadow-sm border-white/5"
              >
                {/* Left: Day & Date */}
                <div className="flex flex-col w-24 flex-shrink-0">
                    <span className={`text-base font-bold truncate ${isWeekend ? 'text-blue-300' : 'text-white'}`}>{dayName}</span>
                    <span className="text-xs text-slate-400 font-medium truncate">{dateNum}</span>
                </div>
                
                {/* Center: Icon */}
                <div className="flex flex-col items-center justify-center gap-1 w-14 flex-shrink-0">
                  <div className="w-9 h-9 drop-shadow-lg">
                    {getWeatherIcon(weather_code[index])}
                  </div>
                  {rainProb > 10 && (
                    <div className="flex items-center gap-1 bg-blue-500/20 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                        <Umbrella size={10} className="text-blue-300" />
                        <span className="text-[9px] text-blue-200 font-bold">%{rainProb}</span>
                    </div>
                  )}
                </div>

                {/* Right: Temp Bar */}
                <div className="flex-1 flex items-center justify-end gap-2 pl-1 min-w-0">
                     <span className="text-sm font-medium text-slate-400 w-6 text-right">{Math.round(currentMin)}°</span>
                     
                     <div className="h-2 w-16 sm:w-24 bg-slate-700/50 rounded-full relative overflow-hidden flex-shrink-0 ring-1 ring-white/5">
                        <div 
                            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400 opacity-90 shadow-[0_0_10px_rgba(251,146,60,0.4)]"
                            style={{ 
                                left: `${leftPos}%`, 
                                width: `${Math.max(widthPos, 10)}%` 
                            }} 
                        />
                    </div>

                    <span className="text-lg font-bold text-white w-7 text-right">{Math.round(currentMax)}°</span>
                    <ChevronRight size={16} className="text-slate-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Render Modal via Portal for day details */}
        {selectedDay !== null && createPortal(modalContent, document.body)}
    </div>
  );
};

export default DailyForecast;
