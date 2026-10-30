import type { PitchDeckData } from "@/types/pitch";
import { Media } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";

// Lookbook: image first. Big stills, short captions, the text kept to a
// line or two. For tone, world and visual references.
export function LookbookLayout({ deck }: { deck: PitchDeckData }) {
  const { hero: h, world_and_engine: w, production: pr } = deck;
  const pal = w.color_palette;
  const library = deck.media.filter((m) => m.kind === "image");
  const stills = w.mood_stills.filter((s) => s.url);
  const extra = library.filter((m) => !stills.some((s) => s.url === m.url) && m.url !== h.hero_image_url);

  return (
    <div className="bg-bg text-fg">
      <section id="concept" className="relative bg-fg text-white">
        <Media src={h.hero_image_url} alt={h.title} palette={pal} className="max-h-[85vh] min-h-[60vh] w-full !rounded-none" />
        <div className="deck-hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-12 lg:px-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{h.format} · Lookbook</p>
          <h1 className="mt-3 text-5xl leading-[0.95] md:text-8xl">{h.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85 md:text-xl">{h.logline}</p>
        </div>
      </section>

      <section id="engine" className="px-5 py-12 md:px-12 lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Tone and texture</p>
            <p className="mt-2 text-2xl font-semibold leading-snug tracking-tight">{w.the_engine || w.synopsis}</p>
          </div>
          <div className="flex gap-1">
            {pal.map((c) => (
              <span key={c} className="h-10 w-14 rounded" style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {stills.map((s, i) => (
            <figure key={i} className={i % 5 === 0 ? "md:col-span-4" : "md:col-span-2"}>
              <Media src={s.url} alt={s.caption} palette={pal.slice(i % 3)} ratio={i % 5 === 0 ? "2.39 / 1" : "4 / 3"} />
              <figcaption className="mt-2 text-sm text-mute">{s.caption}</figcaption>
            </figure>
          ))}
          {extra.map((m, i) => (
            <figure key={m.url} className={(i + stills.length) % 5 === 0 ? "md:col-span-4" : "md:col-span-2"}>
              <Media src={m.url} alt={m.name} palette={pal} ratio={(i + stills.length) % 5 === 0 ? "2.39 / 1" : "4 / 3"} />
              <figcaption className="mt-2 text-sm text-mute">{m.credit || m.name}</figcaption>
            </figure>
          ))}
          {stills.length + extra.length === 0 && <p className="md:col-span-6 rounded-xl bg-surface px-4 py-10 text-center text-mute">Add mood stills in the editor to fill the lookbook.</p>}
        </div>
      </section>

      <section id="locations" className="border-t border-line px-5 py-12 md:px-12 lg:px-20">
        <p className="eyebrow">Places</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pr.locations.map((l, i) => (
            <figure key={l.name} className="relative overflow-hidden rounded-[var(--radius-pg)]">
              <Media src={l.image_url} alt={l.name} palette={pal.slice(i % 2)} ratio="16 / 9" label="Location" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
                <p className="text-lg font-semibold">{l.name}</p>
                <p className="text-xs uppercase tracking-wider text-white/80">{l.region}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="casting" className="border-t border-line px-5 py-12 md:px-12 lg:px-20">
        <p className="eyebrow">Faces</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {deck.casting.flatMap((c) =>
            c.actor_wishlist.map((a) => (
              <figure key={`${c.character_name}-${a.name}`}>
                <Media src={a.headshot_url} alt={a.name} palette={pal.slice(1)} ratio="4 / 5" />
                <figcaption className="mt-2">
                  <p className="text-sm font-semibold">{c.character_name}</p>
                  <p className="text-xs text-mute">{a.name}</p>
                </figcaption>
              </figure>
            )),
          )}
        </div>
        {h.sizzle_video_url && (
          <div className="mt-8">
            <VideoButton src={h.sizzle_video_url} label="Mood reel" />
          </div>
        )}
      </section>

      <section id="package" className="border-t border-line px-5 py-8 text-sm text-mute md:px-12 lg:px-20">
        {h.comparables && <p>Comparables: {h.comparables}</p>}
        <p className="mt-1">{deck.team.map((t) => `${t.name}, ${t.role}`).join(" · ")}</p>
      </section>
    </div>
  );
}
