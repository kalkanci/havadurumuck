import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';

export const useWeatherApp = ({ hapticsEnabled }: { hapticsEnabled: boolean }) => {
  // State
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

  // Haptic Helper
  const haptic = useCallback((pattern?: number | number[]) => {
      if (hapticsEnabled) {
          triggerHapticFeedback(pattern);
      }
  }, [hapticsEnabled]);

  // Load Astronomy (Once)
  const loadAstronomy = useCallback(async () => {
      try {
        const data = await fetchAstronomyPicture();
        if (data) setCosmicData(data);
      } catch (e) {
        console.warn("Astronomy load failed", e);
      }
  }, []);

  // Load Holidays
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

  // Load Weather
  const loadWeather = useCallback(async (isRefresh = false) => {
    if (!location) return;

    if (!isRefresh && !initialBoot) setLoading(true);
    setError(null);

    // Network Check (Enhanced Error Handling)
    if (!navigator.onLine) {
        setError('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
        setLoading(false);
        setRefreshing(false);
        if (initialBoot) setInitialBoot(false);
        return;
    }

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
      console.error("Weather Load Error:", err);
      // Enhanced Error Messages
      if (err.message && err.message.includes('404')) {
          setError('Hava durumu verisi bulunamadı. Konum desteklenmiyor olabilir.');
      } else if (err.message && err.message.includes('500')) {
          setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else {
          setError('Hava durumu verisi alınamadı. Bağlantı sorunu olabilir.');
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

  // Handle GPS Location
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
            setLocation(loc);
            haptic(20);
        } catch (err) {
             console.warn("Reverse Geocode Error:", err);
             // Fallback if address fails but we have coords?
             // Ideally we should still set location with coordinates but unknown name,
             // but current UI relies heavily on name.
             handleLocationError('Adres bilgisi alınamadı.');
        }
      },
      (err) => {
        console.warn("GPS Error:", err);
        let msg = 'Konum alınamadı.';
        if (err.code === 1) msg = 'Konum izni reddedildi.';
        else if (err.code === 2) msg = 'Konum kullanılamıyor.';
        else if (err.code === 3) msg = 'Konum isteği zaman aşımına uğradı.';

        handleLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [initialBoot, haptic]);

  const handleLocationError = useCallback((msg: string) => {
      if (initialBoot) {
          const defaultLoc = {
            id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
          };
          setLocation(defaultLoc);
          setGpsError(true);
          // Don't set error string on boot fallback, just show banner
      } else {
          setError(msg);
          setLoading(false);
          setGpsError(true);
      }
  }, [initialBoot]);

  // Effects
  useEffect(() => {
      // Start the app flow
      handleCurrentLocation();
      // Load initial astronomy data
      loadAstronomy();
  }, []); // Run once on mount

  useEffect(() => {
      if (location) {
          loadWeather();
          loadHolidays();
      }
  }, [location, loadWeather, loadHolidays]);

  const refresh = useCallback(async () => {
      setRefreshing(true);
      await Promise.all([
          loadWeather(true),
          loadHolidays(),
          loadAstronomy()
      ]);
      setRefreshing(false);
  }, [loadWeather, loadHolidays, loadAstronomy]);

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
    error,
    gpsError,
    handleCurrentLocation,
    refresh
  };
};
