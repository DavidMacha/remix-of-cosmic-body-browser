import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface AnimationProps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  planetObjects: Map<string, any>;
  selectedPlanetId: string;
  isSpaceView?: boolean;
  reticleRef?: React.MutableRefObject<THREE.Group | null>;
}

export const setupAnimation = ({
  renderer, scene, camera, planetObjects, selectedPlanetId, isSpaceView = false, reticleRef
}: AnimationProps) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  let time = 0;
  const targetPosition = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();

  const animate = () => {
    time += 0.005;

    planetObjects.forEach((planetObj, planetId) => {
      if (planetObj.mesh && planetObj.orbitMesh) {
        const positions = planetObj.orbitMesh.geometry.attributes.position.array;
        const orbitRadius = Math.sqrt(positions[0] * positions[0] + positions[2] * positions[2]);
        const speedMultiplier = getOrbitalSpeed(planetId);
        const angle = time * speedMultiplier;

        planetObj.mesh.position.x = Math.cos(angle) * orbitRadius;
        planetObj.mesh.position.z = Math.sin(angle) * orbitRadius;
        planetObj.mesh.rotation.y += 0.01;

        if (planetId === 'saturn' && planetObj.ringsMesh) {
          planetObj.ringsMesh.position.copy(planetObj.mesh.position);
          planetObj.ringsMesh.rotation.y += 0.003;
        }

        if (planetObj.moons && planetObj.moonOrbitMeshes) {
          planetObj.moons.forEach((moon: THREE.Mesh, index: number) => {
            const moonOrbit = planetObj.moonOrbitMeshes[index];
            if (moonOrbit) {
              const moonPositions = moonOrbit.geometry.attributes.position.array;
              const moonRadius = Math.sqrt(moonPositions[0] * moonPositions[0] + moonPositions[2] * moonPositions[2]);
              const moonAngle = time * (speedMultiplier * 5 + index);

              moon.position.x = planetObj.mesh.position.x + Math.cos(moonAngle) * moonRadius;
              moon.position.y = planetObj.mesh.position.y;
              moon.position.z = planetObj.mesh.position.z + Math.sin(moonAngle) * moonRadius;
              moonOrbit.position.copy(planetObj.mesh.position);
            }
          });
        }
      }
    });

    // Belts & comets
    const asteroidBelt = scene.getObjectByName('asteroidBelt');
    if (asteroidBelt) asteroidBelt.rotation.y += 0.0005;
    const kuiperBelt = scene.getObjectByName('kuiperBelt');
    if (kuiperBelt) kuiperBelt.rotation.y += 0.0002;
    const comets = scene.getObjectByName('comets');
    if (comets) {
      comets.children.forEach((comet, index) => {
        const cometAngle = time * 0.1 + (index * Math.PI * 2 / comets.children.length);
        const distance = 200 + Math.sin(time * 0.2 + index) * 100;
        comet.position.x = Math.cos(cometAngle) * distance;
        comet.position.z = Math.sin(cometAngle) * distance;
        comet.lookAt(0, 0, 0);
        comet.rotateY(Math.PI);
      });
    }

    // Animate targeting reticle
    if (reticleRef?.current) {
      reticleRef.current.rotation.y = time * 2;
      // Follow the highlighted planet
      const selectedObj = Array.from(planetObjects.entries()).find(([_, obj]) => {
        const reticlePos = reticleRef.current!.position;
        // Snap reticle to the planet it's nearest to
        return obj.mesh && obj.mesh.position.distanceTo(reticlePos) < 50;
      });
      // Just spin the reticle; position is updated by PlanetScene effect
    }

    // Slow-rotate constellation group for subtle movement
    const constGroup = scene.getObjectByName('constellations');
    if (constGroup) constGroup.rotation.y += 0.00005;

    // Camera follow
    if (!isSpaceView) {
      const selectedPlanet = planetObjects.get(selectedPlanetId);
      if (selectedPlanet?.mesh) {
        targetPosition.copy(selectedPlanet.mesh.position);
        targetPosition.y += 25;
        targetPosition.z += 40;
        targetLookAt.copy(selectedPlanet.mesh.position);

        camera.position.lerp(targetPosition, 0.02);
        const currentTarget = controls.target.clone();
        currentTarget.lerp(targetLookAt, 0.02);
        controls.target.copy(currentTarget);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    return requestAnimationFrame(animate);
  };

  const frameId = animate();
  return { frameId, controls };
};

const getOrbitalSpeed = (planetId: string): number => {
  const speeds: Record<string, number> = {
    mercury: 2.0, venus: 1.6, earth: 1.0, mars: 0.8,
    jupiter: 0.4, saturn: 0.3, uranus: 0.2, neptune: 0.15,
  };
  return speeds[planetId] || 1.0;
};

export const setupResizeHandler = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  mountRef: React.RefObject<HTMLDivElement>
) => {
  const handleResize = () => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};

export const createOrbitPath = (radius: number): THREE.Line => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i <= 128; i++) {
    const theta = (i / 128) * Math.PI * 2;
    vertices.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0x334466,
    transparent: true,
    opacity: 0.2,
  });
  return new THREE.Line(geometry, material);
};
