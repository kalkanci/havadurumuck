
import React from 'react';
import { X, MapPin, Trash2, Plus, Star, Navigation } from 'lucide-react';
import { GeoLocation } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: GeoLocation[];
  currentLocation: GeoLocation;
  onSelect: (loc: GeoLocation) => void;
  onRemove: (id: number) => void;
  onAdd: (loc: GeoLocation) => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  currentLocation,
  onSelect, 
  onRemove,
  onAdd
}) => {
  if (!isOpen) return null;

  const isCurrentFavorite = favorites.some(f => f.id === currentLocation.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/20 rounded-lg">
                <Star size={18} className="text-red-400 fill-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Favorilerim</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Area (Add/Remove Current) */}
        <div className="p-5 bg-gradient-to-b from-zinc-800/50 to-transparent">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Şu Anki Konum</span>
            </div>
            
            <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
                <div>
                    <h3 className="font-bold text-white">{currentLocation.name}</h3>
                    <p className="text-xs text-zinc-400">{currentLocation.country}</p>
                </div>
                
                {!isCurrentFavorite ? (
                    <button 
                        onClick={() => onAdd(currentLocation)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={14} /> Ekle
                    </button>
                ) : (
                    <button 
                        onClick={() => onRemove(currentLocation.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={14} /> Kaldır
                    </button>
                )}
            </div>
        </div>

        {/* List */}
        <div className="p-5 pt-0 max-h-[50vh] overflow-y-auto no-scrollbar space-y-3">
          <div className="flex items-center justify-between mb-2 px-1">
             <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Kayıtlı Şehirler ({favorites.length})</span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">
              <MapPin size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz favori eklenmedi.</p>
            </div>
          ) : (
            favorites.map(fav => (
              <div 
                key={fav.id} 
                className={`glass-card p-3 rounded-xl flex justify-between items-center transition-all hover:bg-white/5 border border-white/5 ${fav.id === currentLocation.id ? 'ring-1 ring-blue-500/50' : ''}`}
              >
                <div 
                  className="flex-1 cursor-pointer flex items-center gap-3"
                  onClick={() => { onSelect(fav); onClose(); }}
                >
                  <div className="p-2 bg-zinc-800 rounded-full">
                      <Navigation size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{fav.name}</h4>
                    <p className="text-[10px] text-zinc-400">{fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}</p>
                  </div>
                </div>
                
                {/* Mevcut konum favoriler listesindeyse silme butonu burada görünmesin, yukarıdan yönetilsin. Sadece diğerleri için göster. */}
                {fav.id !== currentLocation.id && (
                    <button 
                    onClick={() => onRemove(fav.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                    <Trash2 size={16} />
                    </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/50 text-center">
            <p className="text-[10px] text-zinc-600">Favorileri yönetmek için listeyi kullanın.</p>
        </div>

      </div>
    </div>
  );
};

export default FavoritesModal;
