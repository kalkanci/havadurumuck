import React, { useState } from 'react';
import { X, MapPin, Trash2, Settings, Info, Crosshair, Heart, Github, Cloud } from 'lucide-react';
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
}

const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  onSelect, 
  onRemove,
  settings,
  onUpdateSettings,
  onRequestLocation
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'menu'>('favorites');

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
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-slate-900 border-r border-slate-800 z-[70] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50">
          <h2 className="text-xl font-bold text-white tracking-wide">Atmosfer AI</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2">
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'favorites' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Heart size={16} /> Favoriler
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'menu' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings size={16} /> Menü
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
                  <p className="text-sm mt-2">Şehirleri arayıp kalp ikonuna tıklayarak ekleyin.</p>
                </div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className="group bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 flex justify-between items-center border border-slate-700/50 transition-all">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => { onSelect(fav); onClose(); }}
                    >
                      <h4 className="font-bold text-white">{fav.name}</h4>
                      <p className="text-xs text-slate-400">{fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(fav.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Settings Group: GPS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Konum Servisleri</h3>
                
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <Crosshair size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">GPS Yenile</p>
                        <p className="text-xs text-slate-400">Konumunuzu tekrar bulun</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onRequestLocation(); onClose(); }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Konum İznini Yenile / Al
                  </button>
                </div>
              </div>

              {/* Info Group */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hakkında</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Cloud size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-200">Veri Sağlayıcı</p>
                      <p className="text-xs text-slate-500">Open-Meteo & OpenStreetMap</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Settings size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-200">Sürüm</p>
                      <p className="text-xs text-slate-500">v2.1.0 (Mobile First)</p>
                    </div>
                  </div>

                   <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Github size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-200">Geliştirici</p>
                      <p className="text-xs text-slate-500">React & Gemini Powered</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/10">
                <p className="text-xs text-blue-300 text-center italic">
                  "Gökyüzüne bakmayı unutma."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;