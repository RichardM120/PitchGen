"use client";

/* eslint-disable @next/next/no-img-element */
import { upload } from "@vercel/blob/client";
import { useCallback, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, Film, Loader2, Search, Sparkles, Trash2, Upload } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { href } from "@/lib/base";
import { resolveMedia } from "@/components/ui/Media";

type Deck = PitchDeckData;
type Asset = Deck["media"][number];

const IMG = /\.(jpe?g|png|webp|avif|gif)$/i;
const VID = /\.(mp4|mov|m4v|webm)$/i;

// Every place an image or video can go in the deck, so an asset can be
// assigned with one click rather than copied and pasted.
function slots(d: Deck): { id: string; label: string; kind: "image" | "video"; apply: (d: Deck, url: string) => Deck }[] {
  const out: ReturnType<typeof slots> = [
    { id: "hero", label: "Hero image", kind: "image", apply: (d, url) => ({ ...d, hero: { ...d.hero, hero_image_url: url } }) },
    { id: "sizzle", label: "Sizzle reel", kind: "video", apply: (d, url) => ({ ...d, hero: { ...d.hero, sizzle_video_url: url } }) },
    {
      id: "still-new",
      label: "New mood still",
      kind: "image",
      apply: (d, url) => ({ ...d, world_and_engine: { ...d.world_and_engine, mood_stills: [...d.world_and_engine.mood_stills, { url, caption: "", aspect_ratio: "2.39:1" }] } }),
    },
  ];
  d.world_and_engine.mood_stills.forEach((s, i) =>
    out.push({ id: `still-${i}`, label: `Mood still ${i + 1}${s.caption ? `: ${s.caption.slice(0, 30)}` : ""}`, kind: "image", apply: (d, url) => ({ ...d, world_and_engine: { ...d.world_and_engine, mood_stills: d.world_and_engine.mood_stills.map((x, j) => (j === i ? { ...x, url } : x)) } }) }),
  );
  d.production.locations.forEach((l, i) =>
    out.push({ id: `loc-${i}`, label: `Location: ${l.name || i + 1}`, kind: "image", apply: (d, url) => ({ ...d, production: { ...d.production, locations: d.production.locations.map((x, j) => (j === i ? { ...x, image_url: url } : x)) } }) }),
  );
  d.casting.forEach((c, i) => {
    out.push({ id: `tape-${i}`, label: `Self-tape: ${c.character_name || i + 1}`, kind: "video", apply: (d, url) => ({ ...d, casting: d.casting.map((x, j) => (j === i ? { ...x, audition_or_reel_url: url } : x)) }) });
    c.actor_wishlist.forEach((a, k) =>
      out.push({ id: `head-${i}-${k}`, label: `Headshot: ${a.name} (${c.character_name})`, kind: "image", apply: (d, url) => ({ ...d, casting: d.casting.map((x, j) => (j === i ? { ...x, actor_wishlist: x.actor_wishlist.map((y, m) => (m === k ? { ...y, headshot_url: url } : y)) } : x)) }) }),
    );
  });
  d.team.forEach((t, i) => out.push({ id: `team-${i}`, label: `Team: ${t.name || i + 1}`, kind: "image", apply: (d, url) => ({ ...d, team: d.team.map((x, j) => (j === i ? { ...x, headshot_url: url } : x)) }) }));
  return out;
}

function usedIn(d: Deck, url: string): string[] {
  const hits: string[] = [];
  if (d.hero.hero_image_url === url) hits.push("Hero");
  if (d.hero.sizzle_video_url === url) hits.push("Sizzle");
  d.world_and_engine.mood_stills.forEach((s, i) => s.url === url && hits.push(`Still ${i + 1}`));
  d.production.locations.forEach((l) => l.image_url === url && hits.push(l.name || "Location"));
  d.casting.forEach((c) => {
    if (c.audition_or_reel_url === url) hits.push(`${c.character_name} tape`);
    c.actor_wishlist.forEach((a) => a.headshot_url === url && hits.push(a.name));
  });
  d.team.forEach((t) => t.headshot_url === url && hits.push(t.name));
  return hits;
}

