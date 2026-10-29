"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { href } from "@/lib/base";

export function GenerateForm({ disabled, audio }: { disabled: boolean; audio: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(href("/api/generate"), { method: "POST", body: new FormData(e.currentTarget) });
      const json = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok || !json.slug) throw new Error(json.error ?? `Failed (${res.status})`);
      router.push(`/studio/${json.slug}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 p-6">
      <label className="label" htmlFor="title">
        Working title
      </label>
      <input id="title" name="title" className="field" placeholder="The Saltings" />

      <label className="label mt-5" htmlFor="notes">
        Notes, treatment or transcript
      </label>
      <textarea id="notes" name="notes" className="field" rows={12} placeholder="Everything you have: premise, world, characters, tone, comps, who is attached, where it shoots..." />

      <label className="label mt-5" htmlFor="file">
        Attach a file (optional)
      </label>
      <input
        id="file"
        name="file"
        type="file"
        accept={`.pdf,.txt,.md${audio ? ",audio/*,.m4a,.mp3,.wav" : ""}`}
        className="block w-full text-sm text-mute file:mr-3 file:rounded-full file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-paper"
      />
      <p className="mt-1 text-xs text-mute">PDF treatments are read directly. {audio ? "Voice notes are transcribed first." : "Voice notes need OPENAI_API_KEY; paste the transcript for now."}</p>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button className="btn btn-primary mt-6" disabled={disabled || busy}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {busy ? "Drafting the deck (30 to 60 seconds)" : "Generate deck"}
      </button>
    </form>
  );
}
