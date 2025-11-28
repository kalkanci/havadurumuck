import React from 'react';

interface WeatherOverlayProps {
  weatherCode: number;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weatherCode }) => {
  // WMO Codes:
  // 0-1: Clear/Mainly Clear
  // 2-3: Cloudy
  // 45, 48: Fog
  // 51-67, 80-82: Rain/Drizzle
  // 71-77, 85-86: Snow
  // 95-99: Thunderstorm

  let overlayContent = null;

  if (weatherCode === 0 || weatherCode === 1) {
    // Sun Glow (Right top corner)
    overlayContent = (
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-[sun-glow_5s_infinite_ease-in-out] pointer-events-none" />
    );
  } else if (weatherCode === 45 || weatherCode === 48) {
    // Fog
    overlayContent = (
      <div className="absolute inset-0 bg-slate-400/10 blur-xl animate-[fog-flow_10s_infinite_linear] pointer-events-none" />
    );
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || (weatherCode >= 95)) {
    // Rain
    overlayContent = (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute -top-full left-0 w-full h-full weather-rain" style={{ animationDuration: '1s', left: '10%' }}></div>
        <div className="absolute -top-full left-0 w-full h-full weather-rain" style={{ animationDuration: '1.2s', left: '50%' }}></div>
        <div className="absolute -top-full left-0 w-full h-full weather-rain" style={{ animationDuration: '0.9s', left: '80%' }}></div>
      </div>
    );
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    // Snow
    overlayContent = (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-full left-0 w-full h-full weather-snow"></div>
        <div className="absolute -top-full left-0 w-full h-full weather-snow" style={{ animationDuration: '6s', backgroundSize: '20px 20px', opacity: 0.5 }}></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
       {overlayContent}
    </div>
  );
};

export default WeatherOverlay;