// Third-party sources. Lettermark tiles, not their logos: those are theirs.
const SOURCES = [
  { id: "shotdeck", name: "ShotDeck", mark: "SD", bg: "#111111", url: "https://shotdeck.com/browse/stills", best: "Stills searchable by light, lens, colour, time of day", cost: "Paid, login", kind: "stills" },
  { id: "flim", name: "Flim", mark: "F", bg: "#5b3df5", url: "https://flim.ai", best: "Natural-language search across films, ads and music videos", cost: "Free tier", kind: "stills" },
  { id: "shotcafe", name: "Shot Cafe", mark: "SC", bg: "#c2410c", url: "https://shot.cafe", best: "Free stills with colour palettes", cost: "Free", kind: "stills" },
  { id: "filmgrab", name: "Film-Grab", mark: "FG", bg: "#1d4ed8", url: "https://film-grab.com", best: "Arthouse and classic cinema, by title", cost: "Free", kind: "stills" },
  { id: "moviestills", name: "MovieStillsDB", mark: "MS", bg: "#0f766e", url: "https://www.moviestillsdb.com", best: "Bulk studio frames", cost: "Free", kind: "stills" },
  { id: "filmvibes", name: "Film Vibes", mark: "FV", bg: "#be185d", url: "https://filmvibes.io", best: "Motion clips and GIFs for treatments", cost: "Paid", kind: "motion" },
  { id: "sceneclipper", name: "SceneClipper", mark: "SX", bg: "#4d7c0f", url: "https://sceneclipper.com", best: "Clip TV and film scenes for reels", cost: "Paid", kind: "motion" },
  { id: "playphrase", name: "PlayPhrase", mark: "PP", bg: "#7c3aed", url: "https://www.playphrase.me", best: "Find a line of dialogue across thousands of films", cost: "Free tier", kind: "motion" },
] as const;

