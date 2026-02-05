import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError, ErrorCode } from '../utils/errors';

export const useWeatherApp = () => {
  // Data State
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  // Settings & Favorites
  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('atmosfer_settings');
      return saved ? JSON.parse(saved) : { hapticsEnabled: true };
  });

  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  // Haptics
  const haptic = useCallback((pattern?: number | number[]) => {
      if (settings.hapticsEnabled) {
          triggerHapticFeedback(pattern);
      }
  }, [settings.hapticsEnabled]);

  // Loaders
  const loadAstronomy = useCallback(async () => {
      try {
        const data = await fetchAstronomyPicture();
        if (data) setCosmicData(data);
      } catch (e) {
        console.warn('Astronomy load failed', e);
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

      if (location.country !== 'GPS') setGpsError(false);
    } catch (err: any) {
        if (err instanceof AppError) {
             setError(err);
        } else {
             setError(new AppError('Beklenmedik bir hata oluştu.', ErrorCode.UNKNOWN_ERROR, err));
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

  const handleLocationError = useCallback((msg: string, code: ErrorCode = ErrorCode.LOCATION_ERROR) => {
      if (initialBoot) {
          const defaultLoc = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
          };
          setLocation(defaultLoc);
          setGpsError(true);
      } else {
          setError(new AppError(msg, code));
          setLoading(false);
          setGpsError(true);
      }
  }, [initialBoot]);

  const handleCurrentLocation = useCallback(() => {
    if (!initialBoot) setLoading(true);
    setGpsError(false);
    haptic(10);

    if (!navigator.geolocation) {
      handleLocationError('Cihazınız konum özelliğini desteklemiyor.', ErrorCode.GEOLOCATION_UNSUPPORTED);
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
        let msg = 'Konum alınamadı.';
        if (err.code === err.PERMISSION_DENIED) msg = 'Konum izni reddedildi.';
        handleLocationError(msg, ErrorCode.GEOLOCATION_PERMISSION_DENIED);
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

  const refresh = useCallback(() => {
      setRefreshing(true);
      haptic(50);
      loadWeather(true);
      loadHolidays();
      loadAstronomy();
  }, [haptic, loadWeather, loadHolidays, loadAstronomy]);

  // Initial Boot
  useEffect(() => {
    handleCurrentLocation();
    loadAstronomy();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Trigger weather load when location is set
  useEffect(() => {
    if (location) {
        loadWeather();
        loadHolidays();
    }
  }, [location]);

  return {
    location, setLocation,
    weather,
    loading,
    initialBoot,
    refreshing,
    error,
    gpsError,
    alerts,
    upcomingHolidays,
    cosmicData,
    settings, setSettings,
    favorites,
    deferredPrompt,

    handleCurrentLocation,
    loadWeather,
    addFavorite,
    removeFavorite,
    handleInstallClick,
    refresh,
    haptic
  };
};
