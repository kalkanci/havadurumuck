import { useState, useCallback, useEffect, useRef } from 'react';
import { GeoLocation, WeatherData, WeatherAlert } from '../types';
import { fetchWeather, getDetailedAddress } from '../services/weatherService';
import { checkWeatherAlerts } from '../utils/helpers';

export const useWeatherApp = () => {
  // Initialize location from cache if available for instant load
  const [location, setLocationState] = useState<GeoLocation | null>(() => {
      try {
          const saved = localStorage.getItem('cached_location');
          return saved ? JSON.parse(saved) : null;
      } catch {
          return null;
      }
  });

  // Initialize weather from cache to show something immediately
  const [weather, setWeather] = useState<WeatherData | null>(() => {
      try {
          const saved = localStorage.getItem('cached_weather');
          return saved ? JSON.parse(saved) : null;
      } catch {
          return null;
      }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Keep a ref to weather for use in callbacks without triggering dependency loops
  const weatherRef = useRef(weather);
  useEffect(() => {
      weatherRef.current = weather;
  }, [weather]);

  // Load alerts from cached weather on mount if available
  useEffect(() => {
      if (weather) {
          setAlerts(checkWeatherAlerts(weather));
      }
  }, []);

  const handleLocationError = useCallback((msg: string) => {
      // If no location at all (and no cache), fallback to Istanbul
      setLocationState(prev => {
          if (!prev) {
              const defaultLoc = {
                id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
              };
              return defaultLoc;
          }
          return prev;
      });

      // If we already had a location (prev), we just show error but keep old location
      setError(msg);
      setLoading(false);
      setGpsError(true);
  }, []);

  const loadWeather = useCallback(async (isRefresh = false) => {
    if (!location) return;

    // If we are refreshing or don't have weather, show loading
    if (isRefresh || !weatherRef.current) {
        setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchWeather(location.latitude, location.longitude);
      setWeather(data);
      const generatedAlerts = checkWeatherAlerts(data);
      setAlerts(generatedAlerts);

      // Save to cache
      localStorage.setItem('cached_weather', JSON.stringify(data));
      localStorage.setItem('cached_location', JSON.stringify(location));

      setIsOffline(false);
      if (location.country !== 'GPS') setGpsError(false);

    } catch (err) {
      console.warn("Weather fetch failed, checking cache...", err);

      // If we have weather data (loaded from init or previous success), we enter offline mode
      if (weatherRef.current) {
          setIsOffline(true);
          // Recalculate alerts just in case
          setAlerts(checkWeatherAlerts(weatherRef.current));
      } else {
          // No cache, real error
          setError('Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.');
          setIsOffline(false);
      }
    } finally {
      setLoading(false);
    }
  }, [location]);

  const handleCurrentLocation = useCallback(() => {
    setLoading(true);
    setGpsError(false);
    // Clear weather to ensure no stale data is shown while fetching new GPS location
    setWeather(null);

    if (!navigator.geolocation) {
      handleLocationError('Cihazınız konum özelliğini desteklemiyor.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const details = await getDetailedAddress(latitude, longitude);

            const loc: GeoLocation = {
              id: Date.now(),
              name: details.city,
              latitude,
              longitude,
              country: details.country || 'Konum',
              countryCode: details.countryCode,
              subtext: details.address,
              admin1: details.country
            };
            setLocationState(loc);
        } catch (e) {
            handleLocationError('Adres çözümlenemedi.');
        }
      },
      (err) => {
        console.warn("GPS Error:", err);
        handleLocationError('Konum alınamadı.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [handleLocationError]);

  // Wrapper for setLocation to clear weather on change
  const setLocation = useCallback((newLoc: GeoLocation | null | ((prev: GeoLocation | null) => GeoLocation | null)) => {
      // Determine new location ID to check if it changed
      // Since setState can take a function, this is tricky.
      // But we mostly use setLocation(obj).
      // Let's just clear weather if it's a direct object and different.
      // Or safer: just clear weather.
      setWeather(null);
      setLocationState(newLoc);
  }, []);

  // Trigger load when location changes
  useEffect(() => {
    if (location) {
        loadWeather();
    }
  }, [location, loadWeather]);

  return {
      weather,
      location,
      loading,
      error,
      alerts,
      gpsError,
      isOffline,
      loadWeather,
      handleCurrentLocation,
      setLocation
  };
};
