// PitchGen brand marks. The mark is a "P" whose bowl is a play button, set in
// a rounded tile with the teal gradient. SVG so it stays crisp at any size.

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
      <rect x="19" y="16" width="8" height="34" rx="2" fill="#eef6f7" />
      <path d="M27 16 L48 27.5 L27 39 Z" fill="#eef6f7" />
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
