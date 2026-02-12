import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '@/types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '@/services/weatherService';
import { fetchAstronomyPicture } from '@/services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '@/utils/helpers';
import { AppError, ErrorCode } from '@/utils/errors';
import { ToastType } from '@/components/ui/Toast';

export const useWeatherApp = () => {
  // --- STATE ---
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Settings & Favorites (Persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('atmosfer_settings');
      return saved ? JSON.parse(saved) : { hapticsEnabled: true };
  });

  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  // --- HELPERS ---
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const haptic = useCallback((pattern?: number | number[]) => {
      if (settings.hapticsEnabled) {
          triggerHapticFeedback(pattern);
      }
  }, [settings.hapticsEnabled]);

  // --- DATA LOADING ---
  const loadAstronomy = useCallback(async () => {
      try {
        const data = await fetchAstronomyPicture();
        if (data) setCosmicData(data);
      } catch (e) {
        console.warn("Failed to load astronomy picture", e);
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
          showToast('Hava durumu güncellendi', 'success');
      }

      if (location.country !== 'GPS') setGpsError(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = 'Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.';

      if (isRefresh) {
        showToast('Güncelleme başarısız. Önbellek kullanılıyor.', 'error');
      } else {
        setError(errorMessage);
      }

      // If specific AppError logic existed, we would use it here
      if (err instanceof AppError) {
          // handle specific codes
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
  }, [location, initialBoot, haptic, showToast]);

  // --- LOCATION HANDLING ---
  const handleLocationError = useCallback((msg: string) => {
      if (initialBoot) {
          const defaultLoc = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
          };
          setLocation(defaultLoc);
          setGpsError(true);
          showToast('GPS alınamadı, varsayılan konum yüklendi.', 'info');
      } else {
          setError(msg);
          setLoading(false);
          setGpsError(true);
          showToast(msg, 'error');
      }
  }, [initialBoot, showToast]);

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
            haptic(20);
        } catch (e) {
            handleLocationError('Adres çözümlenemedi.');
        }
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

  // --- FAVORITES ---
  const addFavorite = useCallback((loc: GeoLocation) => {
     if (!favorites.some(f => f.id === loc.id)) {
        setFavorites(prev => [...prev, loc]);
        haptic(30);
        showToast(`${loc.name} favorilere eklendi`, 'success');
     } else {
         showToast(`${loc.name} zaten favorilerde`, 'info');
     }
  }, [favorites, haptic, showToast]);

  const removeFavorite = useCallback((id: number) => {
     setFavorites(prev => prev.filter(f => f.id !== id));
     haptic(30);
     showToast('Favorilerden kaldırıldı', 'info');
  }, [haptic, showToast]);

  // --- INITIALIZATION ---
  useEffect(() => {
    handleCurrentLocation();
    loadAstronomy();
  }, []);

  useEffect(() => {
    if (location) {
        loadWeather();
        loadHolidays();
    }
  }, [location]);

  return {
    // State
    location,
    weather,
    loading,
    initialBoot,
    refreshing,
    alerts,
    upcomingHolidays,
    cosmicData,
    error,
    gpsError,
    settings,
    favorites,
    toast,

    // Actions
    setLocation,
    setSettings,
    setRefreshing,
    handleCurrentLocation,
    loadWeather,
    addFavorite,
    removeFavorite,
    hideToast,
    showToast
  };
};
