
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Car, Footprints, Shovel, ThermometerSun, Bike as MotorBike, Utensils, X, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { WeatherData } from '../types';
import { triggerHapticFeedback } from '../utils/helpers';

interface ActivityScoreProps {
  weather: WeatherData;
}

const ActivityScore: React.FC<ActivityScoreProps> = ({ weather }) => {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);

  const current = weather.current;
  const today = weather.daily;

  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const rain = current.precipitation;
  const rainProb = today.precipitation_probability_max[0];
  const humidity = current.relative_humidity_2m;

  useEffect(() => {
    if (selectedActivity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedActivity]);

  const clamp = (val: number) => Math.max(1, Math.min(10, val));

  const calculateScore = (type: string) => {
    let score = 10;
    let reasons: { type: 'pos' | 'neg' | 'neutral', text: string }[] = [];

    const addReason = (t: 'pos' | 'neg' | 'neutral', txt: string) => reasons.push({ type: t, text: txt });

    if (type === 'running') {
        if (temp > 25) { score -= 3; addReason('neg', 'Hava sıcak, performans düşebilir.'); }
        else if (temp < 5) { score -= 3; addReason('neg', 'Hava çok soğuk.'); }
        else { addReason('pos', 'Sıcaklık koşu için ideal.'); }

        if (rain > 0) { score -= 4; addReason('neg', 'Yağış var, zemin kaygan.'); }
        if (wind > 20) { score -= 2; addReason('neg', 'Rüzgar direnci yüksek.'); }
    } 
    else if (type === 'carwash') {
        if (rainProb > 30) { score -= 5; addReason('neg', 'Bugün yağmur riski var.'); }
        else if (today.precipitation_probability_max[1] > 30) { score -= 4; addReason('neg', 'Yarın yağmur bekleniyor.'); }
        else { addReason('pos', 'Önümüzdeki günler açık görünüyor.'); }
    }
    else if (type === 'comfort') {
        const idealTemp = 22;
        const diff = Math.abs(temp - idealTemp);
        if (diff > 0) { score -= diff * 0.5; }
        if (temp > 25 && humidity > 60) { score -= 2; addReason('neg', 'Yüksek nem bunaltıcı olabilir.'); }
        if (temp < 15 && wind > 15) { score -= 2; addReason('neg', 'Rüzgar hissedilen sıcaklığı düşürüyor.'); }
        
        if (score > 8) addReason('pos', 'Termal konfor yüksek.');
        else if (score < 5) addReason('neg', 'Konfor seviyesi düşük.');
    }
    else if (type === 'moto') {
        if (rain > 0) { score = 1; addReason('neg', 'Yağış var, sürüş tehlikeli.'); }
        else if (rainProb > 50) { score -= 4; addReason('neg', 'Yüksek yağmur ihtimali.'); }
        
        if (wind > 25) { score -= 3; addReason('neg', 'Şiddetli yan rüzgar riski.'); }
        if (temp < 5) { score -= 3; addReason('neg', 'Hava çok soğuk, ekipman önemli.'); }
        
        if (score > 8) addReason('pos', 'Sürüş için harika bir hava.');
    }
    else if (type === 'garden') {
        if (rain > 0) { score = 1; addReason('neg', 'Toprak çamurlu.'); }
        else if (rainProb > 60) { score -= 3; addReason('neg', 'Yağmur riski yüksek.'); }
        if (wind > 30) { score -= 4; addReason('neg', 'Rüzgar bitkilere zarar verebilir.'); }
        if (temp > 32) { score -= 3; addReason('neg', 'Güneş çarpması riski.'); }
    }
    else if (type === 'bbq') {
        if (rain > 0) { score = 1; addReason('neg', 'Yağmur yağıyor.'); }
        else if (rainProb > 30) { score = 4; addReason('neg', 'Yağmur riski keyif kaçırabilir.'); }
        if (wind > 20) { score -= 4; addReason('neg', 'Rüzgar ateşi etkileyebilir.'); }
        if (temp < 12) { score -= 3; addReason('neg', 'Hava serin, sıkı giyinin.'); }
        if (score > 8) addReason('pos', 'Mangal için mükemmel şartlar.');
    }

    return { score: clamp(score), reasons };
  };

  const activities = [
    { id: 'running', label: "Koşu", icon: <Footprints size={18} className="text-emerald-400" /> },
    { id: 'moto', label: "Motosiklet", icon: <MotorBike size={18} className="text-red-400" /> },
    { id: 'garden', label: "Bahçe İşleri", icon: <Shovel size={18} className="text-amber-500" /> },
    { id: 'comfort', label: "Konfor", icon: <ThermometerSun size={18} className="text-orange-400" /> },
    { id: 'bbq', label: "Mangal", icon: <Utensils size={18} className="text-yellow-400" /> },
    { id: 'carwash', label: "Oto Yıkama", icon: <Car size={18} className="text-blue-400" /> },
  ].map(act => ({ ...act, ...calculateScore(act.id) }));

  const handleOpenWithDelay = (act: any) => {
    triggerHapticFeedback(15);
    setTimeout(() => {
        setSelectedActivity(act);
        setIsClosing(false);
    }, 200);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setSelectedActivity(null);
        setIsClosing(false);
    }, 200);
  };

  const renderModal = () => {
    if (!selectedActivity) return null;

    const { label, score, reasons, icon } = selectedActivity;
    let scoreColor = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-rose-400';
    let ringColor = score >= 8 ? 'ring-emerald-500' : score >= 5 ? 'ring-amber-500' : 'ring-rose-500';

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={handleClose} />
            
            <div className={`relative w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
                 <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white z-10">
                     <X size={20} />
                 </button>

                 <div className="flex flex-col items-center mb-6">
                     <div className={`p-5 rounded-full bg-white/5 shadow-xl ring-2 ${ringColor} ring-offset-2 ring-offset-slate-900 mb-3`}>
                         {React.cloneElement(icon, { size: 32 })}
                     </div>
                     <h2 className="text-2xl font-bold text-white">{label}</h2>
                     <div className={`text-4xl font-black mt-2 ${scoreColor}`}>{score}/10</div>
                     <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Uygunluk Skoru</span>
                 </div>

                 <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                     <h3 className="text-sm font-bold text-slate-300 mb-2">Analiz Detayları</h3>
                     {reasons.length === 0 ? (
                         <p className="text-sm text-slate-400">Önemli bir engel bulunmuyor.</p>
                     ) : (
                         reasons.map((r: any, idx: number) => (
                             <div key={idx} className="flex items-start gap-3 text-sm">
                                 {r.type === 'pos' ? <ThumbsUp size={16} className="text-emerald-400 mt-0.5 shrink-0" /> : 
                                  r.type === 'neg' ? <ThumbsDown size={16} className="text-rose-400 mt-0.5 shrink-0" /> :
                                  <Minus size={16} className="text-slate-400 mt-0.5 shrink-0" />}
                                 <span className={r.type === 'neg' ? 'text-rose-200' : r.type === 'pos' ? 'text-emerald-100' : 'text-slate-300'}>
                                     {r.text}
                                 </span>
                             </div>
                         ))
                     )}
                 </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
        Aktivite Rehberi
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {activities.map((act, idx) => (
            <button 
              key={idx} 
              onClick={() => handleOpenWithDelay(act)}
              className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 active:scale-[0.95] active:brightness-90 active:border-white/10"
            >
                {/* Subtle sheen effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="mb-2 p-2.5 bg-white/5 rounded-full ring-1 ring-white/10 shadow-sm">
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
                <span className="text-xs font-bold text-white mt-1 drop-shadow-sm">{act.score}/10</span>
            </button>
        ))}
      </div>
      {renderModal()}
    </div>
  );
};

export default ActivityScore;
