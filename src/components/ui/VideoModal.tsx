"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveMedia } from "./Media";

// Self-tape / sizzle player. Phase 3 swaps the <video> for Mux HLS and logs
// play duration for commissioner telemetry.
export function VideoButton({ src, label }: { src?: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const url = resolveMedia(src);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  if (!url) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-mute">
        <Play size={14} /> {label}: tape to come
      </span>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="no-print btn btn-soft py-2 text-sm">
        <Play size={14} /> {label}
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} className="m-auto w-[min(92vw,1100px)] overflow-hidden rounded-xl bg-black p-0 text-white backdrop:bg-black/80">
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <span className="font-semibold">{label}</span>
          <button onClick={() => setOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {open && <video src={url} controls autoPlay playsInline controlsList="nodownload" className="aspect-video w-full bg-black" />}
      </dialog>
    </>
  );
}
