import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError } from '../utils/AppError';

export const useWeatherApp = () => {
  // --- STATE ---
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Settings State
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

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- EFFECTS ---

  // Persistence
  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  // Offline/Online Status
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

  // PWA Prompt Listener
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

  // Initial Data Load (Astronomy)
  useEffect(() => {
    loadAstronomy();
  }, []);

  // Load Weather on Location Change
  useEffect(() => {
    if (location) {
        loadWeather();
        loadHolidays();
    }
  }, [location]);

  // --- HANDLERS ---

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
        console.warn("Astronomy load failed", e);
      }
  }, []);

  const loadHolidays = useCallback(async () => {
      if (!location || !location.countryCode) return;

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

      // Clear GPS error only if we are not using the fallback location
      if (location.subtext !== 'Varsayılan') setGpsError(false);
    } catch (err) {
      if (err instanceof AppError) {
          setError(err);
      } else {
          setError(new AppError('Bilinmeyen bir hata oluştu.', 'UNKNOWN', err));
      }
    } finally {
      setLoading(false);

      // Artificial delay for splash screen smoothness if it's the first boot
      if (initialBoot) {
          setTimeout(() => {
              setInitialBoot(false);
          }, 800);
      }
    }
  }, [location, initialBoot, haptic]);

  const handleLocationError = useCallback((msg: string) => {
      if (initialBoot) {
          const defaultLoc: GeoLocation = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR', subtext: 'Varsayılan', admin1: 'İstanbul'
          };
          setLocation(defaultLoc);
          setGpsError(true);
          // Don't set error here, just fallback
      } else {
          setError(new AppError(msg, 'GPS'));
          setLoading(false);
          setGpsError(true);
      }
  }, [initialBoot]);

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
        setLocation(loc);
        haptic(20);
      },
      (err) => {
        console.warn("GPS Error:", err);
        handleLocationError('Konum alınamadı. Lütfen GPS izni verin.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [initialBoot, haptic, handleLocationError]);

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

  const refreshAll = useCallback(async () => {
      await Promise.all([
          loadWeather(true),
          loadHolidays(),
          loadAstronomy()
      ]);
  }, [loadWeather, loadHolidays, loadAstronomy]);

  return {
    location,
    setLocation,
    weather,
    loading,
    initialBoot,
    error,
    gpsError,
    alerts,
    upcomingHolidays,
    cosmicData,
    favorites,
    addFavorite,
    removeFavorite,
    settings,
    setSettings,
    deferredPrompt,
    handleInstallClick,
    handleCurrentLocation,
    refreshAll,
    isOffline
  };
};
