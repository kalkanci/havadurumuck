
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { 
    Wind, Sun, Umbrella, X, 
    Sunrise, Sunset, Droplets, Thermometer, Calendar, 
    TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, 
    ThermometerSun, ThermometerSnowflake, CalendarDays
} from 'lucide-react';
import { getWindDirection, formatTime, triggerHapticFeedback, convertTemperature } from '../utils/helpers';

interface DailyForecastProps {
  weather: WeatherData;
  unit: 'celsius' | 'fahrenheit';
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather, unit }) => {
  // Slicing data to exactly 15 days
  const limit = 15;
  
  const time = weather.daily.time.slice(0, limit);
  const weather_code = weather.daily.weather_code.slice(0, limit);

  // Convert Data
  const temperature_2m_max = weather.daily.temperature_2m_max.slice(0, limit).map(t => convertTemperature(t, unit));
  const temperature_2m_min = weather.daily.temperature_2m_min.slice(0, limit).map(t => convertTemperature(t, unit));
  const apparent_temperature_max = weather.daily.apparent_temperature_max.slice(0, limit).map(t => convertTemperature(t, unit));

  const precipitation_probability_max = weather.daily.precipitation_probability_max.slice(0, limit);
  const wind_speed_10m_max = weather.daily.wind_speed_10m_max.slice(0, limit);
  const wind_direction_10m_dominant = weather.daily.wind_direction_10m_dominant.slice(0, limit);
  const sunrise = weather.daily.sunrise.slice(0, limit);
  const sunset = weather.daily.sunset.slice(0, limit);
  const uv_index_max = weather.daily.uv_index_max.slice(0, limit);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDetailClosing, setIsDetailClosing] = useState(false);

  const tempUnit = unit === 'celsius' ? '°' : '°F';
  const speedUnit = 'km/s';

  // Statistics for the summary header
  const globalMin = Math.min(...temperature_2m_min);
  const globalMax = Math.max(...temperature_2m_max);
  const tempRange = globalMax - globalMin;
  
  const hottestDayIndex = temperature_2m_max.indexOf(globalMax);
  const coldestDayIndex = temperature_2m_min.indexOf(globalMin);
  const rainyDaysCount = precipitation_probability_max.filter(p => p > 50).length;

  // Trend Analysis
  const startAvg = (temperature_2m_max[0] + temperature_2m_min[0]) / 2;
  const endAvg = (temperature_2m_max[limit-1] + temperature_2m_min[limit-1]) / 2;
  const trendDiff = endAvg - startAvg;
  
  let trendIcon = <Minus size={20} className="text-slate-400" />;
  let trendText = "Sıcaklıklar dengeli seyredecek.";
  let trendColor = "from-slate-800 to-slate-900";

  if (trendDiff > 2) {
      trendIcon = <TrendingUp size={20} className="text-orange-400" />;
      trendText = "Hava kademeli olarak ısınıyor.";
      trendColor = "from-orange-900/40 to-slate-900";
  } else if (trendDiff < -2) {
      trendIcon = <TrendingDown size={20} className="text-blue-400" />;
      trendText = "Hava kademeli olarak soğuyor.";
      trendColor = "from-blue-900/40 to-slate-900";
  }

  // Helper to determine card background based on weather
  const getCardBackground = (code: number) => {
      // Sunny
      if (code <= 1) return "from-orange-500/10 to-yellow-500/5 border-orange-500/20";
      // Cloudy
      if (code <= 3) return "from-slate-700/20 to-slate-800/10 border-white/10";
      // Rain
      if (code >= 50 && code <= 67) return "from-blue-600/10 to-indigo-600/5 border-blue-500/20";
      // Snow
      if (code >= 71) return "from-cyan-500/10 to-blue-500/5 border-cyan-500/20";
      // Storm
      if (code >= 95) return "from-purple-600/20 to-indigo-900/20 border-purple-500/30";
      
      return "from-white/5 to-transparent border-white/5";
  };

  useEffect(() => {
    if (selectedDay !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDay]);

  // --- Handlers ---
  const openDayDetailWithDelay = (index: number) => {
    triggerHapticFeedback(15);
    setTimeout(() => {
        setSelectedDay(index);
        setIsDetailClosing(false);
    }, 200);
  };

  const closeDayDetail = () => {
    setIsDetailClosing(true);
    setTimeout(() => {
        setSelectedDay(null);
        setIsDetailClosing(false);
    }, 200);
  };

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
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={closeDayDetail}
            />
            
            <div className={`relative w-full max-w-sm bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col ${isDetailClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                 {/* Top Glow */}
                 <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>

                 <button onClick={closeDayDetail} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors z-20">
                     <X size={20} />
                 </button>

                 {/* Header */}
                 <div className="text-center mb-8 pt-4 relative z-10">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                         {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                     <h2 className="text-4xl font-bold text-white mb-2">
                         {date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                     </h2>
                     <div className="flex items-center justify-center gap-2">
                         <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-500/20">
                             {getWeatherLabel(code)}
                         </span>
                     </div>
                 </div>

                 {/* Main Stats Grid */}
                 <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                     {/* Temp Card */}
                     <div className="col-span-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/10 p-5 rounded-3xl border border-blue-500/20 flex items-center justify-between">
                         <div className="flex flex-col">
                             <div className="flex items-center gap-2 text-blue-200 mb-1">
                                 <Thermometer size={16} /> <span className="text-xs font-bold uppercase tracking-wide">Sıcaklık</span>
                             </div>
                             <div className="flex items-end gap-2">
                                 <span className="text-5xl font-black text-white tracking-tighter">{maxT}{tempUnit}</span>
                                 <span className="text-2xl text-slate-400 mb-1 font-light">/ {minT}{tempUnit}</span>
                             </div>
                             <span className="text-xs text-blue-300 mt-2 font-medium">Hissedilen: {feels}{tempUnit}</span>
                         </div>
                         <div className="w-20 h-20 drop-shadow-xl">
                             {getWeatherIcon(code)}
                         </div>
                     </div>

                     {/* Wind */}
                     <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                         <Wind size={24} className="text-teal-400 mb-2" />
                         <span className="text-xl font-bold text-white">{wind} <span className="text-xs font-normal text-slate-400">{speedUnit}</span></span>
                         <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">{getWindDirection(windDir)}</span>
                     </div>

                     {/* Rain/UV */}
                     <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                         {rain > 0 ? (
                             <>
                                <Droplets size={24} className="text-blue-400 mb-2" />
                                <span className="text-xl font-bold text-white">%{rain}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">Yağış</span>
                             </>
                         ) : (
                             <>
                                <Sun size={24} className="text-orange-400 mb-2" />
                                <span className="text-xl font-bold text-white">{uv?.toFixed(0)}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">UV İndeks</span>
                             </>
                         )}
                     </div>
                 </div>

                 {/* Sun Times */}
                 <div className="bg-white/5 rounded-3xl p-5 flex items-center justify-between border border-white/5 backdrop-blur-sm relative z-10">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-yellow-500/20 rounded-full text-yellow-400"><Sunrise size={20} /></div>
                         <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gün Doğumu</p>
                             <p className="text-sm font-bold text-white">{formatTime(sr)}</p>
                         </div>
                     </div>
                     <div className="w-[1px] h-10 bg-white/10" />
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-indigo-500/20 rounded-full text-indigo-400"><Sunset size={20} /></div>
                         <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gün Batımı</p>
                             <p className="text-sm font-bold text-white">{formatTime(ss)}</p>
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
        {/* Page Title & Hero */}
        <div className="mb-6 mt-2 px-2">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300 ring-1 ring-blue-500/30">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Gelecek 15 Gün</h2>
                    <p className="text-xs text-slate-400 font-medium">Detaylı Atmosfer Raporu</p>
                </div>
            </div>

            {/* Visual Insight Board */}
            <div className={`w-full rounded-3xl p-6 bg-gradient-to-br ${trendColor} border border-white/10 shadow-2xl relative overflow-hidden mb-8`}>
                {/* Abstract Noise Texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                
                {/* Trend Header */}
                <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/10 rounded-full backdrop-blur-md shadow-inner">
                        {trendIcon}
                    </div>
                    <p className="text-lg font-bold text-white leading-tight">{trendText}</p>
                </div>

                {/* Stat Grid */}
                <div className="relative z-10 grid grid-cols-3 gap-3">
                    <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center text-center">
                        <ThermometerSun size={18} className="text-orange-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">En Yüksek</span>
                        <span className="text-xl font-black text-white">{globalMax}{tempUnit}</span>
                        <span className="text-[9px] text-slate-500">{new Date(time[hottestDayIndex]).getDate()} {new Date(time[hottestDayIndex]).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center text-center">
                        <ThermometerSnowflake size={18} className="text-blue-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">En Düşük</span>
                        <span className="text-xl font-black text-white">{globalMin}{tempUnit}</span>
                         <span className="text-[9px] text-slate-500">{new Date(time[coldestDayIndex]).getDate()} {new Date(time[coldestDayIndex]).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center text-center">
                        <Droplets size={18} className="text-blue-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Yağışlı Gün</span>
                        <span className="text-xl font-black text-white">{rainyDaysCount}</span>
                        <span className="text-[9px] text-slate-500">Toplam</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Detailed Data Stream (Timeline Style) */}
        <div className="space-y-3 px-1">
            {time.map((dateStr, index) => {
                const date = new Date(dateStr);
                const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
                const dateNum = date.getDate();
                const month = date.toLocaleDateString('tr-TR', { month: 'short' });
                
                const min = Math.round(temperature_2m_min[index]);
                const max = Math.round(temperature_2m_max[index]);
                const rainProb = precipitation_probability_max ? precipitation_probability_max[index] : 0;
                const code = weather_code[index];
                
                // Calculate visualization bars
                const leftPos = ((min - globalMin) / tempRange) * 100;
                const width = ((max - min) / tempRange) * 100;
                
                return (
                    <button 
                        key={dateStr}
                        onClick={() => openDayDetailWithDelay(index)}
                        className={`w-full group flex items-center justify-between p-4 rounded-3xl border backdrop-blur-md transition-all duration-300 active:scale-[0.98] bg-gradient-to-r hover:brightness-110 shadow-lg ${getCardBackground(code)}`}
                    >
                        {/* 1. Date */}
                        <div className="flex flex-col w-16 flex-shrink-0 text-left">
                            <span className="text-sm font-bold text-white leading-tight">{dayName}</span>
                            <span className="text-xs text-slate-400 font-medium">{dateNum} {month}</span>
                        </div>

                        {/* 2. Icon & Rain */}
                        <div className="flex flex-col items-center justify-center w-12 mx-2">
                            <div className="w-8 h-8 opacity-90 drop-shadow-md">
                                {getWeatherIcon(code)}
                            </div>
                            {rainProb > 0 && (
                                <span className="text-[10px] font-bold text-blue-200 mt-1 bg-blue-500/20 px-1.5 rounded-md">%{rainProb}</span>
                            )}
                        </div>

                        {/* 3. Temperature Range Bar (The Data Viz) */}
                        <div className="flex-1 mx-2 h-full flex flex-col justify-center">
                            <div className="relative h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                {/* Gradient Bar */}
                                <div 
                                    className="absolute h-full rounded-full bg-gradient-to-r from-teal-300 via-yellow-300 to-orange-400 opacity-80"
                                    style={{ 
                                        left: `${leftPos}%`, 
                                        width: `${Math.max(width, 10)}%`, // min width ensuring dots for equal temps
                                    }}
                                />
                            </div>
                            
                            {/* Labels below bar for better readability */}
                            <div className="relative w-full h-4 mt-1">
                                <span 
                                    className="absolute text-[10px] font-bold text-slate-400 transform -translate-x-1/2"
                                    style={{ left: `${leftPos}%` }}
                                >
                                    {min}°
                                </span>
                                <span 
                                    className="absolute text-[10px] font-bold text-white transform -translate-x-1/2" 
                                    style={{ left: `${leftPos + Math.max(width, 10)}%` }}
                                >
                                    {max}°
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>

        {renderDetailModal()}
    </div>
  );
};

export default DailyForecast;
