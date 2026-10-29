// Fixed, tiled, non-interactive watermark naming the viewer. Survives
// screenshots and the print-to-PDF export.
export function Watermark({ text }: { text: string }) {
  const tiles = Array.from({ length: 24 });
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 grid grid-cols-3 content-around overflow-hidden select-none"
    >
      {tiles.map((_, i) => (
        <span
          key={i}
          className="-rotate-[24deg] whitespace-nowrap text-center text-[11px] uppercase tracking-[0.3em] text-paper/[0.05] print:text-black/[0.08]"
        >
          {text}
        </span>
      ))}
    </div>
  );
}
