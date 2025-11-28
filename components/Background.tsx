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
  const [isLoaded, setIsLoaded] = useState(false); // New state to track if next image is actually ready
  const prevPropsRef = useRef({ city: '', weatherCode: -1, isDay: -1 });

  useEffect(() => {
    const hasChanged = 
        city !== prevPropsRef.current.city || 
        weatherCode !== prevPropsRef.current.weatherCode || 
        isDay !== prevPropsRef.current.isDay;

    if (!hasChanged || !city) return;

    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchImage = async () => {
      // Reset loading state for transition
      setIsLoaded(false);
      
      try {
        // 1. Önce Gemini ile dene
        const base64Image = await generateCityImage(city, weatherCode, isDay === 1);
        
        if (base64Image) {
          setNextImg(base64Image);
        } else {
          useFallback(city);
        }
      } catch (err) {
        console.error("[Background] Error generating image:", err);
        useFallback(city);
      }
    };

    const timeout = setTimeout(fetchImage, 500); // Biraz daha gecikme ekleyerek UI'ın oturmasını bekle
    return () => clearTimeout(timeout);
  }, [city, weatherCode, isDay]);

  const useFallback = (cityName: string) => {
    const encodedCity = encodeURIComponent(cityName);
    // Seed ekleyerek her seferinde farklı varyasyon gelmesini ama aynı gün için sabit kalmasını sağlayabiliriz
    const seed = Math.floor(Date.now() / 100000); 
    const fallbackUrl = `https://image.pollinations.ai/prompt/cinematic%20wide%20shot%20of%20${encodedCity}%20city%20landmark%20weather%20moody?width=720&height=1280&nologo=true&seed=${seed}&model=flux`;
    setNextImg(fallbackUrl);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    // Cross-fade bittikten sonra (1sn) current resmi güncelle
    setTimeout(() => {
      setCurrentImg(nextImg);
      setIsLoaded(false); // Reset load trigger for internal logic, though visuals depend on props
    }, 1000);
  };

  const handleImageError = () => {
    console.warn("[Background] Image load failed. Retrying with generic fallback.");
    if (!nextImg.includes('pollinations.ai')) {
        useFallback(city);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      {/* Current Image (Persistent Layer) */}
      {currentImg && (
        <img
          src={currentImg}
          alt=""
          className="absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: 1 }}
        />
      )}
      
      {/* Next Image (Transition Layer) */}
      {/* Sadece resim yüklendiğinde opacity 1 yapıyoruz, aksi halde görünmez. Alt text boş. */}
      {nextImg && nextImg !== currentImg && (
        <img
          src={nextImg}
          alt="" 
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* Placeholder / Default Gradient */}
      <div className={`absolute inset-0 w-full h-[65%] bg-gradient-to-b from-slate-800 to-slate-900 -z-10`} />

      {/* Overlays for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/60 to-slate-900 via-50% to-90% h-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Background;