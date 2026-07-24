"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

function latLngToVec3(lat: number, lng: number, r: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

function Globe({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const zones = zonesFixture as unknown as Zone[];

  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y += delta * 0.12;
  });

  const grid = useMemo(() => new THREE.SphereGeometry(1.001, 24, 16), []);

  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      {/* ocean body */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#08213a" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* lat/long wireframe — the "instrument" look */}
      <lineSegments>
        <wireframeGeometry args={[grid]} />
        <lineBasicMaterial color="#22344f" transparent opacity={0.5} />
      </lineSegments>
      {/* atmosphere glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* zone markers */}
      {zones.map((z) => {
        const pos = latLngToVec3(z.centroid[0], z.centroid[1], 1.02);
        const hex = SEV_HEX[riskToSeverity(z.riskScore)];
        const size = 0.02 + (z.riskScore / 100) * 0.03;
        return (
          <group key={z.id} position={pos}>
            <mesh>
              <sphereGeometry args={[size, 16, 16]} />
              <meshBasicMaterial color={hex} />
            </mesh>
            {/* soft halo */}
            <mesh>
              <sphereGeometry args={[size * 2.4, 16, 16]} />
              <meshBasicMaterial color={hex} transparent opacity={0.18} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function ZoneGlobe({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 4]} intensity={1.1} color="#bfe9ff" />
      <pointLight position={[-3, -1, -2]} intensity={0.5} color="#22d3ee" />
      <Globe animate={animate} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={animate}
        autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}
