import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { listPitches } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import { href } from "@/lib/base";
import { Media } from "@/components/ui/Media";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function Dashboard() {
  const [decks, admin] = await Promise.all([listPitches(), cookies().then(isAdmin)]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <PitchGenWordmark size={34} />
          <p className="mt-3 text-sm text-mute">
            {decks.length} {decks.length === 1 ? "pitch" : "pitches"} on the slate
          </p>
        </div>
        <div className="flex items-center gap-3">
          {admin && (
            <Link href="/studio" className="btn btn-primary">
              <Plus size={14} /> Studio
            </Link>
          )}
          <form method="post" action={href("/api/logout")}>
            <button className="btn btn-ghost">Sign out</button>
          </form>
        </div>
      </header>

      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {decks.map((d) => (
          <li key={d.slug} className="group">
            <Link href={`/p/${d.slug}`} className="block">
              <div className="overflow-hidden rounded-[var(--radius-pg)]">
                <Media src={d.hero.hero_image_url} alt={d.hero.title} palette={d.world_and_engine.color_palette} className="transition group-hover:opacity-90" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-3xl">{d.hero.title || "Untitled"}</h2>
                <StatusBadge status={d.status} />
              </div>
              <p className="eyebrow mt-1">{d.hero.format}</p>
              <p className="mt-2 line-clamp-2 text-sm text-paper/70">{d.hero.logline}</p>
              <p className="mt-3 text-xs text-mute">
                {d.casting.length} roles · {d.episodic_arc.length} episodes · {d.production.locations.length} locations
              </p>
            </Link>
            {admin && (
              <Link href={`/studio/${d.slug}`} className="mt-3 inline-block text-xs text-accent hover:text-teal-300">
                Edit in Studio
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
