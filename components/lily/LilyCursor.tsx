"use client";

import { useEffect, useRef } from "react";

// A small dot that sits exactly on the mouse while hovering the lily, with a
// label just to its right. Hidden on touch screens, which have no hover.
export default function LilyCursor({ label }: { label: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const visible = label !== null;

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
      className="pointer-events-none fixed left-0 top-0 z-50 hidden [@media(hover:hover)]:block"
    >
      {/* The dot's centre is the mouse position. */}
      <span
        className={`absolute left-0 top-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-200 ${
          visible ? "scale-100" : "scale-0"
        }`}
      />
      <span
        className={`absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap text-xs uppercase tracking-[0.2em] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
