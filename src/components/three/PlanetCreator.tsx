import * as THREE from 'three';
import { PlanetData } from '@/data/planets';
import { createOrbitPath } from './Animator';

interface PlanetObject {
  mesh: THREE.Mesh;
  orbitMesh?: THREE.Line;
  moons?: THREE.Mesh[];
  moonOrbitMeshes?: THREE.Line[];
  ringsMesh?: THREE.Mesh;
}

export interface SolarSystemObjects {
  planetObjects: Map<string, PlanetObject>;
  asteroidBelt?: THREE.Group;
  kuiperBelt?: THREE.Group;
  oortCloud?: THREE.Mesh;
  comets?: THREE.Group;
}

// Moon data for each planet
const moonData: { [key: string]: { count: number; distance: number; size: number } } = {
  earth: { count: 1, distance: 3.0, size: 0.20 },
  mars: { count: 2, distance: 2.5, size: 0.10 },
  jupiter: { count: 12, distance: 8.0, size: 0.15 },
  saturn: { count: 10, distance: 10.0, size: 0.12 },
  uranus: { count: 8, distance: 6.0, size: 0.11 },
  neptune: { count: 6, distance: 5.0, size: 0.13 }
};

// Planet color maps for procedural texture generation
const planetColorSchemes: { [key: string]: { base: string; accent: string; detail: string } } = {
  mercury: { base: '#8C7E6F', accent: '#A59585', detail: '#6B5E50' },
  venus: { base: '#D4A860', accent: '#E8C87A', detail: '#B89040' },
  earth: { base: '#4A7AB5', accent: '#3D9540', detail: '#E8DCC0' },
  mars: { base: '#C1582A', accent: '#A04020', detail: '#D4783E' },
  jupiter: { base: '#C4A56A', accent: '#D4B880', detail: '#A08050' },
  saturn: { base: '#D4C8A0', accent: '#E0D4B0', detail: '#B8AC80' },
  uranus: { base: '#88C8D8', accent: '#A0D8E8', detail: '#70B0C0' },
  neptune: { base: '#3050B0', accent: '#4060C0', detail: '#2040A0' },
};

/**
 * Generate a procedural planet texture on a canvas
 * Eliminates dependency on external texture files
 */
