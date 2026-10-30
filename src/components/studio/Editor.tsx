"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Eye, Loader2, Save, Send, X } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { PitchDeckSchema } from "@/types/pitch";
import { publishPitchAction, savePitchAction } from "@/app/studio/actions";
import { Stepper } from "./Stepper";
import { DeckView } from "@/components/deck/DeckView";
import { Area, MediaField, Palette, Repeater, Select, Tags, Text, Toggle } from "./fields";

const TABS = ["Overview", "World", "Casting", "Production", "Episodes", "Team", "Access", "JSON"] as const;
type Tab = (typeof TABS)[number];

// What each tab is for, shown above the fields so nobody has to guess.
const GUIDE: Record<Tab, string> = {
  Overview: "The first screen a commissioner sees. Title, format, a one-sentence logline and a hero image that sets the tone.",
  World: "Synopsis, the engine that generates episodes, why now, and three mood stills with captions.",
  Casting: "One card per lead role: who they are, how to cast them, a wishlist with headshots, and a self-tape if you have one.",
  Production: "Where it shoots and why those places work on screen. Budget band, UK tax relief and co-production options.",
  Episodes: "An outline per episode: title, hook and a short synopsis. Three is enough for a first pitch.",
  Team: "Who is behind it. Producers, writers, director and attached talent, with credits.",
  Access: "Who can open this pitch. Set a passcode for a commissioner and the name that appears in the watermark.",
  JSON: "Power editing. Paste a whole deck in, or copy this one out.",
};

function completeness(d: PitchDeckData): Record<Tab, boolean> {
  return {
    Overview: Boolean(d.hero.title && d.hero.format && d.hero.logline),
    World: Boolean(d.world_and_engine.synopsis && d.world_and_engine.the_engine),
    Casting: d.casting.length > 0,
    Production: d.production.locations.length > 0 && Boolean(d.production.financials.indicative_budget_band),
    Episodes: d.episodic_arc.length > 0,
    Team: d.team.length > 0,
    Access: true,
    JSON: true,
  };
}

