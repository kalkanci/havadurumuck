import React, { useState } from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { X, Droplets, Wind, Sun, Calendar } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface DailyForecastProps {
  weather: WeatherData;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather }) => {
  const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max, wind_speed_10m_max, sunrise, sunset, uv_index_max } = weather.daily;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const openModal = (index: number) => setSelectedDay(index);
  const closeModal = () => setSelectedDay(null);

  // Modal içeriği için seçili günün verileri
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
                <span className={`w-24 font-medium ${isWeekend ? 'text-blue-300' : 'text-slate-200'}`}>{dayName}</span>
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

      {/* Detail Modal */}
      {selectedDay !== null && dayData && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          
          <div className="relative bg-[#0f172a] sm:rounded-3xl rounded-t-3xl border-t border-slate-700 w-full max-w-sm p-6 overflow-hidden animate-slideUp sm:animate-zoomIn">
             {/* Decorative Background Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/30 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedDay === 0 ? 'Bugün' : dayData.date.toLocaleDateString('tr-TR', { weekday: 'long' })}
                </h2>
                <p className="text-slate-400 text-sm">
                  {dayData.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-24 h-24 mb-2 filter drop-shadow-2xl">
                {getWeatherIcon(dayData.code)}
              </div>
              <p className="text-xl font-medium text-blue-200">{getWeatherLabel(dayData.code)}</p>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-5xl font-thin tracking-tighter">{Math.round(dayData.maxTemp)}°</span>
                <span className="text-xl text-slate-500">/ {Math.round(dayData.minTemp)}°</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-700/50">
                <Droplets className="text-blue-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Yağış İhtimali</p>
                  <p className="text-lg font-bold">%{dayData.rainProb}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-700/50">
                <Wind className="text-teal-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Maks. Rüzgar</p>
                  <p className="text-lg font-bold">{Math.round(dayData.wind)} <span className="text-xs font-normal">km/s</span></p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center space-x-3 border border-slate-700/50">
                <Sun className="text-orange-400" size={24} />
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">UV İndeksi</p>
                  <p className="text-lg font-bold">{dayData.uv.toFixed(1)}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col justify-center border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500 font-bold">GÜN DOĞUMU</span>
                  <span className="text-sm font-medium">{formatTime(dayData.sunrise)}</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-1">
                   <div className="w-1/2 h-full bg-gradient-to-r from-yellow-500 to-indigo-500"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold">GÜN BATIMI</span>
                  <span className="text-sm font-medium">{formatTime(dayData.sunset)}</span>
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