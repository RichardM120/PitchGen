"use client";

import type { PitchDeckData } from "@/types/pitch";
import { Assist } from "./Assist";
import { Area, MediaField, Palette, Repeater, Select, Tags, Text, Toggle } from "./fields";

export type SectionTab = "Overview" | "World" | "Casting" | "Production" | "Episodes" | "Team";

// The editable fields for one section. Shared by the editor tabs and the
// section-by-section review flow so they never drift apart.
export function SectionFields({
  tab,
  deck,
  patch,
  aiReady,
}: {
  tab: SectionTab;
  deck: PitchDeckData;
  patch: <K extends keyof PitchDeckData>(key: K, value: PitchDeckData[K]) => void;
  aiReady: boolean;
}) {
  const h = deck.hero;
  const w = deck.world_and_engine;
  const f = deck.production.financials;
  return (
    <>
            {tab === "Overview" && (
              <>
                <Assist deck={deck} section="hero" enabled={aiReady} onApply={(v) => patch("hero", v as PitchDeckData["hero"])} />
                <Text label="Title" value={h.title} onChange={(v) => patch("hero", { ...h, title: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text label="Format" value={h.format} placeholder="6 x 60' returnable drama" onChange={(v) => patch("hero", { ...h, format: v })} />
                  <Select label="Status" value={deck.status} onChange={(v) => patch("status", v)} options={[["draft", "Draft (private)"], ["in_review", "In review (private)"], ["published", "Published (viewers can see it)"]]} />
                </div>
                <Tags label="Genre" value={h.genre} onChange={(v) => patch("hero", { ...h, genre: v })} />
                <Text label="Comparables" value={h.comparables} placeholder="Broadchurch meets The Night Of" onChange={(v) => patch("hero", { ...h, comparables: v })} />
                <Area label="Logline" rows={3} value={h.logline} onChange={(v) => patch("hero", { ...h, logline: v })} />
                <MediaField label="Hero image" value={h.hero_image_url} onChange={(v) => patch("hero", { ...h, hero_image_url: v })} hint="2.39:1 looks best. JPG, PNG or WebP up to 25MB" />
                <MediaField label="Sizzle reel" kind="video" value={h.sizzle_video_url} onChange={(v) => patch("hero", { ...h, sizzle_video_url: v })} />
              </>
            )}

            {tab === "World" && (
              <>
                <Assist deck={deck} section="world_and_engine" enabled={aiReady} onApply={(v) => patch("world_and_engine", v as PitchDeckData["world_and_engine"])} />
                <Area label="Synopsis" rows={5} value={w.synopsis} onChange={(v) => patch("world_and_engine", { ...w, synopsis: v })} />
                <Area label="The series engine" rows={4} value={w.the_engine} hint="The repeatable conflict that generates episodes" onChange={(v) => patch("world_and_engine", { ...w, the_engine: v })} />
                <Area label="Why now" rows={3} value={w.why_now} onChange={(v) => patch("world_and_engine", { ...w, why_now: v })} />
                <Palette value={w.color_palette} onChange={(v) => patch("world_and_engine", { ...w, color_palette: v })} />
                <Repeater
                  label="Mood stills"
                  items={w.mood_stills}
                  onChange={(v) => patch("world_and_engine", { ...w, mood_stills: v })}
                  blank={() => ({ url: "", caption: "", aspect_ratio: "2.39:1" as const })}
                  title={(s, i) => s.caption || `Still ${i + 1}`}
                >
                  {(s, set) => (
                    <>
                      <MediaField label="Image" value={s.url} onChange={(v) => set({ url: v })} />
                      <Text label="Caption" value={s.caption} onChange={(v) => set({ caption: v })} />
                      <Select label="Aspect" value={s.aspect_ratio ?? "2.39:1"} onChange={(v) => set({ aspect_ratio: v })} options={[["2.39:1", "2.39:1 cinema"], ["16:9", "16:9"], ["4:3", "4:3"]]} />
                    </>
                  )}
                </Repeater>
              </>
            )}

            {tab === "Casting" && (
              <>
              <Assist deck={deck} section="casting" enabled={aiReady} onApply={(v) => patch("casting", v as PitchDeckData["casting"])} />
              <Repeater
                label="Roles"
                items={deck.casting}
                onChange={(v) => patch("casting", v)}
                blank={() => ({ character_name: "", age_range: "", archetype: "", character_bio: "", casting_notes: "", actor_wishlist: [], audition_or_reel_url: "" })}
                title={(c) => c.character_name}
              >
                {(c, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Text label="Character" value={c.character_name} onChange={(v) => set({ character_name: v })} />
                      <Text label="Age range" value={c.age_range} placeholder="45 to 55" onChange={(v) => set({ age_range: v })} />
                    </div>
                    <Text label="Archetype" value={c.archetype} placeholder="The exile who stayed" onChange={(v) => set({ archetype: v })} />
                    <Area label="Character bio" rows={3} value={c.character_bio} onChange={(v) => set({ character_bio: v })} />
                    <Area label="Casting notes" rows={3} value={c.casting_notes} onChange={(v) => set({ casting_notes: v })} />
                    <MediaField label="Self-tape or reel" kind="video" value={c.audition_or_reel_url} onChange={(v) => set({ audition_or_reel_url: v })} />
                    <Repeater
                      label="Actor wishlist"
                      items={c.actor_wishlist}
                      onChange={(v) => set({ actor_wishlist: v })}
                      blank={() => ({ name: "Wishlist (TBC)", headshot_url: "", credits_note: "" })}
                      title={(a) => a.name}
                    >
                      {(a, setA) => (
                        <>
                          <Text label="Name" value={a.name} onChange={(v) => setA({ name: v })} />
                          <Text label="Credits note" value={a.credits_note} onChange={(v) => setA({ credits_note: v })} />
                          <MediaField label="Headshot" value={a.headshot_url} onChange={(v) => setA({ headshot_url: v })} hint="Portrait, 4:5" />
                        </>
                      )}
                    </Repeater>
                  </>
                )}
              </Repeater>
              </>
            )}

            {tab === "Production" && (
              <>
                <Assist deck={deck} section="production" enabled={aiReady} onApply={(v) => patch("production", v as PitchDeckData["production"])} />
                <Repeater
                  label="Locations"
                  items={deck.production.locations}
                  onChange={(v) => patch("production", { ...deck.production, locations: v })}
                  blank={() => ({ name: "", region: "", visual_rationale: "", image_url: "" })}
                  title={(l) => l.name}
                >
                  {(l, set) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Text label="Location" value={l.name} onChange={(v) => set({ name: v })} />
                        <Text label="Region" value={l.region} onChange={(v) => set({ region: v })} />
                      </div>
                      <Area label="Why it works on screen" rows={2} value={l.visual_rationale} onChange={(v) => set({ visual_rationale: v })} />
                      <MediaField label="Image" value={l.image_url} onChange={(v) => set({ image_url: v })} />
                    </>
                  )}
                </Repeater>
                <div className="card space-y-4 p-4">
                  <span className="label mb-0">Financials</span>
                  <Text label="Indicative budget band" value={f.indicative_budget_band} placeholder="£1.6M to £2.0M per episode" onChange={(v) => patch("production", { ...deck.production, financials: { ...f, indicative_budget_band: v } })} />
                  <Toggle label="UK tax relief eligible" value={f.uk_tax_relief_eligible} onChange={(v) => patch("production", { ...deck.production, financials: { ...f, uk_tax_relief_eligible: v } })} />
                  <Area label="Tax relief notes" rows={2} hint="AVEC 34% gross (c.25.5% net) film and HETV; 39% gross animation and children's; IFTC 53% gross for films under £15M" value={f.tax_relief_notes} onChange={(v) => patch("production", { ...deck.production, financials: { ...f, tax_relief_notes: v } })} />
                  <Tags label="Co-production opportunities" value={f.co_pro_opportunities} onChange={(v) => patch("production", { ...deck.production, financials: { ...f, co_pro_opportunities: v } })} />
                  <Area label="Attachments and funding" rows={2} value={f.existing_attachments_or_funding} onChange={(v) => patch("production", { ...deck.production, financials: { ...f, existing_attachments_or_funding: v } })} />
                </div>
              </>
            )}

            {tab === "Episodes" && (
              <>
              <Assist deck={deck} section="episodic_arc" enabled={aiReady} onApply={(v) => patch("episodic_arc", v as PitchDeckData["episodic_arc"])} />
              <Repeater
                label="Episodes"
                items={deck.episodic_arc}
                onChange={(v) => patch("episodic_arc", v)}
                blank={() => ({ episode_number: deck.episodic_arc.length + 1, title: "", hook: "", synopsis: "" })}
                title={(e) => `Ep ${e.episode_number}: ${e.title}`}
              >
                {(e, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                      <Text label="Number" type="number" value={String(e.episode_number)} onChange={(v) => set({ episode_number: Math.max(1, parseInt(v) || 1) })} />
                      <Text label="Title" value={e.title} onChange={(v) => set({ title: v })} />
                    </div>
                    <Text label="Hook" value={e.hook} onChange={(v) => set({ hook: v })} />
                    <Area label="Synopsis" rows={3} value={e.synopsis} onChange={(v) => set({ synopsis: v })} />
                  </>
                )}
              </Repeater>
              </>
            )}

            {tab === "Team" && (
              <>
              <Assist deck={deck} section="team" enabled={aiReady} onApply={(v) => patch("team", v as PitchDeckData["team"])} />
              <Repeater
                label="Team"
                items={deck.team}
                onChange={(v) => patch("team", v)}
                blank={() => ({ name: "", role: "", company: "", bio: "", notable_credits: [], headshot_url: "" })}
                title={(t) => t.name}
              >
                {(t, set) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Text label="Name" value={t.name} onChange={(v) => set({ name: v })} />
                      <Text label="Role" value={t.role} onChange={(v) => set({ role: v })} />
                    </div>
                    <Text label="Company" value={t.company ?? ""} onChange={(v) => set({ company: v })} />
                    <Area label="Bio" rows={2} value={t.bio} onChange={(v) => set({ bio: v })} />
                    <Tags label="Notable credits" value={t.notable_credits} onChange={(v) => set({ notable_credits: v })} />
                    <MediaField label="Headshot" value={t.headshot_url} onChange={(v) => set({ headshot_url: v })} />
                  </>
                )}
              </Repeater>
              </>
            )}

    </>
  );
}
