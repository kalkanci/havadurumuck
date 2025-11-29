
import React from 'react';
import { Car, Footprints, Shovel, ThermometerSun, Bike as MotorBike, Utensils } from 'lucide-react';
import { WeatherData } from '../types';

interface ActivityScoreProps {
  weather: WeatherData;
}

const ActivityScore: React.FC<ActivityScoreProps> = ({ weather }) => {
  const current = weather.current;
  const today = weather.daily;

  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const rain = current.precipitation;
  const rainProb = today.precipitation_probability_max[0];
  const humidity = current.relative_humidity_2m;

  // Helper to clamp score
  const clamp = (val: number) => Math.max(1, Math.min(10, val));

  // 1. Koşu (Running)
  let runningScore = 10;
  if (temp > 25 || temp < 5) runningScore -= 3;
  if (rain > 0) runningScore -= 4;
  if (wind > 20) runningScore -= 2;

  // 2. Araba Yıkama (Car Wash)
  let carWashScore = 10;
  if (rainProb > 30) carWashScore -= 5;
  if (today.precipitation_probability_max[1] > 30) carWashScore -= 4;

  // 3. Termal Konfor (Thermal Comfort - Üşüme/Terleme Dengesi)
  // İdeal: 20-24 derece, düşük nem, düşük rüzgar.
  let comfortScore = 10;
  const idealTemp = 22;
  const diff = Math.abs(temp - idealTemp);
  
  if (diff > 0) comfortScore -= diff * 0.5; // Her derece fark yarım puan götürür
  
  // Nem cezası (Sıcakken)
  if (temp > 25 && humidity > 60) comfortScore -= 2; 
  // Rüzgar cezası (Soğukken - Hissedilen düşer)
  if (temp < 15 && wind > 15) comfortScore -= 2;

  // 4. Motosiklet (Motorcycle)
  let motoScore = 10;
  if (rain > 0) motoScore = 1;
  else if (rainProb > 50) motoScore -= 4;
  if (wind > 25) motoScore -= 3;
  if (temp < 5) motoScore -= 3;
  if (temp > 35) motoScore -= 2;

  // 5. Bahçe İşleri (Gardening) - Bisiklet yerine
  let gardenScore = 10;
  if (rain > 0) gardenScore = 1; // Yağmurda çamur olur
  if (rainProb > 60) gardenScore -= 3;
  if (wind > 30) gardenScore -= 4; // Çiçekler/dallar zarar görür
  if (temp < 5) gardenScore -= 3; // Toprak donuk olabilir
  if (temp > 32) gardenScore -= 3; // Güneş çarpması riski

  // 6. Mangal / Piknik (BBQ)
  let bbqScore = 10;
  if (rain > 0 || rainProb > 30) bbqScore = 1;
  if (wind > 20) bbqScore -= 4;
  if (temp < 12) bbqScore -= 3;

  const activities = [
    { label: "Koşu", score: clamp(runningScore), icon: <Footprints size={18} className="text-emerald-400" /> },
    { label: "Motosiklet", score: clamp(motoScore), icon: <MotorBike size={18} className="text-red-400" /> },
    { label: "Bahçe İşleri", score: clamp(gardenScore), icon: <Shovel size={18} className="text-amber-700" /> }, // Amber/Brown for earth
    { label: "Termal Konfor", score: clamp(comfortScore), icon: <ThermometerSun size={18} className="text-orange-400" /> },
    { label: "Mangal", score: clamp(bbqScore), icon: <Utensils size={18} className="text-yellow-400" /> },
    { label: "Araba Yıkama", score: clamp(carWashScore), icon: <Car size={18} className="text-blue-400" /> },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
        Aktivite Rehberi
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {activities.map((act, idx) => (
            <div 
              key={idx} 
              className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
                {/* Subtle sheen effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="mb-2 p-2 bg-slate-800/50 rounded-full ring-1 ring-white/10 shadow-lg">
                    {act.icon}
                </div>
                <span className="text-[10px] text-slate-300 font-bold uppercase mb-1">{act.label}</span>
                
                {/* Score Bar */}
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-1 ring-1 ring-white/5">
                    <div 
                        className={`h-full rounded-full shadow-lg ${act.score >= 8 ? 'bg-emerald-500' : act.score >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${act.score * 10}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-white mt-1 drop-shadow-md">{act.score}/10</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityScore;
