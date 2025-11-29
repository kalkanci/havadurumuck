
import { WeatherData, GeoLocation, AirQuality } from '../types';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Sokak/Mahalle detayını bulmak için Nominatim servisi (OpenStreetMap)
export const getDetailedAddress = async (lat: number, lon: number): Promise<{ city: string, address: string, country: string }> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'AtmosferAI/1.0'
      }
    });
    const data = await res.json();
    const addr = data.address || {};
    
    // Ana Başlık için Öncelik: İlçe > Şehir > Kasaba
    // "GPS Konumu" yazmaması için hiyerarşiyi tarıyoruz.
    let mainName = 
      addr.town || 
      addr.district || 
      addr.city_district ||
      addr.county ||
      addr.city || 
      addr.province ||
      addr.suburb;

    // Eğer yukarıdakiler yoksa, en kötü ihtimalle köy veya mahalle
    if (!mainName) {
        mainName = addr.village || addr.neighbourhood || addr.road || 'Bilinmeyen Konum';
    }

    // Ülke bilgisini al
    const country = addr.country || 'Dünya';

    // Alt metin (Subtext) için daha detaylı adres oluştur
    const contextParts = [];
    
    // Detay: Mahalle
    if (addr.neighbourhood && mainName !== addr.neighbourhood) contextParts.push(addr.neighbourhood);
    
    // Bağlam: İlçe, İl (Ana başlıkta kullanılmayanı buraya ekle)
    if (addr.town && mainName !== addr.town) contextParts.push(addr.town);
    if (addr.city && mainName !== addr.city) contextParts.push(addr.city);
    if (addr.province && mainName !== addr.province && mainName !== addr.city) contextParts.push(addr.province);
    
    const fullAddress = contextParts.slice(0, 2).join(', ');

    return { city: mainName, address: fullAddress, country: country };
  } catch (error) {
    console.warn("Reverse geocoding failed", error);
    return { city: 'Konum Bulunamadı', address: '', country: '' };
  }
};

export const searchCity = async (query: string): Promise<GeoLocation[]> => {
  if (query.length < 2) return [];
  try {
    const res = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  // 1. Hava Durumu Verisi
  const weatherParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m',
    hourly: 'temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
    forecast_days: '7'
  });

  // 2. Hava Kalitesi Verisi (Ayrı endpoint)
  const aqiParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,pm10,pm2_5,dust',
    timezone: 'auto'
  });

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`${WEATHER_API_URL}?${weatherParams.toString()}`),
      fetch(`${AIR_QUALITY_API_URL}?${aqiParams.toString()}`)
    ]);

    if (!weatherRes.ok) {
        const errorText = await weatherRes.text();
        console.error("Open-Meteo API Error:", errorText);
        throw new Error(`Weather fetch failed: ${weatherRes.status}`);
    }
    
    const weatherData = await weatherRes.json();
    let aqiData: AirQuality | undefined;

    if (aqiRes.ok) {
      const aqiJson = await aqiRes.json();
      if (aqiJson.current) {
        aqiData = aqiJson.current;
      }
    }

    return {
      ...weatherData,
      air_quality: aqiData
    };

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
