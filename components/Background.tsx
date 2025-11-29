
import React, { useEffect, useState, useRef } from 'react';
import { getCityImage } from '../services/imageService';

interface BackgroundProps {
  city: string;
}

const Background: React.FC<BackgroundProps> = ({ city }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const prevCityRef = useRef<string>('');

  useEffect(() => {
    if (city === prevCityRef.current) return;
    prevCityRef.current = city;

    const fetchImage = async () => {
      setIsLoaded(false);
      
      // Wikipedia'dan gerçek fotoğrafı çek
      const imgUrl = await getCityImage(city);
      
      if (imgUrl) {
        setNextImg(imgUrl);
      } else {
        // Fallback: Pollinations Realism
        // "Real photo" araması için optimize edilmiş
        const fallbackUrl = `https://image.pollinations.ai/prompt/wide%20angle%20real%20photography%20of%20${encodeURIComponent(city)}%20city%20landmark%20daylight?width=1080&height=1920&nologo=true&model=flux-realism&seed=${Math.random()}`;
        setNextImg(fallbackUrl);
      }
    };

    fetchImage();
  }, [city]);

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
      
      {/* 3. Gradient Overlay - Kullanıcı isteği: "Gradyan etkisini geri getir" */}
      {/* Üstten hafif karartma (Text okunabilirliği için) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Alttan güçlü karartma (UI ile birleşme için) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-40% to-slate-900 to-60% h-full pointer-events-none z-10 dark:to-slate-900" />
      
      {/* Light Mode için özel gradient logic (JS tarafında class kontrolü yerine CSS variable kullanılabilir ama burada manuel ekliyoruz) */}
      {/* Bu div body.light-mode olduğunda CSS ile rengi değişecek, şimdilik dark default */}
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pointer-events-none z-10 opacity-100 transition-colors duration-500 [.light-mode_&]:from-sky-50 [.light-mode_&]:via-sky-50/90" />

    </div>
  );
};

export default Background;
