
import { CurrentWeather, AdviceResponse, WeatherData, WeatherAlert, DailyForecast, AirQuality } from '../types';

export const convertTemperature = (value: number, unit: 'celsius' | 'fahrenheit'): number => {
  if (unit === 'celsius') return value;
  return (value * 9 / 5) + 32;
};

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

// Akıllı Tavsiye Motoru (Gelişmiş Mantık)
export const generateSmartAdvice = (weather: WeatherData, unit: 'celsius' | 'fahrenheit' = 'celsius'): AdviceResponse => {
  const { current, daily, air_quality } = weather;
  const temp = current.temperature_2m;
  const code = current.weather_code;
  const wind = current.wind_speed_10m;
  const isDay = current.is_day === 1;
  const rainProb = daily.precipitation_probability_max[0] || 0;
  
  let mood = "Dengeli";
  let advice = "Hava koşulları standart seyrediyor.";
  let activities: string[] = [];

  // --- 1. GECE MODU ---
  if (!isDay) {
      if (code <= 2) { // Açık Gece
          mood = "Huzurlu Gece";
          advice = "Gökyüzü açık ve sakin. Şehrin ışıklarından uzaklaşabilirsen harika bir yıldız manzarası var.";
          activities = ["Yıldız İzleme", "Gece Yürüyüşü", "Sıcak Bir Çay", "Meditasyon"];
      } else if (code >= 51) { // Yağmurlu Gece
          mood = "Melankolik";
          advice = "Dışarıda yağmurun sesi var, içeride ise huzur. Kendine vakit ayırmak için mükemmel bir atmosfer.";
          activities = ["Loş Işıkta Film", "Kitap & Battaniye", "Jazz Müzik", "Uyku Öncesi Yoga"];
      } else { // Bulutlu Gece
          mood = "Sakin";
          advice = "Serin ve kapalı bir gece. Yarınki planlarını gözden geçirmek veya erken uyumak için iyi bir fırsat.";
          activities = ["Cilt Bakımı", "Günlük Yazma", "Podcast Dinleme"];
      }
      return { mood, advice, activities };
  }

  // --- 2. GÜNDÜZ MODU (Hava Olaylarına Göre) ---

  // Fırtına ve Şiddetli Yağış
  if (code >= 95 || code === 82) { 
     mood = "Kaotik";
     advice = "Dışarısı şu an pek tekin değil. Fırtına geçene kadar güvenli ve kuru bir yerde kal.";
     activities = ["Ev Düzenleme", "Yemek Denemeleri", "Online Oyunlar", "Eski Fotoğraflara Bakma"];
  } 
  // Kar Yağışı
  else if (code >= 71) { 
     mood = "Büyülü Beyaz";
     advice = "Şehir beyaza bürünüyor! Soğuğa aldırmayıp bu görsel şölenin tadını çıkarabilirsin.";
     activities = ["Fotoğraf Çekimi", "Salep Keyfi", "Kış Yürüyüşü", "Pencere Kenarı Keyfi"];
  } 
  // Yağmur
  else if (code >= 51 || rainProb > 80) { 
     mood = "Islak & Gri";
     advice = "Gri bulutlar şehre hakim. Islanmayı sevmiyorsan kapalı mekan planları yapmalısın.";
     activities = ["Müze/Galeri Gezisi", "AVM Turu", "Sinema", "Kahve Dükkanı Keşfi"];
  } 
  // Aşırı Sıcak (>32°C)
  else if (temp > 32) { 
     mood = "Kavurucu";
     advice = "Güneş yakıcı seviyede. Dışarıda fazla kalmamaya ve bol sıvı tüketmeye dikkat et.";
     activities = ["Yüzme Havuzu", "Kliması Olan Mekanlar", "Soğuk Kahve Molası", "Siesta"];
  } 
  // Soğuk (<5°C)
  else if (temp < 5) { 
     mood = "Dondurucu";
     advice = "Hava ısırıyor! Kat kat giyinmeden kapıdan çıkma. Sıcak içecekler en iyi dostun olacak.";
     activities = ["Sıcak Çikolata", "Arkadaş Evinde Toplanma", "Termal Giyim Alışverişi"];
  } 
  // Rüzgarlı (>30 km/s)
  else if (wind > 30) { 
     mood = "Rüzgarlı";
     advice = "Rüzgar saçını başını dağıtabilir. Açık alanlarda yürümek biraz zorlayıcı olabilir.";
     activities = ["Uçurtma Uçurma (Varsa)", "Hızlı Tempolu Yürüyüş", "Kapalı Spor Salonu"];
  } 
  // Mükemmel Hava (18-26°C, Açık/Parçalı)
  else if (temp >= 18 && temp <= 26 && code <= 3) { 
     mood = "Enerjik";
     advice = "Hava tam anlamıyla 'gezmelik'. Evde durmak için çok güzel bir gün, dışarı at kendini!";
     activities = ["Yeni Semt Keşfi", "Sahil Yürüyüşü", "Dışarıda Yemek", "Fotoğraf Safarisi"];
  }
  // Standart/Bulutlu
  else {
      mood = "Durağan";
      advice = "Ne çok sıcak, ne çok soğuk. Günlük rutinlerini halletmek için ideal bir gün.";
      activities = ["Alışveriş", "Arkadaş Buluşması", "Kütüphane", "Park Yürüyüşü"];
  }

  // Hava Kalitesi Uyarısı Ekler
  if (air_quality && air_quality.european_aqi > 80) {
      advice += " Dikkat: Hava kirliliği yüksek, açık hava sporlarını erteleyebilirsin.";
  }

  return { mood, advice, activities };
};

// Fallback is simply calling the smart advice now
export const generateFallbackAdvice = (current: CurrentWeather, unit: 'celsius' | 'fahrenheit' = 'celsius'): AdviceResponse => {
    // Mock weather data structure for simple fallback
    return generateSmartAdvice({
        current,
        daily: { uv_index_max: [0], precipitation_probability_max: [0] } as any,
        hourly: {} as any,
        latitude: 0, longitude: 0, generationtime_ms: 0, utc_offset_seconds: 0, elevation: 0, current_units: {}
    }, unit);
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

// Geri Sayım Formatlayıcı (HH:MM:SS)
export const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "00:00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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

// Haptic Feedback Helper
export const triggerHapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
        navigator.vibrate(pattern);
    } catch (e) {
        // Fail silently if not supported or allowed
    }
  }
};

// --- HAVA DURUMU UYARILARI ANALİZİ ---
export const checkWeatherAlerts = (weather: WeatherData, unit: 'celsius' | 'fahrenheit' = 'celsius'): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    const current = weather.current;
    const daily = weather.daily;
    const tempUnit = unit === 'celsius' ? '°C' : '°F';

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
        const displayTemp = Math.round(convertTemperature(current.temperature_2m, unit));
        alerts.push({
            type: 'heat',
            level: 'warning',
            title: 'Aşırı Sıcak',
            message: `Sıcaklık ${displayTemp}${tempUnit}'ye ulaştı. Bol su tüketin ve güneşten korunun.`
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
