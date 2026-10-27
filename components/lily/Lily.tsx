"use client";

// Three.js scenes are mutated every frame (positions, materials, lights), which
// the React Compiler's immutability rule is not designed for. Off for this file only.
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/*
  The orange lily (model by Codex: public/models/orange-lily.glb, 1.3 MB).

  Model structure
  - Petal_1..Petal_6 carry their section in userData.section:
    experiences, leadership, education, hobbies, making-1, making-2
  - "Core" holds all 18 centre parts (style, stigma, stamens, ovary...)
  - One animation, "Bloom_Open_Close", 10 s: 0–1 closed, 1–4 opening,
    4–6 open, 6–9 closing. We play 0 -> 4 once on load and hold it open.

  Interactions
  - Hover a part: it glows, everything else fades back.
  - Click a petal: it slowly drifts outward (detaches) and onSelect(section) fires.
  - Click the centre: the Core rises and onSelect("about") fires.
  - Drag a petal or the Core to pull it out (from Codex's preview).
  - Click empty space or press Escape: everything reassembles.
  - "In the making" petals highlight on hover but aren't clickable.
*/

export const LILY_MODEL_URL = "/models/orange-lily.glb";

const OPEN_TIME = 4;
const BLOOM_SPEED = 0.9; // clip seconds per real second
const PETALS = Array.from({ length: 6 }, (_, i) => `Petal_${i + 1}`);
const CLICKABLE = new Set(["about", "experiences", "leadership", "education", "hobbies"]);
const DETACH_DISTANCE = 0.035; // metres
const MUTED_OPACITY = 0.3;
const GLOW = 6;

type Part = {
  name: string;
  section: string;
  wrapper: THREE.Group;
  offset: THREE.Vector3; // where the wrapper should sit, in its parent's local units
  detach: THREE.Vector3; // detached position, in its parent's local units
  dragging: boolean;
};

type MeshInfo = {
  part: Part | null;
  material: THREE.MeshStandardMaterial;
  baseOpacity: number;
  baseTransparent: boolean;
  baseEmissive: number;
  fade: number;
  glow: number;
};

export type LilyApi = { reset: () => void };

function setupLily(scene: THREE.Group, animations: THREE.AnimationClip[]) {
  const root = scene.clone(true);
  const parts: Part[] = [];
  const byWrapper = new Map<THREE.Object3D, Part>();

  for (const name of [...PETALS, "Core"]) {
    const node = root.getObjectByName(name);
    if (!node || !node.parent) continue;
    // Movement goes on a wrapper so the bloom animation never overwrites it.
    const wrapper = new THREE.Group();
    wrapper.name = `${name}_Offset`;
    node.parent.add(wrapper);
    wrapper.add(node);
    const section = name === "Core" ? "about" : String(node.userData.section ?? "");
    const part: Part = {
      name,
      section,
      wrapper,
      offset: new THREE.Vector3(),
      detach: new THREE.Vector3(),
      dragging: false,
    };
    parts.push(part);
    byWrapper.set(wrapper, part);
  }

  const meshes: MeshInfo[] = [];
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    // Own material per mesh so each part can fade/glow on its own.
    const material = (mesh.material as THREE.MeshStandardMaterial).clone();
    material.side = THREE.DoubleSide;
    mesh.material = material;
    let part: Part | null = null;
    for (let p: THREE.Object3D | null = mesh; p; p = p.parent) {
      const found = byWrapper.get(p);
      if (found) {
        part = found;
        break;
      }
    }
    meshes.push({
      part,
      material,
      baseOpacity: material.opacity,
      baseTransparent: material.transparent,
      baseEmissive: material.emissiveIntensity ?? 1,
      fade: 1,
      glow: 0,
    });
  });

  const mixer = new THREE.AnimationMixer(root);
  const clip = animations.find((c) => c.name === "Bloom_Open_Close") ?? animations[0];
  if (clip) mixer.clipAction(clip).play();

  // Work out detach directions from the fully open pose.
  mixer.setTime(OPEN_TIME);
  root.updateMatrixWorld(true);
  const core = parts.find((p) => p.name === "Core");
  const centre = core
    ? new THREE.Box3().setFromObject(core.wrapper).getCenter(new THREE.Vector3())
    : new THREE.Vector3();
  for (const part of parts) {
    const world =
      part.name === "Core"
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Box3().setFromObject(part.wrapper).getCenter(new THREE.Vector3()).sub(centre);
    world.normalize().multiplyScalar(DETACH_DISTANCE);
    const parent = part.wrapper.parent!;
    const zero = parent.worldToLocal(new THREE.Vector3());
    part.detach.copy(parent.worldToLocal(world.clone())).sub(zero);
  }
  mixer.setTime(0);

  return { root, parts, byWrapper, meshes, mixer };
}

