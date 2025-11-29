
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Navigation, MapPin, ArrowUp, ArrowDown, RefreshCw, Calendar, CloudSun, Loader2 } from 'lucide-react';
import { GeoLocation, WeatherData, WeatherAlert, PublicHoliday } from './types';
import { fetchWeather, getDetailedAddress, fetchHolidays } from './services/weatherService';
import { calculateDistance, checkWeatherAlerts, triggerHapticFeedback } from './utils/helpers';
import Background from './components/Background';
import Search from './components/Search';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import DetailsGrid from './components/DetailsGrid';
import AirQualityCard from './components/AirQualityCard';
import FavoritesModal from './components/FavoritesModal';
import SkeletonLoader from './components/SkeletonLoader';
import GoldenHourCard from './components/GoldenHourCard';
import ActivityScore from './components/ActivityScore';
import WeatherAlerts from './components/WeatherAlerts';
import ForecastInsight from './components/ForecastInsight';
import WidgetView from './components/WidgetView';
import PWAInstallBanner from './components/PWAInstallBanner';
import AdviceCard from './components/AdviceCard';
import HolidayCard from './components/HolidayCard';
import { getWeatherLabel } from './constants';

const App: React.FC = () => {
  // Start with NO location to show splash screen
  const [location, setLocation] = useState<GeoLocation | null>(null);
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialBoot, setInitialBoot] = useState(true); // Control Splash Screen
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<PublicHoliday[]>([]);
  
  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'today' | 'forecast'>('today');
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
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
    // Start the app flow
    handleCurrentLocation();
    
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

  const loadHolidays = async () => {
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
  };

  const loadWeather = async (isRefresh = false) => {
    if (!location) return;
    
    if (!isRefresh && !initialBoot) setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeather(location.latitude, location.longitude);
      setWeather(data);
      
      const generatedAlerts = checkWeatherAlerts(data);
      setAlerts(generatedAlerts);
      
      if (generatedAlerts.some(a => a.level === 'critical')) {
          triggerHapticFeedback([50, 100, 50]);
      } else if (isRefresh) {
          triggerHapticFeedback(20);
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
  };

  const handleCurrentLocation = () => {
    // If manually triggered later, show loading
    if (!initialBoot) setLoading(true);
    
    setGpsError(false);
    triggerHapticFeedback(10);

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
        triggerHapticFeedback(20);
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
  };

  const handleLocationError = (msg: string) => {
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
  };

  const addFavorite = (loc: GeoLocation) => {
     if (!favorites.some(f => f.id === loc.id)) {
        setFavorites([...favorites, loc]);
        triggerHapticFeedback(30);
     }
  };

  const removeFavorite = (id: number) => {
     setFavorites(favorites.filter(f => f.id !== id));
     triggerHapticFeedback(30);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      triggerHapticFeedback(20);
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Pull to Refresh Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && window.scrollY === 0) {
      pullDistance.current = diff;
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > PULL_THRESHOLD && window.scrollY === 0) {
      setRefreshing(true);
      triggerHapticFeedback(50);
      loadWeather(true);
      loadHolidays();
    }
    startY.current = 0;
    pullDistance.current = 0;
  };

  // --- SPLASH SCREEN RENDER ---
  if (initialBoot) {
      return (
          <div className="fixed inset-0 z-[999] bg-slate-900 flex flex-col items-center justify-center text-white p-6">
              <div className="relative mb-8">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center relative z-10 shadow-2xl border border-white/10">
                       <CloudSun size={48} className="text-blue-400" />
                  </div>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight mb-2">Atmosfer AI</h1>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium animate-pulse">
                  <Navigation size={16} className="animate-bounce" />
                  <span>Konum Bekleniyor...</span>
              </div>
          </div>
      );
  }

  // RENDER WIDGET MODE
  if (isWidgetMode) {
    return (
        <WidgetView 
            weather={weather} 
            locationName={location?.name || ''} 
            loading={loading}
            onRefresh={() => loadWeather(true)}
        />
    );
  }

  // NORMAL APP RENDER
  const isFav = location ? favorites.some(f => f.id === location.id) : false;
  const distanceToStation = (weather && location)
    ? calculateDistance(location.latitude, location.longitude, weather.latitude, weather.longitude)
    : 0;

  const todayStr = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div 
      className="relative min-h-screen overflow-hidden selection:bg-blue-500/30 pb-28 text-white transition-colors duration-500"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Background 
        city={location?.name || ''} 
        weatherCode={weather?.current.weather_code}
        isDay={weather?.current.is_day}
      />
      
      {/* Modals */}
      {location && (
        <FavoritesModal 
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            favorites={favorites}
            currentLocation={location}
            onSelect={setLocation}
            onRemove={removeFavorite}
            onAdd={addFavorite}
        />
      )}

      <PWAInstallBanner 
          deferredPrompt={deferredPrompt} 
          onInstall={handleInstallClick} 
      />

      <div className="relative z-10 flex flex-col min-h-screen p-4 md:max-w-md md:mx-auto transition-transform duration-300">
        
        {/* Pull to Refresh Indicator */}
        {refreshing && (
           <div className="absolute top-24 left-0 right-0 flex justify-center z-50">
             <div className="bg-slate-800/80 backdrop-blur rounded-full p-2 shadow-lg animate-spin">
               <RefreshCw size={20} className="text-blue-500" />
             </div>
           </div>
        )}

        {/* GPS Error Banner */}
        {gpsError && !loading && (
          <div className="mt-20 mb-4 p-3 bg-red-500/80 backdrop-blur-md rounded-xl flex items-center justify-between shadow-lg animate-bounce-short text-white">
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
              className={`p-3 glass-card rounded-2xl transition-all active:scale-95 duration-200 ${isFav ? 'bg-red-500/20 border-red-500/30' : 'hover:bg-slate-800/80'}`}
            >
              <Heart 
                  size={22} 
                  className={`transition-colors duration-300 ${isFav ? 'text-red-400 fill-red-400' : 'text-slate-300'}`} 
              />
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
            <p className="text-slate-300 max-w-xs mx-auto mb-6">{error}</p>
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
                <div className="flex flex-col items-center justify-center mb-8 mt-2 text-center">
                  <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg mb-2 text-white">{location.name}</h1>
                  
                  {location.subtext ? (
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full mb-1 border border-white/5">
                      <MapPin size={12} className="text-blue-400" />
                      <p className="text-blue-100 text-xs font-medium truncate max-w-[250px]">
                        {location.subtext}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-200 text-sm font-medium drop-shadow-md">
                      {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                    </p>
                  )}
                  
                  <p className="text-slate-300 text-xs font-medium mt-1 uppercase tracking-wide opacity-80">
                    {todayStr}
                  </p>
                  
                  <div className="flex flex-col items-center mt-6">
                    <span className="text-[7rem] leading-none font-thin tracking-tighter drop-shadow-2xl text-white">
                      {Math.round(weather.current.temperature_2m)}°
                    </span>
                    <p className="text-xl font-medium mt-2 text-blue-200 tracking-wide drop-shadow-md">
                      {getWeatherLabel(weather.current.weather_code)}
                    </p>
                    <div className="flex items-center space-x-6 mt-3 text-sm font-semibold text-slate-300">
                      <span className="flex items-center gap-1"><ArrowUp size={16} className="text-red-400" /> {Math.round(weather.daily.temperature_2m_max[0])}°</span>
                      <span className="flex items-center gap-1"><ArrowDown size={16} className="text-blue-400" /> {Math.round(weather.daily.temperature_2m_min[0])}°</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-5">
                  <WeatherAlerts alerts={alerts} />
                  <HolidayCard holidays={upcomingHolidays} />
                  <AdviceCard weather={weather} cityName={location.name} />
                  <ForecastInsight weather={weather} />
                  <HourlyForecast weather={weather} />
                  
                  <div className="grid grid-cols-1 gap-5">
                    <GoldenHourCard weather={weather} />
                    <ActivityScore weather={weather} />
                  </div>
                  
                  <AirQualityCard data={weather.air_quality} />
                  <DetailsGrid weather={weather} />
                  
                  <div className="text-center pt-4 opacity-50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                      En Yakın İstasyon: {distanceToStation} km
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // --- 16 DAYS FORECAST VIEW ---
              <DailyForecast weather={weather} />
            )}
          </main>
        )}
      </div>

      {/* FLOATING NAVIGATION */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[280px]">
        <div className="relative flex items-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-slate-700 shadow-lg shadow-black/20 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${activeTab === 'today' ? 'left-1.5' : 'left-1/2'}`}
          />

          <button
            onClick={() => setActiveTab('today')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
              activeTab === 'today' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
              <CloudSun size={18} className={activeTab === 'today' ? "fill-white/10" : ""} />
              Bugün
          </button>
          
          <button
            onClick={() => setActiveTab('forecast')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
              activeTab === 'forecast' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
              <Calendar size={18} className={activeTab === 'forecast' ? "fill-white/10" : ""} />
              Uzun Vade
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;
