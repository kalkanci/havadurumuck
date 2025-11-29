
import { CurrentWeather, AdviceResponse, WeatherData, WeatherAlert } from '../types';

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

// Basit statik tavsiye
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

// Rüzgar Yönü Çevirici
export const getWindDirection = (degrees: number): string => {
  const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Gün Uzunluğu Hesaplayıcı
export const getDayDuration = (sunrise: string, sunset: string): string => {
  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} sa ${minutes} dk`;
};

// --- HAVA DURUMU UYARILARI ANALİZİ ---
export const checkWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    const current = weather.current;
    const daily = weather.daily;

    // 1. Fırtına / Şiddetli Yağmur (Code 95-99, 65, 82)
    const severeCodes = [95, 96, 99, 65, 82];
    if (severeCodes.includes(current.weather_code)) {
        alerts.push({
            type: 'storm',
            level: 'critical',
            title: 'Fırtına Uyarısı',
            message: 'Dışarıda şiddetli hava koşulları hakim. Mecbur kalmadıkça güvenli alanlardan ayrılmayın.'
        });
    }

    // 2. Aşırı Sıcaklık (> 35°C)
    if (current.temperature_2m > 35) {
        alerts.push({
            type: 'heat',
            level: 'warning',
            title: 'Aşırı Sıcak',
            message: `Sıcaklık ${Math.round(current.temperature_2m)}°C'ye ulaştı. Bol su tüketin ve güneşten korunun.`
        });
    }

    // 3. Aşırı Soğuk / Don (< 0°C)
    if (current.temperature_2m < 0) {
        alerts.push({
            type: 'cold',
            level: 'warning',
            title: 'Don Tehlikesi',
            message: 'Sıcaklık sıfırın altında. Buzlanmaya karşı dikkatli olun ve sıkı giyinin.'
        });
    }

    // 4. Şiddetli Rüzgar (> 50 km/s)
    if (current.wind_speed_10m > 50) {
        alerts.push({
            type: 'wind',
            level: 'warning',
            title: 'Şiddetli Rüzgar',
            message: `Rüzgar hızı ${current.wind_speed_10m} km/s. Çatı uçması ve ağaç devrilmelerine karşı dikkatli olun.`
        });
    }

    // 5. Yüksek UV İndeksi (> 8)
    const maxUv = daily.uv_index_max[0];
    if (maxUv > 8) {
         alerts.push({
            type: 'uv',
            level: 'critical',
            title: 'Çok Yüksek UV',
            message: 'Güneş ışınları çok zararlı seviyede. 11:00-16:00 arası doğrudan güneşe maruz kalmayın.'
        });
    }

    // 6. Hava Kalitesi (AQI > 100)
    if (weather.air_quality && weather.air_quality.european_aqi > 80) {
        alerts.push({
            type: 'air',
            level: 'warning',
            title: 'Kötü Hava Kalitesi',
            message: 'Hava kirliliği yüksek seviyede. Hassas grupların dışarı çıkmaması önerilir.'
        });
    }

    // 7. Yağmur Uyarısı (Şu an yok ama önümüzdeki saatlerde yüksek ihtimal varsa)
    // Sadece ilk 3 saate bakıyoruz
    if (current.precipitation === 0 && weather.hourly.precipitation_probability) {
        const upcomingRain = weather.hourly.precipitation_probability.slice(0, 3).some(p => p > 70);
        if (upcomingRain) {
             alerts.push({
                type: 'rain',
                level: 'info',
                title: 'Yağmur Bekleniyor',
                message: 'Önümüzdeki birkaç saat içinde yüksek yağış ihtimali var. Şemsiyenizi yanınıza alın.'
            });
        }
    }

    return alerts;
};
