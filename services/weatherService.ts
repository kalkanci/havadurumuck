import { WeatherData, GeoLocation, AirQuality } from '../types';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Sokak/Mahalle detayını bulmak için Nominatim servisi (OpenStreetMap)
export const getDetailedAddress = async (lat: number, lon: number): Promise<{ city: string, address: string }> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'AtmosferAI/1.0'
      }
    });
    const data = await res.json();
    const addr = data.address || {};
    
    // Öncelik Sıralaması: Mahalle > Semt > Köy > İlçe > Şehir
    // Bu 'city' değişkeni ana başlık (Büyük Font) olacak.
    let specificLocationName = 
      addr.neighbourhood || 
      addr.suburb || 
      addr.village || 
      addr.town || 
      addr.district || 
      addr.city_district ||
      'Bilinmeyen Konum';

    // Eğer mahalle yoksa ama sokak varsa, sokağı başlık yapalım
    if (specificLocationName === 'Bilinmeyen Konum' && addr.road) {
      specificLocationName = addr.road;
    }

    // Alt metin oluşturma: İlçe, İl, Ülke
    const contextParts = [];
    
    // Eğer başlıkta sokak adı yoksa ve sokak verisi varsa, başa ekle
    if (addr.road && specificLocationName !== addr.road) {
        contextParts.push(addr.road);
    }

    // İlçe/Semt (Eğer başlıkta kullanılmadıysa)
    if (addr.town && specificLocationName !== addr.town) contextParts.push(addr.town);
    else if (addr.district && specificLocationName !== addr.district) contextParts.push(addr.district);
    
    // İl (Province)
    if (addr.city && specificLocationName !== addr.city) contextParts.push(addr.city);
    else if (addr.province && specificLocationName !== addr.province) contextParts.push(addr.province);
    
    const fullAddress = contextParts.slice(0, 2).join(', '); // Çok uzamaması için ilk 2 parçayı al

    return { city: specificLocationName, address: fullAddress };
  } catch (error) {
    console.warn("Reverse geocoding failed", error);
    return { city: 'GPS Konumu', address: '' };
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
    // wind_direction_10m eklendi
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max,moon_phase',
    // moon_phase eklendi
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

    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    
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