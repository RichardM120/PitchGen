import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listPitches } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import { href } from "@/lib/base";
import { Media } from "@/components/ui/Media";
import { PitchGenWordmark } from "@/components/brand/Logo";

// Viewer home: published pitches only. Builders go straight to the Studio.
export default async function Dashboard() {
  if (await isAdmin(await cookies())) redirect("/studio");
  const decks = (await listPitches()).filter((d) => d.status === "published");

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <PitchGenWordmark size={40} />
          <p className="mt-3 text-mute">
            {decks.length} {decks.length === 1 ? "pitch" : "pitches"} shared with you
          </p>
        </div>
        <form method="post" action={href("/api/logout")}>
          <button className="btn btn-ghost">Sign out</button>
        </form>
      </header>

      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {decks.map((d) => (
          <li key={d.slug}>
            <Link href={`/p/${d.slug}`} className="group block">
              <Media src={d.hero.hero_image_url} alt={d.hero.title} palette={d.world_and_engine.color_palette} className="transition group-hover:opacity-90" />
              <h2 className="mt-4 text-2xl">{d.hero.title || "Untitled"}</h2>
              <p className="eyebrow mt-1">{d.hero.format}</p>
              <p className="mt-2 line-clamp-2 text-fg-2">{d.hero.logline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
