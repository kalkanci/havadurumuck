import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { WeatherData, GeoLocation } from '../types';
import { getWeatherLabel } from '../constants';
import { convertTemperature } from '../utils/helpers';

interface ShareButtonProps {
    weather: WeatherData;
    location: GeoLocation;
    unit: 'celsius' | 'fahrenheit';
}

const ShareButton: React.FC<ShareButtonProps> = ({ weather, location, unit }) => {
    const [copied, setCopied] = useState(false);

    const tempUnit = unit === 'celsius' ? '°C' : '°F';
    const currentTemp = Math.round(convertTemperature(weather.current.temperature_2m, unit));
    const condition = getWeatherLabel(weather.current.weather_code);

    const shareText = `${location.name} konumunda anlık hava durumu: ${currentTemp}${tempUnit} ve ${condition}. Atmosfer AI üzerinden detayları inceleyin!`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Atmosfer AI Hava Durumu',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                console.warn('Share cancelled or failed', err);
            }
        } else {
            // Fallback for browsers that do not support Web Share API
            navigator.clipboard.writeText(shareText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    return (
        <button
            onClick={handleShare}
            aria-label="Hava Durumunu Paylaş"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mb-6 active:scale-95 transition-all text-white/80 hover:text-white"
        >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} className="text-blue-400" />}
            <span className="text-xs font-bold tracking-wide uppercase">{copied ? 'Kopyalandı' : 'Paylaş'}</span>
        </button>
    );
};

export default ShareButton;
