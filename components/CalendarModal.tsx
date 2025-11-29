
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../constants';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, weather }) => {
  const [isClosing, setIsClosing] = useState(false);
  const daily = weather.daily;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />
      
      <div className={`relative w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
           <div className="flex items-center gap-3">
               <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
                   <CalendarIcon size={20} className="text-white" />
               </div>
               <div>
                   <h2 className="text-lg font-bold text-white leading-tight">Takvim</h2>
                   <p className="text-xs text-slate-400">15 Günlük Plan</p>
               </div>
           </div>
           <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 hover:bg-white/10">
               <X size={20} />
           </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3 pb-4">
             {daily.time.map((time, index) => {
                 const date = new Date(time);
                 const isToday = index === 0;
                 const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
                 const dayNum = date.getDate();
                 const max = Math.round(daily.temperature_2m_max[index]);
                 const min = Math.round(daily.temperature_2m_min[index]);
                 const code = daily.weather_code[index];
                 
                 return (
                     <div 
                        key={time}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center border transition-colors ${isToday ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5'}`}
                     >
                         <div className="w-full flex justify-between items-start mb-2">
                             <div className="flex flex-col items-start">
                                 <span className={`text-xs font-bold uppercase ${isToday ? 'text-blue-300' : 'text-slate-400'}`}>{dayName}</span>
                                 <span className="text-xl font-black text-white">{dayNum}</span>
                             </div>
                             <div className="w-8 h-8">
                                 {getWeatherIcon(code, 1)}
                             </div>
                         </div>
                         
                         <div className="w-full flex items-center justify-between bg-black/20 rounded-lg px-2 py-1.5 mt-1">
                             <span className="flex items-center gap-1 text-xs font-bold text-slate-300">
                                 <ArrowDown size={10} className="text-blue-400" /> {min}°
                             </span>
                             <span className="flex items-center gap-1 text-xs font-bold text-white">
                                 <ArrowUp size={10} className="text-red-400" /> {max}°
                             </span>
                         </div>
                     </div>
                 );
             })}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default CalendarModal;
