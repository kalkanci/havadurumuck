import { useState, useEffect, useRef, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError, ErrorCode } from '../utils/AppError';

export const useWeatherApp = () => {
  // Start with NO location to show splash screen
  const [location, setLocation] = useState<GeoLocation | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true); // Control Splash Screen
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);

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

  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Start the app flow
    handleCurrentLocation();

    // Load non-location dependent data once
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

  const haptic = useCallback((pattern?: number | number[]) => {
      if (settings.hapticsEnabled) {
          triggerHapticFeedback(pattern);
      }
  }, [settings.hapticsEnabled]);

  const loadAstronomy = useCallback(async () => {
      const data = await fetchAstronomyPicture();
      if (data) setCosmicData(data);
  }, []);

  const loadHolidays = useCallback(async () => {
      if (!location || !location.countryCode) return;

      const year = new Date().getFullYear();
      const holidays = await fetchHolidays(year, location.countryCode);

      // Filter for holidays happening Today or in the next 7 days
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
    } catch (err) {
      console.error("Weather load error", err);
      if (err instanceof AppError) {
          if (err.code === ErrorCode.NETWORK) {
              setError('İnternet bağlantısı yok veya zayıf.');
          } else if (err.code === ErrorCode.API) {
              setError('Sunucu şu an yanıt vermiyor. Lütfen biraz bekleyin.');
          } else {
              setError('Beklenmedik bir hata oluştu.');
          }
      } else {
          setError('Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);

      // Artificial delay for splash screen smoothness if it's the first boot
      if (initialBoot) {
          setTimeout(() => {
              setInitialBoot(false);
          }, 800);
      }
    }
  }, [location, initialBoot, haptic]);

  const handleCurrentLocation = useCallback(() => {
    // If manually triggered later, show loading
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
        setLocation(loc); // This triggers useEffect -> loadWeather
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
  }, [initialBoot, haptic]);

  const handleLocationError = useCallback((msg: string) => {
      // Fallback to Istanbul if GPS fails on boot
      if (initialBoot) {
          const defaultLoc = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
          };
          setLocation(defaultLoc);
          setGpsError(true);
          // Don't set global error on boot fallback, just show the banner via gpsError state
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

  return {
      location, setLocation,
      weather,
      loading,
      initialBoot,
      refreshing, setRefreshing,
      alerts,
      upcomingHolidays,
      cosmicData,
      settings, setSettings,
      favorites, addFavorite, removeFavorite,
      deferredPrompt, handleInstallClick,
      error,
      gpsError,
      loadWeather,
      handleCurrentLocation,
      haptic
  };
};
