import type { PitchDeckData } from "@/types/pitch";
import { Media } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";

// Treatment: text first, long form. Reads like a document and prints well.
export function TreatmentLayout({ deck }: { deck: PitchDeckData }) {
  const { hero: h, world_and_engine: w, production: pr } = deck;
  const pal = w.color_palette;
  const f = pr.financials;
  const hide = new Set<string>(deck.hidden_sections);

  return (
    <div className="bg-bg text-fg">
      <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <header id="concept" className="border-b-2 border-fg pb-8 text-center">
          <p className="eyebrow">{h.format}</p>
          <h1 className="mt-3 text-5xl md:text-6xl">{h.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-snug text-fg-2">{h.logline}</p>
          <p className="mt-4 text-sm text-mute">
            {h.genre.join(" · ")}
            {h.comparables ? ` · ${h.comparables}` : ""}
          </p>
          {deck.team.length > 0 && <p className="mt-6 text-sm">{deck.team.map((t) => `${t.name}, ${t.role}`).join(" · ")}</p>}
        </header>

        {!hide.has("World") && (
        <Section id="engine" n="1" title="The world">
          <p>{w.synopsis}</p>
          <h3>The engine</h3>
          <p>{w.the_engine}</p>
          <h3>Why now</h3>
          <p>{w.why_now}</p>
          {w.mood_stills.filter((s) => s.url).length > 0 && (
            <div className="not-prose my-6 grid grid-cols-3 gap-2">
              {w.mood_stills.filter((s) => s.url).slice(0, 3).map((s, i) => (
                <figure key={i}>
                  <Media src={s.url} alt={s.caption} palette={pal.slice(i % 3)} ratio="4 / 3" />
                  <figcaption className="mt-1 text-xs text-mute">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </Section>
        )}

        {!hide.has("Casting") && (
        <Section id="casting" n="2" title="Characters">
          {deck.casting.map((c) => (
            <div key={c.character_name} className="mb-6">
              <h3>
                {c.character_name} <span className="font-normal text-mute">({c.age_range})</span>
              </h3>
              <p className="!mt-0 font-semibold text-accent-strong">{c.archetype}</p>
              <p>{c.character_bio}</p>
              <p className="text-fg-2">
                <strong>Casting.</strong> {c.casting_notes}
                {c.actor_wishlist.length > 0 && <> Wishlist: {c.actor_wishlist.map((a) => a.name).join(", ")}.</>}
              </p>
              <div className="not-prose">
                <VideoButton src={c.audition_or_reel_url} label="Self-tape" />
              </div>
            </div>
          ))}
        </Section>
        )}

        {!hide.has("Episodes") && (
        <Section id="episodes" n="3" title="Episodes">
          {deck.episodic_arc.map((e) => (
            <div key={e.episode_number} className="mb-5">
              <h3>
                Episode {e.episode_number}: {e.title}
              </h3>
              <p className="!mt-0 italic text-fg-2">{e.hook}</p>
              <p>{e.synopsis}</p>
            </div>
          ))}
        </Section>
        )}

        {!hide.has("Production") && (
        <Section id="locations" n="4" title="Production">
          {pr.locations.map((l) => (
            <p key={l.name}>
              <strong>{l.name}, {l.region}.</strong> {l.visual_rationale}
            </p>
          ))}
          <h3>Budget and finance</h3>
          <p>
            Indicative budget {f.indicative_budget_band || "to be confirmed"}. {f.uk_tax_relief_eligible ? f.tax_relief_notes : "UK tax relief to be confirmed."}
            {f.co_pro_opportunities.length > 0 && ` Co-production: ${f.co_pro_opportunities.join(", ")}.`} {f.existing_attachments_or_funding}
          </p>
        </Section>
        )}

        {!hide.has("Team") && (
        <Section id="package" n="5" title="Team">
          {deck.team.map((t) => (
            <p key={t.name}>
              <strong>
                {t.name}, {t.role}
                {t.company ? `, ${t.company}` : ""}.
              </strong>{" "}
              {t.bio}
              {t.notable_credits.length > 0 && ` Credits include ${t.notable_credits.join(", ")}.`}
            </p>
          ))}
        </Section>
        )}
      </article>
    </div>
  );
}

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12">
      <p className="eyebrow">Part {n}</p>
      <h2 className="mt-1 text-3xl">{title}</h2>
      <div className="prose-treatment mt-5">{children}</div>
    </section>
  );
}
