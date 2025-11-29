
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { Droplets, Wind, Sun, Gauge, Thermometer, Navigation, X, Clock, Sunrise, Sunset, ArrowUpRight, ArrowDownRight, Minus, Moon, CloudSun, CloudMoon } from 'lucide-react';
import { formatTime, getWindDirection } from '../utils/helpers';

interface DetailsGridProps {
  weather: WeatherData;
}

type DetailType = 'feels_like' | 'wind' | 'humidity' | 'dew_point' | 'uv' | 'pressure' | 'sunrise' | 'sunset' | null;

const DetailsGrid: React.FC<DetailsGridProps> = ({ weather }) => {
  const { current, daily, hourly } = weather;
  const [selectedDetail, setSelectedDetail] = useState<DetailType>(null);
  const [isClosing, setIsClosing] = useState(false);

  const tempUnit = '°';
  const speedUnit = 'km/s';

  // Lock body scroll
  useEffect(() => {
    if (selectedDetail !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDetail]);

  // Helper: Close Modal with Animation
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
        setSelectedDetail(null);
        setIsClosing(false);
    }, 200);
  };

  // Helper: Get Dew Point Description
  const getDewPointDesc = (dp: number) => {
    if (dp < 10) return "Kuru";
    if (dp < 15) return "Rahat";
    if (dp < 20) return "Nemli";
    return "Bunaltıcı";
  };

  // Helper: Safe access to hourly data (next 24 hours from NOW)
  const getNext24Hours = () => {
      const now = new Date();
      // Find the index of the current hour
      const currentHourIndex = hourly.time.findIndex(t => {
          const d = new Date(t);
          return d.getHours() === now.getHours() && d.getDate() === now.getDate();
      });
      
      const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
      
      return hourly.time.slice(startIndex, startIndex + 24).map((t, i) => {
          const idx = startIndex + i;
          return {
            time: t,
            temp: hourly.temperature_2m[idx],
            windSpeed: hourly.wind_speed_10m[idx],
            windDir: hourly.wind_direction_10m[idx],
            humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[idx] : 0,
            uv: hourly.uv_index ? hourly.uv_index[idx] : 0,
            pressure: (hourly.pressure_msl && hourly.pressure_msl[idx]) || (hourly.surface_pressure && hourly.surface_pressure[idx]) || 0,
            feelsLike: hourly.apparent_temperature ? hourly.apparent_temperature[idx] : 0,
          };
      });
  };

  const hourlyData = getNext24Hours();

  // --- Modal Content Renderers ---

  const renderWindContent = () => (
      <div className="flex flex-col h-full">
          <div className="flex flex-col items-center justify-center py-4 shrink-0">
               {/* Compact Compass */}
               <div className="relative w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-lg bg-slate-100/50 dark:bg-slate-800/50">
                   {/* Cardinal Points */}
                   <span className="absolute top-1 text-[10px] font-bold text-slate-500">K</span>
                   <span className="absolute bottom-1 text-[10px] font-bold text-slate-500">G</span>
                   <span className="absolute left-1 text-[10px] font-bold text-slate-500">B</span>
                   <span className="absolute right-1 text-[10px] font-bold text-slate-500">D</span>
                   
                   {/* Arrow */}
                   <div 
                     className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
                     style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
                   >
                       <div className="w-1.5 h-14 bg-gradient-to-t from-teal-500 to-transparent rounded-full -mt-14 relative">
                          <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-teal-400"></div>
                       </div>
                   </div>

                   <div className="text-center z-10 bg-white/80 dark:bg-slate-900/80 p-2 rounded-full backdrop-blur-sm shadow-sm">
                       <span className="block text-xl font-bold text-slate-900 dark:text-white leading-none">{current.wind_speed_10m}</span>
                       <span className="block text-[9px] text-slate-500 dark:text-slate-400">{speedUnit}</span>
                   </div>
               </div>
               <p className="mt-3 text-teal-600 dark:text-teal-300 font-bold text-sm">{getWindDirection(current.wind_direction_10m)} Yönünden</p>
          </div>

          <div className="glass-card rounded-2xl p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2 shrink-0">
                  <Clock size={14} /> Saatlik Rüzgar
              </h4>
              <div className="space-y-2 overflow-y-auto no-scrollbar pr-1">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-300 w-10">{formatTime(h.time)}</span>
                          <div className="flex-1 px-3">
                               <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-teal-500/50" style={{ width: `${Math.min(h.windSpeed * 3, 100)}%` }}></div>
                               </div>
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white w-14 text-right">{h.windSpeed} <span className="text-[9px] font-normal text-slate-500">{speedUnit}</span></span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderHumidityContent = () => (
      <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-center gap-6 py-2 shrink-0">
              <div className="text-center">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Bağıl Nem</p>
                  <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">%{current.relative_humidity_2m}</p>
              </div>
              <div className="w-[1px] h-10 bg-black/10 dark:bg-white/10"></div>
              <div className="text-center">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Çiy Noktası</p>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{Math.round(current.dew_point_2m)}{tempUnit}</p>
              </div>
          </div>
          
          <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-center shrink-0">
              <p className="text-blue-700 dark:text-blue-200 text-xs font-medium leading-relaxed">
                  Çiy noktası {Math.round(current.dew_point_2m)}{tempUnit}. Hissedilen hava: <span className="font-bold text-slate-900 dark:text-white">{getDewPointDesc(current.dew_point_2m)}</span>.
              </p>
          </div>

          <div className="glass-card rounded-2xl p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2 shrink-0">
                  <Droplets size={14} /> Saatlik Nem
              </h4>
              <div className="space-y-2 overflow-y-auto no-scrollbar pr-1">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-500 dark:text-slate-400 w-10">{formatTime(h.time)}</span>
                          <div className="flex-1 mx-3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${h.humidity}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-white w-8 text-right">%{h.humidity || '-'}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderPressureContent = () => {
    // Current Pressure Check
    let currentP = current.pressure_msl || current.surface_pressure || 0;
    // Fallback if API returns 0
    if (currentP === 0) currentP = 1013;

    const isMSL = current.pressure_msl !== undefined && current.pressure_msl !== null && current.pressure_msl > 0;
    
    // Trend calculation
    const nowP = hourlyData[0]?.pressure || currentP;
    const futureP = hourlyData.length > 3 ? hourlyData[3].pressure : nowP;
    
    let trendIcon = <Minus size={32} className="text-slate-400" />;
    let trendText = "Dengeli";
    let trendDesc = "Basınç seviyesi stabil seyrediyor.";

    if (futureP > nowP + 0.5) {
        trendIcon = <ArrowUpRight size={32} className="text-emerald-500" />;
        trendText = "Yükseliyor";
        trendDesc = "Yüksek basınç genellikle açık ve durgun havayı işaret eder.";
    } else if (futureP < nowP - 0.5) {
        trendIcon = <ArrowDownRight size={32} className="text-amber-500" />;
        trendText = "Düşüyor";
        trendDesc = "Düşen basınç bulutlanma ve yağış ihtimalini artırabilir.";
    }

    return (
        <div className="flex flex-col h-full items-center justify-center space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
                 <div className="text-6xl font-bold tracking-tighter text-slate-900 dark:text-white drop-shadow-sm mb-2">
                    {Math.round(currentP)}
                 </div>
                 <span className="text-xl font-medium text-slate-400">hPa <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded ml-1 align-middle">{isMSL ? 'MSL' : 'Yüzey'}</span></span>
            </div>

            <div className="flex flex-col items-center bg-slate-100 dark:bg-white/5 px-6 py-4 rounded-2xl w-full">
                <div className="p-3 bg-white dark:bg-slate-800/50 rounded-full mb-3 shadow-sm">
                    {trendIcon}
                </div>
                <span className="block text-lg font-bold text-slate-900 dark:text-white mb-1">{trendText}</span>
                <span className="block text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">{trendDesc}</span>
            </div>
        </div>
    );
  };

  const renderUVContent = () => {
    const uv = current.weather_code === 0 && daily.uv_index_max[0] ? daily.uv_index_max[0] : 0; 
    const percentage = Math.min((uv / 11) * 100, 100);
    
    let advice = "Güneş kremi gerekmez.";
    if (uv > 2) advice = "Şapka ve güneş gözlüğü takın.";
    if (uv > 5) advice = "Güneş kremi sürün, gölgede kalın.";
    if (uv > 7) advice = "10:00 - 16:00 arası dışarı çıkmaktan kaçının.";

    return (
      <div className="space-y-6">
           <div className="relative pt-6 pb-2">
               <div className="h-4 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full opacity-30"></div>
               <div 
                 className="absolute top-4 w-1 h-8 bg-slate-800 dark:bg-white shadow-[0_0_10px_white] transition-all duration-1000"
                 style={{ left: `${percentage}%` }}
               ></div>
               <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 uppercase">
                   <span>Düşük</span>
                   <span>Orta</span>
                   <span>Yüksek</span>
                   <span>Aşırı</span>
               </div>
           </div>

           <div className="text-center">
               <span className="text-6xl font-bold text-orange-500 dark:text-orange-400 block mb-2">{uv.toFixed(1)}</span>
               <span className="px-3 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-200 rounded-full text-sm font-bold">
                   {uv > 7 ? 'Çok Yüksek' : uv > 5 ? 'Yüksek' : uv > 2 ? 'Orta' : 'Düşük'}
               </span>
               <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                   {advice}
               </p>
           </div>

           <div className="glass-card rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Sun size={14} /> Saatlik UV Tahmini
              </h4>
              <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex flex-col items-center min-w-[3rem] p-2 bg-black/5 dark:bg-white/5 rounded-xl">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">{formatTime(h.time)}</span>
                          <span className={`text-sm font-bold ${h.uv > 5 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-800 dark:text-white'}`}>{h.uv?.toFixed(0) || '-'}</span>
                      </div>
                  ))}
              </div>
           </div>
      </div>
    );
  };

  // --- Specific Renderers for Sunrise vs Sunset ---

  const renderSunriseContent = () => (
      <div className="flex flex-col h-full">
          {/* Dawn Visual */}
          <div className="relative w-full aspect-[2/1] rounded-t-3xl overflow-hidden bg-gradient-to-t from-orange-300 via-indigo-500 to-slate-900 mb-4 shrink-0 shadow-inner">
               <div className="absolute inset-0 flex items-end justify-center pb-2">
                   <div className="w-24 h-24 bg-orange-400 rounded-full blur-[40px] opacity-80 animate-pulse"></div>
               </div>
               
               {/* Rising Animation */}
               <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 animate-fade-in-up">
                   <Sun size={64} className="text-yellow-100 drop-shadow-[0_0_25px_rgba(253,186,116,0.8)]" />
               </div>

               <div className="absolute bottom-0 w-full h-1 bg-white/20"></div>
          </div>

          <div className="space-y-6 px-2">
               <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gün Doğumu</p>
                    <p className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{formatTime(daily.sunrise[0])}</p>
                    <p className="text-sm text-slate-500 mt-2">Yeni bir gün başlıyor.</p>
               </div>

               <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <CloudSun size={20} className="text-orange-500" />
                       <div>
                           <p className="text-[10px] font-bold text-orange-700 dark:text-orange-200 uppercase">Şafak Vakti</p>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">
                               {/* Yaklaşık 30dk önce */}
                               {formatTime(new Date(new Date(daily.sunrise[0]).getTime() - 30*60000).toISOString())}
                           </p>
                       </div>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Işık</p>
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-300">%0 &rarr; %100</p>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderSunsetContent = () => (
      <div className="flex flex-col h-full">
          {/* Dusk Visual */}
          <div className="relative w-full aspect-[2/1] rounded-t-3xl overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-800 to-orange-500 mb-4 shrink-0 shadow-inner">
               <div className="absolute inset-0 flex items-end justify-center">
                    {/* Darker horizon overlay */}
                   <div className="w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent absolute bottom-0"></div>
               </div>

               {/* Setting Animation */}
               <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 transition-all duration-1000 transform translate-y-2 opacity-80">
                   <Sun size={64} className="text-orange-200 drop-shadow-[0_0_30px_rgba(249,115,22,0.9)]" />
               </div>
               
               <div className="absolute bottom-0 w-full h-1 bg-black/20"></div>
          </div>

          <div className="space-y-6 px-2">
               <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gün Batımı</p>
                    <p className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{formatTime(daily.sunset[0])}</p>
                    <p className="text-sm text-slate-500 mt-2">Hava kararıyor.</p>
               </div>

               <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <CloudMoon size={20} className="text-indigo-500" />
                       <div>
                           <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-200 uppercase">Alacakaranlık</p>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">
                               {/* Yaklaşık 30dk sonra */}
                               {formatTime(new Date(new Date(daily.sunset[0]).getTime() + 30*60000).toISOString())}
                           </p>
                       </div>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Işık</p>
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-300">%100 &rarr; %0</p>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderBasicContent = (value: string | number, unit: string, desc: string, sub: string) => (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="text-7xl font-bold tracking-tighter text-slate-900 dark:text-white drop-shadow-lg">
              {value}<span className="text-3xl text-slate-400 font-normal ml-1">{unit}</span>
          </div>
          <p className="text-xl font-medium text-blue-600 dark:text-blue-200">{desc}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[80%] mx-auto leading-relaxed">{sub}</p>
      </div>
  );

  // --- Main Render Map ---
  const items = [
    {
      id: 'feels_like',
      label: 'Hissedilen',
      value: Math.round(current.apparent_temperature),
      unit: tempUnit,
      icon: <Thermometer size={24} className="text-red-500 dark:text-red-400" />,
      subtext: null,
      render: () => renderBasicContent(
          Math.round(current.apparent_temperature), 
          tempUnit, 
          current.apparent_temperature > current.temperature_2m ? 'Olduğundan daha sıcak' : 'Olduğundan daha soğuk',
          `Rüzgar ve nem faktörleri hesaba katıldığında sıcaklık ${Math.round(current.apparent_temperature)}${tempUnit} olarak hissediliyor.`
      )
    },
    {
      id: 'wind',
      label: 'Rüzgar',
      value: current.wind_speed_10m,
      unit: ' ' + speedUnit,
      icon: <Wind size={24} className="text-teal-500 dark:text-teal-400" />,
      subtext: (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
           <Navigation size={10} style={{ transform: `rotate(${current.wind_direction_10m}deg)` }} />
           <span>{getWindDirection(current.wind_direction_10m)}</span>
        </div>
      ),
      render: renderWindContent
    },
    {
      id: 'humidity',
      label: 'Nem',
      value: current.relative_humidity_2m,
      unit: '%',
      icon: <Droplets size={24} className="text-blue-500 dark:text-blue-400" />,
      subtext: null,
      render: renderHumidityContent
    },
    {
      id: 'dew_point',
      label: 'Çiy Noktası',
      value: Math.round(current.dew_point_2m),
      unit: tempUnit,
      icon: <Droplets size={24} className="text-cyan-500 dark:text-cyan-300" />,
      subtext: <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">{getDewPointDesc(current.dew_point_2m)}</span>,
      render: renderHumidityContent
    },
    {
      id: 'uv',
      label: 'UV İndeksi',
      value: daily.uv_index_max[0]?.toFixed(0) || '-',
      unit: '',
      icon: <Sun size={24} className="text-orange-500 dark:text-orange-400" />,
      subtext: null,
      render: renderUVContent
    },
    {
      id: 'pressure',
      label: 'Basınç',
      // Strict undefined check to allow 0 or valid numbers
      value: Math.round(
          (current.pressure_msl || current.surface_pressure || 1013)
      ),
      unit: ' hPa',
      icon: <Gauge size={24} className="text-purple-500 dark:text-purple-400" />,
      subtext: null,
      render: renderPressureContent
    },
    {
      id: 'sunrise',
      label: 'Gün Doğumu',
      value: formatTime(daily.sunrise[0]),
      unit: '',
      icon: <Sunrise size={24} className="text-yellow-500 dark:text-yellow-400" />,
      subtext: null,
      render: renderSunriseContent
    },
    {
      id: 'sunset', 
      label: 'Gün Batımı',
      value: formatTime(daily.sunset[0]),
      unit: '',
      icon: <Sunset size={24} className="text-indigo-500 dark:text-indigo-400" />,
      subtext: null,
      render: renderSunsetContent
    }
  ];

  const activeItem = items.find(i => i.id === selectedDetail);

  return (
    <>
        <div className="grid grid-cols-2 gap-3 mb-6">
        {items.map((item, idx) => {
            return (
            <button 
                key={idx} 
                onClick={() => setSelectedDetail(item.id as DetailType)}
                className="glass-card p-4 rounded-2xl flex flex-col justify-between aspect-[4/3] group hover:bg-white/40 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 text-left relative overflow-hidden"
            >
                {/* Visual feedback on hover/active */}
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start">
                    <div className="bg-black/5 dark:bg-white/10 p-2 rounded-full shadow-inner">
                    {item.icon}
                    </div>
                </div>
                <div>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</span>
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-300">{item.unit}</span>
                    </div>
                    {item.subtext && item.subtext}
                </div>
            </button>
            )
        })}
        </div>

        {/* Modal - Center Pop-in Animation */}
        {selectedDetail && createPortal(
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={closeModal}
                />

                {/* Modal Content */}
                <div 
                    className={`
                        relative w-full max-w-sm bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10
                        rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh]
                        transform transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1)
                        ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}
                    `}
                >
                    {/* Handle & Header */}
                    <div className="pt-4 pb-2 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 sticky top-0 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner border border-black/5 dark:border-white/5">
                                    {activeItem?.icon}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{activeItem?.label} Detayı</h2>
                            </div>
                            <button 
                                onClick={closeModal}
                                className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 pb-6 no-scrollbar">
                        {activeItem?.render && activeItem.render()}
                    </div>
                </div>
            </div>,
            document.body
        )}
    </>
  );
};

export default DetailsGrid;
