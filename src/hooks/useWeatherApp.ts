import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from '../types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from '../services/weatherService';
import { fetchAstronomyPicture } from '../services/astronomyService';
import { checkWeatherAlerts, triggerHapticFeedback } from '../utils/helpers';
import { AppError, ErrorCode, getErrorMessage } from '../utils/errors';

export const useWeatherApp = () => {
    // Core Data State
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gpsError, setGpsError] = useState<boolean>(false);

    // UI/Flow State
    const [initialBoot, setInitialBoot] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
    const [cosmicData, setCosmicData] = useState<AstronomyData | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'forecast'>('today');

    // Modals State
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Settings & Favorites
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const saved = localStorage.getItem('atmosfer_settings');
            return saved ? JSON.parse(saved) : { hapticsEnabled: true };
        } catch {
            return { hapticsEnabled: true };
        }
    });

    const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
        try {
            const saved = localStorage.getItem('weather_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // PWA State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    // Refs for Pull-to-Refresh
    const startY = useRef(0);
    const pullDistance = useRef(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const PULL_THRESHOLD = 120;

    const isWidgetMode = new URLSearchParams(window.location.search).get('mode') === 'widget';

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('weather_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
    }, [settings]);

    // Haptic Feedback Helper
    const haptic = useCallback((pattern?: number | number[]) => {
        if (settings.hapticsEnabled) {
            triggerHapticFeedback(pattern);
        }
    }, [settings.hapticsEnabled]);

    // Data Loading Functions
    const loadAstronomy = useCallback(async () => {
        try {
            const data = await fetchAstronomyPicture();
            if (data) setCosmicData(data);
        } catch (err) {
            console.error("Failed to load astronomy data", err);
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
        } catch (err) {
            console.warn("Failed to load holidays", err);
            // Non-critical, so we don't set main error
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
            console.error("Weather load error:", err);
            if (err instanceof AppError) {
                setError(getErrorMessage(err));
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

    // Location Handling
    const handleLocationError = useCallback((msg: string, code?: ErrorCode) => {
        // Fallback to Istanbul if GPS fails on boot
        if (initialBoot) {
            const defaultLoc = {
                id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye', countryCode: 'TR',
                admin1: 'İstanbul', subtext: 'Türkiye'
            };
            setLocation(defaultLoc);
            setGpsError(true);
            // We don't set error message on boot fallback to keep it clean, just show indicator
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
            handleLocationError('Cihazınız konum özelliğini desteklemiyor.', ErrorCode.GEOLOCATION_UNAVAILABLE);
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
                        admin1: details.country // Simplified for now
                    };
                    setLocation(loc);
                    haptic(20);
                } catch (err) {
                     handleLocationError('Konum detayları alınamadı.', ErrorCode.API_ERROR);
                }
            },
            (err) => {
                console.warn("GPS Error:", err);
                let msg = 'Konum alınamadı.';
                let code = ErrorCode.UNKNOWN_ERROR;
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        msg = 'Konum izni reddedildi.';
                        code = ErrorCode.GEOLOCATION_DENIED;
                        break;
                    case err.POSITION_UNAVAILABLE:
                        msg = 'Konum bilgisi mevcut değil.';
                        code = ErrorCode.GEOLOCATION_UNAVAILABLE;
                        break;
                    case err.TIMEOUT:
                        msg = 'Konum alma zaman aşımı.';
                        code = ErrorCode.GEOLOCATION_TIMEOUT;
                        break;
                }
                handleLocationError(msg, code);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [initialBoot, haptic, handleLocationError]);

    // Favorites Management
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

    // PWA Installation
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

    // Pull to Refresh Logic
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (startY.current === 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && window.scrollY === 0) {
            pullDistance.current = diff;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (pullDistance.current > PULL_THRESHOLD && window.scrollY === 0) {
            setRefreshing(true);
            haptic(50);
            loadWeather(true);
            loadHolidays();
            loadAstronomy();
        }
        startY.current = 0;
        pullDistance.current = 0;
    }, [haptic, loadWeather, loadHolidays, loadAstronomy]);

    // Lifecycle Effects
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

    useEffect(() => {
        if (location) {
            loadWeather();
            loadHolidays();
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        state: {
            location, weather, loading, error, gpsError,
            initialBoot, refreshing, alerts, upcomingHolidays, cosmicData,
            activeTab, isFavoritesOpen, isSettingsOpen, isCalendarOpen,
            settings, favorites, deferredPrompt, isWidgetMode
        },
        actions: {
            setLocation, setWeather, setLoading, setError,
            setInitialBoot, setRefreshing, setActiveTab,
            setIsFavoritesOpen, setIsSettingsOpen, setIsCalendarOpen,
            setSettings,
            handleCurrentLocation, loadWeather,
            addFavorite, removeFavorite, handleInstallClick,
            handleTouchStart, handleTouchMove, handleTouchEnd
        },
        refs: {
            contentRef
        }
    };
};
