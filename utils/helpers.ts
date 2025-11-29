
import { CurrentWeather, AdviceResponse, WeatherData, WeatherAlert, DailyForecast, AirQuality } from '../types';

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

// Akıllı Tavsiye Motoru (Local Logic)
export const generateSmartAdvice = (weather: WeatherData): AdviceResponse => {
  const { current, daily, air_quality } = weather;
  const temp = current.temperature_2m;
  const code = current.weather_code;
  const wind = current.wind_speed_10m;
  const uv = daily.uv_index_max[0] || 0;
  const rainProb = daily.precipitation_probability_max[0] || 0;
  
  let mood = "Dengeli";
  let advice = "Hava koşulları mevsim normallerinde seyrediyor.";
  let activities: string[] = ["Yürüyüş", "Kitap Okuma", "Müzik Dinleme"];

  // Logic Tree for Weather Conditions
  if (code >= 95) { // Thunderstorm
     mood = "Fırtınalı";
     advice = "Dışarıda fırtına riski var. Mecbur kalmadıkça dışarı çıkmaman ve güvenli alanlarda kalman en iyisi.";
     activities = ["Film Maratonu", "Ev Düzenleme", "Yemek Yapma"];
  } 
  else if (code >= 71) { // Snow
     mood = "Büyülü Beyaz";
     advice = "Hava karlı ve soğuk. Dışarı çıkacaksan sıkı giyin ve kaygan zeminlere dikkat et. Manzaranın tadını çıkar!";
     activities = ["Kardan Adam Yapma", "Sıcak Çikolata", "Manzara İzleme"];
  } 
  else if (code >= 51 || rainProb > 80) { // Rain
     mood = "Yağmurlu";
     advice = "Şemsiyeni almadan çıkma. Islanmak istemiyorsan kapalı mekan aktivitelerini tercih edebilirsin.";
     activities = ["Kahve Keyfi", "Müze Gezisi", "Kapalı Sporlar"];
  } 
  else if (temp > 32) { // Extreme Hot
     mood = "Kavurucu";
     advice = "Hava çok sıcak! Güneş çarpmasına karşı dikkatli ol, bol su tüket ve gölgede kalmaya çalış.";
     activities = ["Yüzme", "Dondurma Keyfi", "Kliması Olan Yerler"];
  } 
  else if (temp < 0) { // Freezing
     mood = "Dondurucu";
     advice = "Hava ısırıyor! Atkı, bere ve eldivenlerini takmadan dışarı adım atma.";
     activities = ["Sıcak Kafe", "Sinema", "Evde Oyun Gecesi"];
  } 
  else if (wind > 35) { // Windy
     mood = "Rüzgarlı";
     advice = "Rüzgar oldukça sert esiyor. Şapkam uçmasın diyorsan dikkatli ol, saçların dağılabilir!";
     activities = ["Uçurtma Uçurma", "Hızlı Yürüyüş", "Fotoğrafçılık"];
  } 
  else if (code <= 1 && uv > 6) { // Clear & High UV
     mood = "Güneşli";
     advice = "Harika bir gün ama UV indeksi yüksek. Dışarı çıkarken güneş kremi sürmeyi ve gözlük takmayı unutma.";
     activities = ["Piknik", "Bisiklet Turu", "Doğa Yürüyüşü"];
  } 
  else if (temp >= 15 && temp <= 25 && code <= 2) { // Perfect
     mood = "Mükemmel";
     advice = "Hava tam gezmelik! Ne çok sıcak ne çok soğuk. Bu güzel havanın tadını mutlaka çıkar.";
     activities = ["Şehir Turu", "Park Gezisi", "Arkadaş Buluşması"];
  }

  // Air Quality Override
  if (air_quality && air_quality.european_aqi > 80) {
      advice += " Ayrıca hava kalitesi biraz düşük, hassasiyetin varsa maske takmayı düşünebilirsin.";
  }

  return { mood, advice, activities };
};

// Fallback is simply calling the smart advice now
export const generateFallbackAdvice = (current: CurrentWeather): AdviceResponse => {
    // Mock weather data structure for simple fallback
    return generateSmartAdvice({
        current,
        daily: { uv_index_max: [0], precipitation_probability_max: [0] } as any,
        hourly: {} as any,
        latitude: 0, longitude: 0, generationtime_ms: 0, utc_offset_seconds: 0, elevation: 0, current_units: {}
    });
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
