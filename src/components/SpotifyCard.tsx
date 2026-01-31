
import React from 'react';
import { ExternalLink, CloudRain, Sun, CloudSnow, CloudLightning, Coffee, Footprints, Car, Play } from 'lucide-react';
import { WeatherData } from '../types';

interface SpotifyCardProps {
  weather: WeatherData;
}

// Spotify SVG Logo Component for the watermark
const SpotifyLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.779-.6 13.561 1.621.42.181.6.779.18 1.2zm.12-3.36C15.538 8.46 9.019 8.22 5.239 9.36c-.6.18-1.26-.12-1.439-.72-.18-.6.12-1.26.72-1.44 4.44-1.32 11.58-1.02 16.021 1.62.539.3.719 1.02.419 1.56-.24.48-.96.66-1.44.36z"/>
  </svg>
);

const SpotifyCard: React.FC<SpotifyCardProps> = ({ weather }) => {
  const { current } = weather;
  const code = current.weather_code;
  const isDay = current.is_day === 1;

  // Hava durumuna göre Şarkı/Liste ve Bağlam (Context) belirleme
  const getRecommendation = () => {
      // 1. Fırtına
      if ([95, 96, 99].includes(code)) {
          return {
              title: "Riders on the Storm",
              artist: "The Doors",
              context: "Fırtınalı havanın en ikonik eşlikçisi.",
              link: "https://open.spotify.com/track/14XWXWv5FoCbFzLksawpEe",
              icon: <CloudLightning size={18} className="text-purple-300" />,
              bgGradient: "from-slate-900 via-blue-900 to-black"
          };
      }
      // 2. Kar
      if ([71, 73, 75, 77, 85, 86].includes(code)) {
          return {
              title: "Winter Song",
              artist: "Sara Bareilles, Ingrid Michaelson",
              context: "Lapa lapa kar yağarken huzur bulman için.",
              link: "https://open.spotify.com/track/6E2h1lVpMAyHw1V9t2nQ9n",
              icon: <CloudSnow size={18} className="text-sky-200" />,
              bgGradient: "from-slate-700 via-slate-800 to-slate-900"
          };
      }
      // 3. Yağmur
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
          return {
              title: "November Rain",
              artist: "Guns N' Roses",
              context: "Yağmurun sesiyle bütünleşen bir klasik.",
              link: "https://open.spotify.com/track/3YxJe4qRFk0p0k0x9k9x99",
              icon: <Coffee size={18} className="text-amber-200" />,
              bgGradient: "from-blue-900 via-slate-800 to-black"
          };
      }
      // 4. Gece (Açık/Bulutlu fark etmez)
      if (!isDay) {
          return {
              title: "Midnight City",
              artist: "M83",
              context: "Şehir ışıkları altında gece sürüşü için.",
              link: "https://open.spotify.com/track/1eyzqe2QqGZUmfcPZtrIyt",
              icon: <Car size={18} className="text-indigo-200" />,
              bgGradient: "from-indigo-950 via-slate-900 to-black"
          };
      }
      // 5. Açık / Güneşli Gündüz
      if (code <= 1) {
          return {
              title: "Walking On Sunshine",
              artist: "Katrina & The Waves",
              context: "Güneşin enerjisini hisset!",
              icon: <Footprints size={18} className="text-yellow-200" />,
              bgGradient: "from-blue-500 via-sky-600 to-slate-800"
          };
      }
      // 6. Bulutlu / Kapalı (Varsayılan)
      return {
          title: "Here Comes The Sun",
          artist: "The Beatles",
          context: "Bulutların arkasında güneş hep var.",
          icon: <Sun size={18} className="text-orange-100" />,
          bgGradient: "from-slate-800 via-slate-900 to-black"
      };
  };

  const rec = getRecommendation();

  return (
    <a 
        href={rec.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full relative overflow-hidden rounded-2xl p-6 mb-6 flex flex-col justify-between group transition-all duration-300 active:scale-[0.98] hover:shadow-2xl border border-white/10 bg-gradient-to-br ${rec.bgGradient}`}
    >
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>

        {/* SPOTIFY WATERMARK - The big faded logo */}
        <div className="absolute -bottom-6 -right-6 text-white opacity-10 rotate-12 transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
            <SpotifyLogo className="w-40 h-40" />
        </div>

        {/* Header Section */}
        <div className="relative z-10 flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                 <div className="p-2 bg-white/10 rounded-full backdrop-blur-md shadow-sm">
                     {rec.icon}
                 </div>
                 <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-full border border-white/5">
                     Soundtrack
                 </span>
             </div>
             <div className="p-2 bg-black/20 rounded-full hover:bg-green-500 hover:text-white transition-colors text-white/70">
                 <ExternalLink size={16} />
             </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10">
            <div className="mb-4">
                <h3 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-md line-clamp-1">{rec.title}</h3>
                <p className="text-sm text-white/70 font-medium">{rec.artist}</p>
            </div>
            
            <div className="flex items-center gap-3">
                 <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    <p className="text-xs text-slate-200 leading-relaxed italic line-clamp-2">
                        "{rec.context}"
                    </p>
                 </div>
                 
                 {/* Play Button Indicator */}
                 <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black shadow-lg shadow-green-900/50 shrink-0 group-hover:scale-110 transition-transform">
                     <Play size={20} fill="currentColor" className="ml-1" />
                 </div>
            </div>
            
            <div className="mt-3 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                 <SpotifyLogo className="w-4 h-4 text-white" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-wide">Spotify'da Dinle</span>
            </div>
        </div>
    </a>
  );
};

export default SpotifyCard;
