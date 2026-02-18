import { Button } from '@/components/ui/button';
import { PlanetData } from '@/data/planets';
import { RocketIcon, MenuIcon, XIcon, ChevronDownIcon, GitCompareArrows } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlanetNavigationProps {
  planets: PlanetData[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  onToggleSpaceView?: () => void;
  isSpaceView?: boolean;
  onOpenComparison?: () => void;
}

const PlanetNavigation = ({
  planets, selectedPlanetId, onSelectPlanet, onToggleSpaceView, isSpaceView = false, onOpenComparison
}: PlanetNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="md:hidden absolute top-4 right-4 z-30">
        <Button onClick={() => setIsOpen(!isOpen)} size="sm" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border">
          {isOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </Button>
      </div>

      <div className={`absolute top-4 right-4 z-20 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      } md:translate-x-0`}>
        
        <div className="hidden md:block">
          <div className="info-panel rounded-lg p-3 max-w-xs relative overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-muted/50 p-2">
                  <span className="font-bold text-sm tracking-widest uppercase text-foreground font-display">Navigation</span>
                  <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-body"
                    variant="ghost"
                    onClick={onToggleSpaceView}
                  >
                    <RocketIcon className="mr-1.5 h-3.5 w-3.5" />
                    {isSpaceView ? "Lock Target" : "Free Nav"}
                  </Button>
                  <Button
                    className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs font-body"
                    variant="ghost"
                    onClick={onOpenComparison}
                  >
                    <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
                    Compare
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-0.5 max-h-64 overflow-y-auto">
                  {planets.map(planet => (
                    <Button
                      key={planet.id}
                      className={`planet-btn w-full text-left text-sm justify-start rounded-sm ${
                        selectedPlanetId === planet.id
                          ? 'bg-primary/15 text-foreground border-l-2 border-l-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      variant="ghost"
                      onClick={() => onSelectPlanet(planet.id)}
                    >
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0" style={{
                        backgroundColor: planet.color,
                        boxShadow: selectedPlanetId === planet.id ? `0 0 6px ${planet.color}80` : 'none'
                      }} />
                      <span className="truncate text-xs tracking-wide font-body">{planet.name}</span>
                      {selectedPlanetId === planet.id && <span className="ml-auto status-dot" />}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="md:hidden">
          <div className="info-panel rounded-lg p-4 w-72 max-h-96 overflow-y-auto relative">
            <h2 className="text-foreground font-bold mb-4 text-sm tracking-widest uppercase font-display">Navigation</h2>
            
            <div className="flex gap-2 mb-4">
              <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs" variant="ghost" onClick={() => { onToggleSpaceView?.(); setIsOpen(false); }}>
                <RocketIcon className="mr-1.5 h-3.5 w-3.5" />
                {isSpaceView ? "Lock" : "Free Nav"}
              </Button>
              <Button className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs" variant="ghost" onClick={() => { onOpenComparison?.(); setIsOpen(false); }}>
                <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
                Compare
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-0.5">
              {planets.map(planet => (
                <Button
                  key={planet.id}
                  className={`planet-btn w-full text-left text-xs justify-start rounded-sm ${
                    selectedPlanetId === planet.id
                      ? 'bg-primary/15 text-foreground border-l-2 border-l-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  variant="ghost"
                  onClick={() => { onSelectPlanet(planet.id); setIsOpen(false); }}
                >
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0" style={{
                    backgroundColor: planet.color,
                    boxShadow: selectedPlanetId === planet.id ? `0 0 6px ${planet.color}80` : 'none'
                  }} />
                  <span className="truncate tracking-wide">{planet.name}</span>
                  {selectedPlanetId === planet.id && <span className="ml-auto status-dot" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetNavigation;
