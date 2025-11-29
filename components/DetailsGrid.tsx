
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { Droplets, Wind, Sun, Gauge, Thermometer, Navigation, X, Clock, Sunrise, Sunset } from 'lucide-react';
import { formatTime, getWindDirection } from '../utils/helpers';

interface DetailsGridProps {
  weather: WeatherData;
}

type DetailType = 'feels_like' | 'wind' | 'humidity' | 'dew_point' | 'uv' | 'pressure' | 'sun' | null;

const DetailsGrid: React.FC<DetailsGridProps> = ({ weather }) => {
  const { current, daily, hourly } = weather;
  const [selectedDetail, setSelectedDetail] = useState<DetailType>(null);
  const [isClosing, setIsClosing] = useState(false);

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

  // Helper: Safe access to hourly data (next 24 hours)
  const getNext24Hours = () => {
      return hourly.time.slice(0, 24).map((t, i) => ({
          time: t,
          temp: hourly.temperature_2m[i],
          windSpeed: hourly.wind_speed_10m[i],
          windDir: hourly.wind_direction_10m[i],
          humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : 0,
          uv: hourly.uv_index ? hourly.uv_index[i] : 0,
          pressure: hourly.surface_pressure ? hourly.surface_pressure[i] : 0,
          feelsLike: hourly.apparent_temperature ? hourly.apparent_temperature[i] : 0,
      }));
  };

  const hourlyData = getNext24Hours();

  // --- Modal Content Renderers ---

  const renderWindContent = () => (
      <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
               <div className="relative w-48 h-48 rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-lg bg-slate-100/50 dark:bg-slate-800/50">
                   {/* Cardinal Points */}
                   <span className="absolute top-2 text-xs font-bold text-slate-500">K</span>
                   <span className="absolute bottom-2 text-xs font-bold text-slate-500">G</span>
                   <span className="absolute left-2 text-xs font-bold text-slate-500">B</span>
                   <span className="absolute right-2 text-xs font-bold text-slate-500">D</span>
                   
                   {/* Arrow */}
                   <div 
                     className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
                     style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
                   >
                       <div className="w-1.5 h-20 bg-gradient-to-t from-teal-500 to-transparent rounded-full -mt-20 relative">
                          <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-teal-400"></div>
                       </div>
                   </div>

                   <div className="text-center z-10 bg-white/80 dark:bg-slate-900/80 p-3 rounded-full backdrop-blur-sm">
                       <span className="block text-3xl font-bold text-slate-900 dark:text-white">{current.wind_speed_10m}</span>
                       <span className="block text-xs text-slate-500 dark:text-slate-400">km/s</span>
                   </div>
               </div>
               <p className="mt-4 text-teal-600 dark:text-teal-300 font-bold">{getWindDirection(current.wind_direction_10m)} Yönünden</p>
          </div>

          <div className="glass-card rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Clock size={14} /> Saatlik Rüzgar
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-300 w-12">{formatTime(h.time)}</span>
                          <div className="flex-1 px-4">
                               <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                                   <div className="h-full bg-teal-500/50" style={{ width: `${Math.min(h.windSpeed * 3, 100)}%` }}></div>
                               </div>
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white w-16 text-right">{h.windSpeed} <span className="text-[10px] font-normal text-slate-500">km/s</span></span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderUVContent = () => {
    const uv = current.weather_code === 0 && daily.uv_index_max[0] ? daily.uv_index_max[0] : 0; // Fallback logic
    const percentage = Math.min((uv / 11) * 100, 100);
    
    let advice = "Güneş kremi gerekmez.";
    if (uv > 2) advice = "Şapka ve güneş gözlüğü takın.";
    if (uv > 5) advice = "Güneş kremi sürün, gölgede kalın.";
    if (uv > 7) advice = "10:00 - 16:00 arası dışarı çıkmaktan kaçının.";

    return (
      <div className="space-y-6">
           {/* Gauge */}
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

  const renderHumidityContent = () => (
      <div className="space-y-6">
          <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Bağıl Nem</p>
                  <p className="text-4xl font-bold text-blue-500 dark:text-blue-400">%{current.relative_humidity_2m}</p>
              </div>
              <div className="w-[1px] h-12 bg-black/10 dark:bg-white/10"></div>
              <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Çiy Noktası</p>
                  <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{Math.round(current.dew_point_2m)}°</p>
              </div>
          </div>
          
          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-center">
              <p className="text-blue-700 dark:text-blue-200 text-sm font-medium">
                  Çiy noktası {Math.round(current.dew_point_2m)}°C. Hissedilen hava: <span className="font-bold text-slate-900 dark:text-white">{getDewPointDesc(current.dew_point_2m)}</span>.
              </p>
          </div>

          <div className="glass-card rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Droplets size={14} /> Saatlik Nem
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {hourlyData.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400 w-12">{formatTime(h.time)}</span>
                          <div className="flex-1 mx-3 h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${h.humidity}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-white w-8 text-right">%{h.humidity || '-'}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderSunContent = () => (
      <div className="space-y-8 py-4">
          <div className="relative h-32 border-b border-black/10 dark:border-white/10">
              {/* Arc for sun path */}
              <div className="absolute inset-x-4 bottom-0 h-28 border-t-2 border-dashed border-orange-300/50 rounded-t-[100px]"></div>
              
              {/* Sun Icon positioned roughly based on time (static for now, could be dynamic) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-4 bg-orange-500 text-white p-2 rounded-full shadow-[0_0_20px_orange]">
                  <Sun size={32} />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
               <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 flex items-center gap-4">
                   <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                       <Sunrise size={24} />
                   </div>
                   <div>
                       <p className="text-xs text-yellow-700/70 dark:text-yellow-200/70 font-bold uppercase">Gün Doğumu</p>
                       <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(daily.sunrise[0])}</p>
                   </div>
               </div>
               
               <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400">
                       <Sunset size={24} />
                   </div>
                   <div>
                       <p className="text-xs text-indigo-700/70 dark:text-indigo-200/70 font-bold uppercase">Gün Batımı</p>
                       <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(daily.sunset[0])}</p>
                   </div>
               </div>
          </div>
          
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Bugün gün süresi yaklaşık <span className="text-slate-900 dark:text-white font-bold">{
                (() => {
                    const start = new Date(daily.sunrise[0]).getTime();
                    const end = new Date(daily.sunset[0]).getTime();
                    const hours = Math.floor((end - start) / (1000 * 60 * 60));
                    return `${hours} saat`;
                })()
              }</span>.
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
      unit: '°',
      icon: <Thermometer size={24} className="text-red-500 dark:text-red-400" />,
      subtext: null,
      render: () => renderBasicContent(
          Math.round(current.apparent_temperature), 
          '°', 
          current.apparent_temperature > current.temperature_2m ? 'Olduğundan daha sıcak' : 'Olduğundan daha soğuk',
          `Rüzgar ve nem faktörleri hesaba katıldığında sıcaklık ${Math.round(current.apparent_temperature)}° olarak hissediliyor.`
      )
    },
    {
      id: 'wind',
      label: 'Rüzgar',
      value: current.wind_speed_10m,
      unit: ' km/s',
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
      unit: '°',
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
      value: current.surface_pressure,
      unit: ' hPa',
      icon: <Gauge size={24} className="text-purple-500 dark:text-purple-400" />,
      subtext: null,
      render: () => renderBasicContent(
          current.surface_pressure, 
          ' hPa', 
          'Atmosfer Basıncı',
          'Yüksek basınç genellikle açık havayı, alçak basınç ise bulutlu ve yağışlı havayı işaret eder.'
      )
    },
    {
      id: 'sun',
      label: 'Gün Doğumu',
      value: formatTime(daily.sunrise[0]),
      unit: '',
      icon: <Sun size={24} className="text-yellow-500 dark:text-yellow-400" />,
      subtext: null,
      render: renderSunContent
    },
    {
      id: 'sun', 
      label: 'Gün Batımı',
      value: formatTime(daily.sunset[0]),
      unit: '',
      icon: <Sun size={24} className="text-indigo-500 dark:text-indigo-400" />,
      subtext: null,
      render: renderSunContent
    }
  ];

  const activeItem = items.find(i => i.id === selectedDetail);

  return (
    <>
        <div className="grid grid-cols-2 gap-3 mb-6">
        {items.map((item, idx) => (
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
        ))}
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
                        rounded-3xl shadow-2xl overflow-hidden flex flex-col 
                        max-h-[85vh] transform transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1)
                        ${isClosing ? 'animate-pop-out' : 'animate-pop-in'}
                    `}
                >
                    {/* Handle & Header */}
                    <div className="pt-4 pb-2 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 sticky top-0">
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
