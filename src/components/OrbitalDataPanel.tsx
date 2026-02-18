import { useEffect, useState } from 'react';
import { PlanetData } from '@/data/planets';
import { calculatePosition, dateToJD, orbitalElements } from '@/data/keplerOrbits';

interface OrbitalDataPanelProps {
  planet: PlanetData;
}

const OrbitalDataPanel = ({ planet }: OrbitalDataPanelProps) => {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const update = () => {
      const jd = dateToJD(new Date());
      const pos = calculatePosition(planet.id, jd);
      setPosition(pos);
      setDistance(Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2));
    };

    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [planet.id]);

  const elem = orbitalElements[planet.id];
  if (!elem) return null;

  return (
    <div className="space-y-2 border-t border-border/50 pt-3 mt-3">
      <div className="telemetry-label mb-1">Orbital Mechanics (Kepler)</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <div className="telemetry-label">Semi-major Axis</div>
          <div className="telemetry-value text-xs">{elem.a.toFixed(4)} AU</div>
        </div>
        <div>
          <div className="telemetry-label">Eccentricity</div>
          <div className="telemetry-value text-xs">{elem.e.toFixed(6)}</div>
        </div>
        <div>
          <div className="telemetry-label">Inclination</div>
          <div className="telemetry-value text-xs">{elem.i.toFixed(4)}°</div>
        </div>
        <div>
          <div className="telemetry-label">Current Distance</div>
          <div className="telemetry-value text-xs">{distance.toFixed(4)} AU</div>
        </div>
        <div className="col-span-2">
          <div className="telemetry-label">Heliocentric Position</div>
          <div className="telemetry-value text-xs font-mono">
            ({position[0].toFixed(3)}, {position[1].toFixed(3)}, {position[2].toFixed(3)}) AU
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalDataPanel;
