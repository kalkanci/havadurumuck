
import React, { useEffect, useState, useRef } from 'react';
import { generateCityImage } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

interface BackgroundProps {
  city: string;
  weatherCode?: number;
  isDay?: number;
}

const Background: React.FC<BackgroundProps> = ({ city, weatherCode = 0, isDay = 1 }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false); // Resim üretiliyor mu?
  const [isLoaded, setIsLoaded] = useState(false); // Yeni resim yüklendi mi?
  const prevPropsRef = useRef({ city: '', weatherCode: -1, isDay: -1 });

  useEffect(() => {
    const hasChanged = 
        city !== prevPropsRef.current.city || 
        weatherCode !== prevPropsRef.current.weatherCode || 
        isDay !== prevPropsRef.current.isDay;

    if (!hasChanged || !city) return;

    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchImage = async () => {
      setIsGenerating(true);
      setIsLoaded(false);
      
      try {
        // Nano Banana Pro ile üretim
        const base64Image = await generateCityImage(city, weatherCode, isDay === 1);
        
        if (base64Image) {
          setNextImg(base64Image);
        } else {
          useFallback(city);
        }
      } catch (err) {
        console.error("[Background] Error generating image:", err);
        useFallback(city);
      } finally {
        setIsGenerating(false);
      }
    };

    // UI'ın önce render olması için çok kısa bir gecikme
    const timeout = setTimeout(fetchImage, 100); 
    return () => clearTimeout(timeout);
  }, [city, weatherCode, isDay]);

  const useFallback = (cityName: string) => {
    const encodedCity = encodeURIComponent(cityName);
    // Fallback servisi
    const fallbackUrl = `https://image.pollinations.ai/prompt/cinematic%20vertical%20photo%20of%20${encodedCity}%20landmark?width=720&height=1280&nologo=true&model=flux`;
    setNextImg(fallbackUrl);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    // Yumuşak geçiş için bekle
    setTimeout(() => {
      setCurrentImg(nextImg);
      setIsLoaded(false); // Reset load state logic
    }, 1200);
  };

  const handleImageError = () => {
    if (!nextImg.includes('pollinations.ai')) {
        useFallback(city);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      
      {/* 1. Mevcut Resim (En Altta) */}
      {currentImg && (
        <img
          src={currentImg}
          alt=""
          className={`absolute inset-0 w-full h-[65%] object-cover transition-all duration-[2000ms] ease-in-out ${isGenerating ? 'blur-lg scale-105 opacity-80' : 'blur-0 scale-100 opacity-100'}`}
        />
      )}
      
      {/* 2. Yeni Resim (Yüklenince Fade-In olur) */}
      {nextImg && nextImg !== currentImg && (
        <img
          src={nextImg}
          alt="" 
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-[1500ms] ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Placeholder / Default Gradient (Resim yoksa) */}
      {!currentImg && (
         <div className={`absolute inset-0 w-full h-[65%] bg-gradient-to-b from-slate-800 to-slate-900 -z-10`} />
      )}

      {/* 4. Loading Göstergesi (Üretim sırasında blur üzerine gelir) */}
      {isGenerating && (
        <div className="absolute inset-0 h-[65%] flex items-center justify-center bg-black/20 backdrop-blur-md z-10 transition-opacity duration-500">
           <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-white animate-spin drop-shadow-lg" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase drop-shadow-md">
                Sinematik Görüntü Oluşturuluyor...
              </span>
           </div>
        </div>
      )}

      {/* 5. Okunabilirlik Katmanları (Gradient Overlays) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/60 to-slate-900 via-50% to-90% h-full pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pointer-events-none z-20" />
    </div>
  );
};

export default Background;
