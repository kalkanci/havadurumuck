
import React, { useState } from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { X, Droplets, Wind, Sun, Calendar, ArrowUp, ArrowDown, Sunrise, Sunset, Navigation, Clock, ThermometerSun, Umbrella } from 'lucide-react';
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

  const openModal = (index: number) => setSelectedDay(index);
  const closeModal = () => setSelectedDay(null);

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

      {/* Expanded Detail Modal */}
      {selectedDay !== null && dayData && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" 
            onClick={closeModal} 
          />
          
          <div className="relative w-full max-w-md m-0 sm:m-4 h-[90vh] sm:h-auto overflow-y-auto sm:overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-white/10 shadow-2xl animate-slideUp sm:animate-zoomIn flex flex-col bg-slate-900/90 no-scrollbar">
            
            {/* Modal Header Decoration */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {selectedDay === 0 ? 'Bugün' : dayData.date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                  </h2>
                  <p className="text-blue-200/60 font-medium text-xs uppercase tracking-wide">
                    {dayData.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
               <button 
                  onClick={closeModal} 
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-slate-200 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
            </div>
            
            <div className="p-5 pb-10 space-y-4">
              
              {/* Main Status Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-6 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-2 drop-shadow-2xl">
                        {getWeatherIcon(dayData.code)}
                    </div>
                    <div className="text-xl font-medium text-blue-100 mb-4">{getWeatherLabel(dayData.code)}</div>
                    
                    <div className="flex items-center justify-center gap-8 w-full">
                         <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white">{Math.round(dayData.maxTemp)}°</span>
                            <span className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Gündüz</span>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-light text-slate-300">{Math.round(dayData.minTemp)}°</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Gece</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Feels Like */}
                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <ThermometerSun size={18} className="text-red-300" />
                        <span className="text-[10px] font-bold uppercase">Hissedilen</span>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-300">Max</span>
                            <span className="text-lg font-bold text-white">{Math.round(dayData.maxFeels)}°</span>
                        </div>
                        <div className="w-full h-[1px] bg-white/10 my-1"></div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-300">Min</span>
                            <span className="text-lg font-light text-slate-300">{Math.round(dayData.minFeels)}°</span>
                        </div>
                    </div>
                </div>

                {/* UV & Sun Duration */}
                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                     <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Sun size={18} className="text-orange-400" />
                        <span className="text-[10px] font-bold uppercase">Güneş</span>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-300">UV İndeksi</span>
                            <span className={`text-sm font-bold ${dayData.uv > 7 ? 'text-red-400' : dayData.uv > 5 ? 'text-orange-400' : 'text-green-400'}`}>
                                {dayData.uv.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 bg-white/5 p-1.5 rounded-lg">
                            <Clock size={12} className="text-yellow-200" />
                            <span className="text-xs text-white">{getDayDuration(dayData.sunrise, dayData.sunset)}</span>
                        </div>
                    </div>
                </div>

                {/* Wind & Gusts */}
                <div className="col-span-2 glass-card p-4 rounded-2xl flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-3">
                            <Wind size={18} className="text-teal-400" />
                            <span className="text-[10px] font-bold uppercase">Rüzgar Analizi</span>
                        </div>
                        <div className="flex gap-6">
                            <div>
                                <p className="text-2xl font-bold text-white">{Math.round(dayData.wind)} <span className="text-sm font-normal text-slate-400">km/s</span></p>
                                <p className="text-[10px] text-slate-400 uppercase">Ortalama</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-teal-200">{Math.round(dayData.gusts)} <span className="text-sm font-normal text-slate-400">km/s</span></p>
                                <p className="text-[10px] text-slate-400 uppercase">Hamleler</p>
                            </div>
                        </div>
                    </div>
                    {/* Compass Visualization */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-slate-600/30 bg-slate-800/50">
                         <Navigation 
                            size={24} 
                            className="text-teal-400 transition-transform duration-1000" 
                            style={{ transform: `rotate(${dayData.windDir}deg)` }} 
                         />
                         <span className="text-[10px] font-bold text-slate-300 mt-1">{getWindDirection(dayData.windDir)}</span>
                    </div>
                </div>

                {/* Precipitation Detailed */}
                <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-200/70 mb-3">
                        <Umbrella size={18} />
                        <span className="text-[10px] font-bold uppercase">Yağış Detayları</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-blue-500/20">
                        <div>
                            <p className="text-lg font-bold text-blue-100">%{dayData.rainProb}</p>
                            <p className="text-[10px] text-blue-300">İhtimal</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-100">{dayData.rainSum} <span className="text-xs">mm</span></p>
                            <p className="text-[10px] text-blue-300">Miktar</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-100">{dayData.rainHours} <span className="text-xs">sa</span></p>
                            <p className="text-[10px] text-blue-300">Süre</p>
                        </div>
                    </div>
                </div>

                {/* Sun Cycle Graphic */}
                <div className="col-span-2 glass-card p-5 rounded-2xl">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-2">
                        <div className="flex items-center gap-1"><Sunrise size={14} className="text-yellow-400"/> Gün Doğumu</div>
                        <div className="flex items-center gap-1">Gün Batımı <Sunset size={14} className="text-purple-400"/></div>
                    </div>
                    <div className="relative h-12 w-full mt-2">
                        {/* Horizon Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-600"></div>
                        {/* Arc */}
                        <div className="absolute bottom-0 left-4 right-4 h-10 border-t-2 border-r-2 border-l-2 border-slate-700/50 rounded-t-full"></div>
                        {/* Sun Position (Visual only - placed center for daily view) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>
                    </div>
                     <div className="flex justify-between items-center text-sm font-bold text-white mt-1 px-1">
                        <span>{formatTime(dayData.sunrise)}</span>
                        <span>{formatTime(dayData.sunset)}</span>
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
