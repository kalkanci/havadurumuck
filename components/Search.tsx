
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
        const data = await searchCity(query);
        setResults(data);
        setLoading(false);
        setIsOpen(true);
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
          {loading ? (
             <Loader2 size={20} className="animate-spin text-blue-500" />
          ) : (
             <SearchIcon size={20} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Konum, sokak, mahalle..."
          className="w-full bg-white/70 dark:bg-zinc-800/80 backdrop-blur-md text-zinc-900 dark:text-white pl-10 pr-12 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-zinc-500 dark:placeholder-zinc-400 transition-all shadow-lg"
        />
        {query ? (
          <button 
            onClick={() => setQuery('')}
            aria-label="Aramayı Temizle"
            className="absolute right-3 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        ) : (
          <button 
            onClick={onCurrentLocation}
            aria-label="Mevcut Konum"
            className="absolute right-3 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
          >
            <MapPin size={20} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar overflow-hidden">
          {results.map((loc) => (
            <li
              key={loc.id}
              className="border-b border-zinc-100 dark:border-zinc-700/50 last:border-none"
            >
              <button
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex flex-col transition-colors focus:outline-none focus:bg-black/5 dark:focus:bg-white/10"
              >
                <span className="font-medium text-zinc-900 dark:text-white">{loc.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {loc.subtext || loc.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
