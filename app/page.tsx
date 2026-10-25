import { content } from "@/content";

export default function Home() {
  const { about } = content;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl">
        <p className="text-sm uppercase tracking-widest text-accent">
          {about.title}
        </p>
        <h1 className="mt-3 font-serif text-5xl">{about.name}</h1>
        <p className="mt-2 text-lg opacity-70">{about.tagline}</p>
        <p className="mt-8 text-lg leading-8">{about.text}</p>
      </div>
    </main>
  );
}
