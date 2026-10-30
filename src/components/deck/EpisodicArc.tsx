"use client";

import { useState } from "react";
import type { PitchDeckData } from "@/types/pitch";

export function EpisodicArc({ episodes }: { episodes: PitchDeckData["episodic_arc"] }) {
  const [active, setActive] = useState(0);
  const ep = episodes[active];
  if (!ep) return <p className="text-mute">No episodes outlined yet.</p>;

  return (
    <div className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div role="tablist" className="flex gap-2 overflow-x-auto md:flex-col">
        {episodes.map((e, i) => (
          <button
            key={e.episode_number}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              i === active ? "bg-accent-soft text-accent-strong" : "text-mute hover:bg-surface"
            }`}
          >
            <span className="mr-2 text-xs uppercase tracking-wider">Ep {e.episode_number}</span>
            {e.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="panel p-6 md:p-8">
        <p className="eyebrow">Episode {ep.episode_number}</p>
        <h3 className="mt-2 text-3xl">{ep.title}</h3>
        <p className="mt-4 text-xl font-semibold tracking-tight text-accent-strong">{ep.hook}</p>
        <p className="mt-4 max-w-2xl text-fg-2">{ep.synopsis}</p>
      </div>
    </div>
  );
}
