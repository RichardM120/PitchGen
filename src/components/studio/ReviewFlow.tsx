"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleAlert, EyeOff, FileText, Loader2, PenLine, Sparkles } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { PitchDeckSchema } from "@/types/pitch";
import { confirmSectionAction } from "@/app/studio/actions";
import { DeckView } from "@/components/deck/DeckView";
import { Stepper } from "./Stepper";
import { SectionFields, type SectionTab } from "./SectionFields";

const SECTIONS: { tab: SectionTab; title: string; ask: string }[] = [
  { tab: "Overview", title: "Overview", ask: "Is the title, format and logline right?" },
  { tab: "World", title: "World and engine", ask: "Does this describe the world and what drives the episodes?" },
  { tab: "Casting", title: "Casting", ask: "Are the lead roles and casting notes right?" },
  { tab: "Production", title: "Production", ask: "Are the locations, budget and relief notes right?" },
  { tab: "Episodes", title: "Episodes", ask: "Does the episode outline match the material?" },
  { tab: "Team", title: "Team", ask: "Is the team correct and complete?" },
];

// Section-by-section review after an AI extraction. For each section:
// what the source stated, what was inferred, what is missing; then confirm
// or edit in place before moving on.
export function ReviewFlow({ initial, aiReady }: { initial: PitchDeckData; aiReady: boolean }) {
  const router = useRouter();
  const [deck, setDeck] = useState<PitchDeckData>(initial);
  const firstUnconfirmed = Math.max(0, SECTIONS.findIndex((s) => !(initial.extraction?.confirmed ?? []).includes(s.tab)));
  const [i, setI] = useState(firstUnconfirmed);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sec = SECTIONS[i];
  const notes = deck.extraction?.notes?.[sec.tab];
  const confirmed = deck.extraction?.confirmed ?? [];
  const previewDeck = useMemo(() => {
    const p = PitchDeckSchema.safeParse(deck);
    return p.success ? p.data : null;
  }, [deck]);

  const patch = useCallback(<K extends keyof PitchDeckData>(key: K, value: PitchDeckData[K]) => {
    setDeck((d) => ({ ...d, [key]: value }));
  }, []);

  async function confirm() {
    setBusy(true);
    setErr(null);
    const res = await confirmSectionAction(deck, sec.tab);
    setBusy(false);
    if (!res.ok) {
      setErr(res.errors.join(" · "));
      return;
    }
    const ex = deck.extraction ?? { source: "", notes: {}, confirmed: [] };
    const next = { ...deck, extraction: { ...ex, confirmed: ex.confirmed.includes(sec.tab) ? ex.confirmed : [...ex.confirmed, sec.tab] } };
    setDeck(next);
    setEditing(false);
    if (i < SECTIONS.length - 1) setI(i + 1);
    else router.push(`/studio/${deck.slug}?welcome=1`);
  }

  const allDone = SECTIONS.every((s) => confirmed.includes(s.tab));
  const hidden = deck.hidden_sections.includes(sec.tab as never);

  async function hideAndNext() {
    if (sec.tab === "Overview") return;
    setBusy(true);
    setErr(null);
    const next = { ...deck, hidden_sections: Array.from(new Set([...deck.hidden_sections, sec.tab])) as PitchDeckData["hidden_sections"] };
    const res = await confirmSectionAction(next, sec.tab);
    setBusy(false);
    if (!res.ok) {
      setErr(res.errors.join(" · "));
      return;
    }
    const ex = next.extraction ?? { source: "", notes: {}, confirmed: [] };
    setDeck({ ...next, extraction: { ...ex, confirmed: ex.confirmed.includes(sec.tab) ? ex.confirmed : [...ex.confirmed, sec.tab] } });
    setEditing(false);
    if (i < SECTIONS.length - 1) setI(i + 1);
    else router.push(`/studio/${deck.slug}?welcome=1`);
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-57px)]">
      <div className="border-b border-line bg-bg px-4 py-2.5 md:px-6">
        <Stepper current={3} slug={deck.slug} />
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 w-full flex-col lg:w-[46%] lg:border-r lg:border-line">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
            <p className="eyebrow">
              Review {i + 1} of {SECTIONS.length}
              {deck.extraction?.source ? ` · extracted from ${deck.extraction.source}` : ""}
            </p>
            <h1 className="mt-1 text-3xl">{sec.title}</h1>
            <p className="mt-1 text-fg-2">{sec.ask} {sec.tab !== "Overview" && <span className="text-mute">Not needed for this pitch? Hide it.</span>}</p>
            {hidden && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">This section is hidden from the deck. You can show it again in the editor.</p>}

            {/* Section progress */}
            <ol className="mt-4 flex flex-wrap gap-2">
              {SECTIONS.map((s, k) => (
                <li key={s.tab}>
                  <button type="button" onClick={() => { setI(k); setEditing(false); }} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${k === i ? "bg-accent-strong text-white" : confirmed.includes(s.tab) ? "bg-teal-100 text-teal-800" : "bg-surface-2 text-mute"}`}>
                    {confirmed.includes(s.tab) && k !== i ? <Check size={12} /> : null} {s.title}
                  </button>
                </li>
              ))}
            </ol>

            {/* What the AI found */}
            {notes && (notes.found.length + notes.inferred.length + notes.missing.length > 0) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <NoteList icon={<FileText size={14} className="text-ok" />} title="From the document" items={notes.found} empty="Nothing specific" />
                <NoteList icon={<Sparkles size={14} className="text-accent-strong" />} title="Inferred by AI" items={notes.inferred} empty="Nothing inferred" tone="accent" />
                <NoteList icon={<CircleAlert size={14} className="text-warn" />} title="Not in the document" items={notes.missing} empty="Nothing missing" tone="warn" />
              </div>
            )}

            {!editing ? (
              <div className="mt-5 rounded-xl bg-surface p-4">
                <Summary deck={deck} tab={sec.tab} />
                <button type="button" className="btn btn-ghost mt-4 py-1.5 text-sm" onClick={() => setEditing(true)}>
                  <PenLine size={14} /> Edit this section
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <SectionFields tab={sec.tab} deck={deck} patch={patch} aiReady={aiReady} />
              </div>
            )}

            {err && <p className="mt-3 text-sm font-medium text-danger">{err}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-bg px-4 py-3 md:px-6">
            <button type="button" className="btn btn-ghost py-1.5" disabled={i === 0 || busy} onClick={() => { setI(i - 1); setEditing(false); }}>
              <ArrowLeft size={14} /> Back
            </button>
            <span className="flex-1 text-sm text-mute">{allDone ? "All sections confirmed." : `${confirmed.length} of ${SECTIONS.length} confirmed`}</span>
            <Link href={`/studio/${deck.slug}`} className="btn btn-ghost py-1.5">
              Skip to editor
            </Link>
            {sec.tab !== "Overview" && (
              <button type="button" className="btn btn-ghost py-1.5" disabled={busy} onClick={hideAndNext} title="Leave this section out of the deck">
                <EyeOff size={14} /> {hidden ? "Hidden" : "Hide section"}
              </button>
            )}
            <button type="button" className="btn btn-primary py-1.5" disabled={busy} onClick={confirm}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {i < SECTIONS.length - 1 ? "Confirm and next" : "Confirm and finish"} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 flex-col bg-surface lg:flex">
          <div className="border-b border-line px-4 py-2 text-xs font-semibold text-mute">Live preview</div>
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
      </div>
    </div>
  );
}

function NoteList({ icon, title, items, empty, tone }: { icon: React.ReactNode; title: string; items: string[]; empty: string; tone?: "accent" | "warn" }) {
  return (
    <div className={`rounded-xl border p-3 text-sm ${tone === "warn" ? "border-amber-200 bg-amber-50" : tone === "accent" ? "border-accent/30 bg-accent-soft/50" : "border-line bg-bg"}`}>
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">{icon} {title}</p>
      {items.length ? (
        <ul className="mt-2 space-y-1 text-fg-2">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-mute">{empty}</p>
      )}
    </div>
  );
}

// Read-only recap of a section so the builder can confirm without opening fields.
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-2 last:border-0 sm:grid-cols-[140px_1fr]">
      <span className="text-xs font-bold uppercase tracking-wider text-mute">{k}</span>
      <span className="text-sm">{v || <span className="text-mute">Empty</span>}</span>
    </div>
  );
}

function Summary({ deck, tab }: { deck: PitchDeckData; tab: SectionTab }) {
  const h = deck.hero, w = deck.world_and_engine, p = deck.production;
  if (tab === "Overview")
    return (
      <>
        <Row k="Title" v={h.title} />
        <Row k="Format" v={h.format} />
        <Row k="Genre" v={h.genre.join(", ")} />
        <Row k="Comparables" v={h.comparables} />
        <Row k="Logline" v={h.logline} />
      </>
    );
  if (tab === "World")
    return (
      <>
        <Row k="Synopsis" v={w.synopsis} />
        <Row k="Engine" v={w.the_engine} />
        <Row k="Why now" v={w.why_now} />
        <Row k="Mood stills" v={w.mood_stills.length ? w.mood_stills.map((s) => s.caption || "untitled").join(" · ") : ""} />
      </>
    );
  if (tab === "Casting")
    return (
      <>
        {deck.casting.map((c) => (
          <Row key={c.character_name} k={c.character_name || "Role"} v={<><strong>{c.archetype}</strong> ({c.age_range}). {c.character_bio} <span className="text-fg-2">Casting: {c.casting_notes}</span></>} />
        ))}
        {deck.casting.length === 0 && <Row k="Roles" v="" />}
      </>
    );
  if (tab === "Production")
    return (
      <>
        {p.locations.map((l) => (
          <Row key={l.name} k={l.name || "Location"} v={`${l.region}. ${l.visual_rationale}`} />
        ))}
        <Row k="Budget" v={p.financials.indicative_budget_band} />
        <Row k="Tax relief" v={p.financials.uk_tax_relief_eligible ? p.financials.tax_relief_notes : "Not claimed"} />
        <Row k="Co-pro" v={p.financials.co_pro_opportunities.join(", ")} />
        <Row k="Funding" v={p.financials.existing_attachments_or_funding} />
      </>
    );
  if (tab === "Episodes")
    return (
      <>
        {deck.episodic_arc.map((e) => (
          <Row key={e.episode_number} k={`Ep ${e.episode_number}`} v={<><strong>{e.title}.</strong> {e.hook} {e.synopsis}</>} />
        ))}
        {deck.episodic_arc.length === 0 && <Row k="Episodes" v="" />}
      </>
    );
  return (
    <>
      {deck.team.map((t) => (
        <Row key={t.name} k={t.name || "Person"} v={`${t.role}${t.company ? `, ${t.company}` : ""}. ${t.bio}`} />
      ))}
      {deck.team.length === 0 && <Row k="Team" v="" />}
    </>
  );
}
