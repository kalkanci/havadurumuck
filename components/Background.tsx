
import React, { useEffect, useState, useRef } from 'react';

interface BackgroundProps {
  city: string;
  country?: string;
  weatherCode?: number;
  isDay?: number;
}

const getWeatherDescription = (code?: number) => {
  if (code === undefined) return "clear sky";
  if (code <= 1) return "clear blue sky, sunny, vibrant lighting";
  if (code <= 3) return "partly cloudy sky, soft sunlight, dynamic clouds";
  if (code <= 48) return "foggy, misty atmosphere, mysterious, cinematic mist";
  if (code <= 67) return "rainy weather, wet streets, reflections, dramatic sky, moody";
  if (code <= 77) return "snowy winter landscape, white snow, cold atmosphere";
  if (code <= 99) return "stormy weather, dark clouds, dramatic lighting, thunder";
  return "clear sky";
};

const Background: React.FC<BackgroundProps> = ({ city, country, weatherCode, isDay }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const prevPropsRef = useRef<{city: string, isDay?: number}>({ city: '', isDay: undefined });

  useEffect(() => {
    const prev = prevPropsRef.current;
    
    // Şehir veya gece/gündüz değişirse yeni set üret
    if (city === prev.city && isDay === prev.isDay) return;
    
    prevPropsRef.current = { city, isDay };

    const generateImageSet = () => {
      // Lokasyon bağlamını güçlendir
      const locationQuery = country ? `${city}, ${country}` : city;
      
      const weatherDesc = getWeatherDescription(weatherCode);
      const timeDesc = isDay === 1 ? "daytime, golden hour lighting" : "night time, city lights, cinematic dark atmosphere";
      
      // Halüsinasyonu önlemek için 'landmark' yerine 'vibe/atmosfer' odaklı promptlar
      const prompts = [
        `cinematic street photography of ${locationQuery}, ${weatherDesc}, ${timeDesc}, highly detailed, 8k, photorealistic, depth of field`,
        `beautiful cityscape view of ${locationQuery}, ${weatherDesc}, ${timeDesc}, wide angle, atmospheric lighting, architectural detail`,
        `scenic landscape near ${locationQuery}, ${weatherDesc}, ${timeDesc}, nature and city blend, national geographic style`,
        `urban life in ${locationQuery}, ${weatherDesc}, ${timeDesc}, wet surfaces, cinematic composition, unreal engine 5 render`
      ];

      // Pollinations URL'lerini oluştur
      const newImages = prompts.map((prompt, index) => {
        const seed = Math.floor(Math.random() * 50000) + index;
        // flux-realism modeli ile daha gerçekçi sonuçlar
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&model=flux-realism&seed=${seed}`;
      });

      setImages(newImages);
      setCurrentIndex(0);
    };

    generateImageSet();
  }, [city, country, isDay, weatherCode]);

  // Slayt Geçişi (5 Saniye)
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      
      {/* Resimler Listesi - Crossfade Efekti */}
      {images.map((imgUrl, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
           <img
            src={imgUrl}
            alt="Background"
            className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_infinite]" 
          />
        </div>
      ))}

      {/* Görseller Yüklenirken Varsayılan */}
      {images.length === 0 && (
          <div className="absolute inset-0 bg-slate-900 w-full h-full" />
      )}
      
      {/* Okunabilirlik Katmanları */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" /> 
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-20" />

    </div>
  );
};

export default Background;
