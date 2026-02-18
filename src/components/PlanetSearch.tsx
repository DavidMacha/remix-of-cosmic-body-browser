import { useState, useRef, useEffect } from 'react';
import { PlanetData } from '@/data/planets';
import { Search, Crosshair } from 'lucide-react';

interface PlanetSearchProps {
  planets: PlanetData[];
  onSelectPlanet: (id: string) => void;
  onHighlightPlanet: (id: string | null) => void;
}

const PlanetSearch = ({ planets, onSelectPlanet, onHighlightPlanet }: PlanetSearchProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? planets.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    if (filtered.length === 1) {
      onHighlightPlanet(filtered[0].id);
    } else {
      onHighlightPlanet(null);
    }
  }, [query]);

  const handleSelect = (id: string) => {
    onSelectPlanet(id);
    setQuery('');
    setIsFocused(false);
    onHighlightPlanet(null);
    inputRef.current?.blur();
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-72">
      <div className={`info-panel rounded-lg overflow-hidden transition-all duration-300 ${
        isFocused ? 'ring-1 ring-nasa-cyan/50' : ''
      }`}>
        <div className="flex items-center px-3 py-2 gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search celestial bodies..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-body tracking-wide"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); onHighlightPlanet(null); }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {isFocused && filtered.length > 0 && (
          <div className="border-t border-border/30">
            {filtered.map(planet => (
              <button
                key={planet.id}
                onMouseDown={() => handleSelect(planet.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color, boxShadow: `0 0 6px ${planet.color}60` }}
                />
                <span className="text-sm text-foreground font-body">{planet.name}</span>
                <Crosshair className="h-3 w-3 text-nasa-cyan ml-auto animate-pulse" />
              </button>
            ))}
          </div>
        )}

        {isFocused && query && filtered.length === 0 && (
          <div className="border-t border-border/30 px-3 py-3">
            <p className="text-xs text-muted-foreground text-center font-body">No celestial body found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetSearch;
