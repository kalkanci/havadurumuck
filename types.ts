export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // Province/State
  subtext?: string; // Sokak, Mahalle vb. detaylı adres
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  surface_pressure: number;
  cloud_cover: number;
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  is_day: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[]; // Yeni: Rüzgar Yönü
  precipitation_probability: number[];
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  moon_phase: number[]; // Yeni: Ay Fazı (0.0 - 1.0)
}

export interface AirQuality {
  european_aqi: number;
  pm10: number;
  pm2_5: number;
  dust: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  elevation: number;
  current_units: any;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  air_quality?: AirQuality;
}

export interface UserSettings {
  highAccuracyGPS: boolean;
}

export interface AdviceResponse {
  mood: string;
  advice: string;
  activities: string[];
}