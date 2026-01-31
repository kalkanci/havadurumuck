
import React, { useState } from 'react';
import { AlertTriangle, CloudLightning, Thermometer, Wind, Sun, Info, X, ShieldAlert } from 'lucide-react';
import { WeatherAlert } from '../types';
import { triggerHapticFeedback } from '../utils/helpers';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<number[]>(alerts.map((_, i) => i));

  if (alerts.length === 0 || visibleAlerts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
        case 'storm': return <CloudLightning size={24} className="animate-pulse" />;
        case 'heat': return <Thermometer size={24} className="text-orange-100" />;
        case 'cold': return <Thermometer size={24} className="text-blue-100" />;
        case 'wind': return <Wind size={24} className="animate-pulse" />;
        case 'uv': return <Sun size={24} className="animate-spin-slow" />;
        case 'air': return <ShieldAlert size={24} />;
        default: return <Info size={24} />;
    }
  };

  const getStyles = (level: string) => {
      switch(level) {
          case 'critical': return 'bg-red-500/80 backdrop-blur-md border-red-400 text-white shadow-red-900/20';
          case 'warning': return 'bg-orange-500/80 backdrop-blur-md border-orange-400 text-white shadow-orange-900/20';
          default: return 'bg-blue-500/80 backdrop-blur-md border-blue-400 text-white shadow-blue-900/20';
      }
  };

  const dismiss = (index: number) => {
      setVisibleAlerts(prev => prev.filter(i => i !== index));
      triggerHapticFeedback(10);
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
        {alerts.map((alert, index) => {
            if (!visibleAlerts.includes(index)) return null;

            return (
                <div 
                    key={index} 
                    className={`relative p-4 rounded-3xl border flex items-start gap-4 animate-fade-in-up ${getStyles(alert.level)}`}
                >
                    <div className="p-2 bg-white/20 rounded-full shrink-0">
                        {getIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="font-bold text-lg leading-tight mb-1 flex items-center gap-2">
                            {alert.title}
                            {alert.level === 'critical' && <AlertTriangle size={16} />}
                        </h4>
                        <p className="text-sm font-medium opacity-90 leading-relaxed">
                            {alert.message}
                        </p>
                    </div>

                    <button 
                        onClick={() => dismiss(index)}
                        className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            );
        })}
    </div>
  );
};

export default WeatherAlerts;
