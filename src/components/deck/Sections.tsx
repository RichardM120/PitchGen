import type { PitchDeckData } from "@/types/pitch";
import { Media, ratioOf } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";
import { EpisodicArc } from "./EpisodicArc";

type P = { deck: PitchDeckData };

export const NAV = [
  { id: "concept", label: "Concept", section: "" },
  { id: "engine", label: "World", section: "World" },
  { id: "casting", label: "Casting", section: "Casting" },
  { id: "locations", label: "Locations", section: "Production" },
  { id: "episodes", label: "Episodes", section: "Episodes" },
  { id: "package", label: "Package", section: "Team" },
] as const;

export function navFor(deck: PitchDeckData) {
  const hide = new Set<string>(deck.hidden_sections);
  return NAV.filter((n) => !n.section || !hide.has(n.section));
}

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line px-5 py-16 md:px-12 lg:px-20">
      <p className="eyebrow">
        {n} · {title}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function HeroCover({ deck }: P) {
  const { hero, world_and_engine: w } = deck;
  return (
    <section id="concept" className="relative overflow-hidden bg-fg text-white">
      <Media src={hero.hero_image_url} alt={hero.title} palette={w.color_palette} className="max-h-[78vh] min-h-[78vh] w-full !rounded-none md:min-h-0" />
      <div className="deck-hero-overlay absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-12 lg:px-20">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{hero.format}</p>
        <h1 className="mt-3 text-5xl leading-[0.95] md:text-7xl">{hero.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-snug text-white/90 md:text-2xl">{hero.logline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {hero.genre.map((g) => (
            <span key={g} className="rounded-full border border-white/30 px-3 py-1 text-white/90">
              {g}
            </span>
          ))}
          <span className="text-white/70">{hero.comparables}</span>
          <VideoButton src={hero.sizzle_video_url} label="Sizzle reel" />
        </div>
      </div>
    </section>
  );
}

export function WorldAndEngine({ deck }: P) {
  const w = deck.world_and_engine;
  return (
    <Section id="engine" n="02" title="World and engine">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{w.synopsis}</p>
          <div className="mt-10 border-l-4 border-accent pl-5">
            <p className="eyebrow">The series engine</p>
            <p className="mt-2 text-fg-2">{w.the_engine}</p>
          </div>
          <div className="mt-8 pl-6">
            <p className="eyebrow">Why now</p>
            <p className="mt-2 text-fg-2">{w.why_now}</p>
          </div>
          <div className="mt-8 flex gap-1 pl-6" aria-label="Colour palette">
            {w.color_palette.map((c) => (
              <span key={c} title={c} className="h-7 w-11 rounded" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {w.mood_stills.map((s, i) => (
            <figure key={i}>
              <Media src={s.url} alt={s.caption} palette={w.color_palette.slice(i % 3)} ratio={ratioOf(s.aspect_ratio)} label="Mood still" />
              <figcaption className="mt-2 text-sm text-mute">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CastingGrid({ deck }: P) {
  const palette = deck.world_and_engine.color_palette;
  return (
    <Section id="casting" n="03" title="Casting">
      <div className="grid gap-6 md:grid-cols-2">
        {deck.casting.map((c) => (
          <article key={c.character_name} className="panel p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-2xl">{c.character_name}</h3>
              <span className="text-sm text-mute">{c.age_range}</span>
            </div>
            <p className="mt-1 font-semibold text-accent">{c.archetype}</p>
            <p className="mt-4 text-fg-2">{c.character_bio}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="eyebrow">Casting notes</p>
              <p className="mt-2 text-fg-2">{c.casting_notes}</p>
            </div>
            {c.actor_wishlist.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {c.actor_wishlist.map((a) => (
                  <div key={a.name}>
                    <Media src={a.headshot_url} alt={a.name} palette={palette.slice(1)} ratio="4 / 5" />
                    <p className="mt-2 text-sm font-semibold">{a.name}</p>
                    <p className="text-xs leading-snug text-mute">{a.credits_note}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5">
              <VideoButton src={c.audition_or_reel_url} label={`${c.character_name} self-tape`} />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function LocationsBoard({ deck }: P) {
  const palette = deck.world_and_engine.color_palette;
  return (
    <Section id="locations" n="04" title="Locations">
      <div className="grid gap-8 md:grid-cols-2">
        {deck.production.locations.map((l, i) => (
          <figure key={l.name}>
            <Media src={l.image_url} alt={l.name} palette={palette.slice(i % 2)} label="Location" />
            <figcaption className="mt-3">
              <p className="text-xl font-semibold tracking-tight">{l.name}</p>
              <p className="eyebrow mt-1">{l.region}</p>
              <p className="mt-2 text-fg-2">{l.visual_rationale}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function Episodes({ deck }: P) {
  return (
    <Section id="episodes" n="05" title="Episodes">
      <EpisodicArc episodes={deck.episodic_arc} />
    </Section>
  );
}

export function PackageFinancials({ deck }: P) {
  const f = deck.production.financials;
  const palette = deck.world_and_engine.color_palette;
  const hide = new Set<string>(deck.hidden_sections);
  const rows: [string, string][] = [
    ["Budget band", f.indicative_budget_band],
    ["UK tax relief", f.uk_tax_relief_eligible ? f.tax_relief_notes : "Not eligible / TBC"],
    ["Co-production", f.co_pro_opportunities.join(" · ") || "TBC"],
    ["Attachments and funding", f.existing_attachments_or_funding],
  ];
  return (
    <Section id="package" n="06" title="Package">
      <div className="grid gap-12 lg:grid-cols-2">
        {!hide.has("Production") && (
        <dl className="divide-y divide-line border-y border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[150px_1fr] gap-4 py-4">
              <dt className="pt-0.5 text-xs font-bold uppercase tracking-wider text-mute">{k}</dt>
              <dd className="text-fg-2">{v}</dd>
            </div>
          ))}
        </dl>
        )}
        {!hide.has("Team") && (
        <div className="grid gap-6 sm:grid-cols-2">
          {deck.team.map((t) => (
            <div key={t.name} className="flex gap-4">
              <div className="w-20 shrink-0">
                <Media src={t.headshot_url} alt={t.name} palette={palette.slice(1)} ratio="4 / 5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">{t.name}</p>
                <p className="eyebrow mt-0.5">
                  {t.role}
                  {t.company ? ` · ${t.company}` : ""}
                </p>
                <p className="mt-2 text-sm text-fg-2">{t.bio}</p>
                {t.notable_credits.length > 0 && <p className="mt-2 text-xs text-mute">{t.notable_credits.join(", ")}</p>}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </Section>
  );
}
