"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Loader2, Sparkles } from "lucide-react";
import { href } from "@/lib/base";
import { createPitchAction } from "@/app/studio/actions";
import { Stepper } from "./Stepper";

const FORMATS = ["6 x 60' returnable drama", "8 x 30' comedy", "4 x 60' limited series", "Feature film", "Children's / animation", "Factual / documentary"];
export const LAYOUTS = [
  { id: "cinematic", name: "Cinematic", blurb: "Full-bleed hero, long scroll, image-led. Drama and thrillers." },
  { id: "editorial", name: "Editorial", blurb: "Magazine pages, text-led, white space. Comedy, factual, returning series." },
  { id: "onepager", name: "One-pager", blurb: "Everything on one screen with tabs. Fast read on a phone." },
  { id: "lookbook", name: "Lookbook", blurb: "Image first. Big stills, short captions. For tone and visual references." },
  { id: "treatment", name: "Treatment", blurb: "Text first, long form. Reads like a document, prints well." },
] as const;

const GENRES = ["Crime", "Drama", "Comedy", "Thriller", "Family", "Period", "Sci-fi", "Romance", "Horror", "Documentary"];

export function NewPitchWizard({ aiReady, audio, canSave }: { aiReady: boolean; audio: boolean; canSave: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]["id"]>("cinematic");
  const [customGenre, setCustomGenre] = useState("");

  function addCustomGenre() {
    const g = customGenre.trim();
    if (!g) return;
    if (!genres.some((x) => x.toLowerCase() === g.toLowerCase())) setGenres([...genres, g]);
    setCustomGenre("");
  }
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"generate" | "blank" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canContinue = title.trim().length > 1;
  const hasMaterial = notes.trim().length > 40 || Boolean(file);

  async function generate() {
    setBusy("generate");
    setError(null);
    const fd = new FormData();
    fd.set("title", title.trim());
    fd.set("notes", [format && `Format: ${format}`, genres.length && `Genre: ${genres.join(", ")}`, notes].filter(Boolean).join("\n\n"));
    fd.set("layout", layout);
    if (file) fd.set("file", file);
    try {
      const res = await fetch(href("/api/generate"), { method: "POST", body: fd });
      const json = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok || !json.slug) throw new Error(json.error ?? `Failed (${res.status})`);
      router.push(`/studio/${json.slug}?welcome=1`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function blank() {
    setBusy("blank");
    const fd = new FormData();
    fd.set("title", title.trim());
    fd.set("format", format);
    fd.set("genre", genres.join(","));
    fd.set("layout", layout);
    await createPitchAction(fd);
  }

  return (
    <div>
      <Stepper current={step} />
      <div className="mt-8" />
      {step === 1 && (
        <section>
          <h1 className="text-3xl md:text-4xl">Step 1: What is the pitch?</h1>
          <p className="mt-2 text-fg-2">Just the essentials. You can change all of this later.</p>

          <div className="card mt-8 space-y-6 p-6 md:p-8">
            <div>
              <label className="label" htmlFor="title">
                Working title
              </label>
              <input id="title" className="field text-lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Saltings" autoFocus />
              <p className="hint">This becomes the web address, for example /p/the-saltings.</p>
            </div>

            <div>
              <span className="label">Format</span>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f === format ? "" : f)} className={`btn py-1.5 text-sm ${format === f ? "btn-primary" : "btn-ghost"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <input className="field mt-2" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Or type your own, e.g. 3 x 90' event drama" />
            </div>

            <div>
              <span className="label">Layout</span>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {LAYOUTS.map((l) => (
                  <button key={l.id} type="button" onClick={() => setLayout(l.id)} className={`rounded-xl border-2 p-3 text-left transition ${layout === l.id ? "border-accent-strong bg-accent-soft" : "border-line hover:border-accent"}`}>
                    <LayoutThumb id={l.id} />
                    <p className="mt-2 font-semibold">{l.name}</p>
                    <p className="text-xs text-mute">{l.blurb}</p>
                  </button>
                ))}
              </div>
              <p className="hint">You can switch layouts any time in the editor. The content stays the same.</p>
            </div>

            <div>
              <span className="label">Genre (pick any, or add your own)</span>
              <div className="flex flex-wrap gap-2">
                {[...GENRES, ...genres.filter((g) => !(GENRES as readonly string[]).includes(g))].map((g) => {
                  const on = genres.includes(g);
                  return (
                    <button key={g} type="button" onClick={() => setGenres(on ? genres.filter((x) => x !== g) : [...genres, g])} className={`btn py-1.5 text-sm ${on ? "btn-primary" : "btn-ghost"}`}>
                      {g}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="field"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomGenre();
                    }
                  }}
                  placeholder="Add your own, e.g. Coastal noir, Folk horror, Workplace comedy"
                />
                <button type="button" className="btn btn-ghost shrink-0" onClick={addCustomGenre} disabled={!customGenre.trim()}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-mute">Next: add your notes or treatment</span>
            <button className="btn btn-primary" disabled={!canContinue} onClick={() => setStep(2)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="text-3xl md:text-4xl">Step 2: Add your material</h1>
          <p className="mt-2 text-fg-2">
            Paste anything you have: a treatment, writer notes, a transcript of a voice memo, casting thoughts. The more detail, the better the first draft. PitchGen writes every section of the deck from it.
          </p>

          <div className="card mt-8 space-y-6 p-6 md:p-8">
            <div>
              <label className="label" htmlFor="notes">
                Notes, treatment or transcript
              </label>
              <textarea id="notes" className="field" rows={14} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={"Premise and world...\nWho the lead is and what they want...\nThe engine that generates episodes...\nTone and comparables...\nWho is attached, where it shoots, budget thoughts..."} />
              <p className="hint">{notes.trim().length} characters. A good draft needs a few paragraphs.</p>
            </div>

            <div>
              <label className="label" htmlFor="file">
                Or attach a file
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line px-4 py-4 text-sm hover:border-accent">
                <FileText size={18} className="text-accent" />
                <span className="flex-1">{file ? file.name : `Word (.docx) or PDF treatment${audio ? ", or a voice note (m4a, mp3)" : ""}`}</span>
                <span className="btn btn-ghost py-1 text-xs">Choose</span>
                <input id="file" type="file" className="hidden" accept={`.pdf,.docx,.txt,.md${audio ? ",audio/*,.m4a,.mp3,.wav" : ""}`} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              {!audio && <p className="hint">Voice notes need an OpenAI key in settings. For now, paste the transcript.</p>}
            </div>

            {!aiReady && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">AI drafting is off until an Anthropic key is set. You can still create a blank pitch and fill it in yourself.</p>}
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={busy !== null}>
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-ghost" onClick={blank} disabled={!canSave || busy !== null}>
                {busy === "blank" ? <Loader2 size={16} className="animate-spin" /> : null} Skip, start blank
              </button>
              <button className="btn btn-primary" onClick={generate} disabled={!aiReady || !hasMaterial || busy !== null}>
                {busy === "generate" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {busy === "generate" ? "Drafting your deck, 30 to 60 seconds" : "Draft the deck"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-right text-sm text-mute">Next: refine each section in the editor</p>
        </section>
      )}
    </div>
  );
}

// Tiny wireframes so the choice is visual, not a label.
export function LayoutThumb({ id }: { id: "cinematic" | "editorial" | "onepager" | "lookbook" | "treatment" }) {
  const c = "fill-accent-strong";
  const m = "fill-surface-2";
  return (
    <svg viewBox="0 0 120 72" className="h-auto w-full rounded-md border border-line bg-bg">
      {id === "cinematic" && (
        <>
          <rect x="0" y="0" width="120" height="34" className={c} />
          <rect x="8" y="22" width="50" height="6" fill="#fff" />
          <rect x="8" y="42" width="48" height="4" className={m} />
          <rect x="8" y="50" width="48" height="4" className={m} />
          <rect x="64" y="42" width="48" height="24" className={m} />
        </>
      )}
      {id === "editorial" && (
        <>
          <rect x="8" y="8" width="60" height="8" className={c} />
          <rect x="8" y="22" width="40" height="3" className={m} />
          <rect x="8" y="28" width="44" height="3" className={m} />
          <rect x="8" y="34" width="38" height="3" className={m} />
          <rect x="72" y="8" width="40" height="28" className={m} />
          <rect x="8" y="48" width="104" height="3" className={m} />
          <rect x="8" y="54" width="90" height="3" className={m} />
          <rect x="8" y="60" width="96" height="3" className={m} />
        </>
      )}
      {id === "lookbook" && (
        <>
          <rect x="8" y="8" width="50" height="34" className={c} />
          <rect x="62" y="8" width="50" height="16" className={m} />
          <rect x="62" y="26" width="24" height="16" className={m} />
          <rect x="88" y="26" width="24" height="16" className={m} />
          <rect x="8" y="46" width="24" height="18" className={m} />
          <rect x="34" y="46" width="24" height="18" className={m} />
          <rect x="62" y="46" width="50" height="18" className={m} />
        </>
      )}
      {id === "treatment" && (
        <>
          <rect x="30" y="8" width="60" height="6" className={c} />
          <rect x="24" y="20" width="72" height="3" className={m} />
          <rect x="24" y="26" width="72" height="3" className={m} />
          <rect x="24" y="32" width="60" height="3" className={m} />
          <rect x="24" y="42" width="30" height="4" className={c} />
          <rect x="24" y="50" width="72" height="3" className={m} />
          <rect x="24" y="56" width="72" height="3" className={m} />
          <rect x="24" y="62" width="48" height="3" className={m} />
        </>
      )}
      {id === "onepager" && (
        <>
          <rect x="8" y="8" width="104" height="10" className={m} />
          <rect x="8" y="8" width="24" height="10" className={c} />
          <rect x="8" y="24" width="104" height="40" rx="2" className={m} />
          <rect x="14" y="30" width="40" height="5" className={c} />
          <rect x="14" y="40" width="60" height="3" fill="#fff" />
          <rect x="14" y="46" width="52" height="3" fill="#fff" />
        </>
      )}
    </svg>
  );
}