export function Editor({ initial, welcome = false }: { initial: PitchDeckData; welcome?: boolean }) {
  const [deck, setDeck] = useState<PitchDeckData>(initial);
  const [tab, setTab] = useState<Tab>("Overview");
  const [showWelcome, setShowWelcome] = useState(welcome);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const patch = useCallback(<K extends keyof PitchDeckData>(key: K, value: PitchDeckData[K]) => {
    setDeck((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setMsg(null);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await savePitchAction(deck);
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setMsg({ ok: true, text: `Saved ${new Date(res.updated_at).toLocaleTimeString("en-GB")}` });
    } else {
      setMsg({ ok: false, text: res.errors.join(" · ") });
    }
  }, [deck]);

  const setStatus = useCallback(
    async (status: PitchDeckData["status"]) => {
      setPublishing(true);
      const res = await publishPitchAction(deck.slug, status);
      setPublishing(false);
      if (res.ok) {
        setDeck((d) => ({ ...d, status }));
        setMsg({ ok: true, text: status === "published" ? "Published. Viewers can open it now." : "Taken back to " + status.replace("_", " ") });
      } else setMsg({ ok: false, text: res.errors.join(" · ") });
    },
    [deck.slug],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Preview renders whatever currently validates; otherwise the last good state.
  const previewDeck = useMemo(() => {
    const p = PitchDeckSchema.safeParse(deck);
    return p.success ? p.data : null;
  }, [deck]);

  const h = deck.hero;
  const w = deck.world_and_engine;
  const f = deck.production.financials;
  const done = completeness(deck);
  const doneCount = (["Overview", "World", "Casting", "Production", "Episodes", "Team"] as Tab[]).filter((t) => done[t]).length;
  const published = deck.status === "published";

  return (
    <div className="flex flex-col lg:h-[calc(100vh-57px)]">
      {/* Step bar */}
      <div className="sticky top-[57px] z-20 border-b border-line bg-bg px-4 py-2.5 md:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Stepper current={published ? 4 : 3} slug={deck.slug} />
          <span className="ml-auto flex items-center gap-2 text-sm">
            {msg && <span className={`hidden sm:inline ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</span>}
            {dirty && !msg && <span className="hidden font-medium text-warn sm:inline">Unsaved changes</span>}
            <button type="button" className="btn btn-ghost hidden py-1.5 text-sm lg:inline-flex" onClick={() => setShowPreview((s) => !s)}>
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
            <Link href={`/p/${deck.slug}`} target="_blank" className="btn btn-ghost py-1.5 text-sm">
              <Eye size={14} /> <span className="hidden sm:inline">Preview</span>
            </Link>
            <button type="button" className="btn btn-primary py-1.5 text-sm" onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : dirty ? <Save size={14} /> : <Check size={14} />}
              {saving ? "Saving" : dirty ? "Save" : "Saved"}
            </button>
          </span>
        </div>
      </div>

      {msg && !msg.ok && <p className="border-b border-danger/30 bg-red-50 px-4 py-2 text-sm text-danger sm:hidden">{msg.text}</p>}

      {showWelcome && (
        <div className="flex items-start gap-3 border-b border-line bg-accent-soft px-4 py-3 text-sm md:px-6">
          <span className="step-dot">3</span>
          <p className="flex-1 text-fg-2">
            <strong className="text-fg">Your draft is ready.</strong> Work through the tabs on the left; the preview on the right updates as you type. Tick off the six sections, then publish from the bar at the bottom.
          </p>
          <button onClick={() => setShowWelcome(false)} aria-label="Dismiss" className="text-mute hover:text-fg">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className={`flex min-h-0 flex-col ${showPreview ? "w-full lg:w-[46%]" : "w-full"} lg:border-r lg:border-line`}>
          <div className="px-4 pt-4 md:px-6">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="truncate text-2xl">{h.title || "Untitled"}</h1>
              <span className="shrink-0 text-xs font-semibold text-mute">{doneCount} of 6 sections done</span>
            </div>
          </div>
          <div className="sticky top-[105px] z-10 flex gap-1 overflow-x-auto border-b border-line bg-bg px-3 pt-3 text-sm lg:static">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-medium ${tab === t ? "border-accent-strong text-fg" : "border-transparent text-mute hover:text-fg"}`}
              >
                {t}
                {t !== "Access" && t !== "JSON" && (done[t] ? <Check size={13} className="text-ok" /> : <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />)}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-5 px-4 py-5 md:px-6 lg:overflow-y-auto">
            <p className="rounded-xl bg-surface px-4 py-3 text-sm text-fg-2">{GUIDE[tab]}</p>
            {tab === "Overview" && (
              <>
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
            )}

            {tab === "Production" && (
              <>
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
            )}

            {tab === "Team" && (
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
            )}

            {tab === "Access" && (
              <>
                <Text label="URL slug" value={deck.slug} hint="Lowercase letters, numbers and hyphens. Changing it changes the link." onChange={(v) => patch("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                <Text label="Deck passcode" value={deck.security.passcode} hint="Optional. Lets a commissioner open this deck only. Leave blank to rely on the shared passcode." onChange={(v) => patch("security", { ...deck.security, passcode: v })} />
                <Text label="Recipient" value={deck.security.watermark_recipient} placeholder="Prepared for Drama Commissioning, BBC" hint="Shown in the watermark when the viewer gives no email" onChange={(v) => patch("security", { ...deck.security, watermark_recipient: v })} />
                <div className="rounded-xl bg-surface p-4 text-sm text-fg-2">
                  Share link: <span className="font-mono text-accent-strong">cwcasting.com/pitchgen/p/{deck.slug}</span>
                  {deck.security.passcode ? ` with passcode ${deck.security.passcode}` : " (shared passcode)"}
                </div>
              </>
            )}

            {tab === "JSON" && (
              <JsonTab deck={deck} onApply={(d) => { setDeck(d); setDirty(true); setMsg(null); }} />
            )}
          </div>
        </div>

        {showPreview && (
          <div className="hidden min-h-0 flex-1 flex-col bg-surface lg:flex">
            <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs font-semibold text-mute">
              <span>Live preview: what a commissioner will see</span>
              <span>50% scale</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {previewDeck ? (
                <div className="m-4 overflow-hidden rounded-xl border border-line bg-bg shadow-sm" style={{ zoom: 0.5 }}>
                  <DeckView deck={previewDeck} />
                </div>
              ) : (
                <p className="p-6 text-sm text-warn">Preview paused: fix the highlighted fields.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 4: publish bar */}
      <div className="no-print sticky bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-line bg-bg px-4 py-3 text-sm md:px-6">
        <span className="step-dot">4</span>
        <div className="min-w-0 flex-1">
          {published ? (
            <p>
              <strong>Published.</strong> Share <span className="font-mono text-accent-strong">cwcasting.com/pitchgen/p/{deck.slug}</span>
              {deck.security.passcode ? ` with passcode ${deck.security.passcode}` : " with the shared passcode"}.
            </p>
          ) : (
            <p className="text-fg-2">
              <strong className="text-fg">Preview, then publish.</strong> {doneCount < 6 ? `${6 - doneCount} ${6 - doneCount === 1 ? "section is" : "sections are"} still empty.` : "All sections have content."} Viewers cannot see this pitch until it is published.
            </p>
          )}
        </div>
        <Link href={`/p/${deck.slug}`} target="_blank" className="btn btn-ghost py-1.5">
          <ExternalLink size={14} /> Preview full page
        </Link>
        {published ? (
          <button type="button" className="btn btn-ghost py-1.5" onClick={() => setStatus("draft")} disabled={publishing}>
            Unpublish
          </button>
        ) : (
          <button type="button" className="btn btn-primary py-1.5" onClick={() => setStatus("published")} disabled={publishing || dirty}>
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {dirty ? "Save first" : "Publish"}
          </button>
        )}
      </div>
    </div>
  );
}

function JsonTab({ deck, onApply }: { deck: PitchDeckData; onApply: (d: PitchDeckData) => void }) {
  const [text, setText] = useState(() => JSON.stringify(deck, null, 2));
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <p className="text-xs text-mute">Power editing. Paste JSON from the extraction prompt or edit directly, then apply.</p>
      <textarea className="field font-mono text-xs" rows={24} value={text} onChange={(e) => setText(e.target.value)} />
      {err && <p className="text-sm text-danger">{err}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            try {
              const p = PitchDeckSchema.safeParse(JSON.parse(text));
              if (!p.success) throw new Error(p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
              setErr(null);
              onApply(p.data);
            } catch (e) {
              setErr((e as Error).message);
            }
          }}
        >
          Apply to editor
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setText(JSON.stringify(deck, null, 2))}>
          Reload from editor
        </button>
      </div>
    </>
  );
}
