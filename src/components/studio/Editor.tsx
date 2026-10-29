"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Loader2, Save } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { PitchDeckSchema } from "@/types/pitch";
import { savePitchAction } from "@/app/studio/actions";
import { DeckView } from "@/components/deck/DeckView";
import { Area, MediaField, Palette, Repeater, Select, Tags, Text, Toggle } from "./fields";

const TABS = ["Overview", "World", "Casting", "Production", "Episodes", "Team", "Access", "JSON"] as const;
type Tab = (typeof TABS)[number];

export function Editor({ initial }: { initial: PitchDeckData }) {
  const [deck, setDeck] = useState<PitchDeckData>(initial);
  const [tab, setTab] = useState<Tab>("Overview");
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

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col">
      <div className="flex items-center gap-4 border-b border-line bg-ink-2 px-5 py-2.5 text-sm">
        <span className="font-display text-xl">{h.title || "Untitled"}</span>
        <span className="text-xs text-mute">/p/{deck.slug}</span>
        <span className="ml-auto flex items-center gap-3 text-xs">
          {msg && <span className={msg.ok ? "text-ok" : "text-danger"}>{msg.text}</span>}
          {dirty && !msg && <span className="text-warn">Unsaved changes</span>}
          <button type="button" className="btn btn-ghost py-1.5 lg:inline-flex" onClick={() => setShowPreview((s) => !s)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <Link href={`/p/${deck.slug}`} target="_blank" className="btn btn-ghost py-1.5">
            <ExternalLink size={13} /> Open
          </Link>
          <button type="button" className="btn btn-primary py-1.5" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : dirty ? <Save size={13} /> : <Check size={13} />}
            {saving ? "Saving" : dirty ? "Save" : "Saved"}
          </button>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={`flex min-h-0 flex-col ${showPreview ? "w-full lg:w-[46%]" : "w-full"} border-r border-line`}>
          <div className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-2 text-xs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`shrink-0 border-b-2 px-3 py-2 ${tab === t ? "border-accent text-paper" : "border-transparent text-mute hover:text-paper"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {tab === "Overview" && (
              <>
                <Text label="Title" value={h.title} onChange={(v) => patch("hero", { ...h, title: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text label="Format" value={h.format} placeholder="6 x 60' returnable drama" onChange={(v) => patch("hero", { ...h, format: v })} />
                  <Select label="Status" value={deck.status} onChange={(v) => patch("status", v)} options={[["draft", "Draft"], ["in_review", "In review"], ["sent", "Sent"]]} />
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
                <div className="card p-4 text-xs text-mute">
                  Share link: <span className="text-paper">cwcasting.com/pitchgen/p/{deck.slug}</span>
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
          <div className="hidden min-h-0 flex-1 overflow-y-auto bg-ink lg:block">
            {previewDeck ? (
              <div style={{ zoom: 0.5 }}>
                <DeckView deck={previewDeck} />
              </div>
            ) : (
              <p className="p-6 text-sm text-warn">Preview paused: fix the highlighted fields.</p>
            )}
          </div>
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
      <textarea className="field font-mono text-xs" rows={28} value={text} onChange={(e) => setText(e.target.value)} />
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
