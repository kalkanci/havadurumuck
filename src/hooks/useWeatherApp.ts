
import { useState, useEffect, useCallback } from 'react';
import { WeatherData, GeoLocation, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError, ErrorCode } from '../utils/AppError';

export const useWeatherApp = () => {
  // Application State
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
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  // Settings & Favorites
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

  // Persistence Effects
  useEffect(() => {
    if (location) localStorage.setItem('atmosfer_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    if (weather) localStorage.setItem('atmosfer_weather', JSON.stringify(weather));
  }, [weather]);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  // Initial Boot Logic
  useEffect(() => {
    loadAstronomy();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If we have saved location, load weather immediately
    if (location) {
        loadWeather();
        loadHolidays();
        setInitialBoot(false);
    } else {
        handleCurrentLocation();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Helpers
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

  const loadHolidays = useCallback(async () => {
      if (!location || !location.countryCode) return;

      try {
        const year = new Date().getFullYear();
        const holidays = await fetchHolidays(year, location.countryCode);

        const today = new Date();
        today.setHours(0,0,0,0);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const relevant = holidays.filter(h => {
            const hDate = new Date(h.date);
            return hDate >= today && hDate <= nextWeek;
        });

        setUpcomingHolidays(relevant);
      } catch (e) {
        console.warn("Holiday fetch failed", e);
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

      if (generatedAlerts.some(a => a.level === 'critical')) {
          haptic([50, 100, 50]);
      } else if (isRefresh) {
          haptic(20);
      }

      if (location.country !== 'GPS') setGpsError(false);
    } catch (err) {
      console.error("Weather Load Error:", err);
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

  const handleCurrentLocation = useCallback(() => {
    if (!initialBoot) setLoading(true);

    setGpsError(false);
    haptic(10);

    if (!navigator.geolocation) {
      handleLocationError('Cihazınız konum özelliğini desteklemiyor.', ErrorCode.GPS);
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
            setLocation(loc);
            // Trigger loadWeather via useEffect dependency on location or call directly?
            // Since we persist location, setting it will trigger the effect if we kept that.
            // But we removed the effect that watches 'location' to avoid loop or double fetch on boot.
            // So we call loadWeather manually here after state update is processed or just rely on next render.
            // Better to call loadWeather directly after setting location if possible, but state is async.
            // We will add a useEffect for location changes to trigger weather update.
            haptic(20);
        } catch (e) {
            handleLocationError('Adres çözümlenemedi.', ErrorCode.API);
        }
      },
      (err) => {
        console.warn("GPS Error:", err);
        handleLocationError('Konum alınamadı.', ErrorCode.GPS);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [initialBoot, haptic]);

  // Watch for location changes to reload weather
  useEffect(() => {
      if (location) {
          loadWeather();
          loadHolidays();
      }
  }, [location]);

  const handleLocationError = useCallback((msg: string, code: ErrorCode) => {
      if (initialBoot) {
          const defaultLoc = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
          };
          setLocation(defaultLoc);
          setGpsError(true);
          // Allow boot to finish with default location
          setInitialBoot(false);
      } else {
          setError(msg);
          setLoading(false);
          setGpsError(true);
      }
  }, [initialBoot]);

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

  const refreshAll = useCallback(() => {
      setRefreshing(true);
      haptic(50);
      Promise.all([
          loadWeather(true),
          loadHolidays(),
          loadAstronomy()
      ]).finally(() => {
          setRefreshing(false);
      });
  }, [loadWeather, loadHolidays, loadAstronomy, haptic]);

  return {
    location,
    setLocation,
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
    handleInstallClick,
    error,
    gpsError,
    handleCurrentLocation,
    refreshAll,
    haptic
  };
};
