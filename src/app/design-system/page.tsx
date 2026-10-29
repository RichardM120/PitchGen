import Link from "next/link";
import { PitchGenMark, PitchGenWordmark } from "@/components/brand/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import tokens from "../../../design-system/tokens.json";

export const metadata = { title: "Design system" };

const teal = Object.entries(tokens.colour.teal).reverse();
const semantic = Object.entries(tokens.colour.semantic);

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <p className="eyebrow">Design system v{tokens.version}</p>
      <h1 className="mt-1 font-display text-5xl italic">PitchGen</h1>
      <p className="mt-3 max-w-2xl text-sm text-mute">
        Blue teal on deep ink. Cinematic serif for the story, a clean grotesque for the interface. Tokens live in{" "}
        <code className="text-paper">design-system/tokens.json</code> and <code className="text-paper">src/app/globals.css</code>.
        <Link href="/studio" className="ml-2 text-accent">
          Back to Studio
        </Link>
      </p>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-10">
          <PitchGenMark size={96} />
          <PitchGenWordmark size={44} />
          <div className="rounded-md bg-paper p-4 text-ink">
            <PitchGenWordmark size={28} />
          </div>
        </div>
        <p className="mt-4 text-xs text-mute">{tokens.logo.mark}. Minimum size 16px. Clear space equals the tile radius. {tokens.logo.alternates}</p>
      </Section>

      <Section title="Teal scale">
        <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
          {teal.map(([k, v]) => (
            <div key={k}>
              <div className="h-14 rounded-md border border-line" style={{ background: v }} />
              <p className="mt-1 text-[11px]">
                {k}
                <span className="block text-mute">{v}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic colours">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {semantic.map(([k, v]) => (
            <div key={k}>
              <div className="h-12 rounded-md border border-line" style={{ background: `var(--${k})` }} />
              <p className="mt-1 text-[11px]">
                {k}
                <span className="block text-mute">{v}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-mute">Contrast: paper on ink {tokens.colour.contrast["paper on ink"]}, accent on ink {tokens.colour.contrast["accent on ink"]}, mute on ink {tokens.colour.contrast["mute on ink"]}.</p>
      </Section>

      <Section title="Type">
        <p className="font-display text-6xl leading-none">Cormorant Garamond</p>
        <p className="mt-2 font-display text-2xl italic text-accent">Italic for loglines, hooks and the studio voice.</p>
        <p className="mt-6 text-lg font-semibold">Montserrat Variable 600 for headings in the interface</p>
        <p className="mt-1 max-w-xl text-sm text-paper/80">Montserrat 400 for body copy at 15px, 1.5 line height. Mute for secondary text.</p>
        <p className="eyebrow mt-4">Eyebrow label, 0.68rem, 0.2em tracking</p>
      </Section>

      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
          <StatusBadge status="draft" />
          <StatusBadge status="in_review" />
          <StatusBadge status="sent" />
        </div>
        <div className="mt-5 grid max-w-lg gap-4">
          <div>
            <label className="label">Text field</label>
            <input className="field" placeholder="Placeholder" defaultValue="" />
          </div>
          <div>
            <label className="label">Textarea</label>
            <textarea className="field" rows={3} defaultValue="Crisp, atmospheric prose." />
          </div>
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-4 text-sm">
            <span className="eyebrow">Card</span>
            <p className="mt-2">ink-2 surface, line border, 10px radius.</p>
          </div>
          <div className="glow card p-4 text-sm">
            <span className="eyebrow">Glow</span>
            <p className="mt-2">Radial teal wash for login and empty states.</p>
          </div>
          <div className="grain card p-4 text-sm">
            <span className="eyebrow">Grain</span>
            <p className="mt-2">Subtle dot texture for image fallbacks.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="eyebrow mb-5">{title}</h2>
      {children}
    </section>
  );
}
