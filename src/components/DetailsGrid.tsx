
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { Droplets, Wind, Sun, Gauge, Thermometer, Navigation, X, Clock, Sunrise, Sunset, ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';
import { formatTime, getWindDirection, triggerHapticFeedback } from '../utils/helpers';

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

  const handleOpenWithDelay = (id: DetailType) => {
    triggerHapticFeedback(15);
    setTimeout(() => {
        setSelectedDetail(id);
        setIsClosing(false);
    }, 180); // Slightly faster for grid items
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
        setSelectedDetail(null);
        setIsClosing(false);
    }, 200);
  };

  const getDewPointDesc = (dp: number) => {
    if (dp < 10) return "Kuru";
    if (dp < 15) return "Rahat";
    if (dp < 20) return "Nemli";
    return "Bunaltıcı";
  };

  const getNext24Hours = () => {
      const now = new Date();
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
          <div className="flex flex-col items-center justify-center py-6 shrink-0">
               <div className="relative w-40 h-40 rounded-full border-4 border-slate-700 bg-slate-800/50 flex items-center justify-center shadow-2xl ring-1 ring-white/5 backdrop-blur-sm">
                   {/* Cardinal Points */}
                   <span className="absolute top-2 text-xs font-bold text-slate-400">K</span>
                   <span className="absolute bottom-2 text-xs font-bold text-slate-400">G</span>
                   <span className="absolute left-2 text-xs font-bold text-slate-400">B</span>
                   <span className="absolute right-2 text-xs font-bold text-slate-400">D</span>
                   
                   {/* Arrow */}
                   <div 
                     className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
                     style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
                   >
                       <div className="w-2 h-20 bg-gradient-to-t from-teal-400 to-transparent rounded-full -mt-20 relative shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                          <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[14px] border-b-teal-400"></div>
                       </div>
                   </div>

                   <div className="text-center z-10 bg-slate-900/90 p-4 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                       <span className="block text-2xl font-bold text-white leading-none">{current.wind_speed_10m}</span>
                       <span className="block text-[10px] text-slate-400 mt-1">{speedUnit}</span>
                   </div>
               </div>
               <p className="mt-4 text-teal-400 font-bold text-lg">{getWindDirection(current.wind_direction_10m)} Yönünden</p>
          </div>

          <div className="bg-white/5 rounded-3xl p-5 flex-1 overflow-hidden flex flex-col min-h-0 border border-white/5 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 shrink-0 tracking-wider">
                  <Clock size={14} /> Saatlik Tahmin
              </h4>
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-1">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-xs font-medium text-slate-400 w-12">{formatTime(h.time)}</span>
                          <div className="flex-1 px-4">
                               <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                   <div className="h-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]" style={{ width: `${Math.min(h.windSpeed * 3, 100)}%` }}></div>
                               </div>
                          </div>
                          <span className="text-xs font-bold text-white w-14 text-right">{h.windSpeed} <span className="text-[9px] font-normal text-slate-500">{speedUnit}</span></span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderHumidityContent = () => (
      <div className="flex flex-col h-full gap-6">
          <div className="flex items-center justify-center gap-8 py-4 shrink-0">
              <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Bağıl Nem</p>
                  <p className="text-4xl font-black text-blue-400 drop-shadow-lg">%{current.relative_humidity_2m}</p>
              </div>
              <div className="w-[1px] h-12 bg-white/10"></div>
              <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Çiy Noktası</p>
                  <p className="text-4xl font-black text-cyan-400 drop-shadow-lg">{Math.round(current.dew_point_2m)}{tempUnit}</p>
              </div>
          </div>
          
          <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 text-center shrink-0">
              <p className="text-blue-200 text-sm font-medium leading-relaxed">
                  Çiy noktası <span className="text-white font-bold">{Math.round(current.dew_point_2m)}{tempUnit}</span> seviyesinde. Hissedilen hava şuan <span className="font-bold text-white underline decoration-blue-400/50">{getDewPointDesc(current.dew_point_2m)}</span>.
              </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-5 flex-1 overflow-hidden flex flex-col min-h-0 border border-white/5 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 shrink-0 tracking-wider">
                  <Droplets size={14} /> Saatlik Nem
              </h4>
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-1">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-400 w-12">{formatTime(h.time)}</span>
                          <div className="flex-1 mx-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${h.humidity}%` }}></div>
                          </div>
                          <span className="font-bold text-white w-10 text-right">%{h.humidity || '-'}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderPressureContent = () => {
    let currentP = current.pressure_msl || current.surface_pressure || 0;
    if (currentP === 0) currentP = 1013;
    const isMSL = current.pressure_msl !== undefined && current.pressure_msl !== null && current.pressure_msl > 0;
    
    const nowP = hourlyData[0]?.pressure || currentP;
    const futureP = hourlyData.length > 3 ? hourlyData[3].pressure : nowP;
    
    let trendIcon = <Minus size={40} className="text-slate-500" />;
    let trendText = "Dengeli";
    let trendDesc = "Basınç seviyesi stabil seyrediyor.";

    if (futureP > nowP + 0.5) {
        trendIcon = <ArrowUpRight size={40} className="text-emerald-400" />;
        trendText = "Yükseliyor";
        trendDesc = "Yüksek basınç genellikle açık ve durgun havayı işaret eder.";
    } else if (futureP < nowP - 0.5) {
        trendIcon = <ArrowDownRight size={40} className="text-amber-400" />;
        trendText = "Düşüyor";
        trendDesc = "Düşen basınç bulutlanma ve yağış ihtimalini artırabilir.";
    }

    return (
        <div className="flex flex-col h-full items-center justify-center space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                <div className="relative flex flex-col items-center justify-center text-center z-10">
                    <div className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl mb-2">
                        {Math.round(currentP)}
                    </div>
                    <span className="text-xl font-medium text-slate-400">hPa <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-1 align-middle font-bold tracking-wider">{isMSL ? 'MSL' : 'YÜZEY'}</span></span>
                </div>
            </div>

            <div className="flex flex-col items-center bg-white/5 px-8 py-6 rounded-3xl w-full border border-white/5">
                <div className="p-4 bg-black/40 rounded-full mb-4 shadow-inner ring-1 ring-white/5">
                    {trendIcon}
                </div>
                <span className="block text-xl font-bold text-white mb-2">{trendText}</span>
                <span className="block text-sm text-center text-slate-400 leading-relaxed">{trendDesc}</span>
            </div>
        </div>
    );
  };

  const renderUVContent = () => {
    const uv = daily.uv_index_max[0] || 0; 
    const percentage = Math.min((uv / 11) * 100, 100);
    
    let advice = "Güneş kremi gerekmez.";
    if (uv > 2) advice = "Şapka ve güneş gözlüğü takın.";
    if (uv > 5) advice = "Güneş kremi sürün, gölgede kalın.";
    if (uv > 7) advice = "10:00 - 16:00 arası dışarı çıkmaktan kaçının.";

    return (
      <div className="space-y-8 pt-4">
           <div className="relative pt-6 pb-2 px-2">
               <div className="h-4 w-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 rounded-full opacity-50 blur-[2px]"></div>
               <div className="h-4 w-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 rounded-full absolute top-6 left-0 mix-blend-overlay"></div>
               
               <div 
                 className="absolute top-4 w-1.5 h-8 bg-white shadow-[0_0_15px_white] transition-all duration-1000 z-10 rounded-full"
                 style={{ left: `${percentage}%` }}
               ></div>
               
               <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   <span>Düşük</span>
                   <span>Orta</span>
                   <span>Yüksek</span>
                   <span>Aşırı</span>
               </div>
           </div>

           <div className="text-center">
               <span className="text-7xl font-black text-orange-400 block mb-2 drop-shadow-lg">{uv.toFixed(1)}</span>
               <span className="px-4 py-1.5 bg-orange-500/20 text-orange-200 rounded-full text-sm font-bold border border-orange-500/20">
                   {uv > 7 ? 'Çok Yüksek' : uv > 5 ? 'Yüksek' : uv > 2 ? 'Orta' : 'Düşük'}
               </span>
               <div className="mt-6 flex items-start gap-3 text-slate-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5 text-left">
                   <HelpCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
                   <p>{advice}</p>
               </div>
           </div>

           <div className="bg-white/5 rounded-2xl p-5 border border-white/5 shadow-inner">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <Sun size={14} /> Saatlik UV Tahmini
              </h4>
              <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex flex-col items-center min-w-[3.5rem] p-2.5 bg-black/20 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 mb-1 font-medium">{formatTime(h.time)}</span>
                          <span className={`text-base font-bold ${h.uv > 5 ? 'text-orange-400' : 'text-white'}`}>{h.uv?.toFixed(0) || '-'}</span>
                      </div>
                  ))}
              </div>
           </div>
      </div>
    );
  };

  const renderSunriseContent = () => (
      <div className="flex flex-col h-full">
          {/* Dawn Visual */}
          <div className="relative w-full aspect-[2/1] rounded-[1.5rem] overflow-hidden bg-gradient-to-t from-orange-300 via-indigo-600 to-slate-900 mb-6 shrink-0 shadow-2xl border border-white/10">
               <div className="absolute inset-0 flex items-end justify-center pb-2">
                   <div className="w-32 h-32 bg-orange-400 rounded-full blur-[50px] opacity-60 animate-pulse"></div>
               </div>
               
               {/* Rising Animation */}
               <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 animate-fade-in-up">
                   <Sun size={80} className="text-yellow-100 drop-shadow-[0_0_35px_rgba(253,186,116,0.9)]" />
               </div>

               <div className="absolute bottom-0 w-full h-1 bg-white/10 blur-sm"></div>
          </div>

          <div className="space-y-6 px-2">
               <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Gün Doğumu</p>
                    <p className="text-6xl font-black text-white tracking-tighter drop-shadow-xl">{formatTime(daily.sunrise[0])}</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Yeni bir gün.</p>
               </div>

               <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-5 rounded-3xl border border-orange-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                       <div className="p-3 rounded-full bg-orange-500/20">
                            <Sunrise size={24} className="text-orange-400" />
                       </div>
                       <div>
                           <p className="text-[10px] font-bold text-orange-200 uppercase tracking-wide">Şafak Vakti</p>
                           <p className="text-base font-bold text-white">
                               {formatTime(new Date(new Date(daily.sunrise[0]).getTime() - 30*60000).toISOString())}
                           </p>
                       </div>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderSunsetContent = () => (
      <div className="flex flex-col h-full">
          {/* Dusk Visual */}
          <div className="relative w-full aspect-[2/1] rounded-[1.5rem] overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-orange-600 mb-6 shrink-0 shadow-2xl border border-white/10">
               <div className="absolute inset-0 flex items-end justify-center">
                   <div className="w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent absolute bottom-0"></div>
               </div>

               <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 transition-all duration-1000 transform translate-y-4 opacity-90">
                   <Sun size={80} className="text-orange-200 drop-shadow-[0_0_40px_rgba(249,115,22,1)]" />
               </div>
               
               <div className="absolute bottom-0 w-full h-1 bg-black/30"></div>
          </div>

          <div className="space-y-6 px-2">
               <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Gün Batımı</p>
                    <p className="text-6xl font-black text-white tracking-tighter drop-shadow-xl">{formatTime(daily.sunset[0])}</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Akşam oluyor.</p>
               </div>

               <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-3xl border border-indigo-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                       <div className="p-3 rounded-full bg-indigo-500/20">
                           <Sunset size={24} className="text-indigo-400" />
                       </div>
                       <div>
                           <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide">Alacakaranlık</p>
                           <p className="text-base font-bold text-white">
                               {formatTime(new Date(new Date(daily.sunset[0]).getTime() + 30*60000).toISOString())}
                           </p>
                       </div>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderBasicContent = (value: string | number, unit: string, desc: string, sub: string) => (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 h-full">
          <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl relative z-10">
                  {value}<span className="text-4xl text-slate-400 font-light ml-2">{unit}</span>
              </div>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5 max-w-[90%]">
              <p className="text-2xl font-bold text-blue-300 mb-2">{desc}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{sub}</p>
          </div>
      </div>
  );

  // --- Main Render Map ---
  const items = [
    {
      id: 'feels_like',
      label: 'Hissedilen',
      value: Math.round(current.apparent_temperature),
      unit: tempUnit,
      icon: <Thermometer size={24} className="text-red-400" />,
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
      icon: <Wind size={24} className="text-teal-400" />,
      subtext: (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
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
      icon: <Droplets size={24} className="text-blue-400" />,
      subtext: null,
      render: renderHumidityContent
    },
    {
      id: 'dew_point',
      label: 'Çiy Noktası',
      value: Math.round(current.dew_point_2m),
      unit: tempUnit,
      icon: <Droplets size={24} className="text-cyan-300" />,
      subtext: <span className="text-[10px] text-slate-400 mt-1 block">{getDewPointDesc(current.dew_point_2m)}</span>,
      render: renderHumidityContent
    },
    {
      id: 'uv',
      label: 'UV İndeksi',
      value: daily.uv_index_max[0]?.toFixed(0) || '-',
      unit: '',
      icon: <Sun size={24} className="text-orange-400" />,
      subtext: null,
      render: renderUVContent
    },
    {
      id: 'pressure',
      label: 'Basınç',
      value: Math.round((current.pressure_msl || current.surface_pressure || 1013)),
      unit: ' hPa',
      icon: <Gauge size={24} className="text-purple-400" />,
      subtext: null,
      render: renderPressureContent
    },
    {
      id: 'sunrise',
      label: 'Gün Doğumu',
      value: formatTime(daily.sunrise[0]),
      unit: '',
      icon: <Sunrise size={24} className="text-yellow-400" />,
      subtext: null,
      render: renderSunriseContent
    },
    {
      id: 'sunset', 
      label: 'Gün Batımı',
      value: formatTime(daily.sunset[0]),
      unit: '',
      icon: <Sunset size={24} className="text-indigo-400" />,
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
                onClick={() => handleOpenWithDelay(item.id as DetailType)}
                className="glass-card p-4 rounded-[1.5rem] flex flex-col justify-between aspect-[4/3] group relative overflow-hidden text-left transition-all duration-300 transform active:scale-[0.95] active:bg-white/10 active:border-white/20 hover:bg-white/5 border border-transparent"
            >
                {/* Visual feedback layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex justify-between items-start relative z-10">
                    <div className="bg-white/5 p-2 rounded-full shadow-inner ring-1 ring-white/5 backdrop-blur-sm">
                    {item.icon}
                    </div>
                </div>
                <div className="relative z-10">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">{item.value}</span>
                        <span className="text-sm font-normal text-slate-400">{item.unit}</span>
                    </div>
                    {item.subtext && item.subtext}
                </div>
            </button>
            )
        })}
        </div>

        {/* Improved Modal */}
        {selectedDetail && createPortal(
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
                <div 
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={closeModal}
                />

                <div 
                    className={`
                        relative w-full max-w-sm bg-slate-900 border border-white/10
                        rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[75vh]
                        transform transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1)
                        ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}
                    `}
                >
                    {/* Sticky Header with Frosted Glass */}
                    <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between">
                        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2">
                             {React.cloneElement(activeItem?.icon as React.ReactElement, { size: 16 })}
                             <span className="text-xs font-bold text-white uppercase tracking-wider">{activeItem?.label}</span>
                        </div>
                        <button 
                            onClick={closeModal}
                            className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white border border-white/5 transition-transform active:scale-90"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Gradient Background for Modal */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 overflow-y-auto p-6 pt-16 no-scrollbar">
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
