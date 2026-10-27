"use client";

import Link from "next/link";
import { content, type SectionId } from "@/content";

// Slides in from the right when a lily part is clicked: short text plus a
// clear way into the full section page.
export default function SectionPanel({
  section,
  open,
  onClose,
}: {
  section: SectionId | null;
  open: boolean;
  onClose: () => void;
}) {
  const s = section ? content.sections[section] : null;
  const { lily } = content;

  return (
    <aside
      aria-hidden={!open}
      className={`absolute right-4 top-1/2 z-10 w-[min(22rem,calc(100vw-2rem))] -translate-y-1/2 rounded-2xl border border-foreground/10 bg-background/85 p-7 shadow-sm backdrop-blur-md transition-all duration-700 ease-out sm:right-10 ${
        open ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
      }`}
    >
      {s && section && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label={lily.close}
            className="absolute right-5 top-5 text-xl leading-none opacity-50 transition-opacity hover:opacity-100"
          >
            ×
          </button>
          <h2 className="pr-6 font-serif text-3xl">{s.title}</h2>
          <p className="mt-4 leading-7 opacity-80">{s.short}</p>
          <Link
            href={`/${section}`}
            tabIndex={open ? 0 : -1}
            className="group mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-accent"
          >
            {lily.explore} {s.title}
            <span className="transition-transform duration-300 group-hover:translate-x-1">{lily.arrow}</span>
          </Link>
        </>
      )}
    </aside>
  );
}
