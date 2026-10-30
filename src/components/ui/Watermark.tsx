// Fixed, tiled, non-interactive watermark naming the viewer or recipient.
// Survives screenshots and the print-to-PDF export.
export function Watermark({ text }: { text: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 grid grid-cols-3 content-around overflow-hidden select-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="-rotate-[24deg] whitespace-nowrap text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-fg/[0.06]">
          {text}
        </span>
      ))}
    </div>
  );
}
