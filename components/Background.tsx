
import React, { useEffect, useState, useRef } from 'react';

interface BackgroundProps {
  city: string;
  weatherCode?: number;
  isDay?: number;
}

const Background: React.FC<BackgroundProps> = ({ city, weatherCode, isDay }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Önceki prop'ları takip et (Gereksiz render'ı önlemek için)
  const prevPropsRef = useRef<{city: string, isDay?: number}>({ city: '', isDay: undefined });

  useEffect(() => {
    const prev = prevPropsRef.current;
    
    // Sadece şehir veya gece/gündüz değişirse yeni set üret
    if (city === prev.city && isDay === prev.isDay) return;
    
    prevPropsRef.current = { city, isDay };

    const generateImageSet = () => {
      const condition = isDay === 0 ? "night time, city lights, cinematic" : "daylight, sunny, blue sky";
      
      // Şehrin farklı yönlerini gösteren 4 farklı prompt şablonu
      const prompts = [
        `iconic famous landmark of ${city}, ${condition}, highly detailed, 8k, photorealistic`,
        `historical architecture in ${city} city center, ${condition}, street level, wide angle`,
        `panoramic view of ${city} skyline, ${condition}, national geographic style`,
        `famous city square or street in ${city}, ${condition}, cinematic lighting`
      ];

      // Pollinations URL'lerini oluştur
      const newImages = prompts.map((prompt, index) => {
        // Seed'i rastgele vererek her seferinde (ve her layerda) farklı görsel gelmesini sağla
        const seed = Math.floor(Math.random() * 10000) + index;
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&nologo=true&model=flux-realism&seed=${seed}`;
      });

      setImages(newImages);
      setCurrentIndex(0);
    };

    generateImageSet();
  }, [city, isDay]);

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
      
      {/* Resimler Listesi - Crossfade Efekti için hepsi render edilir ama opacity ile oynanır */}
      {images.map((imgUrl, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-[65%] transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
           <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* Görseller Yüklenirken Gösterilecek Varsayılan Arka Plan */}
      {images.length === 0 && (
          <div className="absolute inset-0 bg-slate-900 w-full h-full" />
      )}
      
      {/* Gradient Overlay (Yazıların okunması ve zeminle birleşmesi için) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-40% to-slate-900 to-60% h-full pointer-events-none z-20 dark:to-slate-900" />
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pointer-events-none z-20" />

    </div>
  );
};

export default Background;
