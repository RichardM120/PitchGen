"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PitchDeckData } from "@/types/pitch";
import { Media, resolveMedia } from "@/components/ui/Media";

// Lookbook: a book you turn the pages of. Every page is 16:9, one page on
// screen at a time, arrows or keys to turn. Full-bleed stills with a short
// caption; text pages kept to a line or two. Prints as one page per sheet.

type Page = { id: string; nav: string; node: React.ReactNode };

export function LookbookLayout({ deck }: { deck: PitchDeckData }) {
  const pages = useMemo(() => buildPages(deck), [deck]);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<{ index: number; dir: 1 | -1 } | null>(null);

  const go = useCallback(
    (to: number) => {
      setIndex((cur) => {
        const next = Math.max(0, Math.min(pages.length - 1, to));
        if (next !== cur) setPrev({ index: cur, dir: next > cur ? 1 : -1 });
        return next;
      });
    },
    [pages.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(index - 1); }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(pages.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, pages.length]);

  // The section nav links to #concept, #engine etc. Map those to pages.
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      const i = pages.findIndex((p) => p.nav === id);
      if (i >= 0) go(i);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [go, pages]);

  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setPrev(null), 600);
    return () => clearTimeout(t);
  }, [prev]);

  const page = pages[index];

  return (
    <div className="bg-bg text-fg">
      <div className="book-stage no-print mx-auto flex max-w-[1600px] flex-col items-center px-5 py-6 md:px-12">
        <div className="book-frame relative w-full overflow-hidden rounded-[var(--radius-pg)] bg-fg shadow-xl" style={{ aspectRatio: "16 / 9", maxWidth: "calc((100vh - 190px) * 16 / 9)" }}>
          <div key={page.id} className={`book-page ${prev ? (prev.dir === 1 ? "book-in" : "book-in-back") : ""}`}>
            {page.node}
          </div>
          {prev && (
            <div key={`out-${pages[prev.index].id}`} className={`book-page pointer-events-none ${prev.dir === 1 ? "book-out" : "book-out-back"}`}>
              {pages[prev.index].node}
            </div>
          )}
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="book-turn absolute inset-y-0 left-0 w-[18%] cursor-w-resize disabled:cursor-default"
          />
          <button
            type="button"
            aria-label="Next page"
            onClick={() => go(index + 1)}
            disabled={index === pages.length - 1}
            className="book-turn absolute inset-y-0 right-0 w-[18%] cursor-e-resize disabled:cursor-default"
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between text-sm text-mute">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="btn btn-ghost py-1.5 disabled:opacity-40">
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              Page {index + 1} of {pages.length}
            </span>
            <span className="hidden items-center gap-1 md:flex" aria-hidden>
              {pages.map((p, i) => (
                <button key={p.id} type="button" onClick={() => go(i)} aria-label={`Page ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-accent" : "w-1.5 bg-line hover:bg-mute"}`} />
              ))}
            </span>
            <span className="hidden text-xs md:inline">Arrow keys turn the page</span>
          </div>
          <button type="button" onClick={() => go(index + 1)} disabled={index === pages.length - 1} className="btn btn-ghost py-1.5 disabled:opacity-40">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Print: every page, one per sheet. */}
      <div className="book-print hidden">
        {pages.map((p) => (
          <div key={p.id} className="book-page-print relative overflow-hidden bg-fg" style={{ aspectRatio: "16 / 9" }}>
            {p.node}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Page builders. All pages are laid out for a 16:9 frame; sizes use cqw so
   they scale with the frame, not the window. */

function Full({ src, alt, palette, children, dark = true }: { src?: string; alt: string; palette: string[]; children?: React.ReactNode; dark?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Media src={src} alt={alt} palette={palette} ratio="16 / 9" className="h-full w-full !rounded-none" />
      {dark && <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />}
      <div className="absolute inset-x-0 bottom-0 p-[4cqw] text-white">{children}</div>
    </div>
  );
}

function Paper({ eyebrow, children }: { eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-bg p-[5cqw] text-fg">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="mt-[2cqw] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function buildPages(deck: PitchDeckData): Page[] {
  const { hero: h, world_and_engine: w, production: pr } = deck;
  const pal = w.color_palette;
  const hide = new Set<string>(deck.hidden_sections);
  const stills = w.mood_stills.filter((s) => s.url);
  const pages: Page[] = [];

  pages.push({
    id: "cover",
    nav: "concept",
    node: (
      <Full src={h.hero_image_url} alt={h.title} palette={pal}>
        <p className="text-[1.1cqw] font-bold uppercase tracking-[0.14em] text-teal-200">{h.format} · Lookbook</p>
        <h1 className="mt-[1cqw] text-[8cqw] leading-[0.95]">{h.title}</h1>
      </Full>
    ),
  });

  pages.push({
    id: "logline",
    nav: "concept",
    node: (
      <Paper eyebrow="Logline">
        <p className="max-w-[80%] text-[3.2cqw] font-semibold leading-tight tracking-tight">{h.logline}</p>
        {h.comparables && <p className="mt-auto text-[1.4cqw] text-mute">{h.comparables}</p>}
      </Paper>
    ),
  });

  if (!hide.has("World")) {
    pages.push({
      id: "tone",
      nav: "engine",
      node: (
        <Paper eyebrow="Tone and texture">
          <p className="max-w-[86%] text-[2.4cqw] leading-snug">{w.the_engine || w.synopsis}</p>
          <div className="mt-auto flex gap-[0.6cqw]">
            {pal.map((c) => (
              <span key={c} className="h-[4cqw] w-[9cqw] rounded" style={{ background: c }} />
            ))}
          </div>
        </Paper>
      ),
    });
  }

  stills.forEach((s, i) => {
    pages.push({
      id: `still-${i}`,
      nav: "engine",
      node: (
        <Full src={s.url} alt={s.caption} palette={pal.slice(i % 3)}>
          {s.caption && <p className="max-w-[70%] text-[1.8cqw] leading-snug">{s.caption}</p>}
        </Full>
      ),
    });
  });

  if (!hide.has("World") && w.why_now) {
    pages.push({
      id: "why-now",
      nav: "engine",
      node: (
        <Paper eyebrow="Why now">
          <p className="max-w-[86%] text-[2.2cqw] leading-snug">{w.why_now}</p>
        </Paper>
      ),
    });
  }

  if (!hide.has("Production") && pr.locations.length) {
    pages.push({
      id: "places",
      nav: "locations",
      node: (
        <Paper eyebrow="Places">
          <div className="grid flex-1 grid-cols-2 gap-[1.5cqw]">
            {pr.locations.slice(0, 4).map((l, i) => (
              <figure key={l.name} className="relative overflow-hidden rounded-[var(--radius-pg)]">
                <Media src={l.image_url} alt={l.name} palette={pal.slice(i % 2)} className="h-full w-full !rounded-none" ratio="16 / 9" label="Location" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-[1.5cqw] text-white">
                  <p className="text-[1.6cqw] font-semibold">{l.name}</p>
                  <p className="text-[0.95cqw] uppercase tracking-wider text-white/80">{l.region}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Paper>
      ),
    });
  }

  if (!hide.has("Casting") && deck.casting.length) {
    const faces = deck.casting.flatMap((c) => c.actor_wishlist.slice(0, 1).map((a) => ({ c, a })));
    pages.push({
      id: "faces",
      nav: "casting",
      node: (
        <Paper eyebrow="Faces">
          <div className="grid flex-1 grid-cols-4 gap-[1.2cqw]">
            {faces.slice(0, 8).map(({ c, a }) => (
              <figure key={c.character_name}>
                <Media src={a.headshot_url} alt={a.name} palette={pal.slice(1)} ratio="16 / 9" />
                <figcaption className="mt-[0.6cqw]">
                  <p className="text-[1.3cqw] font-semibold leading-tight">{c.character_name}</p>
                  <p className="text-[0.95cqw] text-mute">{a.name}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Paper>
      ),
    });
  }

  if (!hide.has("Episodes") && deck.episodic_arc.length) {
    pages.push({
      id: "episodes",
      nav: "episodes",
      node: (
        <Paper eyebrow="Episodes">
          <ol className="grid flex-1 grid-cols-2 gap-x-[3cqw] gap-y-[1.2cqw]">
            {deck.episodic_arc.slice(0, 8).map((e) => (
              <li key={e.episode_number} className="border-t border-line pt-[0.8cqw]">
                <p className="text-[0.95cqw] font-bold uppercase tracking-wider text-accent-strong">Episode {e.episode_number}</p>
                <p className="text-[1.5cqw] font-semibold leading-tight">{e.title}</p>
                <p className="mt-[0.3cqw] text-[1.1cqw] leading-snug text-fg-2">{e.hook}</p>
              </li>
            ))}
          </ol>
        </Paper>
      ),
    });
  }

  if (h.sizzle_video_url) {
    pages.push({
      id: "reel",
      nav: "casting",
      node: (
        <div className="absolute inset-0 bg-black">
          <video src={resolveMedia(h.sizzle_video_url)} controls playsInline preload="metadata" controlsList="nodownload" className="h-full w-full object-contain" />
        </div>
      ),
    });
  }

  if (!hide.has("Team")) {
    pages.push({
      id: "package",
      nav: "package",
      node: (
        <Paper eyebrow="The package">
          <div className="grid flex-1 grid-cols-2 gap-[3cqw]">
            <div className="space-y-[1.5cqw]">
              {deck.team.slice(0, 3).map((t) => (
                <div key={t.name}>
                  <p className="text-[1.5cqw] font-semibold">
                    {t.name} <span className="font-normal text-mute">· {t.role}</span>
                  </p>
                  <p className="mt-[0.3cqw] text-[1.05cqw] leading-snug text-fg-2">{t.bio}</p>
                  {t.notable_credits.length > 0 && <p className="mt-[0.3cqw] text-[0.95cqw] text-mute">{t.notable_credits.join(" · ")}</p>}
                </div>
              ))}
            </div>
            <div className="text-[1.1cqw] leading-snug text-fg-2">
              {pr.financials.indicative_budget_band && <p><span className="font-semibold text-fg">Budget:</span> {pr.financials.indicative_budget_band}</p>}
              {pr.financials.tax_relief_notes && <p className="mt-[0.8cqw]"><span className="font-semibold text-fg">UK tax relief:</span> {pr.financials.tax_relief_notes}</p>}
              {pr.financials.existing_attachments_or_funding && <p className="mt-[0.8cqw]"><span className="font-semibold text-fg">Attached:</span> {pr.financials.existing_attachments_or_funding}</p>}
              {pr.financials.co_pro_opportunities.length > 0 && <p className="mt-[0.8cqw]"><span className="font-semibold text-fg">Co-pro:</span> {pr.financials.co_pro_opportunities.join(", ")}</p>}
            </div>
          </div>
          <p className="mt-auto text-[0.95cqw] text-mute">{h.title} · Confidential development material</p>
        </Paper>
      ),
    });
  }

  return pages;
}
