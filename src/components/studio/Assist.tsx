"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Undo2, X } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { href } from "@/lib/base";

type Section = "hero" | "world_and_engine" | "casting" | "production" | "episodic_arc" | "team";

const STYLES: [string, string][] = [
  ["tighten", "Tighten"],
  ["punchier", "Punchier"],
  ["atmospheric", "More atmospheric"],
  ["simpler", "Simpler"],
  ["expand", "Expand"],
];

// The "AI click": one row of buttons per tab. Rewrite in a style, or fill
// the gaps from the rest of the deck. The result is applied to the editor
// with an Undo, so nothing is lost.
export function Assist({
  deck,
  section,
  onApply,
  enabled,
}: {
  deck: PitchDeckData;
  section: Section;
  onApply: (value: PitchDeckData[Section]) => void;
  enabled: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [undo, setUndo] = useState<PitchDeckData[Section] | null>(null);

  async function run(mode: "rewrite" | "fill", instruction = "") {
    setBusy(mode === "fill" ? "fill" : instruction || "custom");
    setError(null);
    try {
      const res = await fetch(href("/api/assist"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deck, section, mode, instruction }),
      });
      const json = (await res.json()) as { value?: PitchDeckData[Section]; error?: string };
      if (!res.ok || !json.value) throw new Error(json.error ?? `Failed (${res.status})`);
      setUndo(deck[section]);
      onApply(json.value);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!enabled) return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong">
          <Sparkles size={15} /> AI assist
        </span>
        <button type="button" className="btn btn-primary py-1 text-xs" disabled={busy !== null} onClick={() => run("fill")}>
          {busy === "fill" ? <Loader2 size={13} className="animate-spin" /> : null} Fill the gaps
        </button>
        {STYLES.map(([k, l]) => (
          <button key={k} type="button" className="btn btn-ghost py-1 text-xs" disabled={busy !== null} onClick={() => run("rewrite", k)}>
            {busy === k ? <Loader2 size={13} className="animate-spin" /> : null} {l}
          </button>
        ))}
        <button type="button" className="btn btn-ghost py-1 text-xs" disabled={busy !== null} onClick={() => setShowCustom((v) => !v)}>
          Tell it what to do
        </button>
        {undo && (
          <button
            type="button"
            className="btn btn-soft ml-auto py-1 text-xs"
            onClick={() => {
              onApply(undo);
              setUndo(null);
            }}
          >
            <Undo2 size={13} /> Undo
          </button>
        )}
      </div>
      {showCustom && (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) run("rewrite", custom.trim());
          }}
        >
          <input className="field py-1.5 text-sm" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Make the logline a single sentence under 30 words" />
          <button className="btn btn-primary py-1.5 text-xs" disabled={busy !== null || !custom.trim()}>
            {busy === "custom" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Go
          </button>
          <button type="button" className="btn btn-ghost py-1.5 text-xs" onClick={() => setShowCustom(false)}>
            <X size={13} />
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
      <p className="hint">Changes apply straight to the fields. Undo puts them back. Save when you are happy.</p>
    </div>
  );
}
