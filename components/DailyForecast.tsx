import React, { useState } from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { X, Droplets, Wind, Sun, Calendar, ArrowUp, ArrowDown, Sunrise, Sunset } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface DailyForecastProps {
  weather: WeatherData;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather }) => {
  const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max, wind_speed_10m_max, sunrise, sunset, uv_index_max } = weather.daily;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const openModal = (index: number) => setSelectedDay(index);
  const closeModal = () => setSelectedDay(null);

  const dayData = selectedDay !== null ? {
    date: new Date(time[selectedDay]),
    code: weather_code[selectedDay],
    maxTemp: temperature_2m_max[selectedDay],
    minTemp: temperature_2m_min[selectedDay],
    rainProb: precipitation_probability_max ? precipitation_probability_max[selectedDay] : 0,
    wind: wind_speed_10m_max ? wind_speed_10m_max[selectedDay] : 0,
    uv: uv_index_max[selectedDay],
    sunrise: sunrise[selectedDay],
    sunset: sunset[selectedDay]
  } : null;

  return (
    <>
      <div className="w-full glass-card rounded-3xl p-5 mb-6">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={14} />
          7 Günlük Tahmin
          <span className="text-[10px] normal-case ml-auto opacity-50 font-normal">Detaylar için güne tıkla</span>
        </h3>
        
        <div className="flex flex-col space-y-4">
          {time.map((dateStr, index) => {
            const date = new Date(dateStr);
            const dayName = index === 0 ? 'Bugün' : date.toLocaleDateString('tr-TR', { weekday: 'long' });
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div 
                key={dateStr} 
                onClick={() => openModal(index)}
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

      {/* Beautified Detail Modal */}
      {selectedDay !== null && dayData && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={closeModal} 
          />
          
          <div className="relative w-full max-w-sm m-4 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl animate-slideUp sm:animate-zoomIn group">
            
            {/* Modal Background Gradient */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-0" />
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none z-0" />
            
            {/* Modal Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    {selectedDay === 0 ? 'Bugün' : dayData.date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                  </h2>
                  <p className="text-blue-200/60 font-medium text-sm mt-1">
                    {dayData.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button 
                    onClick={closeModal} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Central Weather Info */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-32 h-32 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] mb-2 transition-transform duration-500 hover:scale-105">
                  {getWeatherIcon(dayData.code)}
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium text-blue-100 mb-1">{getWeatherLabel(dayData.code)}</p>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white tracking-tighter">{Math.round(dayData.maxTemp)}°</span>
                            <span className="text-xs text-red-300 flex items-center mt-1"><ArrowUp size={10} className="mr-0.5" /> En Yüksek</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-light text-slate-300 tracking-tighter">{Math.round(dayData.minTemp)}°</span>
                            <span className="text-xs text-blue-300 flex items-center mt-1"><ArrowDown size={10} className="mr-0.5" /> En Düşük</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Rain */}
                <div className="bg-blue-500/10 border border-blue-500/10 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200/70 font-bold uppercase">Yağış</p>
                    <p className="text-lg font-bold text-blue-100">%{dayData.rainProb}</p>
                  </div>
                </div>

                {/* Wind */}
                <div className="bg-teal-500/10 border border-teal-500/10 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-teal-500/20 rounded-full text-teal-400">
                    <Wind size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-200/70 font-bold uppercase">Rüzgar</p>
                    <p className="text-lg font-bold text-teal-100">{Math.round(dayData.wind)} <span className="text-xs">km/s</span></p>
                  </div>
                </div>

                {/* UV */}
                <div className="bg-orange-500/10 border border-orange-500/10 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-full text-orange-400">
                    <Sun size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-orange-200/70 font-bold uppercase">UV İndeksi</p>
                    <p className="text-lg font-bold text-orange-100">{dayData.uv.toFixed(1)}</p>
                  </div>
                </div>

                {/* Sun Times (Merged) */}
                <div className="bg-purple-500/10 border border-purple-500/10 p-3 rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                            <Sunrise size={12} className="text-yellow-400" />
                            <span className="text-xs font-semibold text-purple-100">{formatTime(dayData.sunrise)}</span>
                        </div>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full my-1 overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-yellow-400 to-purple-400"></div>
                    </div>
                     <div className="flex justify-between items-center mt-0.5">
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-xs font-semibold text-purple-200">{formatTime(dayData.sunset)}</span>
                            <Sunset size={12} className="text-purple-400" />
                        </div>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyForecast;