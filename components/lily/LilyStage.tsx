"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Lily, { type LilyApi } from "./Lily";
import StudioLighting from "./StudioLighting";

// The 3D scene: camera, lighting, the lily and gentle rotate-to-look-around.
// Zoom is off so scrolling the page still works over the flower.
export default function LilyStage({
  className,
  onSelect,
}: {
  className?: string;
  onSelect?: (section: string) => void;
}) {
  const api = useRef<LilyApi | null>(null);

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 32, near: 0.001, far: 10, position: [0.085, 0.355, 0.54] }}
        onPointerMissed={() => api.current?.reset()}
      >
        <StudioLighting />
        <Suspense fallback={null}>
          <Lily apiRef={api} onSelect={onSelect} />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0, 0.122, -0.003]}
          enableDamping
          dampingFactor={0.08}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0.35}
          maxPolarAngle={1.75}
        />
      </Canvas>
    </div>
  );
}
