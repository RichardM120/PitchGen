"use client";

/* eslint-disable @next/next/no-img-element */
import { upload } from "@vercel/blob/client";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useId, useState } from "react";
import { href } from "@/lib/base";

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
    </div>
  );
}

export function Area({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} className="field" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
    </div>
  );
}

// Comma-separated list stored as string[]
export function Tags({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <Text
      label={label}
      value={text}
      hint={hint ?? "Separate with commas"}
      onChange={(t) => {
        setText(t);
        onChange(
          t
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

export function Palette({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const colours = [...value, "", "", "", "", ""].slice(0, 5).map((c) => c || "#0f5563");
  return (
    <div>
      <span className="label">Colour palette (dark to light)</span>
      <div className="flex gap-2">
        {colours.map((c, i) => (
          <label key={i} className="relative h-10 w-full cursor-pointer overflow-hidden rounded-md border border-line" style={{ background: c }}>
            <input
              type="color"
              value={c}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const next = [...colours];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// Upload-or-paste media. Images show a thumbnail; videos show the filename.
export function MediaField({ label, value, onChange, kind = "image", hint }: { label: string; value: string; onChange: (v: string) => void; kind?: "image" | "video"; hint?: string }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const blob = await upload(`${kind}s/${Date.now().toString(36)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`, file, {
        access: "public",
        handleUploadUrl: href("/api/upload"),
      });
      onChange(blob.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="flex flex-col items-start gap-3 sm:flex-row">
        {kind === "image" && value && <img src={value} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />}
        <div className="w-full flex-1">
          <div className="flex gap-2">
            <input id={id} className="field" value={value} placeholder={kind === "image" ? "https://... or upload" : "https://... (Vimeo, Dropbox) or upload"} onChange={(e) => onChange(e.target.value)} />
            <label className="btn btn-ghost cursor-pointer py-1.5">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <input type="file" className="hidden" accept={kind === "image" ? "image/*" : "video/mp4,video/quicktime,video/webm"} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            {value && (
              <button type="button" className="btn btn-ghost py-1.5" onClick={() => onChange("")} title="Clear">
                <X size={14} />
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-mute">{err ?? hint ?? (kind === "image" ? "JPG, PNG or WebP up to 25MB" : "MP4 or MOV up to 500MB, or paste a link")}</p>
        </div>
      </div>
    </div>
  );
}

// Generic repeating-section editor
export function Repeater<T>({
  label,
  items,
  onChange,
  blank,
  title,
  children,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  blank: () => T;
  title: (item: T, i: number) => string;
  children: (item: T, set: (patch: Partial<T>) => void, i: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">{label}</span>
        <button type="button" className="btn btn-ghost py-1" onClick={() => onChange([...items, blank()])}>
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details key={i} className="card group" open={items.length <= 3}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{title(item, i) || `Item ${i + 1}`}</span>
              <span className="flex items-center gap-2 text-mute">
                <button type="button" className="hover:text-danger" title="Remove" onClick={(e) => { e.preventDefault(); onChange(items.filter((_, j) => j !== i)); }}>
                  <Trash2 size={13} />
                </button>
              </span>
            </summary>
            <div className="space-y-4 border-t border-line px-4 py-4">
              {children(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}
            </div>
          </details>
        ))}
        {items.length === 0 && <p className="text-xs text-mute">Nothing yet. Add one above.</p>}
      </div>
    </div>
  );
}
