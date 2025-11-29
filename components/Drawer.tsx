
import React, { useState } from 'react';
import { X, MapPin, Trash2, Settings, Thermometer, Wind, Github, Heart, Share2, RefreshCcw, Mail, Info } from 'lucide-react';
import { GeoLocation, UserSettings } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: GeoLocation[];
  onSelect: (loc: GeoLocation) => void;
  onRemove: (id: number) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onRequestLocation: () => void;
  currentLocationName?: string;
  currentTemp?: number;
  currentCondition?: string;
}

const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  onSelect, 
  onRemove,
  settings,
  onUpdateSettings,
  onRequestLocation,
  currentLocationName,
  currentTemp,
  currentCondition
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'settings'>('favorites');

  const handleShare = () => {
    if (currentLocationName && currentTemp) {
        const text = `Atmosfer AI: ${currentLocationName} şu an ${currentTemp}°C ve ${currentCondition}.`;
        if (navigator.share) {
            navigator.share({
                title: 'Hava Durumu',
                text: text,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            alert("Durum kopyalandı!");
        }
    }
  };

  const handleReset = () => {
      if (confirm("Tüm favoriler ve ayarlar silinecek. Emin misiniz?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer Panel */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-[70] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-wide">Atmosfer AI</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 pt-2">
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'favorites' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Heart size={16} /> Favoriler
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings size={16} /> Ayarlar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {activeTab === 'favorites' ? (
            <div className="space-y-3">
              {favorites.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">
                  <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Henüz favori yok.</p>
                  <p className="text-sm mt-2 opacity-70">Arama yaparak şehir ekleyin.</p>
                </div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className="group glass-card hover:bg-white/5 rounded-xl p-4 flex justify-between items-center transition-all">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => { onSelect(fav); onClose(); }}
                    >
                      <h4 className="font-bold text-white">{fav.name}</h4>
                      <p className="text-xs text-slate-400">{fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(fav.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Birim Ayarları (Visual Only) */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Birimler</h3>
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                        <Thermometer size={20} />
                      </div>
                      <span className="font-medium text-white">Sıcaklık</span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">Celsius (°C)</span>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                        <Wind size={20} />
                      </div>
                      <span className="font-medium text-white">Rüzgar Hızı</span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">km/s</span>
                  </div>
                </div>
              </section>

               {/* GPS */}
               <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Konum</h3>
                <div className="glass-card rounded-xl p-4">
                   <button 
                    onClick={() => { onRequestLocation(); onClose(); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} /> GPS Konumunu Yenile
                  </button>
                </div>
               </section>

               {/* Diğer */}
               <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Diğer İşlemler</h3>
                <div className="glass-card rounded-xl overflow-hidden">
                   
                   <button 
                    onClick={handleShare}
                    className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                   >
                       <Share2 size={20} className="text-slate-400" />
                       <span className="text-sm font-medium text-slate-200">Durumu Paylaş</span>
                   </button>

                   <button 
                    onClick={handleReset}
                    className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                   >
                       <RefreshCcw size={20} className="text-slate-400" />
                       <span className="text-sm font-medium text-slate-200">Verileri Sıfırla</span>
                   </button>

                   <div className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left cursor-default">
                       <Mail size={20} className="text-slate-400" />
                       <div>
                           <span className="text-sm font-medium text-slate-200 block">İletişim</span>
                           <span className="text-xs text-slate-500">iletisim@atmosfer.ai</span>
                       </div>
                   </div>

                </div>
               </section>

              {/* Info */}
              <section className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between px-2 opacity-60">
                   <span className="text-xs text-slate-500">v2.5.1 Premium</span>
                   <Github size={16} className="text-slate-500" />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;
