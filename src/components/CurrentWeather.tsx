import React from 'react';
import { ArrowUp, ArrowDown, MapPin, Calendar } from 'lucide-react';
import { WeatherData, GeoLocation } from '../types';
import { getWeatherLabel } from '../constants';

interface CurrentWeatherProps {
  weather: WeatherData;
  location: GeoLocation;
  todayStr: string;
  onCalendarClick: () => void;
  onLocationClick: () => void;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  location,
  todayStr,
  onCalendarClick,
  onLocationClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center mb-10 mt-6 text-center relative z-10">

      {/* Date Pill (Top - Clickable) */}
      <button
        onClick={onCalendarClick}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mb-6 active:scale-95 transition-transform cursor-pointer"
      >
        <Calendar size={12} className="text-blue-400" />
        <span className="text-xs font-bold text-white tracking-wide uppercase">{todayStr}</span>
      </button>

      {/* Massive Temperature (The Hero) */}
      <div className="relative">
         {/* Glow effect behind */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

         <h1 className="text-[9rem] leading-[0.85] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 drop-shadow-2xl select-none">
            {Math.round(weather.current.temperature_2m)}<span className="text-[5rem] font-light text-zinc-300 align-top absolute top-2 ml-1">°</span>
         </h1>
      </div>

      {/* Condition & High/Low */}
      <div className="mt-4 flex flex-col items-center gap-1">
         <p className="text-xl font-medium text-blue-100 tracking-wide drop-shadow-lg flex items-center gap-2">
            {getWeatherLabel(weather.current.weather_code)}
         </p>
         <div className="flex items-center gap-4 text-base font-medium text-white/80 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/5 mt-2">
             <span className="flex items-center gap-1"><ArrowUp size={14} className="text-red-400" /> {Math.round(weather.daily.temperature_2m_max[0])}°</span>
             <div className="w-px h-3 bg-white/20"></div>
             <span className="flex items-center gap-1"><ArrowDown size={14} className="text-blue-400" /> {Math.round(weather.daily.temperature_2m_min[0])}°</span>
         </div>
      </div>

      {/* Location Pill (New Design) */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
             onClick={onLocationClick}
             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md border border-white/10 shadow-xl group cursor-pointer"
          >
             <MapPin size={16} className="text-red-400 group-hover:animate-bounce" />
             <span className="text-base font-medium text-white tracking-wide shadow-sm">
                 {location.name}
                 {location.admin1 && location.name !== location.admin1 && (
                     <span className="opacity-80 font-normal">, {location.admin1}</span>
                 )}
             </span>
          </button>
      </div>
    </div>
  );
};

export default CurrentWeather;
