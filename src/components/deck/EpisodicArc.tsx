"use client";

import { useState } from "react";
import type { PitchDeckData } from "@/types/pitch";

export function EpisodicArc({ episodes }: { episodes: PitchDeckData["episodic_arc"] }) {
  const [active, setActive] = useState(0);
  const ep = episodes[active];
  if (!ep) return null;

  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div role="tablist" className="flex gap-2 overflow-x-auto md:flex-col">
        {episodes.map((e, i) => (
          <button
            key={e.episode_number}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`shrink-0 border-l-2 px-3 py-2 text-left text-sm transition ${
              i === active ? "border-accent text-paper" : "border-line text-mute hover:text-paper"
            }`}
          >
            <span className="eyebrow mr-2">Ep {e.episode_number}</span>
            {e.title}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <p className="eyebrow">Episode {ep.episode_number}</p>
        <h3 className="mt-2 font-display text-4xl">{ep.title}</h3>
        <p className="mt-4 font-display text-2xl italic text-accent">{ep.hook}</p>
        <p className="mt-4 max-w-2xl leading-relaxed text-paper/80">{ep.synopsis}</p>
      </div>
    </div>
  );
}
