
import React, { useEffect, useState, useRef } from 'react';
import { getWeatherLabel } from '../constants';

interface BackgroundProps {
  city: string;
  weatherCode?: number;
  isDay?: number;
  cosmicUrl?: string; // New prop for NASA image
}

const Background: React.FC<BackgroundProps> = ({ city, weatherCode, isDay, cosmicUrl }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track props to prevent unnecessary re-fetches
  const prevPropsRef = useRef<{city: string, weatherCode?: number, isDay?: number, cosmicUrl?: string}>({ city: '', weatherCode: undefined, isDay: undefined, cosmicUrl: undefined });

  useEffect(() => {
    const prev = prevPropsRef.current;
    
    // Check if anything significant changed
    if (
        city === prev.city && 
        weatherCode === prev.weatherCode && 
        isDay === prev.isDay && 
        cosmicUrl === prev.cosmicUrl &&
        currentImg !== ''
    ) return;
    
    prevPropsRef.current = { city, weatherCode, isDay, cosmicUrl };

    const updateBackground = () => {
      setIsLoaded(false);
      
      // PRIORITY 1: Cosmic URL (NASA) if available
      if (cosmicUrl) {
          setNextImg(cosmicUrl);
      } else {
          // PRIORITY 2: AI Generated City Image
          fetchAiImage();
      }
    };

    const fetchAiImage = () => {
        const condition = weatherCode !== undefined ? getWeatherLabel(weatherCode) : 'clear sky';
        const timeOfDay = isDay === 1 ? 'daylight, bright sun' : 'night time, moonlight, street lights';
        
        // Sokak seviyesinde detay ve gerçekçilik vurgusu
        const prompt = `hyper-realistic street level photography of ${city}, ${condition}, ${timeOfDay}, cinematic lighting, highly detailed 8k, urban atmosphere, no text, wallpaper style`;
        
        // Seed ile rastgelelik ama aynı gün/şehir için tutarlılık denemesi (şimdilik tam rastgele)
        const seed = Math.floor(Math.random() * 10000);
        
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=720&height=1280&nologo=true&model=flux-realism&seed=${seed}`;
        setNextImg(imgUrl);
    };

    updateBackground();
  }, [city, weatherCode, isDay, cosmicUrl]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    // Yumuşak geçiş
    setTimeout(() => {
      setCurrentImg(nextImg);
      setIsLoaded(false); 
    }, 1200);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black transition-colors duration-500">
      
      {/* 1. Mevcut Resim (Alt Katman) */}
      {currentImg && (
        <img
          src={currentImg}
          alt=""
          className="absolute inset-0 w-full h-[60%] object-cover object-center transition-opacity duration-1000 opacity-80"
        />
      )}
      
      {/* 2. Yeni Resim (Üst Katman - Fade In) */}
      {nextImg && nextImg !== currentImg && (
        <img
          src={nextImg}
          alt="" 
          onLoad={handleImageLoad}
          className={`absolute inset-0 w-full h-[60%] object-cover object-center transition-opacity duration-1000 ease-in-out opacity-80 ${isLoaded ? 'opacity-80' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Gradient Overlays */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
      
      {/* Main blending gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cosmicUrl ? 'from-black/60 via-black/40 to-black' : 'from-transparent via-transparent via-30% to-black to-60%'} h-full pointer-events-none z-10`} />
      
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-10 opacity-100" />

    </div>
  );
};

export default Background;
