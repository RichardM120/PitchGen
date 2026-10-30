"use client";

import { useState } from "react";
import type { PitchDeckData } from "@/types/pitch";
import { Media, ratioOf } from "@/components/ui/Media";
import { VideoButton } from "@/components/ui/VideoModal";
import { EpisodicArc } from "./EpisodicArc";

const ALL_TABS = ["Concept", "World", "Casting", "Locations", "Episodes", "Package"] as const;
const HIDE_KEY: Record<string, string> = { World: "World", Casting: "Casting", Locations: "Production", Episodes: "Episodes", Package: "Team" };

// One-pager: everything within one screen, tabbed. Fast to read on a phone.
export function OnePagerLayout({ deck }: { deck: PitchDeckData }) {
  const hide = new Set<string>(deck.hidden_sections);
  const TABS = ALL_TABS.filter((t) => !HIDE_KEY[t] || !hide.has(HIDE_KEY[t]) || (t === "Package" && !hide.has("Production")));
  const [tab, setTab] = useState<(typeof ALL_TABS)[number]>("Concept");
  const { hero: h, world_and_engine: w, production: pr } = deck;
  const pal = w.color_palette;

  return (
    <div className="bg-bg text-fg">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">
        <header className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <p className="eyebrow">{h.format}</p>
            <h1 className="mt-2 text-4xl md:text-5xl">{h.title}</h1>
            <p className="mt-3 text-lg text-fg-2">{h.logline}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {h.genre.map((g) => (
                <span key={g} className="rounded-full bg-surface-2 px-3 py-1 font-medium">{g}</span>
              ))}
              <span className="text-mute">{h.comparables}</span>
            </p>
          </div>
          <Media src={h.hero_image_url} alt={h.title} palette={pal} ratio="4 / 3" />
        </header>

        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t ? "border-accent-strong text-fg" : "border-transparent text-mute hover:text-fg"}`}>
              {t}
            </button>
          ))}
        </nav>

        <div className="mt-6 min-h-[50vh]" id={tab.toLowerCase()}>
          {tab === "Concept" && (
            <div className="space-y-5">
              <p className="text-lg leading-relaxed text-fg-2">{w.synopsis}</p>
              <VideoButton src={h.sizzle_video_url} label="Sizzle reel" />
            </div>
          )}
          {tab === "World" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-5">
                <div><p className="eyebrow">The engine</p><p className="mt-1 text-fg-2">{w.the_engine}</p></div>
                <div><p className="eyebrow">Why now</p><p className="mt-1 text-fg-2">{w.why_now}</p></div>
                <div className="flex gap-1">{pal.map((c) => <span key={c} className="h-6 w-10 rounded" style={{ background: c }} />)}</div>
              </div>
              <div className="grid gap-3">
                {w.mood_stills.map((s, i) => (
                  <figure key={i}><Media src={s.url} alt={s.caption} palette={pal.slice(i % 3)} ratio={ratioOf(s.aspect_ratio)} label="Still" /><figcaption className="mt-1 text-xs text-mute">{s.caption}</figcaption></figure>
                ))}
              </div>
            </div>
          )}
          {tab === "Casting" && (
            <div className="grid gap-4 md:grid-cols-2">
              {deck.casting.map((c) => (
                <article key={c.character_name} className="rounded-xl bg-surface p-5">
                  <div className="flex items-baseline justify-between"><h3 className="text-xl">{c.character_name}</h3><span className="text-sm text-mute">{c.age_range}</span></div>
                  <p className="font-semibold text-accent-strong">{c.archetype}</p>
                  <p className="mt-2 text-sm text-fg-2">{c.character_bio}</p>
                  <p className="mt-2 text-sm text-fg-2"><span className="font-semibold text-fg">Notes. </span>{c.casting_notes}</p>
                  {c.actor_wishlist.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {c.actor_wishlist.slice(0, 4).map((a) => (
                        <div key={a.name} className="w-16"><Media src={a.headshot_url} alt={a.name} palette={pal.slice(1)} ratio="4 / 5" /><p className="mt-1 text-[11px] font-semibold leading-tight">{a.name}</p></div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3"><VideoButton src={c.audition_or_reel_url} label="Self-tape" /></div>
                </article>
              ))}
            </div>
          )}
          {tab === "Locations" && (
            <div className="grid gap-5 sm:grid-cols-2">
              {pr.locations.map((l, i) => (
                <figure key={l.name}><Media src={l.image_url} alt={l.name} palette={pal.slice(i % 2)} ratio="16 / 9" label="Location" /><figcaption className="mt-2"><p className="font-semibold">{l.name} <span className="text-xs font-normal uppercase tracking-wider text-mute">{l.region}</span></p><p className="text-sm text-fg-2">{l.visual_rationale}</p></figcaption></figure>
              ))}
            </div>
          )}
          {tab === "Episodes" && <EpisodicArc episodes={deck.episodic_arc} />}
          {tab === "Package" && (
            <div className="grid gap-8 md:grid-cols-2">
              <dl className="space-y-4 text-sm">
                {[["Budget band", pr.financials.indicative_budget_band], ["UK tax relief", pr.financials.uk_tax_relief_eligible ? pr.financials.tax_relief_notes : "Not eligible / TBC"], ["Co-production", pr.financials.co_pro_opportunities.join(" · ") || "TBC"], ["Attachments and funding", pr.financials.existing_attachments_or_funding]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-mute">{k}</dt><dd className="mt-1 text-fg-2">{v}</dd></div>
                ))}
              </dl>
              <ul className="space-y-4">
                {deck.team.map((t) => (
                  <li key={t.name} className="flex gap-3"><div className="w-12 shrink-0"><Media src={t.headshot_url} alt={t.name} palette={pal.slice(1)} ratio="1 / 1" /></div><div><p className="font-semibold">{t.name}</p><p className="text-xs uppercase tracking-wider text-mute">{t.role}{t.company ? ` · ${t.company}` : ""}</p><p className="mt-1 text-sm text-fg-2">{t.bio}</p></div></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
