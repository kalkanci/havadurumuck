
import { WeatherData, GeoLocation, AirQuality, PublicHoliday } from '../types';
import { fetchWithRetry } from '../utils/api';
import { AppError, ErrorCode } from '../utils/errors';

const SEARCH_API_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const HOLIDAY_API_URL = 'https://date.nager.at/api/v3/PublicHolidays';

// Sokak/Mahalle detayını bulmak için Nominatim servisi (OpenStreetMap)
export const getDetailedAddress = async (lat: number, lon: number): Promise<{ city: string, address: string, country: string, countryCode: string }> => {
  try {
    const res = await fetchWithRetry(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'AtmosferAI/1.0'
      }
    });
    const data = await res.json();
    const addr = data.address || {};
    
    // 1. En Detaylı İsim (Mahalle, Köy, Semt) - Ana Başlık Olacak
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
        mainName = specificLocation;
        const parts = [];
        if (district) parts.push(district);
        if (province && province !== district) parts.push(province);
        if (parts.length === 0) parts.push(country);
        subText = parts.join(', ');

    } else if (district) {
        mainName = district;
        const parts = [];
        if (province && province !== district) parts.push(province);
        parts.push(country);
        subText = parts.join(', ');
    } else {
        mainName = province || country || 'Bilinmeyen Konum';
        subText = addr.country || '';
    }

    return { city: mainName, address: subText, country: country, countryCode };
  } catch (error) {
    console.warn("Reverse geocoding failed", error);
    return { city: 'Konum Bulunamadı', address: '', country: '', countryCode: '' };
  }
};

// OpenStreetMap (Nominatim) kullanarak sokak/cadde araması
export const searchCity = async (query: string): Promise<GeoLocation[]> => {
  if (query.length < 2) return [];
  try {
    // addressdetails=1: Detaylı adres parçalarını getirir
    // limit=5: En fazla 5 sonuç
    const res = await fetchWithRetry(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&accept-language=tr`, {
        headers: {
            'User-Agent': 'AtmosferAI/1.0'
        }
    });
    const data = await res.json();
    
    if (!data || data.length === 0) return [];

    return data.map((item: any) => {
        const addr = item.address || {};
        
        // Görünen ana isim (Sokak, Mahalle veya Şehir)
        const name = addr.road || addr.neighbourhood || addr.suburb || addr.town || addr.city || addr.county || item.name;
        
        // Alt metin (İlçe, İl, Ülke)
        const parts = [];
        if (addr.town && addr.town !== name) parts.push(addr.town);
        if (addr.city && addr.city !== name) parts.push(addr.city);
        if (addr.country) parts.push(addr.country);

        return {
            id: parseInt(item.place_id), // Nominatim place_id
            name: name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: addr.country || '',
            countryCode: addr.country_code ? addr.country_code.toUpperCase() : '',
            admin1: addr.state || addr.province || addr.city, // İl bilgisi
            subtext: parts.join(', ')
        };
    });

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
    forecast_days: '16',
    // Force Metric Units
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  // 2. Hava Kalitesi Verisi (Ayrı endpoint)
  const aqiParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,pm10,pm2_5,dust,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
    timezone: 'auto'
  });

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetchWithRetry(`${WEATHER_API_URL}?${weatherParams.toString()}`),
      fetchWithRetry(`${AIR_QUALITY_API_URL}?${aqiParams.toString()}`)
    ]);

    if (!weatherRes.ok) {
        const errorText = await weatherRes.text();
        console.error("Open-Meteo API Error:", errorText);
        throw new AppError(`Hava durumu servisi yanıt vermiyor (${weatherRes.status})`, ErrorCode.API_ERROR);
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
    if (error instanceof AppError) {
        throw error;
    }
    console.error("API Error:", error);
    throw new AppError('Hava durumu verisi alınamadı.', ErrorCode.API_ERROR, error);
  }
};

export const fetchHolidays = async (year: number, countryCode: string): Promise<PublicHoliday[]> => {
    if (!countryCode) return [];
    try {
        const res = await fetchWithRetry(`${HOLIDAY_API_URL}/${year}/${countryCode}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data || [];
    } catch (error) {
        console.warn("Holiday fetch error:", error);
        return [];
    }
};