const generatePlanetTexture = (planetId: string, size: number = 512): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  
  const colors = planetColorSchemes[planetId] || { base: '#888888', accent: '#AAAAAA', detail: '#666666' };
  
  // Base color fill
  ctx.fillStyle = colors.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add surface detail based on planet type
  if (planetId === 'earth') {
    // Continents
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      const cx = Math.random() * canvas.width;
      const cy = canvas.height * 0.2 + Math.random() * canvas.height * 0.6;
      const rx = 30 + Math.random() * 60;
      const ry = 20 + Math.random() * 40;
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Polar caps
    ctx.fillStyle = '#E8E8F0';
    ctx.fillRect(0, 0, canvas.width, 15);
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
    // Clouds
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 40 + Math.random() * 50, 8 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (planetId === 'jupiter' || planetId === 'saturn') {
    // Gas giant bands
    const bandCount = planetId === 'jupiter' ? 12 : 8;
    for (let i = 0; i < bandCount; i++) {
      const y = (i / bandCount) * canvas.height;
      const bandHeight = canvas.height / bandCount;
      ctx.fillStyle = i % 2 === 0 ? colors.accent : colors.detail;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(0, y, canvas.width, bandHeight);
    }
    ctx.globalAlpha = 1;
    // Great Red Spot for Jupiter
    if (planetId === 'jupiter') {
      ctx.fillStyle = '#C06040';
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.6, canvas.height * 0.55, 30, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'mars') {
    // Mars surface features
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = colors.detail;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 5 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Polar caps
    ctx.fillStyle = '#E0D8D0';
    ctx.fillRect(0, 0, canvas.width, 12);
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
  } else if (planetId === 'venus') {
    // Dense cloud cover
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 50 + Math.random() * 80, 15, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (planetId === 'uranus' || planetId === 'neptune') {
    // Ice giant atmosphere bands (subtle)
    for (let i = 0; i < 6; i++) {
      const y = (i / 6) * canvas.height;
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(0, y, canvas.width, canvas.height / 8);
    }
    ctx.globalAlpha = 1;
  } else {
    // Mercury/generic: craters
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 3 + Math.random() * 10;
      ctx.strokeStyle = colors.detail;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

export const createSolarSystem = (
  scene: THREE.Scene, 
  planets: PlanetData[],
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSceneReady?: () => void
): SolarSystemObjects => {
  const planetObjects = new Map<string, PlanetObject>();
  
  const orbitRadii: { [key: string]: number } = {
    mercury: 60,
    venus: 85,
    earth: 115,
    mars: 155,
    jupiter: 280,
    saturn: 380,
    uranus: 480,
    neptune: 580
  };
  
  const planetScales: { [key: string]: number } = {
    mercury: 1.2,
    venus: 2.3,
    earth: 2.5,
    mars: 1.8,
    jupiter: 8.0,
    saturn: 7.0,
    uranus: 4.5,
    neptune: 4.3,
  };
  
  planets.forEach(planet => {
    const orbitRadius = orbitRadii[planet.id] || (115 + planetObjects.size * 50);
    const orbitPath = createOrbitPath(orbitRadius);
    scene.add(orbitPath);
    
    const planetScale = planetScales[planet.id] || planet.scale * 2.0;
    
    const geometry = new THREE.SphereGeometry(planetScale, 64, 64);
    
    // Generate procedural texture instead of loading external files
    const texture = generatePlanetTexture(planet.id);
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
    });
    
    const planetMesh = new THREE.Mesh(geometry, material);
    
    // Random starting position on orbit
    const startAngle = Math.random() * Math.PI * 2;
    planetMesh.position.x = Math.cos(startAngle) * orbitRadius;
    planetMesh.position.z = Math.sin(startAngle) * orbitRadius;
    
    scene.add(planetMesh);
    
    const planetObj: PlanetObject = {
      mesh: planetMesh,
      orbitMesh: orbitPath,
      moons: [],
      moonOrbitMeshes: []
    };
    
    planetObjects.set(planet.id, planetObj);
    
    // Add Saturn's rings
    if (planet.id === 'saturn') {
      const ringsMesh = createSaturnRings(planetScale, planetMesh);
      planetObj.ringsMesh = ringsMesh;
      scene.add(ringsMesh);
    }
    
    // Add moons
    if (moonData[planet.id]) {
      const moonInfo = moonData[planet.id];
      
      for (let i = 0; i < moonInfo.count; i++) {
        const moonGeometry = new THREE.SphereGeometry(moonInfo.size, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xdddddd,
          roughness: 0.8,
        });
        
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        
        const moonAngle = (i / moonInfo.count) * Math.PI * 2;
        const moonDistance = moonInfo.distance + (i * 0.5);
        moonMesh.position.x = planetMesh.position.x + Math.cos(moonAngle) * moonDistance;
        moonMesh.position.y = planetMesh.position.y;
        moonMesh.position.z = planetMesh.position.z + Math.sin(moonAngle) * moonDistance;
        
        scene.add(moonMesh);
        planetObj.moons!.push(moonMesh);
        
        // Moon orbit path
        const moonOrbitGeometry = new THREE.BufferGeometry();
        const moonOrbitVertices: number[] = [];
        
        for (let j = 0; j <= 64; j++) {
          const theta = (j / 64) * Math.PI * 2;
          moonOrbitVertices.push(Math.cos(theta) * moonDistance, 0, Math.sin(theta) * moonDistance);
        }
        
        moonOrbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(moonOrbitVertices, 3));
        
        const moonOrbitMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.2
        });
        
        const moonOrbitMesh = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
        moonOrbitMesh.position.copy(planetMesh.position);
        
        scene.add(moonOrbitMesh);
        planetObj.moonOrbitMeshes!.push(moonOrbitMesh);
      }
    }
  });
  
  // Signal ready immediately since we use procedural textures (no async loading)
  setIsLoading(false);
  if (onSceneReady) onSceneReady();
  
  // Create belts and extra objects
  const asteroidBelt = createAsteroidBelt();
  scene.add(asteroidBelt);
  
  const kuiperBelt = createKuiperBelt();
  scene.add(kuiperBelt);
  
  const oortCloud = createOortCloud();
  scene.add(oortCloud);
  
  const comets = createComets();
  scene.add(comets);
  
  return { planetObjects, asteroidBelt, kuiperBelt, oortCloud, comets };
};

