"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { content, isSectionId, type SectionId } from "@/content";
import SectionPanel from "@/components/ui/SectionPanel";
import Lily, { type LilyApi } from "./Lily";
import LilyCursor from "./LilyCursor";
import StudioLighting from "./StudioLighting";

const NOTE_MS = 1600;

// The home-page hero: the 3D lily, the hover cursor and the side panel.
// Zoom is off so scrolling the page still works over the flower.
export default function LilyStage({ className }: { className?: string }) {
  const api = useRef<LilyApi | null>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<SectionId | null>(null);
  const [panelSection, setPanelSection] = useState<SectionId | null>(null);
  const [note, setNote] = useState(false);
  const noteTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  const onSelect = useCallback((section: string | null) => {
    const id = section && isSectionId(section) ? section : null;
    setSelected(id);
    if (id) setPanelSection(id); // keep the last one while the panel slides out
  }, []);

  const onNudge = useCallback(() => {
    setNote(true);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(false), NOTE_MS);
  }, []);

  const onOpen = useCallback((section: string) => router.push(`/${section}`), [router]);

  const label = cursorLabel(hovered, selected, note);

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
          <Lily apiRef={api} onHover={setHovered} onSelect={onSelect} onOpen={onOpen} onNudge={onNudge} />
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
      <SectionPanel section={panelSection} open={selected !== null} onClose={() => api.current?.reset()} />
      <LilyCursor label={label} />
    </div>
  );
}

function cursorLabel(hovered: string | null, selected: SectionId | null, note: boolean) {
  if (!hovered) return null;
  if (hovered.startsWith("making")) {
    return note ? content.inTheMaking.note : content.inTheMaking.label;
  }
  if (!isSectionId(hovered)) return null;
  const action = hovered === selected ? content.lily.open : content.lily.discover;
  return `${content.sections[hovered].title} · ${action}`;
}
