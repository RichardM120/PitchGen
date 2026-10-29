export const dynamic = "force-dynamic";

import Link from "next/link";
import { Copy, Sparkles, Trash2 } from "lucide-react";
import { listPitches } from "@/lib/store";
import { Media } from "@/components/ui/Media";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createPitchAction, deletePitchAction, duplicatePitchAction } from "./actions";

export const metadata = { title: "Studio" };

export default async function StudioHome() {
  const decks = await listPitches();
  const canSave = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Producer Studio</p>
          <h1 className="mt-1 font-display text-4xl italic">The slate</h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <form action={createPitchAction} className="flex items-center gap-2">
            <input name="title" placeholder="New pitch title" className="field w-full sm:w-56" required />
            <button className="btn btn-ghost shrink-0" disabled={!canSave}>
              Create blank
            </button>
          </form>
          <Link href="/studio/new" className="btn btn-primary justify-center">
            <Sparkles size={14} /> Generate from notes
          </Link>
        </div>
      </div>

      {!canSave && (
        <p className="mt-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Saving is off: no Blob token in this environment. On Vercel this is set automatically.
        </p>
      )}

      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((d) => (
          <li key={d.slug} className="card overflow-hidden">
            <Link href={`/studio/${d.slug}`}>
              <Media src={d.hero.hero_image_url} alt={d.hero.title} palette={d.world_and_engine.color_palette} ratio="16 / 9" />
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/studio/${d.slug}`} className="font-display text-2xl leading-tight hover:text-accent">
                  {d.hero.title || "Untitled"}
                </Link>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-xs text-mute">
                {d.hero.format || "Format TBC"}
                {d.updated_at ? ` · saved ${new Date(d.updated_at).toLocaleDateString("en-GB")}` : ""}
              </p>
              <p className="mt-2 text-xs text-mute">
                {d.security.passcode ? "Own passcode set" : "Shared passcode only"}
                {d.security.watermark_recipient ? ` · for ${d.security.watermark_recipient}` : ""}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link href={`/studio/${d.slug}`} className="btn btn-primary py-1.5">
                  Edit
                </Link>
                <Link href={`/p/${d.slug}`} className="btn btn-ghost py-1.5">
                  Preview
                </Link>
                <form action={duplicatePitchAction}>
                  <input type="hidden" name="slug" value={d.slug} />
                  <button className="btn btn-ghost py-1.5" title="Duplicate" disabled={!canSave}>
                    <Copy size={13} />
                  </button>
                </form>
                <form action={deletePitchAction} className="ml-auto">
                  <input type="hidden" name="slug" value={d.slug} />
                  <button className="btn btn-danger py-1.5" title="Delete" disabled={!canSave}>
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
