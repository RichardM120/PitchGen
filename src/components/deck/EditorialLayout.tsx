import type { PitchDeckData } from "@/types/pitch";
import { Media } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";
import { EpisodicArc } from "./EpisodicArc";

// Editorial: magazine pages. Text leads, images sit beside it, lots of white
// space. Reads well for comedy, factual and returning series.
export function EditorialLayout({ deck }: { deck: PitchDeckData }) {
  const { hero: h, world_and_engine: w, production: pr } = deck;
  const pal = w.color_palette;
  const hide = new Set<string>(deck.hidden_sections);
  return (
    <div className="bg-bg text-fg">
      {/* Masthead */}
      <section id="concept" className="mx-auto max-w-5xl px-5 pb-12 pt-14 md:px-8 md:pt-20">
        <p className="eyebrow">{h.format}</p>
        <h1 className="mt-3 max-w-4xl text-5xl leading-[0.95] md:text-7xl">{h.title}</h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <p className="text-xl leading-snug text-fg-2 md:text-2xl">{h.logline}</p>
          <div className="text-sm">
            <p className="flex flex-wrap gap-2">
              {h.genre.map((g) => (
                <span key={g} className="rounded-full bg-surface-2 px-3 py-1 font-medium">
                  {g}
                </span>
              ))}
            </p>
            <p className="mt-3 text-mute">{h.comparables}</p>
            <div className="mt-3">
              <VideoButton src={h.sizzle_video_url} label="Sizzle reel" />
            </div>
          </div>
        </div>
        {h.hero_image_url && (
          <div className="mt-10">
            <Media src={h.hero_image_url} alt={h.title} palette={pal} ratio="21 / 9" />
          </div>
        )}
      </section>

      {/* World */}
      {!hide.has("World") && (
      <section id="engine" className="border-t border-line">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-[1fr_1.4fr] md:px-8">
          <div>
            <p className="eyebrow">The world</p>
            <h2 className="mt-2 text-3xl">What it is</h2>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {w.mood_stills.slice(0, 3).map((s, i) => (
                <Media key={i} src={s.url} alt={s.caption} palette={pal.slice(i % 3)} ratio="4 / 5" label="Still" />
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <p className="text-lg leading-relaxed text-fg-2">{w.synopsis}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-surface p-5">
                <p className="eyebrow">The engine</p>
                <p className="mt-2 text-sm text-fg-2">{w.the_engine}</p>
              </div>
              <div className="rounded-xl bg-surface p-5">
                <p className="eyebrow">Why now</p>
                <p className="mt-2 text-sm text-fg-2">{w.why_now}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Casting */}
      {!hide.has("Casting") && (
      <section id="casting" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8">
          <p className="eyebrow">Casting</p>
          <h2 className="mt-2 text-3xl">The people</h2>
          <div className="mt-8 divide-y divide-line">
            {deck.casting.map((c) => (
              <article key={c.character_name} className="grid gap-6 py-8 md:grid-cols-[200px_1fr_220px]">
                <div>
                  <h3 className="text-2xl">{c.character_name}</h3>
                  <p className="text-sm text-mute">{c.age_range}</p>
                  <p className="mt-1 font-semibold text-accent-strong">{c.archetype}</p>
                </div>
                <div className="space-y-3 text-fg-2">
                  <p>{c.character_bio}</p>
                  <p className="text-sm"><span className="font-semibold text-fg">Casting notes. </span>{c.casting_notes}</p>
                  <VideoButton src={c.audition_or_reel_url} label="Self-tape" />
                </div>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
                  {c.actor_wishlist.slice(0, 4).map((a) => (
                    <div key={a.name}>
                      <Media src={a.headshot_url} alt={a.name} palette={pal.slice(1)} ratio="4 / 5" />
                      <p className="mt-1 text-xs font-semibold">{a.name}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Locations and episodes */}
      {!hide.has("Production") && (
      <section id="locations" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8">
          <p className="eyebrow">Locations</p>
          <h2 className="mt-2 text-3xl">Where it lives</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pr.locations.map((l, i) => (
              <figure key={l.name}>
                <Media src={l.image_url} alt={l.name} palette={pal.slice(i % 2)} ratio="4 / 3" label="Location" />
                <figcaption className="mt-3">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-xs uppercase tracking-wider text-mute">{l.region}</p>
                  <p className="mt-1 text-sm text-fg-2">{l.visual_rationale}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {!hide.has("Episodes") && (
      <section id="episodes" className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8">
          <p className="eyebrow">Episodes</p>
          <h2 className="mt-2 text-3xl">The run</h2>
          <div className="mt-8">
            <EpisodicArc episodes={deck.episodic_arc} />
          </div>
        </div>
      </section>
      )}

      {/* Package */}
      {(!hide.has("Production") || !hide.has("Team")) && (
      <section id="package" className="border-t border-line">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-2 md:px-8">
          {!hide.has("Production") && (
          <div>
            <p className="eyebrow">Package</p>
            <h2 className="mt-2 text-3xl">The numbers</h2>
            <dl className="mt-6 space-y-4 text-sm">
              {[
                ["Budget band", pr.financials.indicative_budget_band],
                ["UK tax relief", pr.financials.uk_tax_relief_eligible ? pr.financials.tax_relief_notes : "Not eligible / TBC"],
                ["Co-production", pr.financials.co_pro_opportunities.join(" · ") || "TBC"],
                ["Attachments and funding", pr.financials.existing_attachments_or_funding],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-mute">{k}</dt>
                  <dd className="mt-1 text-fg-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          )}
          {!hide.has("Team") && (
          <div>
            <p className="eyebrow">Team</p>
            <h2 className="mt-2 text-3xl">Who is behind it</h2>
            <ul className="mt-6 space-y-5">
              {deck.team.map((t) => (
                <li key={t.name} className="flex gap-4">
                  <div className="w-16 shrink-0">
                    <Media src={t.headshot_url} alt={t.name} palette={pal.slice(1)} ratio="1 / 1" />
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs uppercase tracking-wider text-mute">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
                    <p className="mt-1 text-sm text-fg-2">{t.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
