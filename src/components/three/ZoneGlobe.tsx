"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import zonesFixture from "@/fixtures/zones.json";
import { riskToSeverity } from "@/lib/ui-meta";

const SEV_HEX: Record<string, string> = { low: "#34D399", medium: "#FBBF24", high: "#FB7185" };

interface Zone {
  id: string;
  name: string;
  centroid: [number, number];
  riskScore: number;
}

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/* ── Fresnel atmosphere — the glowing rim around the planet ───────── */
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#3aa6d8") },
          uIntensity: { value: 0.5 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          uniform vec3 uColor;
          uniform float uIntensity;
          void main() {
            float rim = 1.0 - max(dot(vNormal, vView), 0.0);
            rim = pow(rim, 4.5);
            gl_FragColor = vec4(uColor * uIntensity, rim);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  return <mesh scale={1.14} geometry={UNIT_SPHERE} material={material} />;
}

/* ── Starfield — faint depth behind the planet ───────────────────── */
function Stars() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = frand(i + 1);
      const v = frand(i + 99);
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 6 + frand(i + 7) * 6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.006;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.03} color="#9fb6d6" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* ── Beacon — pillar + tip + radar-pulse ring at a zone ──────────── */
function Beacon({ zone, index }: { zone: Zone; index: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const hex = SEV_HEX[riskToSeverity(zone.riskScore)];
  const t = zone.riskScore / 100;
  const height = 0.1 + t * 0.22;

  const { surface, mid, tip, pillarQuat, ringQuat } = useMemo(() => {
    const surface = latLngToVec3(zone.centroid[0], zone.centroid[1], 1.0);
    const dir = surface.clone().normalize();
    const mid = dir.clone().multiplyScalar(1.0 + height / 2);
    const tip = dir.clone().multiplyScalar(1.0 + height);
    const pillarQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const ringQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    return { surface, mid, tip, pillarQuat, ringQuat };
  }, [zone.centroid, height]);

  const baseRing = 0.03 + t * 0.02;
  const period = 2.6;
  const phase = index * 0.4;

  useFrame((state) => {
    if (!ring.current) return;
    const p = ((state.clock.elapsedTime + phase) % period) / period;
    const s = 1 + p * 2.4;
    ring.current.scale.set(s, s, s);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.55;
  });

  return (
    <group>
      <mesh position={mid} quaternion={pillarQuat}>
        <cylinderGeometry args={[0.004, 0.004, height, 6]} />
        <meshBasicMaterial color={hex} transparent opacity={0.9} />
      </mesh>
      <mesh position={tip}>
        <sphereGeometry args={[0.02 + t * 0.012, 16, 16]} />
        <meshBasicMaterial color={hex} />
      </mesh>
      <mesh position={tip}>
        <sphereGeometry args={[0.038 + t * 0.02, 16, 16]} />
        <meshBasicMaterial color={hex} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring} position={surface.clone().multiplyScalar(1.003)} quaternion={ringQuat}>
        <ringGeometry args={[baseRing, baseRing * 1.35, 40]} />
        <meshBasicMaterial color={hex} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Real Earth — NASA Blue Marble day map, bathymetry specular,
   normals, city lights, and a drifting cloud layer. ─────────────── */
function Earth() {
  const clouds = useRef<THREE.Mesh>(null);
  const [day, normal, specular, cloud, lights] = useTexture([
    "/textures/earth_atmos_2048.jpg",
    "/textures/earth_normal_2048.jpg",
    "/textures/earth_specular_2048.jpg",
    "/textures/earth_clouds_1024.png",
    "/textures/earth_lights_2048.png",
  ]);

  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    lights.colorSpace = THREE.SRGBColorSpace;
    cloud.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
  }, [day, lights, cloud]);

  useFrame((_, d) => {
    if (clouds.current) clouds.current.rotation.y += d * 0.015;
  });

  return (
    <group>
      {/* the planet */}
      <mesh geometry={UNIT_SPHERE}>
        <meshPhongMaterial
          map={day}
          normalMap={normal}
          normalScale={new THREE.Vector2(0.7, 0.7)}
          specularMap={specular}
          specular={new THREE.Color("#2b5673")}
          shininess={16}
          emissiveMap={lights}
          emissive={new THREE.Color("#ffcf87")}
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* drifting clouds */}
      <mesh ref={clouds} scale={1.012} geometry={UNIT_SPHERE}>
        <meshPhongMaterial map={cloud} transparent opacity={0.72} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── School — detailed CC0 Barramundi fish drifting around the globe ─ */
const FISH = [
  { r: 1.42, scale: 0.42, speed: 0.22, tilt: [0.5, 0, 0.15], phase: 0 },
  { r: 1.58, scale: 0.34, speed: -0.17, tilt: [-0.35, 0, 0.5], phase: 2.1 },
  { r: 1.33, scale: 0.5, speed: 0.15, tilt: [0.15, 0, -0.6], phase: 4.0 },
  { r: 1.66, scale: 0.3, speed: -0.24, tilt: [0.8, 0, -0.2], phase: 1.2 },
] as const;

function Fish({
  r,
  scale,
  speed,
  tilt,
  phase,
  animate,
}: (typeof FISH)[number] & { animate: boolean }) {
  const orbit = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/fish.glb");
  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((state) => {
    const t = animate ? state.clock.elapsedTime : phase;
    if (orbit.current) orbit.current.rotation.y = t * speed + phase;
    if (bob.current) bob.current.position.y = Math.sin(t * 1.4 + phase) * 0.04;
  });

  return (
    <group ref={orbit} rotation={tilt as unknown as [number, number, number]}>
      <group position={[r, 0, 0]} rotation={[0, Math.PI, 0]}>
        <group ref={bob}>
          <primitive object={model} scale={scale} />
        </group>
      </group>
    </group>
  );
}

function School({ animate }: { animate: boolean }) {
  return (
    <>
      {FISH.map((f, i) => (
        <Fish key={i} {...f} animate={animate} />
      ))}
    </>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const zones = zonesFixture as unknown as Zone[];

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y += delta * 0.09;
  });

  return (
    <group ref={group} rotation={[0.4, 0, 0.08]}>
      <Earth />
      {zones.map((z, i) => (
        <Beacon key={z.id} zone={z} index={i} />
      ))}
    </group>
  );
}

export default function ZoneGlobe({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.9], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 2, 3]} intensity={1.6} color="#fff4e0" />
      <directionalLight position={[-4, -1, -3]} intensity={0.35} color="#22d3ee" />
      <Stars />
      <Atmosphere />
      <Suspense fallback={null}>
        <Scene animate={animate} />
        <School animate={animate} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/fish.glb");

/* shared unit sphere geometry */
const UNIT_SPHERE = new THREE.SphereGeometry(1, 64, 64);

/* deterministic pseudo-random so SSR/CSR agree */
function frand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
