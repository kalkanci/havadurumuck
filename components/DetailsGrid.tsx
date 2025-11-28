import React from 'react';
import { WeatherData } from '../types';
import { Droplets, Wind, Sun, Gauge, Thermometer } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface DetailsGridProps {
  weather: WeatherData;
}

const DetailsGrid: React.FC<DetailsGridProps> = ({ weather }) => {
  const { current, daily } = weather;

  const items = [
    {
      label: 'UV İndeksi',
      value: daily.uv_index_max[0],
      unit: '',
      icon: <Sun size={24} className="text-orange-400" />
    },
    {
      label: 'Nem',
      value: current.relative_humidity_2m,
      unit: '%',
      icon: <Droplets size={24} className="text-blue-400" />
    },
    {
      label: 'Rüzgar',
      value: current.wind_speed_10m,
      unit: ' km/s',
      icon: <Wind size={24} className="text-teal-400" />
    },
    {
      label: 'Hissedilen',
      value: Math.round(current.apparent_temperature),
      unit: '°',
      icon: <Thermometer size={24} className="text-red-400" />
    },
    {
      label: 'Basınç',
      value: current.surface_pressure,
      unit: ' hPa',
      icon: <Gauge size={24} className="text-purple-400" />
    },
    {
      label: 'Gün Doğumu',
      value: formatTime(daily.sunrise[0]),
      unit: '',
      icon: <Sun size={24} className="text-yellow-400" />
    },
    {
      label: 'Gün Batımı',
      value: formatTime(daily.sunset[0]),
      unit: '',
      icon: <Sun size={24} className="text-indigo-400" />
    },
    {
      label: 'Yağış',
      value: current.precipitation,
      unit: ' mm',
      icon: <Droplets size={24} className="text-sky-300" />
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="glass-card p-4 rounded-2xl flex flex-col justify-between aspect-[4/3]">
          <div className="flex justify-between items-start">
            <div className="bg-white/10 p-2 rounded-full">
               {item.icon}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase">{item.label}</span>
            <div className="text-2xl font-bold text-white mt-1">
              {item.value}<span className="text-sm font-normal text-slate-300">{item.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailsGrid;
