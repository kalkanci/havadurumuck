
import { WeatherData, GeoLocation, AirQuality, PublicHoliday } from '../types';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const HOLIDAY_API_URL = 'https://date.nager.at/api/v3/PublicHolidays';

// Sokak/Mahalle detayını bulmak için Nominatim servisi (OpenStreetMap)
export const getDetailedAddress = async (lat: number, lon: number): Promise<{ city: string, address: string, country: string, countryCode: string }> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'AtmosferAI/1.0'
      }
    });
    const data = await res.json();
    const addr = data.address || {};
    
    // 1. En Detaylı İsim (Mahalle, Köy, Semt) - Ana Başlık Olacak
    // Öncelik: Mahalle > Semt > Köy > Cadde > İlçe
    const specificLocation = 
      addr.neighbourhood || 
      addr.suburb || 
      addr.village || 
      addr.road;

    // 2. İlçe Bilgisi
    const district = 
      addr.town || 
      addr.district || 
      addr.city_district || 
      addr.county || 
      addr.municipality;

    // 3. İl Bilgisi
    const province = 
      addr.city || 
      addr.province || 
      addr.state || 
      addr.region;

    // Ülke
    const country = addr.country || 'Dünya';
    const countryCode = addr.country_code ? addr.country_code.toUpperCase() : '';

    let mainName = '';
    let subText = '';

    if (specificLocation) {
        // Durum 1: Mahalle/Köy bilgisi mevcut (Örn: Barbaros Mahallesi)
        mainName = specificLocation;
        
        // Alt Metin: İlçe, İl (Örn: Bağcılar, İstanbul)
        const parts = [];
        if (district) parts.push(district);
        if (province && province !== district) parts.push(province);
        
        // Eğer ilçe yoksa sadece ili ekle, o da yoksa ülkeyi ekle
        if (parts.length === 0) parts.push(country);
        
        subText = parts.join(', ');

    } else if (district) {
        // Durum 2: Sadece İlçe seviyesinde detay var (Örn: Kadıköy)
        mainName = district;
        
        // Alt Metin: İl, Ülke (Örn: İstanbul, Türkiye)
        const parts = [];
        if (province && province !== district) parts.push(province);
        parts.push(country);
        
        subText = parts.join(', ');
        
    } else {
        // Durum 3: Sadece İl veya daha genel bilgi var
        mainName = province || country || 'Bilinmeyen Konum';
        subText = addr.country || '';
    }

    return { city: mainName, address: subText, country: country, countryCode };
  } catch (error) {
    console.warn("Reverse geocoding failed", error);
    return { city: 'Konum Bulunamadı', address: '', country: '', countryCode: '' };
  }
};

export const searchCity = async (query: string): Promise<GeoLocation[]> => {
  if (query.length < 2) return [];
  try {
    const res = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await res.json();
    
    if (!data.results) return [];

    return data.results.map((item: any) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        countryCode: item.country_code, // Open-Meteo returns country_code
        admin1: item.admin1
    }));

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
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,dew_point_2m',
    // Detailed hourly data for popups:
    hourly: 'temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,precipitation_probability,uv_index,relative_humidity_2m,apparent_temperature,surface_pressure,pressure_msl',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
    forecast_days: '16'
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

export const fetchHolidays = async (year: number, countryCode: string): Promise<PublicHoliday[]> => {
    if (!countryCode) return [];
    try {
        const res = await fetch(`${HOLIDAY_API_URL}/${year}/${countryCode}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data || [];
    } catch (error) {
        console.warn("Holiday fetch error:", error);
        return [];
    }
};