export default function Lily({
  onSelect,
  apiRef,
}: {
  onSelect?: (section: string) => void;
  apiRef?: React.MutableRefObject<LilyApi | null>;
}) {
  const gltf = useGLTF(LILY_MODEL_URL);
  const { root, parts, byWrapper, meshes, mixer } = useMemo(
    () => setupLily(gltf.scene, gltf.animations),
    [gltf],
  );
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;

  const bloom = useRef(0);
  const hovered = useRef<Part | null>(null);
  const drag = useRef<{
    part: Part;
    plane: THREE.Plane;
    start: THREE.Vector3;
    origin: THREE.Vector3;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const partFor = (object: THREE.Object3D) => {
    for (let p: THREE.Object3D | null = object; p; p = p.parent) {
      const found = byWrapper.get(p);
      if (found) return found;
    }
    return null;
  };

  const reset = () => {
    for (const part of parts) part.offset.set(0, 0, 0);
  };

  const select = (part: Part) => {
    for (const p of parts) p.offset.set(0, 0, 0);
    part.offset.copy(part.detach);
    onSelect?.(part.section);
  };

  useEffect(() => {
    if (apiRef) apiRef.current = { reset };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bloom.current = OPEN_TIME;
      mixer.setTime(OPEN_TIME);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, apiRef]);

  // Dragging: follow the pointer on a plane facing the camera.
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      d.moved = true;
      d.part.dragging = true;
      document.body.style.cursor = "grabbing";
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(d.plane, hit)) return;
      const parent = d.part.wrapper.parent!;
      const a = parent.worldToLocal(d.start.clone());
      const b = parent.worldToLocal(hit.clone());
      d.part.offset.copy(d.origin).add(b.sub(a));
    };

    const up = () => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      d.part.dragging = false;
      if (controls) controls.enabled = true;
      document.body.style.cursor = hovered.current ? "pointer" : "";
      if (!d.moved) select(d.part);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, controls, parts]);

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const part = partFor(e.object);
    hovered.current = part;
    if (!drag.current) {
      document.body.style.cursor = part && CLICKABLE.has(part.section) ? "pointer" : "";
    }
  };

  const onPointerOut = () => {
    hovered.current = null;
    if (!drag.current) document.body.style.cursor = "";
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const part = partFor(e.object);
    if (!part || !CLICKABLE.has(part.section)) return;
    e.stopPropagation();
    if (controls) controls.enabled = false;
    drag.current = {
      part,
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()),
        e.point,
      ),
      start: e.point.clone(),
      origin: part.offset.clone(),
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
      moved: false,
    };
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // Bud -> bloom on load, then hold open.
    if (bloom.current < OPEN_TIME) {
      bloom.current = Math.min(OPEN_TIME, bloom.current + dt * BLOOM_SPEED);
      mixer.setTime(bloom.current);
    }

    // Parts drift slowly to their target (fast while being dragged).
    for (const part of parts) {
      const k = part.dragging ? 30 : 2.2;
      part.wrapper.position.lerp(part.offset, 1 - Math.exp(-k * dt));
    }

    // Hover: glow the hovered part, fade the rest.
    const h = hovered.current;
    const ease = 1 - Math.exp(-8 * dt);
    for (const m of meshes) {
      const fadeTarget = h && m.part !== h ? MUTED_OPACITY : 1;
      const glowTarget = h && m.part === h ? 1 : 0;
      m.fade += (fadeTarget - m.fade) * ease;
      m.glow += (glowTarget - m.glow) * ease;
      const fading = m.fade < 0.995;
      if (fading !== m.material.transparent && !m.baseTransparent) {
        m.material.transparent = fading;
        m.material.needsUpdate = true;
      }
      m.material.opacity = m.baseOpacity * (fading ? m.fade : 1);
      m.material.emissiveIntensity = m.baseEmissive * (1 + (GLOW - 1) * m.glow);
    }
  });

  return (
    <primitive
      object={root}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
    />
  );
}

useGLTF.preload(LILY_MODEL_URL);
