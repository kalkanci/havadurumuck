
import React from 'react';
import { WeatherData } from '../types';
import { CloudRain, Sun, Moon, Sunrise, Sunset, CloudLightning, Umbrella } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface ForecastInsightProps {
  weather: WeatherData;
}

const ForecastInsight: React.FC<ForecastInsightProps> = ({ weather }) => {
  const current = weather.current;
  const hourly = weather.hourly;
  
  // Helper to determine weather condition from code
  const isRaining = (code: number) => [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const isClear = (code: number) => [0, 1].includes(code);

  const getInsight = () => {
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
    
    if (currentHourIndex === -1) return null;

    // --- SENARYO 1: Şu an yağmur yağıyor, ne zaman duracak? ---
    if (isRaining(current.weather_code)) {
      for (let i = currentHourIndex + 1; i < currentHourIndex + 12; i++) {
        if (hourly.weather_code[i] !== undefined && !isRaining(hourly.weather_code[i])) {
          return {
            icon: <CloudRain size={20} className="text-blue-500 dark:text-blue-300" />,
            primary: `Yağışın saat ${formatTime(hourly.time[i])} civarında durması bekleniyor.`,
            secondary: "Sonrasında hava parçalı bulutlu olabilir."
          };
        }
      }
      return {
        icon: <Umbrella size={20} className="text-blue-500 dark:text-blue-300" />,
        primary: "Yağış önümüzdeki saatlerde devam edecek.",
        secondary: "Şemsiyenizi yanınızdan ayırmayın."
      };
    }

    // --- SENARYO 2: Şu an yağmıyor, ne zaman başlayacak? (İlk 12 saat) ---
    for (let i = currentHourIndex + 1; i < currentHourIndex + 12; i++) {
      if (hourly.weather_code[i] !== undefined && isRaining(hourly.weather_code[i])) {
         // Eğer fırtına ise
         if ([95, 96, 99].includes(hourly.weather_code[i])) {
            return {
                icon: <CloudLightning size={20} className="text-purple-500 dark:text-purple-300 animate-pulse" />,
                primary: `Saat ${formatTime(hourly.time[i])} itibarıyla fırtına bekleniyor.`,
                secondary: "Dışarıdaki planlarınıza dikkat edin."
            };
         }
         return {
            icon: <Umbrella size={20} className="text-blue-500 dark:text-blue-300" />,
            primary: `Saat ${formatTime(hourly.time[i])} civarında yağmur başlayabilir.`,
            secondary: `Yağış ihtimali %${hourly.precipitation_probability[i]}.`
         };
      }
    }

    // --- SENARYO 3: Gün Doğumu / Batımı ---
    // Eğer yağış yoksa güneş durumuna bak.
    
    // Güneşin batmasına yakın mı? (Şu an gündüz ve güneş batmamışsa)
    const sunsetTime = new Date(weather.daily.sunset[0]);
    const sunriseTimeNextDay = new Date(weather.daily.sunrise[1]); // Yarının doğumu
    
    if (current.is_day === 1) {
        // Gündüz, gün batımına ne kadar var?
        const diffHours = (sunsetTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 0 && diffHours < 5) {
            return {
                icon: <Sunset size={20} className="text-orange-500 dark:text-orange-300" />,
                primary: `Güneş saat ${formatTime(weather.daily.sunset[0])}'te batacak.`,
                secondary: "Gün ışığından faydalanmak için son saatler."
            };
        } else {
             // Havanın açması durumu (Bulutlu -> Güneşli)
             if (!isClear(current.weather_code)) {
                 for (let i = currentHourIndex + 1; i < currentHourIndex + 6; i++) {
                     if (hourly.weather_code[i] !== undefined && isClear(hourly.weather_code[i])) {
                         return {
                             icon: <Sun size={20} className="text-yellow-500 dark:text-yellow-300" />,
                             primary: `Saat ${formatTime(hourly.time[i])}'te gökyüzünün açması bekleniyor.`,
                             secondary: "Güneşli bir hava sizi bekliyor."
                         };
                     }
                 }
             }
             return {
                 icon: <Sun size={20} className="text-yellow-500 dark:text-yellow-300" />,
                 primary: "Önümüzdeki saatlerde yağış beklenmiyor.",
                 secondary: `Gün batımı: ${formatTime(weather.daily.sunset[0])}`
             };
        }
    } else {
        // Gece, gün doğumuna ne kadar var?
        return {
            icon: <Sunrise size={20} className="text-yellow-500 dark:text-yellow-300" />,
            primary: `Güneş yarın sabah ${formatTime(weather.daily.sunrise[0])}'te doğacak.`,
            secondary: "Aydınlık bir sabaha uyanacaksınız."
        };
    }
  };

  const insight = getInsight();

  if (!insight) return null;

  return (
    <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 mb-5 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full shrink-0">
            {insight.icon}
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {insight.primary}
            </span>
            {insight.secondary && (
                <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 font-medium">
                    {insight.secondary}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForecastInsight;
