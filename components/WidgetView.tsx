
import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon, getWeatherLabel } from '../constants';
import { RefreshCw, MapPin } from 'lucide-react';
import { triggerHapticFeedback } from '../utils/helpers';

interface WidgetViewProps {
  weather: WeatherData | null;
  locationName: string;
  loading: boolean;
  onRefresh: () => void;
}

const WidgetView: React.FC<WidgetViewProps> = ({ weather, locationName, loading, onRefresh }) => {
  if (loading || !weather) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="animate-spin p-2 bg-zinc-800 rounded-full">
           <RefreshCw size={24} className="text-blue-400" />
        </div>
      </div>
    );
  }

  const { current, daily } = weather;
  const tempUnit = '°';

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-white text-center">
       {/* Widget Container */}
       <div className="w-full max-w-xs glass-card p-6 rounded-[2rem] shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden">
           
           {/* Background decorative glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

           <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full">
              <MapPin size={14} className="text-blue-400" />
              <span className="text-sm font-bold tracking-wide">{locationName}</span>
           </div>

           <div className="scale-[2.5] my-6 drop-shadow-2xl">
               {getWeatherIcon(current.weather_code, current.is_day)}
           </div>

           <h1 className="text-6xl font-bold tracking-tighter mt-4">{Math.round(current.temperature_2m)}{tempUnit}</h1>
           <p className="text-lg text-blue-200 font-medium mb-4">{getWeatherLabel(current.weather_code)}</p>

           <div className="flex items-center gap-6 text-sm font-semibold text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-xl">
               <span>H: {Math.round(daily.temperature_2m_max[0])}{tempUnit}</span>
               <div className="w-[1px] h-4 bg-white/10"></div>
               <span>L: {Math.round(daily.temperature_2m_min[0])}{tempUnit}</span>
           </div>

           <button 
             onClick={() => {
                 triggerHapticFeedback(50);
                 onRefresh();
             }}
             className="absolute bottom-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
           >
              <RefreshCw size={16} />
           </button>
       </div>
    </div>
  );
};

export default WidgetView;
