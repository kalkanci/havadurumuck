import React, { useEffect, useState } from 'react';

interface BackgroundProps {
  city: string;
}

const Background: React.FC<BackgroundProps> = ({ city }) => {
  const [currentImg, setCurrentImg] = useState<string>('');
  const [nextImg, setNextImg] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!city) return;

    // Use Pollinations AI for cinematic images
    const encodedCity = encodeURIComponent(city);
    // Add timestamp to prevent caching the same image if needed, though here we want stability for same city
    // Use a seed based on city name to get consistent but unique result for that city
    const seed = Array.from(city).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const newUrl = `https://image.pollinations.ai/prompt/cinematic%20panoramic%20wide%20shot%20photography%20of%20${encodedCity}%20city%20landmark%20weather%20moody?width=1080&height=1920&nologo=true&seed=${seed}`;

    setNextImg(newUrl);
    setIsTransitioning(true);
  }, [city]);

  const handleImageLoad = () => {
    // When next image is ready, swap them after a short delay for CSS transition
    setCurrentImg(nextImg);
    setIsTransitioning(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      {/* Current Image (Back buffer) */}
      <img
        src={currentImg}
        alt="Background"
        className="absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out opacity-100"
      />
      
      {/* Next Image (Front buffer for crossfade) */}
      <img
        src={nextImg}
        alt="Next Background"
        onLoad={handleImageLoad}
        className={`absolute inset-0 w-full h-[65%] object-cover transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Stronger Gradient Overlay for Fade Out to Bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/60 to-slate-900 via-50% to-90% h-full pointer-events-none" />
      
      {/* Additional bottom fade to ensure seamless transition to content background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Background;
