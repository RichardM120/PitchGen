export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Copy, Eye, FolderOpen, PenLine, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { listPitches } from "@/lib/store";
import { Media } from "@/components/ui/Media";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { deletePitchAction, duplicatePitchAction } from "./actions";

export const metadata = { title: "Studio" };

const STEPS = [
  { n: 1, t: "Start", d: "Give the pitch a title and format." },
  { n: 2, t: "Add material", d: "Paste notes or a treatment. PitchGen drafts the deck." },
  { n: 3, t: "Refine", d: "Edit each section with the live preview beside you." },
  { n: 4, t: "Preview and publish", d: "Check the finished deck, then publish and share the link." },
];

export default async function StudioHome() {
  const all = await listPitches();
  const mine = all.filter((d) => !d.is_demo);
  const demo = all.find((d) => d.is_demo);
  const canSave = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
      {/* Hero panel */}
      <section className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="panel flex flex-col justify-between p-7 md:p-9">
          <div>
            <p className="eyebrow">Producer Studio</p>
            <h1 className="mt-2 text-4xl md:text-5xl">Build a pitch commissioners can walk through.</h1>
            <p className="mt-4 max-w-xl text-lg text-fg-2">
              Turn notes, a treatment or a voice memo into a private, watermarked pitch site. Four steps, about 20 minutes.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio/new" className="btn btn-primary text-base">
              <Plus size={16} /> Start a new pitch
            </Link>
            {mine.length > 0 && (
              <a href="#mine" className="btn btn-ghost text-base">
                <FolderOpen size={16} /> Open existing ({mine.length})
              </a>
            )}
          </div>
        </div>

        {demo && (
          <Link href={`/p/${demo.slug}`} className="group card overflow-hidden">
            <Media src={demo.hero.hero_image_url} alt={demo.hero.title} palette={demo.world_and_engine.color_palette} ratio="16 / 9" className="!rounded-none transition group-hover:opacity-90" />
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">See the finished result</p>
                <StatusBadge status={demo.status} demo />
              </div>
              <h2 className="mt-2 text-2xl">{demo.hero.title}</h2>
              <p className="mt-1 text-fg-2">{demo.hero.format}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 font-semibold text-accent-strong">
                Open the demo deck <ArrowRight size={16} />
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* How it works */}
      <section className="mt-10">
        <h2 className="text-xl">How it works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="card p-5">
              <span className="step-dot">{s.n}</span>
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-mute">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {!canSave && (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Saving is off: no storage token in this environment. On the live site this is set automatically.
        </p>
      )}

      {/* My pitches */}
      <section id="mine" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">My pitches</h2>
            <p className="mt-1 text-mute">
              {mine.length === 0 ? "Nothing here yet. Start one above." : `${mine.length} ${mine.length === 1 ? "pitch" : "pitches"}. Drafts are private until you publish.`}
            </p>
          </div>
          <Link href="/studio/new" className="btn btn-soft">
            <Sparkles size={14} /> Create new
          </Link>
        </div>

        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mine.map((d) => (
            <PitchCard key={d.slug} d={d} canSave={canSave} />
          ))}
          {demo && (
            <li className="card overflow-hidden border-dashed">
              <Link href={`/studio/${demo.slug}`}>
                <Media src={demo.hero.hero_image_url} alt={demo.hero.title} palette={demo.world_and_engine.color_palette} ratio="16 / 9" className="!rounded-none" />
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/studio/${demo.slug}`} className="text-xl font-semibold tracking-tight hover:text-accent-strong">
                    {demo.hero.title}
                  </Link>
                  <StatusBadge status={demo.status} demo />
                </div>
                <p className="mt-1 text-sm text-mute">Demo project. Edit it to learn the editor; reset brings it back.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link href={`/studio/${demo.slug}`} className="btn btn-soft py-1.5 text-sm">
                    <PenLine size={14} /> Edit
                  </Link>
                  <Link href={`/p/${demo.slug}`} className="btn btn-ghost py-1.5 text-sm">
                    <Eye size={14} /> View
                  </Link>
                  <form action={duplicatePitchAction}>
                    <input type="hidden" name="slug" value={demo.slug} />
                    <button className="btn btn-ghost py-1.5 text-sm" disabled={!canSave} title="Copy as a starting point">
                      <Copy size={14} /> Copy
                    </button>
                  </form>
                  <form action={deletePitchAction} className="ml-auto">
                    <input type="hidden" name="slug" value={demo.slug} />
                    <button className="btn btn-ghost py-1.5 text-sm" disabled={!canSave} title="Reset demo to the original">
                      <RotateCcw size={14} /> Reset
                    </button>
                  </form>
                </div>
              </div>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}

function PitchCard({ d, canSave }: { d: Awaited<ReturnType<typeof listPitches>>[number]; canSave: boolean }) {
  return (
    <li className="card overflow-hidden">
      <Link href={`/studio/${d.slug}`}>
        <Media src={d.hero.hero_image_url} alt={d.hero.title} palette={d.world_and_engine.color_palette} ratio="16 / 9" className="!rounded-none" />
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/studio/${d.slug}`} className="text-xl font-semibold tracking-tight hover:text-accent-strong">
            {d.hero.title || "Untitled"}
          </Link>
          <StatusBadge status={d.status} />
        </div>
        <p className="mt-1 text-sm text-mute">
          {d.hero.format || "Format to add"}
          {d.updated_at ? ` · saved ${new Date(d.updated_at).toLocaleDateString("en-GB")}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={`/studio/${d.slug}`} className="btn btn-primary py-1.5 text-sm">
            <PenLine size={14} /> Edit
          </Link>
          <Link href={`/p/${d.slug}`} className="btn btn-ghost py-1.5 text-sm">
            <Eye size={14} /> {d.status === "published" ? "View" : "Preview"}
          </Link>
          <form action={duplicatePitchAction}>
            <input type="hidden" name="slug" value={d.slug} />
            <button className="btn btn-ghost py-1.5 text-sm" disabled={!canSave} title="Duplicate">
              <Copy size={14} />
            </button>
          </form>
          <form action={deletePitchAction} className="ml-auto">
            <input type="hidden" name="slug" value={d.slug} />
            <button className="btn btn-danger py-1.5 text-sm" disabled={!canSave} title="Delete">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
