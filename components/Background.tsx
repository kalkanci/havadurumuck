import React, { useEffect, useState, useRef } from 'react';
import { generateCityImage } from '../services/geminiService';

interface BackgroundProps {
  city: string;
  weatherCode?: number;
  isDay?: number;
}

const Background: React.FC<BackgroundProps> = ({ city, weatherCode = 0, isDay = 1 }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPropsRef = useRef({ city: '', weatherCode: -1, isDay: -1 });

  useEffect(() => {
    const hasChanged = 
        city !== prevPropsRef.current.city || 
        weatherCode !== prevPropsRef.current.weatherCode || 
        isDay !== prevPropsRef.current.isDay;

    if (!hasChanged || !city) return;

    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchImage = async () => {
      console.log(`[Background] Fetching image for ${city}...`);
      
      try {
        // 1. Önce Gemini ile dene
        const base64Image = await generateCityImage(city, weatherCode, isDay === 1);
        
        if (base64Image) {
          console.log("[Background] Gemini image generated.");
          setNextImg(base64Image);
          setIsTransitioning(true);
        } else {
          console.warn("[Background] Gemini returned null, using fallback.");
          useFallback(city);
        }
      } catch (err) {
        console.error("[Background] Error generating image:", err);
        useFallback(city);
      }
    };

    const timeout = setTimeout(fetchImage, 100);
    return () => clearTimeout(timeout);
  }, [city, weatherCode, isDay]);

  const useFallback = (cityName: string) => {
    const encodedCity = encodeURIComponent(cityName);
    const seed = Date.now();
    // Alternatif olarak Unsplash source veya Pollinations
    const fallbackUrl = `https://image.pollinations.ai/prompt/cinematic%20wide%20shot%20of%20${encodedCity}%20city%20landmark%20weather%20moody?width=1080&height=1920&nologo=true&seed=${seed}&model=flux`;
    setNextImg(fallbackUrl);
    setIsTransitioning(true);
  };

  const handleImageLoad = () => {
    setCurrentImg(nextImg);
    setIsTransitioning(false);
  };

  const handleImageError = () => {
    console.error("[Background] Image load failed (Base64/URL error). Retrying with fallback.");
    if (!nextImg.includes('pollinations.ai')) {
        // Eğer hata veren resim Gemini resmiyse, fallback'e geç
        useFallback(city);
    } else {
        // Fallback de hata verirse geçişi iptal et (siyah ekran kalsın veya gradient)
        setIsTransitioning(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      {/* Current Image (Back buffer) */}
      {currentImg && (
        <img
          src={currentImg}
          alt="Background"
          className="absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out opacity-100"
        />
      )}
      
      {/* Next Image (Front buffer for crossfade) */}
      {nextImg && (
        <img
          src={nextImg}
          alt="Next Background"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Placeholder Gradient if no image yet */}
      {!currentImg && !nextImg && (
        <div className="absolute inset-0 w-full h-[65%] bg-gradient-to-b from-slate-800 to-slate-900" />
      )}

      {/* Stronger Gradient Overlay for Fade Out to Bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/60 to-slate-900 via-50% to-90% h-full pointer-events-none" />
      
      {/* Additional bottom fade to ensure seamless transition to content background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Background;