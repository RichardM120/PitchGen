// PitchGen brand mark: the slate in the frame. A clapperboard held inside the
// corner brackets of a cinema frame, in one colour (currentColor). The clapper
// stripes are cut from the background via --gap (set in globals.css).

export function PitchGenMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={Math.round(size * (40 / 48))} viewBox="8 12 48 40" aria-hidden="true" className={className}>
      <path
        d="M12 23 v-7 h7 M45 16 h7 v7 M12 41 v7 h7 M45 48 h7 v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="22" y="31" width="20" height="12" rx="2" fill="currentColor" />
      <g transform="rotate(-14 22 31)">
        <rect x="22" y="24.5" width="20" height="6.5" rx="1.5" fill="currentColor" />
        <path d="M25 24.5 l3 6.5 M31 24.5 l3 6.5 M37 24.5 l3 6.5" stroke="var(--gap)" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function PitchGenWordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <PitchGenMark size={size} />
      <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.72 }}>
        PitchGen
      </span>
    </span>
  );
}
