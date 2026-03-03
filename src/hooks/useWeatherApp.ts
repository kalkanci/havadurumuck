import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError } from '../utils/AppError';

export const useWeatherApp = () => {
  const [location, setLocationState] = useState<GeoLocation | null>(() => {
    const saved = localStorage.getItem('atmosfer_location');
    return saved ? JSON.parse(saved) : null;
  });

  const [weather, setWeatherState] = useState<WeatherData | null>(() => {
    const saved = localStorage.getItem('atmosfer_weather');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(!weather);
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

  const setLocation = useCallback((newLoc: GeoLocation | null) => {
    if (newLoc) {
      // Clear current data to enforce loading state
      setWeatherState(null);
      setLocationState(newLoc);
    }
  }, []);

  useEffect(() => {
    if (location) {
      localStorage.setItem('atmosfer_location', JSON.stringify(location));
    }
  }, [location]);

  useEffect(() => {
    if (weather) {
      localStorage.setItem('atmosfer_weather', JSON.stringify(weather));
    }
  }, [weather]);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const haptic = useCallback((pattern?: number | number[]) => {
    if (settings.hapticsEnabled) {
      triggerHapticFeedback(pattern);
    }
  }, [settings.hapticsEnabled]);

  const loadAstronomy = useCallback(async () => {
    try {
      const data = await fetchAstronomyPicture();
      if (data) setCosmicData(data);
    } catch (e) {
      console.warn("Astronomy fetch failed", e);
    }
  }, []);

  const loadHolidays = useCallback(async (loc: GeoLocation) => {
    if (!loc || !loc.countryCode) return;

    const year = new Date().getFullYear();
    try {
      const holidays = await fetchHolidays(year, loc.countryCode);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const relevant = holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= today && hDate <= nextWeek;
      });

      setUpcomingHolidays(relevant);
    } catch (e) {
      setUpcomingHolidays([]);
    }
  }, []);

  const loadWeather = useCallback(async (loc: GeoLocation, isRefresh = false) => {
    if (!loc) return;

    if (!isRefresh && !initialBoot && !weather) setLoading(true);
    setError(null);

    try {
      const data = await fetchWeather(loc.latitude, loc.longitude);
      setWeatherState(data);

      const generatedAlerts = checkWeatherAlerts(data);
      setAlerts(generatedAlerts);

      if (generatedAlerts.some(a => a.level === 'critical')) {
        haptic([50, 100, 50]);
      } else if (isRefresh) {
        haptic(20);
      }

      if (loc.country !== 'GPS') setGpsError(false);

    } catch (err: any) {
      if (err instanceof AppError && err.code === 'NETWORK') {
        setError('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
      } else {
        setError('Hava durumu verisi alınamadı.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);

      if (initialBoot) {
        setTimeout(() => setInitialBoot(false), 800);
      }
    }
  }, [initialBoot, haptic, weather]);

  const refreshAll = useCallback(async () => {
    if (!location) return;
    setRefreshing(true);
    haptic(50);

    // Concurrently load weather, holidays, and astronomy
    await Promise.all([
      loadWeather(location, true),
      loadHolidays(location),
      loadAstronomy()
    ]);

    setRefreshing(false);
  }, [location, haptic, loadWeather, loadHolidays, loadAstronomy]);

  const handleLocationError = useCallback((msg: string) => {
    if (initialBoot && !location) {
      const defaultLoc = {
        id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR', subtext: 'Varsayılan'
      };
      setLocationState(defaultLoc);
      setGpsError(true);
      loadWeather(defaultLoc);
      loadHolidays(defaultLoc);
    } else {
      setError(msg);
      setLoading(false);
      setGpsError(true);
    }
  }, [initialBoot, location, loadWeather, loadHolidays]);

  const handleCurrentLocation = useCallback(() => {
    if (!initialBoot) setLoading(true);

    haptic(10);

    if (!navigator.geolocation) {
      handleLocationError('Cihazınız konum özelliğini desteklemiyor.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
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
          setLocationState(loc);
          setGpsError(false);
          haptic(20);
          loadWeather(loc);
          loadHolidays(loc);
        } catch (e) {
          handleLocationError('Adres detayları alınamadı.');
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
  }, [initialBoot, haptic, handleLocationError, loadWeather, loadHolidays]);

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

  // Initial load logic
  useEffect(() => {
    loadAstronomy();
    if (!location && initialBoot) {
      handleCurrentLocation();
    } else if (location && initialBoot) {
       // if we have location from cache, trigger load, otherwise it might just stay loading
       if(!weather) {
          loadWeather(location);
          loadHolidays(location);
       } else {
           // We have both from cache, still load to refresh but turn off splash
           setTimeout(() => setInitialBoot(false), 800);
           loadWeather(location, true);
           loadHolidays(location);
       }
    }
  }, []);

  // Effect to load when location changes
  useEffect(() => {
     if(location && !initialBoot) {
         loadWeather(location);
         loadHolidays(location);
     }
  }, [location]);

  return {
    location,
    weather,
    settings,
    favorites,
    loading,
    initialBoot,
    refreshing,
    alerts,
    upcomingHolidays,
    cosmicData,
    deferredPrompt,
    error,
    gpsError,
    isOffline,
    setLocation,
    setSettings,
    addFavorite,
    removeFavorite,
    handleInstallClick,
    handleCurrentLocation,
    refreshAll,
    loadWeather: () => location && loadWeather(location),
    haptic
  };
};
