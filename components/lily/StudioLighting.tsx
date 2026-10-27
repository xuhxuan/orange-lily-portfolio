"use client";

// Three.js scenes are mutated every frame (positions, materials, lights), which
// the React Compiler's immutability rule is not designed for. Off for this file only.
/* eslint-disable react-hooks/immutability */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Soft studio lighting for the lily, ported from Codex's studio_lighting.js.
// Warm reflection panels make the petal micro-texture and sheen readable.
export default function StudioLighting() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color().setRGB(0.16, 0.17, 0.15);
    const panels: THREE.Mesh[] = [];
    const panel = (
      position: [number, number, number],
      width: number,
      height: number,
      colour: number,
      intensity: number,
    ) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colour).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      env.add(mesh);
      panels.push(mesh);
    };
    panel([-4, 4, 5], 5, 7, 0xffecd1, 3.2);
    panel([5, 2, 1], 3, 6, 0xf0f5ff, 2.1);
    panel([0, 5, -4], 4, 4, 0xffd392, 3.4);

    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(env, 0.025, 0.1, 20);
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.28;
    for (const mesh of panels) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    generator.dispose();

    return () => {
      if (scene.environment === target.texture) {
        scene.environment = previous;
        scene.environmentIntensity = previousIntensity;
      }
      target.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={[0xffefd3, 0x495138, 1.25]} />
      <directionalLight color={0xffedcf} intensity={2.75} position={[-0.3, 0.5, 0.5]} />
      <directionalLight color={0xe4eeff} intensity={1.1} position={[0.4, 0.3, -0.1]} />
      <directionalLight color={0xffc77e} intensity={1.85} position={[-0.1, 0.4, -0.4]} />
    </>
  );
}
