/* eslint-disable @next/next/no-img-element */
// Image with a palette-gradient fallback, so a deck renders cleanly before
// any stills or headshots have been uploaded.
export function Media({
  src,
  alt,
  palette,
  ratio = "2.39 / 1",
  label,
  className = "",
}: {
  src?: string;
  alt: string;
  palette: string[];
  ratio?: string;
  label?: string;
  className?: string;
}) {
  const [a, b, c] = [palette[0], palette[1] ?? palette[0], palette[2] ?? palette[1] ?? palette[0]];
  return (
    <div
      className={`relative overflow-hidden bg-ink-3 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          aria-label={alt}
          role="img"
          className="grain absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${a} 0%, ${b} 55%, ${c} 120%)` }}
        >
          {label && (
            <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.2em] text-paper/50">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ratioOf(r?: string) {
  if (r === "16:9") return "16 / 9";
  if (r === "4:3") return "4 / 3";
  return "2.39 / 1";
}
