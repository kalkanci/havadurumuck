
import React from 'react';

interface WeatherOverlayProps {
  weatherCode: number;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weatherCode }) => {
  // WMO Codes Mapping
  // 0-1: Clear/Mainly Clear (Sun)
  // 2-3: Cloudy
  // 45, 48: Fog
  // 51-67, 80-82: Rain/Drizzle
  // 71-77, 85-86: Snow
  // 95-99: Thunderstorm

  const renderEffect = () => {
    // --- CLEAR / SUNNY ---
    if (weatherCode === 0 || weatherCode === 1) {
      return (
        <div className="absolute top-[-20%] right-[-20%] w-[120vw] h-[120vw] weather-sun-glow pointer-events-none opacity-40" />
      );
    }

    // --- FOG ---
    if (weatherCode === 45 || weatherCode === 48 || weatherCode === 2 || weatherCode === 3) {
       // Bulutlu havalarda da hafif sis efekti, ama altlara doğru azalan
       const opacity = weatherCode === 2 || weatherCode === 3 ? 0.2 : 0.4;
       return (
         <>
           <div className="absolute inset-0 weather-fog pointer-events-none" style={{ animationDuration: '30s', opacity }} />
         </>
       );
    }

    // --- RAIN ---
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || (weatherCode >= 95)) {
      // Reduced drop count even more for performance and subtlety
      const dropCount = weatherCode >= 61 ? 20 : 10; 
      const drops = Array.from({ length: dropCount }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 0.5 + Math.random() * 0.5;
        return (
          <div 
            key={i} 
            className="weather-rain" 
            style={{ 
              left: `${left}%`, 
              animationDelay: `${delay}s`, 
              animationDuration: `${duration}s`,
              opacity: 0.3 // Even more transparent
            }} 
          />
        );
      });

      return <div className="absolute inset-0 pointer-events-none overflow-hidden">{drops}</div>;
    }

    // --- SNOW ---
    if (weatherCode >= 71 && weatherCode <= 77) {
       const flakeCount = 20; // Reduced snowflake count
       const flakes = Array.from({ length: flakeCount }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 4 + Math.random() * 4;
        const size = 3 + Math.random() * 4;
        return (
          <div 
            key={i} 
            className="weather-snow" 
            style={{ 
              left: `${left}%`, 
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`, 
              animationDuration: `${duration}s`,
              opacity: 0.5
            }} 
          />
        );
      });
      return <div className="absolute inset-0 pointer-events-none overflow-hidden">{flakes}</div>;
    }

    return null;
  };

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        // CSS Mask ile aşağı doğru silinme efekti (Gradient Fade)
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)'
      }}
    >
       {renderEffect()}
    </div>
  );
};

export default WeatherOverlay;
