
import { AstronomyData } from '../types';
import { translateToTurkish } from './translationService';

const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'DEMO_KEY'; // Rate limits apply.

// Fallback data in case API fails or rate limit is hit
const FALLBACK_DATA: AstronomyData = {
    title: "Yıldızlı Gece (Yedek Görünüm)",
    explanation: "NASA bağlantısında geçici bir sorun oluştuğu için bu yedek görseli görüyorsunuz. Evrenin sonsuzluğu, milyarlarca yıldız ve galaksiyle doludur. Bu görüntü, uzayın derinliklerindeki büyüleyici atmosferi temsil eder.",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop",
    media_type: "image",
    date: new Date().toISOString().split('T')[0]
};

export const fetchAstronomyPicture = async (): Promise<AstronomyData | null> => {
  try {
    const response = await fetch(`${NASA_API_URL}?api_key=${API_KEY}`);
    
    if (!response.ok) {
      console.warn(`NASA API Error: ${response.status}. Using fallback.`);
      return FALLBACK_DATA;
    }

    const data = await response.json();
    
    // Çeviri İşlemi (Paralel)
    try {
        const [trTitle, trExplanation] = await Promise.all([
            translateToTurkish(data.title),
            translateToTurkish(data.explanation)
        ]);
        
        return {
            ...data,
            title: trTitle,
            explanation: trExplanation
        };
    } catch (translateError) {
        console.warn("NASA Data translated failed, using english:", translateError);
        return data; // Çeviri başarısızsa İngilizce devam et
    }

  } catch (error) {
    console.error("Failed to fetch astronomy data:", error);
    // Return fallback instead of null so the card doesn't disappear
    return FALLBACK_DATA;
  }
};
