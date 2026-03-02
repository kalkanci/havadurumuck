import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError } from '../utils/AppError';

export const useWeatherApp = () => {
  const [location, setLocation] = useState<GeoLocation | null>(() => {
    const saved = localStorage.getItem('atmosfer_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const saved = localStorage.getItem('atmosfer_weather');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('atmosfer_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, temperatureUnit: parsed.temperatureUnit || 'celsius' };
    }
    return { hapticsEnabled: true, temperatureUnit: 'celsius' };
  });

  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (location) localStorage.setItem('atmosfer_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    if (weather) localStorage.setItem('atmosfer_weather', JSON.stringify(weather));
  }, [weather]);

  const haptic = useCallback((pattern?: number | number[]) => {
    if (settings.hapticsEnabled) {
      triggerHapticFeedback(pattern);
    }
  }, [settings.hapticsEnabled]);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
      haptic(20);
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  }, [deferredPrompt, haptic]);

  const updateLocation = useCallback((loc: GeoLocation) => {
    setLocation(loc);
    setWeather(null); // Clear weather when location changes
    if (loc.country !== 'GPS') setGpsError(false);
  }, []);

  const handleLocationError = useCallback((msg: string) => {
    if (initialBoot) {
      const defaultLoc = {
        id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR', subtext: 'Varsayılan'
      };
      updateLocation(defaultLoc);
      setGpsError(true);
    } else {
      setError(msg);
      setLoading(false);
      setGpsError(true);
    }
  }, [initialBoot, updateLocation]);

  const handleCurrentLocation = useCallback(() => {
    if (!initialBoot) setLoading(true);
    setGpsError(false);
    haptic(10);

    if (!navigator.geolocation) {
      handleLocationError('Cihazınız konum özelliğini desteklemiyor.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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
        updateLocation(loc);
        haptic(20);
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
  }, [initialBoot, haptic, handleLocationError, updateLocation]);

  const loadAstronomy = useCallback(async () => {
    try {
        const data = await fetchAstronomyPicture();
        if (data) setCosmicData(data);
    } catch(e) {
        console.error("Astronomy fetch failed");
    }
  }, []);

  const loadHolidays = useCallback(async () => {
    if (!location || !location.countryCode) return;

    const year = new Date().getFullYear();
    try {
        const holidays = await fetchHolidays(year, location.countryCode) || [];
        const today = new Date();
        today.setHours(0,0,0,0);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const relevant = holidays.filter((h: any) => {
            const hDate = new Date(h.date);
            return hDate >= today && hDate <= nextWeek;
        });

        setUpcomingHolidays(relevant);
    } catch(e) {
        console.error("Holidays fetch failed");
    }
  }, [location]);

  const loadWeather = useCallback(async (isRefresh = false) => {
    if (!location) return;

    if (!isRefresh && !initialBoot) setLoading(true);
    setError(null);

    try {
      const data = await fetchWeather(location.latitude, location.longitude);
      setWeather(data);

      const generatedAlerts = checkWeatherAlerts(data);
      setAlerts(generatedAlerts);

      if (generatedAlerts.some((a: any) => a.level === 'critical')) {
          haptic([50, 100, 50]);
      } else if (isRefresh) {
          haptic(20);
      }

      if (location.subtext !== 'Varsayılan') setGpsError(false);

    } catch (err: any) {
      if (err instanceof AppError) {
          setError(err.message);
      } else {
          setError('Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);

      if (initialBoot) {
          setTimeout(() => {
              setInitialBoot(false);
          }, 800);
      }
    }
  }, [location, initialBoot, haptic]);

  const refreshAll = useCallback(async () => {
      setRefreshing(true);
      haptic(50);
      await Promise.all([
          loadWeather(true),
          loadHolidays(),
          loadAstronomy()
      ]);
  }, [loadWeather, loadHolidays, loadAstronomy, haptic]);

  const addFavorite = useCallback((loc: GeoLocation) => {
    if (!favorites.some(f => f.id === loc.id)) {
       setFavorites([...favorites, loc]);
       haptic(30);
    }
  }, [favorites, haptic]);

  const removeFavorite = useCallback((id: number) => {
    setFavorites(favorites.filter(f => f.id !== id));
    haptic(30);
  }, [favorites, haptic]);

  useEffect(() => {
      if (!location && initialBoot) {
         handleCurrentLocation();
      }
      loadAstronomy();
  }, []);

  useEffect(() => {
      if (location) {
          loadWeather();
          loadHolidays();
      }
  }, [location]);

  return {
    location,
    setLocation: updateLocation,
    weather,
    loading,
    initialBoot,
    refreshing,
    alerts,
    upcomingHolidays,
    cosmicData,
    settings,
    setSettings,
    favorites,
    addFavorite,
    removeFavorite,
    deferredPrompt,
    setDeferredPrompt,
    error,
    gpsError,
    isOffline,
    haptic,
    handleCurrentLocation,
    loadWeather,
    refreshAll,
    handleInstallClick
  };
};
