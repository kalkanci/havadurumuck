
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Heart, Navigation, MapPin, ArrowUp, ArrowDown, RefreshCw, Calendar, CloudSun, Loader2, Settings } from 'lucide-react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday, AppSettings, AstronomyData } from './types';
import { usePWA } from './hooks/usePWA';
import { fetchWeather, getDetailedAddress, fetchHolidays } from './services/weatherService';
import { fetchAstronomyPicture } from './services/astronomyService';
import { calculateDistance, checkWeatherAlerts, triggerHapticFeedback } from './utils/helpers';
import Background from './components/Background';
import Search from './components/Search';
import HourlyForecast from './components/HourlyForecast';
import DetailsGrid from './components/DetailsGrid';
import AirQualityCard from './components/AirQualityCard';
import SkeletonLoader from './components/SkeletonLoader';
import GoldenHourCard from './components/GoldenHourCard';
import ActivityScore from './components/ActivityScore';
import WeatherAlerts from './components/WeatherAlerts';
import ForecastInsight from './components/ForecastInsight';
import PWAInstallBanner from './components/PWAInstallBanner';
import AdviceCard from './components/AdviceCard';
import HolidayCard from './components/HolidayCard';
import SpotifyCard from './components/SpotifyCard';
import { getWeatherLabel } from './constants';

