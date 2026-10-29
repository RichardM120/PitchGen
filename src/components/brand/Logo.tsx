// PitchGen brand marks. The mark is a clapperboard (the slate) held inside
// the corner brackets of a cinema frame, on a teal gradient tile. SVG so it
// stays crisp at any size; design-system/tokens.json has the rationale.

export function PitchGenMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="pg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2fb3c2" />
          <stop offset="1" stopColor="#0f5563" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#pg-grad)" />
      {/* Frame brackets */}
      <path
        d="M12 23 v-7 h7 M45 16 h7 v7 M12 41 v7 h7 M45 48 h7 v-7"
        fill="none"
        stroke="#eef6f7"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Slate board */}
      <rect x="22" y="31" width="20" height="12" rx="2" fill="#eef6f7" />
      {/* Clapper, hinged open */}
      <g transform="rotate(-14 22 31)">
        <rect x="22" y="24.5" width="20" height="6.5" rx="1.5" fill="#eef6f7" />
        <path d="M25 24.5 l3 6.5 M31 24.5 l3 6.5 M37 24.5 l3 6.5" stroke="#0f5563" strokeWidth="2.6" />
      </g>
      {/* Play */}
      <path d="M29 33.5 l6.5 3.5 -6.5 3.5z" fill="#0f5563" />
    </svg>
  );
}

export function PitchGenWordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <PitchGenMark size={size} />
      <span className="font-sans font-semibold tracking-tight" style={{ fontSize: size * 0.72 }}>
        Pitch<span className="text-accent">Gen</span>
      </span>
    </span>
  );
}
