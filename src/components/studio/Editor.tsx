"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Eye, EyeOff, Globe, Loader2, Lock, Save, Send, X } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { PitchDeckSchema } from "@/types/pitch";
import { publishPitchAction, savePitchAction } from "@/app/studio/actions";
import { Stepper } from "./Stepper";
import { href } from "@/lib/base";
import { SectionFields } from "./SectionFields";
import { Text } from "./fields";
import { MediaTab } from "./MediaTab";
import { LAYOUTS, LayoutThumb } from "./NewPitchWizard";
import { DeckView } from "@/components/deck/DeckView";

const TABS = ["Overview", "World", "Casting", "Production", "Episodes", "Team", "Media", "Access", "JSON"] as const;
type Tab = (typeof TABS)[number];

// What each tab is for, shown above the fields so nobody has to guess.
const GUIDE: Record<Tab, string> = {
  Overview: "The first screen a commissioner sees. Title, format, a one-sentence logline and a hero image that sets the tone.",
  World: "Synopsis, the engine that generates episodes, why now, and three mood stills with captions.",
  Casting: "One card per lead role: who they are, how to cast them, a wishlist with headshots, and a self-tape if you have one.",
  Production: "Where it shoots and why those places work on screen. Budget band, UK tax relief and co-production options.",
  Episodes: "An outline per episode: title, hook and a short synopsis. Three is enough for a first pitch.",
  Team: "Who is behind it. Producers, writers, director and attached talent, with credits.",
  Media: "Every image and video for this pitch in one place. Upload in bulk, place each file with one click, download, and let the reference finder write your stills search list.",
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
    Media: true,
    Access: true,
    JSON: true,
  };
}

