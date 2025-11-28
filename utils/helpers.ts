import { CurrentWeather, AdviceResponse } from '../types';

// Haversine formula for distance
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

// Basit statik tavsiye (Gemini yüklenirken veya hata durumunda yedek olarak kullanılır)
export const generateFallbackAdvice = (current: CurrentWeather): AdviceResponse => {
  const temp = current.temperature_2m;
  let mood = "Hava Normal";
  let advice = "Hava koşulları mevsim normallerinde, keyfini çıkarın.";
  let activities = ["Yürüyüş", "Fotoğraf Çekimi"];

  if (temp < 10) {
    mood = "Soğuk ve Dinç";
    advice = "Hava oldukça soğuk, sıkı giyinmeyi ihmal etmeyin.";
    activities = ["Sıcak Kahve", "Kitap Okuma", "Sinema"];
  } else if (temp > 30) {
    mood = "Sıcak ve Enerjik";
    advice = "Hava çok sıcak, bol su tüketin ve gölgede kalın.";
    activities = ["Yüzme", "AVM Gezisi", "Dondurma Keyfi"];
  }

  return { mood, advice, activities };
};

// 24 Saatlik Format (HH:mm)
export const formatTime = (isoString: string) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};