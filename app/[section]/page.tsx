import Link from "next/link";
import { notFound } from "next/navigation";
import { content, isSectionId } from "@/content";

// Full page for one lily section: /about, /experiences, /leadership, ...
// Placeholder layout for now — the real section design comes later.
export function generateStaticParams() {
  return Object.keys(content.sections).map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isSectionId(section)) notFound();
  const s = content.sections[section];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-24">
      <Link href="/" className="text-sm uppercase tracking-[0.2em] text-accent">
        {content.lily.back}
      </Link>
      <h1 className="mt-8 font-serif text-5xl">{s.title}</h1>
      <p className="mt-6 text-lg opacity-70">{s.short}</p>
      <p className="mt-8 text-lg leading-8">{s.long}</p>
    </main>
  );
}
