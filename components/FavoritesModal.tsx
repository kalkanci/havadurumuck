
import React, { useEffect } from 'react';
import { X, MapPin, Trash2, Heart, Plus } from 'lucide-react';
import { GeoLocation } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: GeoLocation[];
  onSelect: (loc: GeoLocation) => void;
  onRemove: (id: number) => void;
  currentLocation: GeoLocation;
  onToggleCurrent: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ 
  isOpen, 
  onClose, 
  favorites, 
  onSelect, 
  onRemove,
  currentLocation,
  onToggleCurrent
}) => {
  const isCurrentFavorite = favorites.some(f => f.id === currentLocation.id);

  // Modal açıkken arkadaki scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 md:rounded-2xl rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-sheet-up">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={20} />
            <h2 className="text-xl font-bold text-white">Favori Şehirler</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Current Location Action */}
        <div className="p-4 border-b border-white/5">
             <button 
                onClick={onToggleCurrent}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${isCurrentFavorite ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
             >
                {isCurrentFavorite ? (
                    <>
                        <Trash2 size={18} />
                        {currentLocation.name} Favorilerden Çıkar
                    </>
                ) : (
                    <>
                        <Plus size={18} />
                        {currentLocation.name} Favorilere Ekle
                    </>
                )}
             </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <MapPin size={40} className="mx-auto mb-3" />
                <p>Henüz favori eklenmedi.</p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div 
                key={fav.id} 
                className="group glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
                onClick={() => { onSelect(fav); onClose(); }}
              >
                <div>
                   <h3 className="font-bold text-lg text-white">{fav.name}</h3>
                   <p className="text-sm text-slate-400">{fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}</p>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(fav.id); }}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
