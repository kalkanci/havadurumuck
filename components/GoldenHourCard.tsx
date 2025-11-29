
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Sun, Moon, X, Aperture } from 'lucide-react';
import { WeatherData } from '../types';
import { formatTime } from '../utils/helpers';

interface GoldenHourCardProps {
  weather: WeatherData;
}

const GoldenHourCard: React.FC<GoldenHourCardProps> = ({ weather }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sunriseStr = weather.daily.sunrise[0];
  const sunsetStr = weather.daily.sunset[0];

  if (!sunriseStr || !sunsetStr) return null;

  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);

  const morningGoldenStart = formatTime(sunriseStr);
  const morningGoldenEnd = formatTime(new Date(sunrise.getTime() + 60 * 60 * 1000).toISOString());
  const eveningGoldenStart = formatTime(new Date(sunset.getTime() - 60 * 60 * 1000).toISOString());
  const eveningGoldenEnd = formatTime(sunsetStr);

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
    }, 200);
  };

  const renderModal = () => {
    if (!isOpen) return null;

    return createPortal(
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
         
         <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}`}>
             <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-white z-50">
                 <X size={20} />
             </button>

             {/* Background Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-purple-50/50 to-white dark:from-orange-500/10 dark:via-purple-900/20 dark:to-slate-900 z-0" />

             <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-orange-500/20 rounded-full text-orange-500 dark:text-orange-400">
                         <Camera size={24} />
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fotoğrafçılık Saatleri</h2>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <h3 className="text-orange-600 dark:text-orange-300 font-bold mb-2 flex items-center gap-2">
                            <Sun size={16} /> Altın Saat (Golden Hour)
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                            Güneşin doğuşundan hemen sonra ve batışından hemen önceki süredir. Işık yumuşak, sıcak ve difüzdür. Portre ve manzara çekimleri için idealdir.
                        </p>
                        <div className="flex justify-between text-sm font-mono bg-slate-200 dark:bg-black/20 p-2 rounded-lg text-slate-800 dark:text-slate-300">
                             <span>Sabah: {morningGoldenStart} - {morningGoldenEnd}</span>
                        </div>
                        <div className="flex justify-between text-sm font-mono bg-slate-200 dark:bg-black/20 p-2 rounded-lg mt-1 text-slate-800 dark:text-slate-300">
                             <span>Akşam: {eveningGoldenStart} - {eveningGoldenEnd}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <h3 className="text-blue-600 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
                            <Moon size={16} /> Mavi Saat (Blue Hour)
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                            Altın saatten hemen önce (sabah) veya sonra (akşam). Gökyüzü derin mavi bir renk alır. Şehir ışıklarıyla harika kontrast oluşturur.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                         <Aperture size={20} className="text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
                         <p className="text-xs text-indigo-700 dark:text-indigo-200">
                             <strong>İpucu:</strong> Düşük ışık koşulları için ISO'yu artırmayı veya tripod kullanmayı unutmayın.
                         </p>
                    </div>
                 </div>
             </div>
         </div>
      </div>,
      document.body
    );
  };

  return (
    <>
        <button 
            onClick={handleOpen}
            className="w-full glass-card rounded-2xl p-5 mb-6 relative overflow-hidden text-left group transition-transform active:scale-[0.98]"
        >
        {/* Artistic Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-900/10 transition-opacity opacity-70 group-hover:opacity-100" />
        
        <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-orange-600 dark:text-orange-300 uppercase tracking-widest flex items-center gap-2">
            <Camera size={14} /> Golden Hour
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/60 dark:group-hover:bg-white/10 transition-colors font-medium">Detaylar için dokun</span>
        </div>

        <div className="relative z-10 flex justify-between items-center gap-4">
            {/* Morning */}
            <div className="flex-1 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 dark:from-orange-400/20 dark:to-yellow-400/10 rounded-xl p-3 border border-orange-200 dark:border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <Sun size={14} className="text-orange-500 dark:text-orange-400" />
                    <span className="text-xs text-orange-700 dark:text-orange-200 font-semibold">Sabah</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{morningGoldenStart}</span>
                    <span className="text-xs text-orange-400/50">-</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{morningGoldenEnd}</span>
                </div>
            </div>

            {/* Evening */}
            <div className="flex-1 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 dark:from-purple-500/20 dark:to-indigo-500/10 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <Moon size={14} className="text-purple-500 dark:text-purple-400" />
                    <span className="text-xs text-purple-700 dark:text-purple-200 font-semibold">Akşam</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{eveningGoldenStart}</span>
                    <span className="text-xs text-purple-300/50">-</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{eveningGoldenEnd}</span>
                </div>
            </div>
        </div>
        
        {/* Visual Timeline Bar */}
        <div className="relative z-10 mt-4 h-1.5 w-full bg-slate-300 dark:bg-slate-700/50 rounded-full overflow-hidden flex">
            <div className="h-full bg-slate-400 dark:bg-slate-800 w-[20%]" /> {/* Night */}
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-300 w-[10%]" /> {/* Golden Morning */}
            <div className="h-full bg-blue-400/20 w-[40%]" /> {/* Day */}
            <div className="h-full bg-gradient-to-r from-yellow-300 to-purple-600 w-[10%]" /> {/* Golden Evening */}
            <div className="h-full bg-slate-400 dark:bg-slate-800 w-[20%]" /> {/* Night */}
        </div>
        </button>
        {renderModal()}
    </>
  );
};

export default GoldenHourCard;