export function MediaTab({ deck, onChange, aiReady }: { deck: Deck; onChange: (d: Deck) => void; aiReady: boolean }) {
  const [busy, setBusy] = useState<{ n: number; total: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [finding, setFinding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => IMG.test(f.name) || VID.test(f.name));
      if (list.length === 0) return;
      setErr(null);
      const added: Asset[] = [];
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        setBusy({ n: i + 1, total: list.length });
        try {
          const kind = VID.test(f.name) ? "video" : "image";
          const blob = await upload(`${kind}s/${deck.slug}/${Date.now().toString(36)}-${f.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`, f, { access: "public", handleUploadUrl: href("/api/upload") });
          added.push({ url: blob.url, kind, name: f.name, credit: "", added_at: new Date().toISOString() });
        } catch (e) {
          setErr(`${f.name}: ${(e as Error).message}`);
        }
      }
      setBusy(null);
      if (added.length) onChange({ ...deck, media: [...added, ...deck.media] });
    },
    [deck, onChange],
  );

  async function findReferences() {
    setFinding(true);
    setErr(null);
    try {
      const res = await fetch(href("/api/references"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deck }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
      onChange({ ...deck, references: json });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setFinding(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  }

  const all = slots(deck);
  const refs = deck.references;

  return (
    <div className="space-y-8">
      {/* Upload */}
      <section>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-accent-strong bg-accent-soft" : "border-line hover:border-accent hover:bg-surface"}`}
        >
          {busy ? <Loader2 size={22} className="animate-spin text-accent-strong" /> : <Upload size={22} className="text-accent-strong" />}
          <p className="font-semibold">{busy ? `Uploading ${busy.n} of ${busy.total}` : "Drop stills, headshots or video here"}</p>
          <p className="text-sm text-mute">Or click to choose. Images up to 25MB, video up to 500MB. Several at once is fine.</p>
          <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </div>
        {err && <p className="mt-2 text-sm font-medium text-danger">{err}</p>}
      </section>

      {/* Library */}
      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Library</h3>
          <span className="text-sm text-mute">{deck.media.length} {deck.media.length === 1 ? "file" : "files"}</span>
        </div>
        {deck.media.length === 0 ? (
          <p className="mt-3 rounded-xl bg-surface px-4 py-6 text-center text-sm text-mute">Nothing uploaded yet. Files you add here can be placed anywhere in the deck with one click.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {deck.media.map((a) => {
              const uses = usedIn(deck, a.url);
              return (
                <li key={a.url} className="card overflow-hidden">
                  <div className="relative aspect-video bg-surface-2">
                    {a.kind === "image" ? <img src={resolveMedia(a.url)} alt={a.name} className="h-full w-full object-cover" /> : <video src={resolveMedia(a.url)} className="h-full w-full object-cover" muted />}
                    {a.kind === "video" && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-fg/80 px-2 py-0.5 text-[11px] font-semibold text-white"><Film size={11} /> Video</span>}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-semibold" title={a.name}>{a.name || "Untitled"}</p>
                    <input className="field py-1 text-xs" placeholder="Credit, e.g. Top of the Lake, DP Adam Arkapaw" value={a.credit} onChange={(e) => onChange({ ...deck, media: deck.media.map((x) => (x.url === a.url ? { ...x, credit: e.target.value } : x)) })} />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="field w-auto flex-1 py-1 text-xs"
                        value=""
                        onChange={(e) => {
                          const s = all.find((x) => x.id === e.target.value);
                          if (s) onChange(s.apply(deck, a.url));
                        }}
                      >
                        <option value="">Use as…</option>
                        {all.filter((s) => s.kind === a.kind).map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <a href={resolveMedia(a.url)} download={a.name} target="_blank" rel="noreferrer" className="btn btn-ghost py-1 text-xs" title="Download">
                        <Download size={13} />
                      </a>
                      <button type="button" className="btn btn-danger py-1 text-xs" title="Remove from library" onClick={() => onChange({ ...deck, media: deck.media.filter((x) => x.url !== a.url) })}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-[11px] text-mute">{uses.length ? `Used in: ${uses.join(", ")}` : "Not placed yet"}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Reference finder */}
      <section className="rounded-xl border border-accent/30 bg-accent-soft/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"><Search size={18} className="text-accent-strong" /> Reference finder</h3>
            <p className="text-sm text-fg-2">Writes a search list for the stills databases from what is in this pitch. Paste a query, download the frames you like, drop them above.</p>
          </div>
          <button type="button" className="btn btn-primary" disabled={!aiReady || finding} onClick={findReferences}>
            {finding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {refs.queries.length ? "Refresh list" : "Write the search list"}
          </button>
        </div>
        {!aiReady && <p className="hint">Needs the Anthropic key in settings.</p>}

        <div className="mt-4">
          <p className="eyebrow">Pick a source</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SOURCES.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="card flex items-start gap-3 p-3 no-underline hover:border-accent-strong">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: s.bg }} aria-hidden>
                  {s.mark}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold">{s.name} <ExternalLink size={11} className="text-mute" /></span>
                  <span className="block text-xs text-fg-2">{s.best}</span>
                  <span className="mt-1 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mute">{s.kind} · {s.cost}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="hint">These are third-party services. PitchGen is not affiliated with them and does not supply, license or check any images or clips you take from them. You are responsible for having the rights to anything you put in a pitch.</p>
        </div>

        {refs.queries.length > 0 && (
          <div className="mt-5 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow">Search queries</p>
              <ul className="mt-2 space-y-1.5">
                {refs.queries.map((q) => (
                  <li key={q.q} className="flex items-start gap-2 rounded-lg bg-bg px-3 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{q.q}</p>
                      {q.why && <p className="text-xs text-mute">{q.why}</p>}
                    </div>
                    <button type="button" className="btn btn-ghost shrink-0 py-0.5 text-xs" onClick={() => copy(q.q)}>
                      {copied === q.q ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Reference films</p>
              <ul className="mt-2 space-y-1.5">
                {refs.films.map((f) => (
                  <li key={f.title} className="rounded-lg bg-bg px-3 py-2 text-sm">
                    <p className="font-medium">
                      {f.title}{f.year ? ` (${f.year})` : ""} <span className="font-normal text-mute">{f.dp ? `DP ${f.dp}` : ""}</span>
                    </p>
                    {f.why && <p className="text-xs text-mute">{f.why}</p>}
                    <a href={`https://film-grab.com/?s=${encodeURIComponent(f.title)}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent-strong">
                      Frames on Film-Grab <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-mute">Rights note: frames from other productions are normal in a passcode-protected pitch sent to a commissioner. On a public link they count as publishing someone else&apos;s work, so keep reference-heavy decks behind a passcode. Credit every frame.</p>
    </div>
  );
}
