import React from 'react';
import { Car, Footprints, Tent, Star } from 'lucide-react';
import { WeatherData } from '../types';

interface ActivityScoreProps {
  weather: WeatherData;
}

const ActivityScore: React.FC<ActivityScoreProps> = ({ weather }) => {
  const current = weather.current;
  const today = weather.daily;

  // Simple logic to calculate scores (0-10)
  
  // Running: Best: 10-20C, No Rain, Low Wind.
  let runningScore = 10;
  if (current.temperature_2m > 25 || current.temperature_2m < 5) runningScore -= 3;
  if (current.precipitation > 0) runningScore -= 4;
  if (current.wind_speed_10m > 20) runningScore -= 2;
  
  // Car Wash: Best: No rain today AND tomorrow.
  let carWashScore = 10;
  if (today.precipitation_probability_max[0] > 30) carWashScore -= 5;
  if (today.precipitation_probability_max[1] > 30) carWashScore -= 4;

  // Camping/Stargazing: Best: Clear sky, low wind.
  let campingScore = 10;
  if (current.cloud_cover > 30) campingScore -= 3;
  if (current.cloud_cover > 70) campingScore -= 3; // Heavy clouds bad
  if (current.temperature_2m < 5) campingScore -= 2;
  if (current.precipitation > 0) campingScore = 1;

  const activities = [
    { label: "Koşu", score: Math.max(1, runningScore), icon: <Footprints size={18} className="text-emerald-400" /> },
    { label: "Araba Yıkama", score: Math.max(1, carWashScore), icon: <Car size={18} className="text-blue-400" /> },
    { label: "Kamp / Yıldız", score: Math.max(1, campingScore), icon: <Tent size={18} className="text-orange-400" /> },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Aktivite Durumu</h3>
      <div className="grid grid-cols-3 gap-3">
        {activities.map((act, idx) => (
            <div key={idx} className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-white/5 rounded-full">
                    {act.icon}
                </div>
                <span className="text-[10px] text-slate-300 font-bold uppercase mb-1">{act.label}</span>
                
                {/* Score Bar */}
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-1">
                    <div 
                        className={`h-full rounded-full ${act.score >= 8 ? 'bg-green-500' : act.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${act.score * 10}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-white mt-1">{act.score}/10</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityScore;