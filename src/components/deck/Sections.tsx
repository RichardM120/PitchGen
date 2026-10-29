import type { PitchDeckData } from "@/types/pitch";
import { Media, ratioOf } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";
import { EpisodicArc } from "./EpisodicArc";

type P = { deck: PitchDeckData };

export const NAV = [
  { id: "concept", label: "01 Concept" },
  { id: "engine", label: "02 Engine" },
  { id: "casting", label: "03 Casting" },
  { id: "locations", label: "04 Locations" },
  { id: "episodes", label: "05 Episodes" },
  { id: "package", label: "06 Package" },
];

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line px-5 py-20 md:px-12 lg:px-20">
      <p className="eyebrow">
        {n} / {title}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function HeroCover({ deck }: P) {
  const { hero, world_and_engine: w } = deck;
  return (
    <section id="concept" className="relative">
      <Media src={hero.hero_image_url} alt={hero.title} palette={w.color_palette} className="max-h-[78vh] min-h-[78vh] w-full md:min-h-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-12 lg:px-20">
        <p className="eyebrow text-paper/70">{hero.format}</p>
        <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">{hero.title}</h1>
        <p className="mt-5 max-w-3xl font-display text-xl italic leading-snug text-paper/90 md:text-2xl">
          {hero.logline}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          {hero.genre.map((g) => (
            <span key={g} className="border border-line px-2 py-1 text-paper/70">
              {g}
            </span>
          ))}
          <span className="text-mute">{hero.comparables}</span>
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
          <p className="font-display text-2xl leading-snug md:text-3xl">{w.synopsis}</p>
          <div className="mt-10 border-l-2 border-accent pl-5">
            <p className="eyebrow">The series engine</p>
            <p className="mt-2 leading-relaxed text-paper/85">{w.the_engine}</p>
          </div>
          <div className="mt-8 pl-5">
            <p className="eyebrow">Why now</p>
            <p className="mt-2 leading-relaxed text-paper/75">{w.why_now}</p>
          </div>
          <div className="mt-8 flex gap-1 pl-5" aria-label="Colour palette">
            {w.color_palette.map((c) => (
              <span key={c} title={c} className="h-6 w-10" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {w.mood_stills.map((s, i) => (
            <figure key={i}>
              <Media src={s.url} alt={s.caption} palette={w.color_palette.slice(i % 3)} ratio={ratioOf(s.aspect_ratio)} label="Mood still" />
              <figcaption className="mt-2 text-xs text-mute">{s.caption}</figcaption>
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
          <article key={c.character_name} className="border border-line bg-ink-2 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-3xl">{c.character_name}</h3>
              <span className="text-xs text-mute">{c.age_range}</span>
            </div>
            <p className="mt-1 font-display italic text-accent">{c.archetype}</p>
            <p className="mt-4 text-sm leading-relaxed text-paper/80">{c.character_bio}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="eyebrow">Casting notes</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/75">{c.casting_notes}</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {c.actor_wishlist.map((a) => (
                <div key={a.name}>
                  <Media src={a.headshot_url} alt={a.name} palette={palette.slice(1)} ratio="4 / 5" />
                  <p className="mt-2 text-xs">{a.name}</p>
                  <p className="text-[11px] leading-snug text-mute">{a.credits_note}</p>
                </div>
              ))}
            </div>
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
              <p className="font-display text-2xl">{l.name}</p>
              <p className="eyebrow mt-1">{l.region}</p>
              <p className="mt-2 text-sm text-paper/75">{l.visual_rationale}</p>
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
  const rows: [string, string][] = [
    ["Budget band", f.indicative_budget_band],
    ["UK tax relief", f.uk_tax_relief_eligible ? f.tax_relief_notes : "Not eligible / TBC"],
    ["Co-production", f.co_pro_opportunities.join(" · ") || "TBC"],
    ["Attachments and funding", f.existing_attachments_or_funding],
  ];
  return (
    <Section id="package" n="06" title="Package">
      <div className="grid gap-12 lg:grid-cols-2">
        <dl className="divide-y divide-line border-y border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[150px_1fr] gap-4 py-4">
              <dt className="eyebrow pt-0.5">{k}</dt>
              <dd className="text-sm leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-6 sm:grid-cols-2">
          {deck.team.map((t) => (
            <div key={t.name}>
              <p className="font-display text-2xl">{t.name}</p>
              <p className="eyebrow mt-1">
                {t.role}
                {t.company ? ` · ${t.company}` : ""}
              </p>
              <p className="mt-2 text-sm text-paper/75">{t.bio}</p>
              {t.notable_credits.length > 0 && (
                <p className="mt-2 text-xs text-mute">{t.notable_credits.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
