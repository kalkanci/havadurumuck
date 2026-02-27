import React from 'react';
import { MapPin, ArrowUp, ArrowDown, Calendar, Share2 } from 'lucide-react';
import { WeatherData, WeatherAlert, PublicHoliday, GeoLocation } from '../types';
import WeatherAlerts from './WeatherAlerts';
import HolidayCard from './HolidayCard';
import AdviceCard from './AdviceCard';
import ForecastInsight from './ForecastInsight';
import HourlyForecast from './HourlyForecast';
import SpotifyCard from './SpotifyCard';
import GoldenHourCard from './GoldenHourCard';
import ActivityScore from './ActivityScore';
import AirQualityCard from './AirQualityCard';
import DetailsGrid from './DetailsGrid';
import { getWeatherLabel } from '../constants';
import { convertTemperature } from '../utils/helpers';

interface TodayViewProps {
  weather: WeatherData;
  location: GeoLocation;
  alerts: WeatherAlert[];
  upcomingHolidays: PublicHoliday[];
  distanceToStation: number;
  onOpenCalendar: () => void;
  onOpenFavorites: () => void;
  unit: 'celsius' | 'fahrenheit';
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TodayView: React.FC<TodayViewProps> = ({
  weather,
  location,
  alerts,
  upcomingHolidays,
  distanceToStation,
  onOpenCalendar,
  onOpenFavorites,
  unit,
  onShowToast
}) => {
  const todayStr = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const currentTemp = Math.round(convertTemperature(weather.current.temperature_2m, unit));
  const maxTemp = Math.round(convertTemperature(weather.daily.temperature_2m_max[0], unit));
  const minTemp = Math.round(convertTemperature(weather.daily.temperature_2m_min[0], unit));

  const handleShare = async () => {
    const shareText = `${location.name} için hava durumu: ${currentTemp}°C, ${getWeatherLabel(weather.current.weather_code)}. Detaylar: Havadurumuck!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hava Durumu',
          text: shareText,
          url: window.location.href,
        });
        onShowToast('Hava durumu paylaşıldı!', 'success');
        if (navigator.vibrate) navigator.vibrate(20);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          onShowToast('Paylaşım yapılamadı.', 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        onShowToast('Bağlantı kopyalandı!', 'success');
        if (navigator.vibrate) navigator.vibrate(20);
      } catch (error) {
        onShowToast('Kopyalama başarısız oldu.', 'error');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-10 mt-6 text-center relative z-10">

        {/* Top Controls: Date Pill and Share Button */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="w-10"></div> {/* Spacer to center the date pill */}

          <button
            onClick={onOpenCalendar}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-transform"
          >
            <Calendar size={12} className="text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">{todayStr}</span>
          </button>

          <button
            onClick={handleShare}
            aria-label="Paylaş"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-transform text-white"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Massive Temperature (The Hero) */}
        <div className="relative">
           {/* Glow effect behind */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

           <h1 className="text-[9rem] leading-[0.85] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 drop-shadow-2xl select-none">
              {currentTemp}<span className="text-[5rem] font-light text-zinc-300 align-top absolute top-2 ml-1">°</span>
           </h1>
        </div>

        {/* Condition & High/Low */}
        <div className="mt-4 flex flex-col items-center gap-1">
           <p className="text-xl font-medium text-blue-100 tracking-wide drop-shadow-lg flex items-center gap-2">
              {getWeatherLabel(weather.current.weather_code)}
           </p>
           <div className="flex items-center gap-4 text-base font-medium text-white/80 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/5 mt-2">
               <span className="flex items-center gap-1"><ArrowUp size={14} className="text-red-400" /> {maxTemp}°</span>
               <div className="w-px h-3 bg-white/20"></div>
               <span className="flex items-center gap-1"><ArrowDown size={14} className="text-blue-400" /> {minTemp}°</span>
           </div>
        </div>

        {/* Location Pill (New Design) */}
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button
               onClick={onOpenFavorites}
               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md border border-white/10 shadow-xl group"
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

      <div className="flex-1 flex flex-col gap-5">
        <WeatherAlerts alerts={alerts} />
        <HolidayCard holidays={upcomingHolidays} />
        <AdviceCard weather={weather} cityName={location.name} />
        <ForecastInsight weather={weather} />
        <HourlyForecast weather={weather} unit={unit} />

        <div className="grid grid-cols-1 gap-5">
          <SpotifyCard weather={weather} />
          <GoldenHourCard weather={weather} />
          <ActivityScore weather={weather} />
        </div>

        <AirQualityCard data={weather.air_quality} />
        <DetailsGrid weather={weather} unit={unit} />

        <div className="text-center pt-4 opacity-50">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">
            En Yakın İstasyon: {distanceToStation} km
          </p>
        </div>
      </div>
    </>
  );
};

export default TodayView;
