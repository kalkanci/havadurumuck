import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Moon,
  CloudMoon
} from 'lucide-react';

export const WMO_CODES: Record<number, { label: string; icon: (isDay: boolean) => React.ReactNode }> = {
  0: { label: 'Açık', icon: (isDay) => isDay ? <Sun className="w-full h-full text-yellow-400" /> : <Moon className="w-full h-full text-slate-300" /> },
  1: { label: 'Çoğunlukla açık', icon: (isDay) => isDay ? <CloudSun className="w-full h-full text-yellow-300" /> : <CloudMoon className="w-full h-full text-slate-400" /> },
  2: { label: 'Parçalı bulutlu', icon: (isDay) => isDay ? <CloudSun className="w-full h-full text-gray-300" /> : <CloudMoon className="w-full h-full text-slate-400" /> },
  3: { label: 'Kapalı', icon: () => <Cloud className="w-full h-full text-gray-400" /> },
  45: { label: 'Sisli', icon: () => <CloudFog className="w-full h-full text-slate-400" /> },
  48: { label: 'Kırağılı sis', icon: () => <CloudFog className="w-full h-full text-slate-400" /> },
  51: { label: 'Hafif çisenti', icon: () => <CloudDrizzle className="w-full h-full text-blue-300" /> },
  53: { label: 'Orta çisenti', icon: () => <CloudDrizzle className="w-full h-full text-blue-400" /> },
  55: { label: 'Yoğun çisenti', icon: () => <CloudDrizzle className="w-full h-full text-blue-500" /> },
  61: { label: 'Hafif yağmurlu', icon: () => <CloudRain className="w-full h-full text-blue-400" /> },
  63: { label: 'Orta şiddette yağmur', icon: () => <CloudRain className="w-full h-full text-blue-500" /> },
  65: { label: 'Şiddetli yağmur', icon: () => <CloudRain className="w-full h-full text-blue-600" /> },
  71: { label: 'Hafif kar yağışlı', icon: () => <CloudSnow className="w-full h-full text-white" /> },
  73: { label: 'Orta kar yağışlı', icon: () => <CloudSnow className="w-full h-full text-white" /> },
  75: { label: 'Yoğun kar yağışlı', icon: () => <CloudSnow className="w-full h-full text-white" /> },
  80: { label: 'Hafif sağanak', icon: () => <CloudRain className="w-full h-full text-blue-300" /> },
  81: { label: 'Orta sağanak', icon: () => <CloudRain className="w-full h-full text-blue-500" /> },
  82: { label: 'Şiddetli sağanak', icon: () => <CloudRain className="w-full h-full text-blue-700" /> },
  95: { label: 'Fırtına', icon: () => <CloudLightning className="w-full h-full text-purple-400" /> },
  96: { label: 'Dolu karışık fırtına', icon: () => <CloudLightning className="w-full h-full text-purple-300" /> },
  99: { label: 'Şiddetli dolu fırtınası', icon: () => <CloudLightning className="w-full h-full text-purple-500" /> },
};

export const getWeatherIcon = (code: number, isDay: number = 1) => {
  const weather = WMO_CODES[code] || WMO_CODES[0];
  return weather.icon(isDay === 1);
};

export const getWeatherLabel = (code: number) => {
  return WMO_CODES[code]?.label || 'Bilinmiyor';
};
