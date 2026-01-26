
import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MapPin, X, Loader2 } from 'lucide-react';
import { GeoLocation } from '../types';
import { searchCity } from '../services/weatherService';

interface SearchProps {
  onSelect: (location: GeoLocation) => void;
  onCurrentLocation: () => void;
}

const Search: React.FC<SearchProps> = ({ onSelect, onCurrentLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        setIsOpen(true);
        const data = await searchCity(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (loc: GeoLocation) => {
    setQuery('');
    setIsOpen(false);
    onSelect(loc);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-zinc-500 dark:text-zinc-400">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Konum, sokak, mahalle..."
          aria-label="Şehir veya konum ara"
          className="w-full bg-white/10 backdrop-blur-xl text-white pl-10 pr-12 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 placeholder-white/50 transition-all shadow-lg"
        />
        {query ? (
          <button 
            onClick={() => setQuery('')}
            aria-label="Aramayı temizle"
            title="Aramayı temizle"
            className="absolute right-3 text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        ) : (
          <button 
            onClick={onCurrentLocation}
            aria-label="Mevcut konumu kullan"
            title="Mevcut konumu kullan"
            className="absolute right-3 text-white/50 hover:text-blue-400 transition-colors"
          >
            <MapPin size={20} />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar overflow-hidden z-[60]">
          {loading ? (
            <li className="px-4 py-4 flex items-center justify-center gap-3 text-white/50">
              <Loader2 size={18} className="animate-spin text-blue-400" />
              <span className="text-sm font-medium">Aranıyor...</span>
            </li>
          ) : (
            results.map((loc) => (
              <li
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="px-4 py-3 hover:bg-white/10 cursor-pointer flex flex-col border-b border-white/5 last:border-none transition-colors"
              >
                <span className="font-medium text-white">{loc.name}</span>
                <span className="text-xs text-white/50">
                  {loc.subtext || loc.country}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