export function Editor({ initial, welcome = false, aiReady = false, origin = "", initialTab }: { initial: PitchDeckData; welcome?: boolean; aiReady?: boolean; origin?: string; initialTab?: string }) {
  const [deck, setDeck] = useState<PitchDeckData>(initial);
  const [tab, setTab] = useState<Tab>((TABS as readonly string[]).includes(initialTab ?? "") ? (initialTab as Tab) : "Overview");
  const [showWelcome, setShowWelcome] = useState(welcome);
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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
    async (status: PitchDeckData["status"], visibility?: "public" | "passcode") => {
      setPublishing(true);
      const res = await publishPitchAction(deck.slug, status, visibility);
      setPublishing(false);
      if (res.ok) {
        setDeck((d) => ({ ...d, status, security: visibility ? { ...d.security, is_password_protected: visibility === "passcode" } : d.security }));
        setMsg({ ok: true, text: status === "published" ? "Published." : "Taken back to " + status.replace("_", " ") });
        setPublishOpen(false);
      } else setMsg({ ok: false, text: res.errors.join(" · ") });
    },
    [deck.slug],
  );

  const shareUrl = `${origin}${href(`/p/${deck.slug}`)}`;
  const isPublic = !deck.security.is_password_protected;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

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
  const done = completeness(deck);
  const hiddenSet = new Set<string>(deck.hidden_sections);
  const HIDEABLE = ["World", "Casting", "Production", "Episodes", "Team"] as const;
  type Hideable = (typeof HIDEABLE)[number];
  const isHideable = (t: string): t is Hideable => (HIDEABLE as readonly string[]).includes(t);
  const toggleHidden = (t: Hideable) => patch("hidden_sections", hiddenSet.has(t) ? deck.hidden_sections.filter((x) => x !== t) : [...deck.hidden_sections, t]);
  const contentTabs = (["Overview", "World", "Casting", "Production", "Episodes", "Team"] as Tab[]).filter((t) => !hiddenSet.has(t));
  const doneCount = contentTabs.filter((t) => done[t]).length;
  const totalCount = contentTabs.length;
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
            <strong className="text-fg">Your draft is ready.</strong> Work through the tabs on the left; the preview on the right updates as you type. Hide any section you do not need, then publish from the bar at the bottom.{" "}
            {deck.extraction && <Link href={`/studio/${deck.slug}/review`} className="font-semibold text-accent-strong">Review section by section</Link>}
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
              <span className="shrink-0 text-xs font-semibold text-mute">{doneCount} of {totalCount} sections done{hiddenSet.size ? `, ${hiddenSet.size} hidden` : ""}</span>
            </div>
          </div>
          <div className="sticky top-[105px] z-10 flex gap-1 overflow-x-auto border-b border-line bg-bg px-3 pt-3 text-sm lg:static">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 font-medium transition ${tab === t ? "border-accent-strong bg-accent-soft/60 text-fg" : "border-transparent text-mute hover:bg-surface hover:text-fg"}`}
              >
                {t}
                {t !== "Access" && t !== "JSON" && t !== "Media" && (hiddenSet.has(t) ? <EyeOff size={13} className="text-mute" /> : done[t] ? <Check size={13} className="text-ok" /> : <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />)}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-5 px-4 py-5 md:px-6 lg:overflow-y-auto">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-fg-2">
              <p className="min-w-0 flex-1">{GUIDE[tab]}</p>
              {isHideable(tab) && (
                <button type="button" className={`btn py-1 text-xs ${hiddenSet.has(tab) ? "btn-primary" : "btn-ghost"}`} onClick={() => toggleHidden(tab)}>
                  {hiddenSet.has(tab) ? <><Eye size={13} /> Show section</> : <><EyeOff size={13} /> Hide section</>}
                </button>
              )}
            </div>
            {isHideable(tab) && hiddenSet.has(tab) && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">This section is hidden. It will not appear in the deck or count towards completion. Your content is kept.</p>
            )}
            {(tab === "Overview" || tab === "World" || tab === "Casting" || tab === "Production" || tab === "Episodes" || tab === "Team") && (
              <SectionFields tab={tab} deck={deck} patch={patch} aiReady={aiReady} />
            )}

            {tab === "Media" && (
              <MediaTab deck={deck} aiReady={aiReady} onChange={(d) => { setDeck(d); setDirty(true); setMsg(null); }} />
            )}

            {tab === "Access" && (
              <>
                <div>
                  <span className="label">Layout</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LAYOUTS.map((l) => (
                      <button key={l.id} type="button" onClick={() => patch("layout", l.id)} className={`rounded-xl border-2 p-3 text-left transition ${deck.layout === l.id ? "border-accent-strong bg-accent-soft" : "border-line hover:border-accent"}`}>
                        <LayoutThumb id={l.id} />
                        <p className="mt-2 text-sm font-semibold">{l.name}</p>
                      </button>
                    ))}
                  </div>
                  <p className="hint">Same content, different page. The preview updates when you switch.</p>
                </div>
                <div>
                  <span className="label">Who can open the link</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => patch("security", { ...deck.security, is_password_protected: true })} className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left ${!isPublic ? "border-accent-strong bg-accent-soft" : "border-line"}`}>
                      <Lock size={18} className="mt-0.5 shrink-0 text-accent-strong" />
                      <span><span className="block text-sm font-semibold">Passcode</span><span className="text-xs text-mute">The shared passcode, or a deck passcode below.</span></span>
                    </button>
                    <button type="button" onClick={() => patch("security", { ...deck.security, is_password_protected: false })} className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left ${isPublic ? "border-accent-strong bg-accent-soft" : "border-line"}`}>
                      <Globe size={18} className="mt-0.5 shrink-0 text-accent-strong" />
                      <span><span className="block text-sm font-semibold">Public link</span><span className="text-xs text-mute">Anyone with the link can open it once published.</span></span>
                    </button>
                  </div>
                </div>
                <Text label="URL slug" value={deck.slug} hint="Lowercase letters, numbers and hyphens. Changing it changes the link." onChange={(v) => patch("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                <Text label="Deck passcode" value={deck.security.passcode} hint="Optional. Lets a commissioner open this deck only. Leave blank to rely on the shared passcode." onChange={(v) => patch("security", { ...deck.security, passcode: v })} />
                <Text label="Recipient" value={deck.security.watermark_recipient} placeholder="Prepared for Drama Commissioning, BBC" hint="Shown in the watermark when the viewer gives no email" onChange={(v) => patch("security", { ...deck.security, watermark_recipient: v })} />
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface p-4 text-sm text-fg-2">
                  <span className="min-w-0 flex-1 truncate">Link: <span className="font-mono text-accent-strong">{shareUrl}</span></span>
                  <button type="button" className="btn btn-ghost py-1 text-xs" onClick={copyLink}><Copy size={13} /> {copied ? "Copied" : "Copy"}</button>
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
            <p className="flex flex-wrap items-center gap-x-2">
              <strong>{isPublic ? "Live on a public link." : "Published behind a passcode."}</strong>
              <span className="truncate font-mono text-accent-strong">{shareUrl}</span>
              <button type="button" className="btn btn-ghost py-0.5 text-xs" onClick={copyLink}><Copy size={12} /> {copied ? "Copied" : "Copy link"}</button>
            </p>
          ) : (
            <p className="text-fg-2">
              <strong className="text-fg">Preview, then publish.</strong> {doneCount < totalCount ? `${totalCount - doneCount} ${totalCount - doneCount === 1 ? "section is" : "sections are"} still empty.` : "All sections have content."} Nobody else can see this pitch until it is published.
            </p>
          )}
        </div>
        <Link href={`/p/${deck.slug}`} target="_blank" className="btn btn-ghost py-1.5">
          <ExternalLink size={14} /> Preview
        </Link>
        {published ? (
          <button type="button" className="btn btn-ghost py-1.5" onClick={() => setStatus("draft")} disabled={publishing}>
            Unpublish
          </button>
        ) : (
          <button type="button" className="btn btn-primary py-1.5" onClick={() => setPublishOpen(true)} disabled={publishing || dirty}>
            <Send size={14} /> {dirty ? "Save first" : "Publish"}
          </button>
        )}
      </div>

      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center" onClick={() => setPublishOpen(false)}>
          <div className="card w-full max-w-lg p-6 shadow-xl md:p-8" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">Step 4</p>
            <h2 className="mt-1 text-2xl">Publish {h.title || "this pitch"}</h2>
            <p className="mt-2 text-fg-2">Choose who can open the link. You can change this later from the Access tab.</p>
            <div className="mt-5 grid gap-3">
              <button type="button" disabled={publishing} onClick={() => setStatus("published", "public")} className="flex items-start gap-3 rounded-xl border-2 border-line p-4 text-left hover:border-accent-strong hover:bg-accent-soft">
                <Globe size={20} className="mt-0.5 shrink-0 text-accent-strong" />
                <span>
                  <span className="block font-semibold">Public link</span>
                  <span className="text-sm text-mute">Anyone with the link can open it. No passcode. Best for sending to a commissioner.</span>
                </span>
              </button>
              <button type="button" disabled={publishing} onClick={() => setStatus("published", "passcode")} className="flex items-start gap-3 rounded-xl border-2 border-line p-4 text-left hover:border-accent-strong hover:bg-accent-soft">
                <Lock size={20} className="mt-0.5 shrink-0 text-accent-strong" />
                <span>
                  <span className="block font-semibold">Passcode protected</span>
                  <span className="text-sm text-mute">Needs the shared passcode{deck.security.passcode ? ` or this deck's passcode (${deck.security.passcode})` : ""}.</span>
                </span>
              </button>
            </div>
            {deck.media.some((m) => m.credit) && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">This deck uses credited reference frames from other productions. A public link publishes them; passcode protected is the safer choice.</p>
            )}
            <p className="mt-4 text-xs text-mute">Link: <span className="font-mono">{shareUrl}</span>. Every page carries a confidential watermark either way.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost py-1.5" onClick={() => setPublishOpen(false)} disabled={publishing}>Cancel</button>
            </div>
            {publishing && <p className="mt-3 inline-flex items-center gap-2 text-sm text-mute"><Loader2 size={14} className="animate-spin" /> Publishing</p>}
          </div>
        </div>
      )}
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
