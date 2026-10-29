"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Self-tape / sizzle player. Phase 3 replaces the <video> with Mux HLS and
// logs play duration for commissioner telemetry.
export function VideoButton({ src, label }: { src?: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  if (!src) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-mute">
        <Play size={14} /> {label}: tape to come
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
      >
        <Play size={14} /> {label}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(92vw,1100px)] bg-ink p-0 text-paper backdrop:bg-black/85"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="eyebrow">{label}</span>
          <button onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {open && (
          <video src={src} controls autoPlay playsInline controlsList="nodownload" className="aspect-video w-full bg-black" />
        )}
      </dialog>
    </>
  );
}
