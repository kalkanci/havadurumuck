import { useState, useEffect, useCallback } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError } from '../utils/errors';

export const useWeatherApp = () => {
    // State
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialBoot, setInitialBoot] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
    const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);

    // Settings
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('atmosfer_settings');
        return saved ? JSON.parse(saved) : { hapticsEnabled: true };
    });

    const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
        const saved = localStorage.getItem('weather_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'today' | 'forecast'>('today');

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [gpsError, setGpsError] = useState<boolean>(false);

    const isWidgetMode = new URLSearchParams(window.location.search).get('mode') === 'widget';

    // Haptics
    const haptic = useCallback((pattern?: number | number[]) => {
        if (settings.hapticsEnabled) {
            triggerHapticFeedback(pattern);
        }
    }, [settings.hapticsEnabled]);

    // Persist Settings & Favorites
    useEffect(() => {
        localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
    }, [settings]);

    // Scroll top on tab change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    // Load Astronomy
    const loadAstronomy = useCallback(async () => {
        try {
            const data = await fetchAstronomyPicture();
            if (data) setCosmicData(data);
        } catch (e) {
            console.warn("Astronomy fetch failed", e);
        }
    }, []);

    // Load Holidays
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
            console.warn("Holidays fetch failed", e);
        }
    }, [location]);

    // Load Weather
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
            if (err instanceof AppError) {
                setError(err.message);
            } else if (err instanceof Error) {
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

    // Handle Current Location
    const handleLocationError = useCallback((msg: string) => {
        if (initialBoot) {
            const defaultLoc = {
              id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR'
            };
            setLocation(defaultLoc);
            setGpsError(true);
        } else {
            setError(msg);
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
                    console.warn("GPS Detail Error:", e);
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
    }, [initialBoot, haptic, handleLocationError]);

    // Favorites Logic
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

    // PWA Prompt
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

    // Initial Load Effects
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Location Change Effect
    useEffect(() => {
        if (location) {
            loadWeather();
            loadHolidays();
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

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
        favorites,
        isFavoritesOpen, setIsFavoritesOpen,
        isSettingsOpen, setIsSettingsOpen,
        isCalendarOpen, setIsCalendarOpen,
        activeTab, setActiveTab,
        deferredPrompt,
        error,
        gpsError,
        isWidgetMode,
        handleCurrentLocation,
        loadWeather,
        addFavorite,
        removeFavorite,
        handleInstallClick,
        haptic // Export haptic for UI interactions if needed
    };
};
