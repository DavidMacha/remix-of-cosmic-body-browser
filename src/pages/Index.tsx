import { useState, useEffect } from 'react';
import PlanetScene from '@/components/PlanetScene';
import PlanetInfo from '@/components/PlanetInfo';
import PlanetNavigation from '@/components/PlanetNavigation';
import PlanetSearch from '@/components/PlanetSearch';
import PlanetComparison from '@/components/PlanetComparison';
import { planets } from '@/data/planets';
import { toast } from '@/components/ui/use-toast';
import SupportChat from '@/components/SupportChat';

const Index = () => {
  const [selectedPlanetId, setSelectedPlanetId] = useState('earth');
  const [isLoading, setIsLoading] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [isSpaceView, setIsSpaceView] = useState(false);
  const [highlightPlanetId, setHighlightPlanetId] = useState<string | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId) || planets[2];

  const handleSelectPlanet = (id: string) => {
    if (id === selectedPlanetId) return;
    setIsLoading(true);
    setSceneReady(false);
    setSelectedPlanetId(id);
  };

  const handleSceneReady = () => {
    setSceneReady(true);
    setIsLoading(false);
  };

  const handleToggleSpaceView = () => {
    setIsSpaceView(!isSpaceView);
    toast({
      title: isSpaceView ? "Target Lock Engaged" : "Free Navigation Active",
      description: isSpaceView ? "Camera tracking selected body" : "Manual control enabled — navigate freely",
      duration: 3000,
    });
  };

  useEffect(() => {
    toast({
      title: "Mission Control Online",
      description: "Select a celestial body to begin observation.",
      duration: 5000,
    });

    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setSceneReady(true);
      }
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <div className="relative overflow-hidden w-full h-screen bg-background">
      {/* Mission Control Header */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="status-dot" />
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-foreground font-display">
            Space Explorer
          </h1>
        </div>
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground ml-5 font-body">
          Solar System Observation Platform
        </p>
      </div>

      {/* Search bar */}
      <PlanetSearch
        planets={planets}
        onSelectPlanet={handleSelectPlanet}
        onHighlightPlanet={setHighlightPlanetId}
      />

      <PlanetScene
        planet={selectedPlanet}
        planets={planets}
        onSceneReady={handleSceneReady}
        isSpaceView={isSpaceView}
        highlightPlanetId={highlightPlanetId}
      />

      {sceneReady && <PlanetInfo planet={selectedPlanet} />}

      <PlanetNavigation
        planets={planets}
        selectedPlanetId={selectedPlanetId}
        onSelectPlanet={handleSelectPlanet}
        onToggleSpaceView={handleToggleSpaceView}
        isSpaceView={isSpaceView}
        onOpenComparison={() => setIsComparisonOpen(true)}
      />

      <PlanetComparison
        planets={planets}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center space-y-3">
            <div className="text-foreground text-lg tracking-widest uppercase font-display">
              Acquiring {selectedPlanet.name}
            </div>
            <div className="w-48 h-0.5 bg-muted mx-auto overflow-hidden rounded-full relative">
              <div className="scan-line absolute inset-0" />
            </div>
            <p className="text-xs text-muted-foreground tracking-wider font-body">Initializing telemetry systems...</p>
          </div>
        </div>
      )}

      {/* Mission timestamp */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:block">
        <p className="telemetry-label">
          Mission Time: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
        </p>
      </div>

      <SupportChat />
    </div>
  );
};

export default Index;
