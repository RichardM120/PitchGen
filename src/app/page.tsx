import Link from "next/link";
import { listPitches } from "@/lib/pitches";
import { Media } from "@/components/ui/Media";

const STATUS_LABEL = { draft: "Draft", in_review: "In review", sent: "Sent" } as const;

export default function Dashboard() {
  const decks = listPitches();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">CW Casting</p>
          <h1 className="mt-1 font-display text-5xl italic">PitchGen</h1>
          <p className="mt-2 text-sm text-mute">
            {decks.length} active {decks.length === 1 ? "pitch" : "pitches"} · private slate
          </p>
        </div>
        <form method="post" action="/pitchgen/api/logout">
          <button className="text-xs text-mute hover:text-paper">Sign out</button>
        </form>
      </header>

      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {decks.map((d) => (
          <li key={d.slug}>
            <Link href={`/p/${d.slug}`} className="group block">
              <Media
                src={d.hero.hero_image_url}
                alt={d.hero.title}
                palette={d.world_and_engine.color_palette}
                className="transition group-hover:opacity-90"
              />
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-3xl">{d.hero.title}</h2>
                <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-widest text-mute">
                  {STATUS_LABEL[d.status]}
                </span>
              </div>
              <p className="eyebrow mt-1">{d.hero.format}</p>
              <p className="mt-2 line-clamp-2 text-sm text-paper/70">{d.hero.logline}</p>
              <p className="mt-3 text-xs text-mute">
                {d.casting.length} roles · {d.episodic_arc.length} episodes outlined ·{" "}
                {d.production.locations.length} locations
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