export const createSaturnRings = (planetScale: number, planetMesh: THREE.Mesh): THREE.Mesh => {
  const ringGeometry = new THREE.RingGeometry(planetScale * 2.2, planetScale * 4.5, 256, 16);
  
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4e4bc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    roughness: 0.8,
    metalness: 0.0,
  });
  
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.rotation.x = Math.PI / 2;
  rings.rotation.z = 26.7 * (Math.PI / 180);
  rings.position.copy(planetMesh.position);
  
  return rings;
};

const createAsteroidBelt = (): THREE.Group => {
  const asteroidGroup = new THREE.Group();
  const asteroidCount = 150;
  const innerRadius = 195;
  const outerRadius = 240;
  
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidGeometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2),
      roughness: 0.9,
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const height = (Math.random() - 0.5) * 8;
    
    asteroid.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    asteroidGroup.add(asteroid);
  }
  
  return asteroidGroup;
};

const createKuiperBelt = (): THREE.Group => {
  const kuiperGroup = new THREE.Group();
  const objectCount = 80;
  const innerRadius = 640;
  const outerRadius = 780;
  
  for (let i = 0; i < objectCount; i++) {
    const objectGeometry = new THREE.SphereGeometry(Math.random() * 0.4 + 0.2, 12, 12);
    const objectMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.4, Math.random() * 0.4 + 0.3),
      roughness: 0.8,
    });
    
    const kuiperObject = new THREE.Mesh(objectGeometry, objectMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const height = (Math.random() - 0.5) * 15;
    
    kuiperObject.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    kuiperGroup.add(kuiperObject);
  }
  
  // Dwarf planets
  const dwarfPlanets = [
    { name: 'Pluto', color: 0xc49c7c, size: 1.2, distance: 680 },
    { name: 'Eris', color: 0xd4d4d4, size: 1.1, distance: 720 },
    { name: 'Haumea', color: 0xf0e8d0, size: 0.8, distance: 700 },
    { name: 'Makemake', color: 0xcd5c5c, size: 0.7, distance: 740 }
  ];
  
  dwarfPlanets.forEach((dwarf, index) => {
    const dwarfGeometry = new THREE.SphereGeometry(dwarf.size, 24, 24);
    const dwarfMaterial = new THREE.MeshStandardMaterial({ color: dwarf.color, roughness: 0.7 });
    const dwarfPlanet = new THREE.Mesh(dwarfGeometry, dwarfMaterial);
    
    const angle = (index / dwarfPlanets.length) * Math.PI * 2;
    dwarfPlanet.position.set(Math.cos(angle) * dwarf.distance, (Math.random() - 0.5) * 10, Math.sin(angle) * dwarf.distance);
    kuiperGroup.add(dwarfPlanet);
  });
  
  return kuiperGroup;
};

const createOortCloud = (): THREE.Mesh => {
  const cloudGeometry = new THREE.SphereGeometry(1200, 32, 16);
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0x404080,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
    wireframe: true
  });
  return new THREE.Mesh(cloudGeometry, cloudMaterial);
};

const createComets = (): THREE.Group => {
  const cometGroup = new THREE.Group();
  const cometCount = 8;
  
  for (let i = 0; i < cometCount; i++) {
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const nucleusMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    
    const tailGeometry = new THREE.ConeGeometry(2, 20, 8);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.3 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -10;
    tail.rotation.x = Math.PI / 2;
    
    const comet = new THREE.Group();
    comet.add(nucleus);
    comet.add(tail);
    
    const angle = (i / cometCount) * Math.PI * 2;
    const distance = 400 + Math.random() * 400;
    comet.position.set(Math.cos(angle) * distance, (Math.random() - 0.5) * 50, Math.sin(angle) * distance);
    comet.lookAt(0, 0, 0);
    comet.rotateY(Math.PI);
    
    cometGroup.add(comet);
  }
  
  return cometGroup;
};