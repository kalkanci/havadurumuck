
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { 
    Wind, Sun, Umbrella, ChevronRight, X, 
    Sunrise, Sunset, Droplets, Thermometer, Calendar
} from 'lucide-react';
import { getWindDirection, formatTime } from '../utils/helpers';

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
    precipitation_probability_max, 
    wind_speed_10m_max, 
    wind_direction_10m_dominant,
    sunrise, 
    sunset, 
    uv_index_max 
  } = weather.daily;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDetailClosing, setIsDetailClosing] = useState(false);

  // Global Min/Max for the bar visualization
  const globalMin = Math.min(...temperature_2m_min);
  const globalMax = Math.max(...temperature_2m_max);
  const globalRange = globalMax - globalMin;

  // --- Handlers ---
  const openDayDetail = (index: number) => {
    setSelectedDay(index);
    setIsDetailClosing(false);
  };

  const closeDayDetail = () => {
    setIsDetailClosing(true);
    setTimeout(() => {
        setSelectedDay(null);
        setIsDetailClosing(false);
    }, 200);
  };

  // --- Helpers for Visuals ---
  const getGradient = (temp: number) => {
      if (temp >= 30) return 'from-orange-500 to-red-600';
      if (temp >= 20) return 'from-yellow-400 to-orange-500';
      if (temp >= 10) return 'from-cyan-400 to-blue-500';
      return 'from-blue-600 to-indigo-600';
  };

  // --- Render Detail Modal (Center Pop-in) ---
  const renderDetailModal = () => {
      if (selectedDay === null) return null;
      
      const index = selectedDay;
      const date = new Date(time[index]);
      const code = weather_code[index];
      const maxT = Math.round(temperature_2m_max[index]);
      const minT = Math.round(temperature_2m_min[index]);
      const feels = Math.round(apparent_temperature_max ? apparent_temperature_max[index] : maxT);
      const rain = precipitation_probability_max ? precipitation_probability_max[index] : 0;
      const wind = Math.round(wind_speed_10m_max ? wind_speed_10m_max[index] : 0);
      const windDir = wind_direction_10m_dominant ? wind_direction_10m_dominant[index] : 0;
      const sr = sunrise[index];
      const ss = sunset[index];
      const uv = uv_index_max ? uv_index_max[index] : 0;

      return createPortal(
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={closeDayDetail}
            />
            
            <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col ${isDetailClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                 <button onClick={closeDayDetail} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 z-10">
                     <X size={20} />
                 </button>

                 {/* Header */}
                 <div className="text-center mb-6">
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                         {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                         {date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                     </h2>
                     <div className="flex items-center justify-center gap-2">
                         <span className="px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-200 text-xs font-bold">
                             {getWeatherLabel(code)}
                         </span>
                     </div>
                 </div>

                 {/* Main Stats Grid */}
                 <div className="grid grid-cols-2 gap-3 mb-6">
                     {/* Temp Card */}
                     <div className="col-span-2 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 p-4 rounded-2xl border border-blue-500/10 dark:border-blue-500/20 flex items-center justify-between">
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-1">
                                 <Thermometer size={16} /> <span className="text-xs font-bold uppercase">Sıcaklık</span>
                             </div>
                             <div className="flex items-end gap-2">
                                 <span className="text-4xl font-bold text-slate-900 dark:text-white">{maxT}°</span>
                                 <span className="text-xl text-slate-500 dark:text-slate-400 mb-1">/ {minT}°</span>
                             </div>
                             <span className="text-xs text-blue-600 dark:text-blue-200 mt-1">Hissedilen: {feels}°</span>
                         </div>
                         <div className="w-16 h-16 drop-shadow-lg scale-125">
                             {getWeatherIcon(code)}
                         </div>
                     </div>

                     {/* Wind */}
                     <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                         <Wind size={20} className="text-teal-500 dark:text-teal-400 mb-2" />
                         <span className="text-lg font-bold text-slate-800 dark:text-white">{wind} <span className="text-xs font-normal text-slate-500">km/s</span></span>
                         <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">{getWindDirection(windDir)}</span>
                     </div>

                     {/* Rain/UV */}
                     <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                         {rain > 0 ? (
                             <>
                                <Droplets size={20} className="text-blue-500 dark:text-blue-400 mb-2" />
                                <span className="text-lg font-bold text-slate-800 dark:text-white">%{rain}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Yağış</span>
                             </>
                         ) : (
                             <>
                                <Sun size={20} className="text-orange-500 dark:text-orange-400 mb-2" />
                                <span className="text-lg font-bold text-slate-800 dark:text-white">{uv?.toFixed(0)}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">UV İndeks</span>
                             </>
                         )}
                     </div>
                 </div>

                 {/* Sun Times */}
                 <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 dark:text-yellow-400"><Sunrise size={18} /></div>
                         <div>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Gün Doğumu</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">{formatTime(sr)}</p>
                         </div>
                     </div>
                     <div className="w-[1px] h-8 bg-slate-300 dark:bg-white/10" />
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-500 dark:text-indigo-400"><Sunset size={18} /></div>
                         <div>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Gün Batımı</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">{formatTime(ss)}</p>
                         </div>
                     </div>
                 </div>

            </div>
        </div>,
        document.body
      );
  };


  // --- Main Render ---
  return (
    <div className="w-full flex flex-col pb-24 animate-fade-in-up">
        {/* Page Title */}
        <div className="mb-6 mt-2 flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-300">
                <Calendar size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">15 Günlük Plan</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Uzun Vadeli Tahmin Raporu</p>
            </div>
        </div>

        {/* List */}
        <div className="space-y-3">
            {time.map((dateStr, index) => {
                const date = new Date(dateStr);
                const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
                const dateNum = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric' });
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                const min = Math.round(temperature_2m_min[index]);
                const max = Math.round(temperature_2m_max[index]);
                const rainProb = precipitation_probability_max ? precipitation_probability_max[index] : 0;
                
                // Bar Calculation
                const leftPos = ((min - globalMin) / globalRange) * 100;
                const widthPos = ((max - min) / globalRange) * 100;
                const barColor = getGradient(max);

                return (
                    <div 
                        key={dateStr}
                        onClick={() => openDayDetail(index)}
                        className="group flex items-center justify-between p-4 rounded-3xl bg-white/90 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-slate-700/60 active:scale-[0.98] transition-all cursor-pointer shadow-none dark:shadow-lg"
                    >
                        {/* Left: Date */}
                        <div className="flex flex-col w-20 flex-shrink-0">
                            <span className={`text-sm font-bold ${isWeekend ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{dayName}</span>
                            <span className="text-xs text-slate-500 font-medium">{dateNum}</span>
                        </div>

                        {/* Middle: Icon & Rain */}
                        <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 gap-1">
                            <div className="w-8 h-8 drop-shadow-md">
                                {getWeatherIcon(weather_code[index])}
                            </div>
                            {rainProb > 0 && (
                                <div className="flex items-center gap-0.5">
                                    <Umbrella size={10} className="text-blue-500 dark:text-blue-400" />
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">%{rainProb}</span>
                                </div>
                            )}
                        </div>

                        {/* Right: Temp Bar & Values */}
                        <div className="flex-1 flex items-center gap-3 pl-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-6 text-right">{min}°</span>
                            
                            {/* Visual Range Bar */}
                            <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-700/30 rounded-full relative overflow-hidden">
                                    <div 
                                    className={`absolute h-full rounded-full bg-gradient-to-r ${barColor} opacity-90`}
                                    style={{ 
                                        left: `${leftPos}%`, 
                                        width: `${Math.max(widthPos, 10)}%` 
                                    }} 
                                />
                            </div>

                            <span className="text-sm font-bold text-slate-800 dark:text-white w-6">{max}°</span>
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors ml-2" />
                    </div>
                );
            })}
        </div>

        {renderDetailModal()}
    </div>
  );
};

export default DailyForecast;
