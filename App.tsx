
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Navigation, MapPin, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { GeoLocation, WeatherData, UserSettings } from './types';
import { fetchWeather, getDetailedAddress } from './services/weatherService';
import { calculateDistance } from './utils/helpers';
import Background from './components/Background';
import Search from './components/Search';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AdviceCard from './components/AdviceCard';
import DetailsGrid from './components/DetailsGrid';
import AirQualityCard from './components/AirQualityCard';
import WeatherOverlay from './components/WeatherOverlay';
import SkeletonLoader from './components/SkeletonLoader';
import GoldenHourCard from './components/GoldenHourCard';
import ActivityScore from './components/ActivityScore';
import FavoritesModal from './components/FavoritesModal';
import { getWeatherLabel } from './constants';

const App: React.FC = () => {
  const [location, setLocation] = useState<GeoLocation>({
    id: 745044, name: 'İstanbul', latitude: 41.0138, longitude: 28.9497, country: 'Türkiye'
  });
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Settings removed, defaulting to high accuracy
  const settings: UserSettings = { highAccuracyGPS: true };

  const [isFavModalOpen, setIsFavModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<boolean>(false);

  // Pull to refresh refs
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const PULL_THRESHOLD = 120;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    handleCurrentLocation();
  }, []);

  useEffect(() => {
    loadWeather();
  }, [location]);

  const loadWeather = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(location.latitude, location.longitude);
      setWeather(data);
      if (location.country !== 'GPS') setGpsError(false); 
    } catch (err) {
      setError('Hava durumu verisi alınamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    setGpsError(false);

    if (!navigator.geolocation) {
      setError('Cihazınız konum özelliğini desteklemiyor.');
      setLoading(false);
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
          subtext: details.address,
          admin1: details.country 
        };
        setLocation(loc);
      },
      (err) => {
        console.warn("GPS Error:", err);
        setGpsError(true);
        setLoading(false);
      },
      {
        enableHighAccuracy: settings.highAccuracyGPS,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleFavorite = () => {
    if (favorites.some(f => f.id === location.id)) {
      setFavorites(favorites.filter(f => f.id !== location.id));
    } else {
      setFavorites([...favorites, location]);
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
      loadWeather(true);
    }
    startY.current = 0;
    pullDistance.current = 0;
  };

  const isFav = favorites.some(f => f.id === location.id);
  const distanceToStation = weather 
    ? calculateDistance(location.latitude, location.longitude, weather.latitude, weather.longitude)
    : 0;

  const today = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div 
      className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Slideshow Background */}
      <Background 
        city={location.name} 
        weatherCode={weather?.current.weather_code}
        isDay={weather?.current.is_day}
      />
      
      {/* Weather Overlay (Rain/Snow effects) */}
      {weather && <WeatherOverlay weatherCode={weather.current.weather_code} />}
      
      {/* Favorites Modal (Replaces Drawer) */}
      <FavoritesModal 
        isOpen={isFavModalOpen}
        onClose={() => setIsFavModalOpen(false)}
        favorites={favorites}
        onSelect={setLocation}
        onRemove={(id) => setFavorites(favorites.filter(f => f.id !== id))}
        currentLocation={location}
        onToggleCurrent={toggleFavorite}
      />

      <div className="relative z-10 flex flex-col min-h-screen p-4 md:max-w-md md:mx-auto transition-transform duration-300">
        
        {/* Pull to Refresh Indicator */}
        {refreshing && (
           <div className="absolute top-24 left-0 right-0 flex justify-center z-50">
             <div className="bg-slate-800/80 backdrop-blur rounded-full p-2 shadow-lg animate-spin">
               <RefreshCw size={20} className="text-blue-400" />
             </div>
           </div>
        )}

        {/* GPS Permission Warning Banner */}
        {gpsError && !loading && (
          <div className="mt-20 mb-4 p-3 bg-red-500/80 backdrop-blur-md rounded-xl flex items-center justify-between shadow-lg animate-bounce-short">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-white" />
              <span className="text-sm font-medium">Konum izni kapalı</span>
            </div>
            <button 
              onClick={handleCurrentLocation}
              className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded-lg"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Header - Simplified */}
        <header 
          className="flex items-center gap-3 mb-6"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          {/* Search Bar takes full width minus heart */}
          <div className="flex-1">
            <Search onSelect={setLocation} onCurrentLocation={handleCurrentLocation} />
          </div>

          {/* Favorites Button */}
          <button 
            onClick={() => setIsFavModalOpen(true)} 
            className={`p-3 glass-card rounded-2xl transition-all active:scale-95 shadow-lg ${isFav ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'text-white hover:text-red-400'}`}
          >
            <Heart size={22} fill={isFav ? "currentColor" : "none"} />
          </button>
        </header>

        {/* Main Content */}
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
        ) : weather && (
          <main 
            key={weather.generationtime_ms} // Trigger animation on new data
            className="flex-1 flex flex-col animate-fade-in-up" 
            ref={contentRef}
          >
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center mb-10 mt-2 text-center">
              <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg mb-2 text-white">{location.name}</h1>
              
              {location.subtext ? (
                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full mb-1">
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
                {today}
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

            {/* Scrollable Data Area */}
            <div className="flex-1 pb-6 space-y-2">
              
              <HourlyForecast weather={weather} />
              
              <AdviceCard 
                weather={weather} 
                cityName={location.name} 
              />

              <div className="grid grid-cols-1 gap-2">
                <GoldenHourCard weather={weather} />
                <ActivityScore weather={weather} />
              </div>
              
              <AirQualityCard data={weather.air_quality} />
              
              <DailyForecast weather={weather} />
              
              <DetailsGrid weather={weather} />

              <div className="text-center pt-4 opacity-50 pb-8">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  En Yakın İstasyon: {distanceToStation} km
                </p>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
