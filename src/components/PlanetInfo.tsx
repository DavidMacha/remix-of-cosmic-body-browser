import { PlanetData } from '@/data/planets';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import OrbitalDataPanel from '@/components/OrbitalDataPanel';

interface PlanetInfoProps {
  planet: PlanetData;
}

const PlanetInfo = ({ planet }: PlanetInfoProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = [
    { label: 'Diameter', value: `${planet.diameter.toLocaleString()} km` },
    { label: 'Distance', value: `${planet.distanceFromSun.toLocaleString()} M km` },
    { label: 'Day Length', value: `${planet.dayLength} Earth ${planet.dayLength === 1 ? 'day' : 'days'}` },
    { label: 'Year Length', value: `${planet.yearLength.toLocaleString()} Earth days` },
    { label: 'Moons', value: `${planet.moons}` },
    { label: 'Temperature', value: planet.temperature },
  ];

  return (
    <>
      <div className="md:hidden absolute bottom-4 left-4 z-30">
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          size="sm"
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-display"
        >
          {isMinimized ? planet.name : <ChevronDownIcon className="h-3 w-3" />}
        </Button>
      </div>

      <div className={`absolute bottom-4 left-4 z-20 transition-transform duration-300 ${
        isMinimized ? 'translate-y-full md:translate-y-0' : 'translate-y-0'
      } md:translate-y-0`}>
        
        <div className="hidden md:block">
          <div className="info-panel rounded-lg max-w-sm relative overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-muted/50 p-4 rounded-none rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.color, boxShadow: `0 0 8px ${planet.color}60` }}
                    />
                    <h2 className="text-lg font-bold text-foreground font-display">{planet.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="status-dot" />
                    {isExpanded ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4 max-h-[60vh] overflow-y-auto">
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{planet.description}</p>
                  
                  <div className="border-t border-border/50 pt-3">
                    <div className="telemetry-label mb-2">Telemetry Data</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {stats.map((stat) => (
                        <div key={stat.label}>
                          <div className="telemetry-label">{stat.label}</div>
                          <div className="telemetry-value text-sm">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <OrbitalDataPanel planet={planet} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="md:hidden">
          <div className="info-panel rounded-lg w-72 max-w-[calc(100vw-64px)] max-h-[60vh] overflow-auto relative">
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: planet.color, boxShadow: `0 0 6px ${planet.color}60` }} />
                <h2 className="text-base font-bold text-foreground font-display">{planet.name}</h2>
                <div className="status-dot ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-body">{planet.description}</p>
              
              <div className="border-t border-border/50 pt-2 space-y-1.5">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="telemetry-label">{stat.label}</span>
                    <span className="telemetry-value text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>

              <OrbitalDataPanel planet={planet} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetInfo;
