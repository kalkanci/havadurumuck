
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { 
    Wind, Sun, Umbrella, ChevronRight, X, 
    Sunrise, Sunset, Droplets, Thermometer, Calendar, TrendingUp, ArrowUp, ArrowDown
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

  // Global Min/Max for calculations
  const globalMin = Math.min(...temperature_2m_min);
  const globalMax = Math.max(...temperature_2m_max);
  
  // Stats
  const hottestTemp = globalMax;
  const coldestTemp = globalMin;
  const rainyDays = precipitation_probability_max.filter(p => p > 50).length;

  // Find Indices for interactions
  const hottestIndex = temperature_2m_max.indexOf(globalMax);
  const coldestIndex = temperature_2m_min.indexOf(globalMin);
  // For rain, find the day with the MAX precipitation probability
  const maxRainProb = Math.max(...precipitation_probability_max);
  const rainiestIndex = precipitation_probability_max.indexOf(maxRainProb);


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

  // --- Chart Generator ---
  const generateChartPath = (width: number, height: number, data: number[], min: number, max: number) => {
      if (data.length < 2) return "";
      const stepX = width / (data.length - 1);
      const range = max - min;
      
      const points = data.map((val, i) => {
          const x = i * stepX;
          const y = height - ((val - min) / range) * height; // Invert Y because SVG 0 is top
          return `${x},${y}`;
      });

      // Create area path
      return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  const generateLinePath = (width: number, height: number, data: number[], min: number, max: number) => {
      if (data.length < 2) return "";
      const stepX = width / (data.length - 1);
      const range = max - min;
      
      const points = data.map((val, i) => {
          const x = i * stepX;
          const y = height - ((val - min) / range) * height; 
          return `${x},${y}`;
      });

      return `M${points.join(' L')}`;
  };

  // Chart config
  const chartHeight = 80;
  const chartWidth = 300; // arbitrary unit for SVG viewbox
  
  // Padding for chart visual limits so lines don't touch edges perfectly
  const chartMin = globalMin - 2;
  const chartMax = globalMax + 2;

  const maxLinePath = generateLinePath(chartWidth, chartHeight, temperature_2m_max, chartMin, chartMax);
  const minLinePath = generateLinePath(chartWidth, chartHeight, temperature_2m_min, chartMin, chartMax);
  const areaPath = generateChartPath(chartWidth, chartHeight, temperature_2m_max, chartMin, chartMax);

  // --- Render Detail Modal ---
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Uzun Vadeli Tahmin</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">16 Günlük Trend ve Analiz</p>
            </div>
        </div>

        {/* 1. Trend Chart */}
        <div className="glass-card rounded-3xl p-5 mb-6 bg-gradient-to-b from-white/10 to-transparent relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} /> Sıcaklık Trendi
                 </h3>
                 <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">Maks / Min</span>
             </div>
             
             <div className="h-28 w-full relative">
                 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     <defs>
                         <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="rgba(249, 115, 22, 0.3)" />
                             <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                         </linearGradient>
                     </defs>
                     
                     {/* Area */}
                     {/* <path d={areaPath} fill="url(#chartGradient)" /> */}
                     
                     {/* Min Line */}
                     <path d={minLinePath} fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     
                     {/* Max Line */}
                     <path d={maxLinePath} fill="none" stroke="rgba(251, 146, 60, 0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>

                 {/* Labels (Min/Max overlay) */}
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-between items-end pb-1 text-[10px] text-slate-400 opacity-50 font-mono">
                     <span>Bugün</span>
                     <span>16 Gün</span>
                 </div>
             </div>
        </div>

        {/* 2. Summary Cards (Interactive) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
                onClick={() => openDayDetail(hottestIndex)}
                className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-white/10"
            >
                 <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">En Sıcak</span>
                 <div className="flex items-center gap-1">
                     <ArrowUp size={14} className="text-red-500" />
                     <span className="text-xl font-bold text-white">{Math.round(hottestTemp)}°</span>
                 </div>
            </button>
            <button 
                onClick={() => openDayDetail(coldestIndex)}
                className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-white/10"
            >
                 <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">En Soğuk</span>
                 <div className="flex items-center gap-1">
                     <ArrowDown size={14} className="text-blue-500" />
                     <span className="text-xl font-bold text-white">{Math.round(coldestTemp)}°</span>
                 </div>
            </button>
            <button 
                onClick={() => openDayDetail(rainiestIndex)}
                className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:bg-white/10"
            >
                 <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Yağışlı Gün</span>
                 <div className="flex items-center gap-1">
                     <Droplets size={14} className="text-blue-400" />
                     <span className="text-xl font-bold text-white">{rainyDays}</span>
                 </div>
            </button>
        </div>

        {/* 3. Detailed List */}
        <div className="space-y-3">
            {time.map((dateStr, index) => {
                const date = new Date(dateStr);
                const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
                const dateNum = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric' });
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                const min = Math.round(temperature_2m_min[index]);
                const max = Math.round(temperature_2m_max[index]);
                const rainProb = precipitation_probability_max ? precipitation_probability_max[index] : 0;
                const windMax = wind_speed_10m_max ? Math.round(wind_speed_10m_max[index]) : 0;
                
                return (
                    <div 
                        key={dateStr}
                        onClick={() => openDayDetail(index)}
                        className={`group flex items-center justify-between p-4 rounded-3xl backdrop-blur-md border hover:bg-white dark:hover:bg-slate-700/60 active:scale-[0.98] transition-all cursor-pointer shadow-none dark:shadow-lg ${isWeekend ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/90 dark:bg-slate-800/60 border-slate-200 dark:border-white/5'}`}
                    >
                        {/* Left: Date */}
                        <div className="flex flex-col w-20 flex-shrink-0">
                            <span className={`text-sm font-bold ${isWeekend ? 'text-indigo-400 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{dayName}</span>
                            <span className="text-xs text-slate-500 font-medium opacity-70">{dateNum}</span>
                        </div>

                        {/* Middle: Icon & Conditions */}
                        <div className="flex items-center gap-4 flex-1 justify-center">
                            <div className="w-10 h-10 drop-shadow-md">
                                {getWeatherIcon(weather_code[index])}
                            </div>
                            
                            {/* Mini Condition Pills */}
                            <div className="flex flex-col gap-1">
                                {rainProb > 20 && (
                                    <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                                        <Umbrella size={10} className="text-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">%{rainProb}</span>
                                    </div>
                                )}
                                {windMax > 20 && (
                                     <div className="flex items-center gap-1 bg-teal-500/10 px-1.5 py-0.5 rounded-md">
                                        <Wind size={10} className="text-teal-500" />
                                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-300">{windMax}km</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Temp */}
                        <div className="flex flex-col items-end w-16">
                            <span className="text-lg font-bold text-slate-800 dark:text-white">{max}°</span>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{min}°</span>
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors ml-1" />
                    </div>
                );
            })}
        </div>

        {renderDetailModal()}
    </div>
  );
};

export default DailyForecast;
