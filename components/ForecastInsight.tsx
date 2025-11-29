
import React, { useState, useEffect, useRef } from 'react';
import { WeatherData } from '../types';
import { 
    CloudRain, Sun, Moon, Sunrise, Sunset, CloudLightning, 
    Umbrella, Timer, TrendingUp, TrendingDown, Minus, Wind 
} from 'lucide-react';
import { formatTime, formatCountdown } from '../utils/helpers';

interface ForecastInsightProps {
  weather: WeatherData;
}

interface EventTarget {
  targetDate: Date;
  label: string;
  icon: React.ReactNode;
  secondaryMessage?: string;
  colorClass: string;
}

const ForecastInsight: React.FC<ForecastInsightProps> = ({ weather }) => {
  const current = weather.current;
  const hourly = weather.hourly;
  
  const [targetEvent, setTargetEvent] = useState<EventTarget | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Helper to determine weather condition from code
  const isRaining = (code: number) => [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);

  // Force scroll to start at the beginning (left) when component mounts or data changes
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
        setActiveSlide(0);
    }
  }, [targetEvent, weather]);

  // --- 1. EVENT DETECTION LOGIC ---
  useEffect(() => {
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
    
    if (currentHourIndex === -1) {
        setTargetEvent(null);
        return;
    }

    let foundEvent: EventTarget | null = null;

    // A. YAĞIŞ DURUMU
    if (isRaining(current.weather_code)) {
      // Yağmur ne zaman duracak?
      for (let i = currentHourIndex + 1; i < currentHourIndex + 12; i++) {
        if (hourly.weather_code[i] !== undefined && !isRaining(hourly.weather_code[i])) {
          foundEvent = {
            targetDate: new Date(hourly.time[i]),
            label: 'Yağış Bitişi',
            icon: <Sun size={20} className="text-yellow-400" />,
            secondaryMessage: "Hava açacak.",
            colorClass: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          };
          break;
        }
      }
      if (!foundEvent) {
         foundEvent = {
            targetDate: new Date(now.getTime() + 3 * 60 * 60 * 1000), 
            label: 'Yağış Devam Ediyor',
            icon: <Umbrella size={20} className="text-blue-400" />,
            secondaryMessage: "Şemsiyenizi unutmayın.",
            colorClass: "from-blue-600/20 to-indigo-600/20 border-blue-500/30"
         };
      }
    }
    else {
        // Yağmur ne zaman başlayacak?
        for (let i = currentHourIndex + 1; i < currentHourIndex + 12; i++) {
            if (hourly.weather_code[i] !== undefined && isRaining(hourly.weather_code[i])) {
                 const isStorm = [95, 96, 99].includes(hourly.weather_code[i]);
                 foundEvent = {
                    targetDate: new Date(hourly.time[i]),
                    label: isStorm ? 'Fırtına Başlangıcı' : 'Yağmur Başlangıcı',
                    icon: isStorm 
                        ? <CloudLightning size={20} className="text-purple-400 animate-pulse" /> 
                        : <Umbrella size={20} className="text-blue-400" />,
                    secondaryMessage: `İhtimal: %${hourly.precipitation_probability[i]}`,
                    colorClass: isStorm ? "from-purple-500/20 to-indigo-500/20 border-purple-500/30" : "from-blue-500/20 to-sky-500/20 border-blue-500/30"
                 };
                 break;
            }
        }
    }

    // B. GÜNEŞ DURUMU (Önemli bir hava olayı yoksa)
    if (!foundEvent) {
        const sunsetTime = new Date(weather.daily.sunset[0]);
        const sunriseTimeNextDay = new Date(weather.daily.sunrise[1]);
        const sunriseTimeToday = new Date(weather.daily.sunrise[0]);

        if (current.is_day === 1) {
             if (now > sunsetTime) {
                 foundEvent = {
                    targetDate: sunriseTimeNextDay,
                    label: 'Yarın Gün Doğumu',
                    icon: <Sunrise size={20} className="text-yellow-400" />,
                    colorClass: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30"
                 };
             } else {
                 foundEvent = {
                    targetDate: sunsetTime,
                    label: 'Gün Batımı',
                    icon: <Sunset size={20} className="text-orange-400" />,
                    secondaryMessage: "Golden Hour yaklaşıyor.",
                    colorClass: "from-orange-500/20 to-red-500/20 border-orange-500/30"
                 };
             }
        } else {
             const targetSunrise = now < sunriseTimeToday ? sunriseTimeToday : sunriseTimeNextDay;
             foundEvent = {
                targetDate: targetSunrise,
                label: 'Gün Doğumu',
                icon: <Sunrise size={20} className="text-yellow-400" />,
                secondaryMessage: "Aydınlık bir sabah.",
                colorClass: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
             };
        }
    }

    setTargetEvent(foundEvent);
  }, [weather]);

  // --- 2. COUNTDOWN TIMER ---
  useEffect(() => {
    if (!targetEvent) return;
    const timer = setInterval(() => {
        const now = new Date();
        const diff = targetEvent.targetDate.getTime() - now.getTime();
        setTimeLeft(diff <= 0 ? "ŞİMDİ" : formatCountdown(diff));
    }, 1000);
    
    // Init call
    const now = new Date();
    const diff = targetEvent.targetDate.getTime() - now.getTime();
    setTimeLeft(diff <= 0 ? "ŞİMDİ" : formatCountdown(diff));

    return () => clearInterval(timer);
  }, [targetEvent]);

  // --- 3. SCROLL HANDLER ---
  const handleScroll = () => {
      if (scrollRef.current) {
          const scrollLeft = scrollRef.current.scrollLeft;
          const width = scrollRef.current.offsetWidth;
          const index = Math.round(scrollLeft / width);
          setActiveSlide(index);
      }
  };

  // --- 4. SHORT SUMMARY ANALYSIS (Next 4 Hours) ---
  const getSummaryAnalysis = () => {
      const now = new Date();
      const startIndex = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
      if (startIndex === -1) return null;

      const next4Hours = hourly.temperature_2m.slice(startIndex, startIndex + 4);
      const startTemp = next4Hours[0];
      const endTemp = next4Hours[next4Hours.length - 1];
      const diff = endTemp - startTemp;
      
      const nextRainProbs = hourly.precipitation_probability.slice(startIndex, startIndex + 4);
      const maxRain = Math.max(...nextRainProbs);
      const nextWinds = hourly.wind_speed_10m.slice(startIndex, startIndex + 4);
      const maxWind = Math.max(...nextWinds);

      let trendIcon = <Minus size={18} className="text-slate-400" />;
      let trendText = "Sıcaklık sabit";
      
      if (diff > 1.5) {
          trendIcon = <TrendingUp size={18} className="text-orange-400" />;
          trendText = `Isınıyor (+${Math.round(diff)}°)`;
      } else if (diff < -1.5) {
          trendIcon = <TrendingDown size={18} className="text-blue-400" />;
          trendText = `Soğuyor (${Math.round(diff)}°)`;
      }

      let conditionText = "Hava sakin.";
      if (maxRain > 40) conditionText = "Yağmur ihtimali var.";
      if (maxWind > 25) conditionText = "Rüzgar sertleşiyor.";

      return {
          trendIcon,
          trendText,
          conditionText,
          maxWind,
          maxRain
      };
  };

  const summary = getSummaryAnalysis();

  return (
    <div className="w-full mb-5 animate-fade-in-up">
        {/* Scroll Container */}
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 pb-2"
        >
            {/* CARD 1: COUNTDOWN (Only if event exists) - This is naturally the LEFT card in flex container */}
            {targetEvent && (
                <div className="snap-center min-w-full">
                    <div className={`glass-card p-4 rounded-2xl flex items-center justify-between gap-4 h-full bg-gradient-to-br ${targetEvent.colorClass} transition-transform duration-200 active:scale-95`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-100/10 dark:bg-white/10 rounded-full shrink-0 shadow-inner backdrop-blur-md">
                                {targetEvent.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-0.5 opacity-80">
                                    {targetEvent.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-white font-mono tracking-tight leading-none tabular-nums drop-shadow-sm">
                                    {timeLeft}
                                    </span>
                                </div>
                                {targetEvent.secondaryMessage && (
                                    <span className="text-[10px] text-slate-200 mt-1 font-medium opacity-90">{targetEvent.secondaryMessage}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end justify-center border-l border-white/10 pl-4 h-full">
                            <div className="flex items-center gap-1 text-slate-300 mb-1 opacity-80">
                                <Timer size={12} />
                                <span className="text-[10px] font-bold uppercase">Hedef</span>
                            </div>
                            <span className="text-lg font-bold text-white drop-shadow-sm">
                                {formatTime(targetEvent.targetDate.toISOString())}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* CARD 2: 4-HOUR SUMMARY - This is naturally the RIGHT card */}
            {summary && (
                <div className="snap-center min-w-full">
                     <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-2 h-full bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-white/10 transition-transform duration-200 active:scale-95">
                        <div className="flex flex-col gap-1">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                 Önümüzdeki 4 Saat
                             </span>
                             <p className="text-sm font-bold text-white leading-tight mt-1 pr-2">
                                 {summary.conditionText}
                             </p>
                             <div className="flex items-center gap-2 mt-2">
                                 <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                     {summary.trendIcon}
                                     <span className="text-xs text-slate-200 font-medium">{summary.trendText}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 pl-4 border-l border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-bold">Rüzgar</span>
                                <div className="flex items-center gap-1">
                                    <Wind size={14} className="text-teal-400" />
                                    <span className="text-sm font-bold text-white">{Math.round(summary.maxWind)}</span>
                                </div>
                            </div>
                            {summary.maxRain > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-bold">Yağış</span>
                                    <div className="flex items-center gap-1">
                                        <CloudRain size={14} className="text-blue-400" />
                                        <span className="text-sm font-bold text-white">%{summary.maxRain}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                </div>
            )}
        </div>

        {/* Pagination Dots */}
        {targetEvent && summary && (
            <div className="flex justify-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'bg-white w-3' : 'bg-white/30'}`} />
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'bg-white w-3' : 'bg-white/30'}`} />
            </div>
        )}
    </div>
  );
};

export default ForecastInsight;
