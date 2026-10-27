"use client";

import { useEffect, useRef } from "react";

// A small dot with a label that follows the mouse (with a little lag) while
// hovering the lily. Hidden on touch screens, which have no hover.
export default function LilyCursor({ label }: { label: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const tick = () => {
      current.x += (target.x - current.x) * 0.25;
      current.y += (target.y - current.y) * 0.25;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  const visible = label !== null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 hidden [@media(hover:hover)]:block"
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          className={`block size-2.5 rounded-full bg-accent transition-transform duration-300 ${
            visible ? "scale-100" : "scale-0"
          }`}
        />
        <span className="translate-x-1/2 whitespace-nowrap text-xs uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
    </div>
  );
}
