
import React, { useEffect, useState, useRef } from 'react';
import { getCityImage } from '../services/imageService';
import { generateCityImage } from '../services/geminiService';

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
    
    // Sadece şehir, hava durumu kodu veya gece/gündüz durumu değiştiğinde çalış
    // Hava durumu kodu değişince (örn: güneşliden yağmurluya) görseli güncellemek isteyebiliriz
    if (city === prev.city && weatherCode === prev.weatherCode && isDay === prev.isDay) return;
    
    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchImage = async () => {
      setIsLoaded(false);
      let imgUrl: string | null = null;
      
      // 1. Wikipedia'dan gerçek fotoğrafı çek (En Hızlı ve Doğru)
      try {
        imgUrl = await getCityImage(city);
      } catch (e) {
        console.warn("Wiki fetch failed");
      }
      
      // 2. Wikipedia bulamazsa veya hata verirse: Gemini ile Üret (Nano Banana)
      if (!imgUrl && weatherCode !== undefined && isDay !== undefined) {
         try {
             // 1 = Day, 0 = Night
             imgUrl = await generateCityImage(city, weatherCode, isDay === 1);
         } catch (e) {
             console.warn("Gemini generation failed");
         }
      }

      // 3. Fallback: Pollinations Realism (Hala görsel yoksa)
      if (!imgUrl) {
        // Pollinations promptunu da landmark odaklı yapalım
        const condition = isDay === 0 ? "night" : "daylight";
        const prompt = `wide angle architectural photography of famous landmark in ${encodeURIComponent(city)}, ${condition}, cinematic lighting, highly detailed, 8k, no text, no map`;
        imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1920&nologo=true&model=flux-realism&seed=${Math.random()}`;
      }

      if (imgUrl) {
        setNextImg(imgUrl);
      }
    };

    fetchImage();
  }, [city, weatherCode, isDay]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    // Yumuşak geçiş tamamlanınca
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
          className="absolute inset-0 w-full h-[60%] object-cover object-center transition-opacity duration-1000"
        />
      )}
      
      {/* 2. Yeni Resim (Üst Katman - Fade In) */}
      {nextImg && nextImg !== currentImg && (
        <img
          src={nextImg}
          alt="" 
          onLoad={handleImageLoad}
          className={`absolute inset-0 w-full h-[60%] object-cover object-center transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 3. Gradient Overlay */}
      {/* Üstten hafif karartma (Text okunabilirliği için) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Alttan güçlü karartma (UI ile birleşme için) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-40% to-slate-900 to-60% h-full pointer-events-none z-10 dark:to-slate-900" />
      
      {/* Light Mode için özel gradient logic */}
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pointer-events-none z-10 opacity-100 transition-colors duration-500 [.light-mode_&]:from-sky-50 [.light-mode_&]:via-sky-50/90" />

    </div>
  );
};

export default Background;