const DailyForecast = React.lazy(() => import('./components/DailyForecast'));
const FavoritesModal = React.lazy(() => import('./components/FavoritesModal'));
const WidgetView = React.lazy(() => import('./components/WidgetView'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const CalendarModal = React.lazy(() => import('./components/CalendarModal'));

const App: React.FC = () => {
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
      return saved ? JSON.parse(saved) : { hapticsEnabled: true };
  });

  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'today' | 'forecast'>('today');
  
  // PWA Hook
  const { deferredPrompt, install } = usePWA();
  
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  // Widget Mode Detection
  const isWidgetMode = new URLSearchParams(window.location.search).get('mode') === 'widget';

  // Pull to refresh refs
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const PULL_THRESHOLD = 120;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('atmosfer_settings', JSON.stringify(settings));
  }, [settings]);

  // Sekme değiştiğinde sayfayı en yukarı kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    // Start the app flow
    handleCurrentLocation();
    
    // Load non-location dependent data once
    loadAstronomy();
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
      setError('Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.');
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
      install();
    }
  }, [deferredPrompt, haptic, install]);

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

  // --- SPLASH SCREEN RENDER ---
  if (initialBoot) {
      return (
          <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-white p-6">
              <div className="relative mb-8">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center relative z-10 shadow-2xl border border-white/10">
                       <CloudSun size={48} className="text-blue-500" />
                  </div>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight mb-2">Atmosfer AI</h1>
              
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium animate-pulse">
                  <Navigation size={16} className="animate-bounce" />
                  <span>Konum Bekleniyor...</span>
              </div>
          </div>
      );
  }

  // RENDER WIDGET MODE
  if (isWidgetMode) {
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen bg-black"><Loader2 className="animate-spin text-white" /></div>}>
        <WidgetView 
            weather={weather} 
            locationName={location?.name || ''} 
            loading={loading}
            onRefresh={() => loadWeather(true)}
        />
      </React.Suspense>
    );
  }

  // NORMAL APP RENDER
  const isFav = location ? favorites.some(f => f.id === location.id) : false;
  const distanceToStation = (weather && location)
    ? calculateDistance(location.latitude, location.longitude, weather.latitude, weather.longitude)
    : 0;

  const todayStr = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div 
      className="relative min-h-screen overflow-x-hidden selection:bg-blue-500/30 pb-24 text-white transition-colors duration-500"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Background 
        city={location?.name || ''} 
        weatherCode={weather?.current.weather_code}
        isDay={weather?.current.is_day}
        cosmicUrl={cosmicData?.url}
      />
      
      {/* Global Modals */}
      {location && isFavoritesOpen && (
        <React.Suspense fallback={null}>
          <FavoritesModal
              isOpen={isFavoritesOpen}
              onClose={() => setIsFavoritesOpen(false)}
              favorites={favorites}
              currentLocation={location}
              onSelect={setLocation}
              onRemove={removeFavorite}
              onAdd={addFavorite}
          />
        </React.Suspense>
      )}
      
      {weather && isCalendarOpen && (
        <React.Suspense fallback={null}>
          <CalendarModal
              isOpen={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
              weather={weather}
          />
        </React.Suspense>
      )}

      {isSettingsOpen && (
        <React.Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdate={setSettings}
          />
        </React.Suspense>
      )}

      {/* Auto PWA Prompt Modal */}
      <PWAInstallBanner 
          deferredPrompt={deferredPrompt} 
          onInstall={handleInstallClick} 
      />

      <div className="relative z-10 flex flex-col min-h-screen px-4 pb-24 max-w-md mx-auto w-full transition-transform duration-300">
        
        {/* Pull to Refresh Indicator */}
        {refreshing && (
           <div className="absolute top-24 left-0 right-0 flex justify-center z-50">
             <div className="bg-zinc-800/90 backdrop-blur rounded-full p-2 shadow-lg animate-spin">
               <RefreshCw size={20} className="text-blue-500" />
             </div>
           </div>
        )}

        {/* GPS Error Banner */}
        {gpsError && !loading && (
          <div className="mt-20 mb-4 p-3 bg-red-500/20 backdrop-blur-md rounded-xl flex items-center justify-between shadow-lg animate-bounce-short text-white border border-red-500/30">
            <div className="flex items-center gap-2">
              <Navigation size={18} />
              <span className="text-sm font-medium">Konum alınamadı, varsayılan gösteriliyor.</span>
            </div>
            <button 
              onClick={handleCurrentLocation}
              className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded-lg"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Header (Search & Actions) */}
        <header 
          className="flex items-center justify-between gap-3 mb-6"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          {/* Expanded Search Bar */}
          <div className="flex-1">
            <Search onSelect={setLocation} onCurrentLocation={handleCurrentLocation} />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavoritesOpen(true)} 
              aria-label="Favori Konumlar"
              className={`p-3 glass-card rounded-3xl transition-all active:scale-95 duration-200 ${isFav ? 'bg-red-500/20 border-red-500/30' : 'hover:bg-white/10'}`}
            >
              <Heart 
                  size={22} 
                  className={`transition-colors duration-300 ${isFav ? 'text-red-400 fill-red-400' : 'text-white/70 hover:text-white'}`}
              />
            </button>
            <button 
               onClick={() => setIsSettingsOpen(true)}
               aria-label="Ayarlar"
               className="p-3 glass-card rounded-3xl transition-all active:scale-95 duration-200 hover:bg-white/10 text-white/70 hover:text-white"
            >
               <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-red-500/20 rounded-full mb-4">
              <Navigation size={32} className="text-red-400" />
            </div>
            <p className="text-red-400 text-lg mb-2 font-bold">Bağlantı Sorunu</p>
            <p className="text-zinc-300 max-w-xs mx-auto mb-6">{error}</p>
            <button 
              onClick={() => loadWeather()} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors text-white"
            >
              Tekrar Dene
            </button>
          </div>
        ) : weather && location && (
          <main 
            key={`${weather.generationtime_ms}-${activeTab}`} 
            className="flex-1 flex flex-col animate-fade-in-up pb-10" 
            ref={contentRef}
          >
            {activeTab === 'today' ? (
              // --- TODAY VIEW ---
              <>
                <div className="flex flex-col items-center justify-center mb-10 mt-6 text-center relative z-10">
                  
                  {/* Date Pill (Top - Clickable) */}
                  <button 
                    onClick={() => setIsCalendarOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mb-6 active:scale-95 transition-transform"
                  >
                    <Calendar size={12} className="text-blue-400" />
                    <span className="text-xs font-bold text-white tracking-wide uppercase">{todayStr}</span>
                  </button>

                  {/* Massive Temperature (The Hero) */}
                  <div className="relative">
                     {/* Glow effect behind */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                     
                     <h1 className="text-[9rem] leading-[0.85] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 drop-shadow-2xl select-none">
                        {Math.round(weather.current.temperature_2m)}<span className="text-[5rem] font-light text-zinc-300 align-top absolute top-2 ml-1">°</span>
                     </h1>
                  </div>

                  {/* Condition & High/Low */}
                  <div className="mt-4 flex flex-col items-center gap-1">
                     <p className="text-xl font-medium text-blue-100 tracking-wide drop-shadow-lg flex items-center gap-2">
                        {getWeatherLabel(weather.current.weather_code)}
                     </p>
                     <div className="flex items-center gap-4 text-base font-medium text-white/80 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/5 mt-2">
                         <span className="flex items-center gap-1"><ArrowUp size={14} className="text-red-400" /> {Math.round(weather.daily.temperature_2m_max[0])}°</span>
                         <div className="w-px h-3 bg-white/20"></div>
                         <span className="flex items-center gap-1"><ArrowDown size={14} className="text-blue-400" /> {Math.round(weather.daily.temperature_2m_min[0])}°</span>
                     </div>
                  </div>

                  {/* Location Pill (New Design) */}
                  <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      <button 
                         onClick={() => setIsFavoritesOpen(true)}
                         className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md border border-white/10 shadow-xl group"
                      >
                         <MapPin size={16} className="text-red-400 group-hover:animate-bounce" />
                         <span className="text-base font-medium text-white tracking-wide shadow-sm">
                             {location.name}
                             {location.admin1 && location.name !== location.admin1 && (
                                 <span className="opacity-80 font-normal">, {location.admin1}</span>
                             )}
                         </span>
                      </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-5">
                  <WeatherAlerts alerts={alerts} />
                  <HolidayCard holidays={upcomingHolidays} />
                  <AdviceCard weather={weather} cityName={location.name} />
                  <ForecastInsight weather={weather} />
                  <HourlyForecast weather={weather} />
                  
                  <div className="grid grid-cols-1 gap-5">
                    <SpotifyCard weather={weather} />
                    <GoldenHourCard weather={weather} />
                    <ActivityScore weather={weather} />
                  </div>
                  
                  <AirQualityCard data={weather.air_quality} />
                  <DetailsGrid weather={weather} />
                  
                  <div className="text-center pt-4 opacity-50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                      En Yakın İstasyon: {distanceToStation} km
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // --- 16 DAYS FORECAST VIEW ---
              <React.Suspense fallback={<SkeletonLoader />}>
                <DailyForecast weather={weather} />
              </React.Suspense>
            )}
          </main>
        )}
      </div>

      {/* FLOATING NAVIGATION */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[280px]">
        <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
              activeTab === 'today' ? 'left-1.5' : 'left-[calc(50%-3px)]'
            }`}
          />

          <button
            onClick={() => setActiveTab('today')}
            aria-current={activeTab === 'today' ? 'page' : undefined}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
              activeTab === 'today' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
              <CloudSun size={18} className={activeTab === 'today' ? "fill-white/20" : ""} />
              Bugün
          </button>
          
          <button
            onClick={() => setActiveTab('forecast')}
            aria-current={activeTab === 'forecast' ? 'page' : undefined}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
              activeTab === 'forecast' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
              <Calendar size={18} className={activeTab === 'forecast' ? "fill-white/20" : ""} />
              Uzun Vade
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;
