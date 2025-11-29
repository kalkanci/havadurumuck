
import React, { useEffect, useState, useRef } from 'react';
import { getWeatherLabel } from '../constants';

interface BackgroundProps {
  city: string;
  weatherCode?: number;
  isDay?: number;
}

const Background: React.FC<BackgroundProps> = ({ city, weatherCode, isDay }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track previous props to prevent unnecessary re-fetches
  const prevPropsRef = useRef<{city: string, weatherCode?: number, isDay?: number}>({ city: '', weatherCode: undefined, isDay: undefined });

  useEffect(() => {
    const prev = prevPropsRef.current;
    
    // Sadece hava durumu kodu veya gece/gündüz durumu değiştiğinde çalış.
    if (weatherCode === prev.weatherCode && isDay === prev.isDay && currentImg !== '') return;
    
    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchRandomImage = async () => {
      setIsLoaded(false);
      
      // Temel koşullar
      const condition = weatherCode !== undefined ? getWeatherLabel(weatherCode) : 'clear sky';
      const timeOfDay = isDay === 1 ? 'daylight, bright' : 'night, moonlight, dark sky';
      
      // Rastgele manzara tipleri
      const landscapes = [
        "majestic mountains", 
        "misty pine forest", 
        "calm ocean horizon", 
        "desert dunes", 
        "rolling green hills", 
        "snowy peaks",
        "tropical beach",
        "lake reflection",
        "deep canyon"
      ];
      const randomLandscape = landscapes[Math.floor(Math.random() * landscapes.length)];

      // Optimization: Reduced resolution for mobile speed (720x1280 is sufficient for backgrounds)
      const prompt = `cinematic wide shot of ${randomLandscape}, ${condition} weather, ${timeOfDay}, atmospheric lighting, 8k, highly detailed, realistic, wallpaper style, no text`;
      const seed = Math.floor(Math.random() * 10000);
      
      // Using 'flux-realism' model but with mobile optimized dimensions
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=720&height=1280&nologo=true&model=flux-realism&seed=${seed}`;

      setNextImg(imgUrl);
    };

    fetchRandomImage();
  }, [city, weatherCode, isDay]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    // Yumuşak geçiş
    setTimeout(() => {
      setCurrentImg(nextImg);
      setIsLoaded(false); 
    }, 1200);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900 transition-colors duration-500">
      
      {/* 1. Mevcut Resim (Alt Katman) */}
      {currentImg && (
        <img
          src={currentImg}
          alt=""
          className="absolute inset-0 w-full h-[65%] object-cover object-center transition-opacity duration-1000"
        />
      )}
      
      {/* 2. Yeni Resim (Üst Katman - Fade In) */}
      {nextImg && nextImg !== currentImg && (
        <img
          src={nextImg}
          alt="" 
          onLoad={handleImageLoad}
          className={`absolute inset-0 w-full h-[65%] object-cover object-center transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-40% to-slate-900 to-65% h-full pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pointer-events-none z-10 opacity-100" />

    </div>
  );
};

export default Background;
