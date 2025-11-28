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
    // Sadece şehir, hava durumu veya gece/gündüz değiştiğinde çalıştır
    const hasChanged = 
        city !== prevPropsRef.current.city || 
        weatherCode !== prevPropsRef.current.weatherCode || 
        isDay !== prevPropsRef.current.isDay;

    if (!hasChanged || !city) return;

    prevPropsRef.current = { city, weatherCode, isDay };

    const fetchImage = async () => {
      // Gemini ile görsel oluştur
      const base64Image = await generateCityImage(city, weatherCode, isDay === 1);
      
      if (base64Image) {
        setNextImg(base64Image);
        setIsTransitioning(true);
      } else {
        // Fallback: Gemini başarısız olursa Pollinations kullan (eski yöntem)
        const encodedCity = encodeURIComponent(city);
        const seed = Date.now(); // Cache breaker for fallback
        const fallbackUrl = `https://image.pollinations.ai/prompt/cinematic%20shot%20of%20${encodedCity}%20city%20landmark%20weather%20moody?width=1080&height=1920&nologo=true&seed=${seed}`;
        setNextImg(fallbackUrl);
        setIsTransitioning(true);
      }
    };

    // İlk yüklemede çok beklemesin diye ufak bir gecikme ile çağırıyoruz
    // Bu sayede UI render olduktan hemen sonra işlem başlar
    const timeout = setTimeout(fetchImage, 100);

    return () => clearTimeout(timeout);
  }, [city, weatherCode, isDay]);

  const handleImageLoad = () => {
    // Yeni resim yüklendiğinde geçişi tamamla
    setCurrentImg(nextImg);
    setIsTransitioning(false);
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
          className={`absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Placeholder Gradient if no image yet */}
      {!currentImg && !nextImg && (
        <div className="absolute inset-0 w-full h-[65%] bg-gradient-to-b from-slate-800 to-slate-900" />
      )}

      {/* Stronger Gradient Overlay for Fade Out to Bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-slate-900/60 to-slate-900 via-50% to-90% h-full pointer-events-none" />
      
      {/* Additional bottom fade to ensure seamless transition to content background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Background;