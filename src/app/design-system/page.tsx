import Link from "next/link";
import { PitchGenMark, PitchGenWordmark } from "@/components/brand/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import tokens from "../../../design-system/tokens.json";

export const metadata = { title: "Design system" };

const teal = Object.entries(tokens.colour.teal);
const semantic = Object.entries(tokens.colour.semantic);

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <p className="eyebrow">Design system v{tokens.version}</p>
      <h1 className="mt-1 text-5xl">PitchGen</h1>
      <p className="mt-3 max-w-2xl text-fg-2">
        White, teal and black copy. Sora for headings, Inter for everything else. Tokens live in{" "}
        <code className="rounded bg-surface px-1">design-system/tokens.json</code> and <code className="rounded bg-surface px-1">src/app/globals.css</code>.
        <Link href="/studio" className="ml-2 font-semibold text-accent-strong">
          Back to Studio
        </Link>
      </p>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-10">
          <PitchGenMark size={96} />
          <PitchGenWordmark size={44} />
          <div className="rounded-xl bg-fg p-4 text-white" style={{ ["--gap" as string]: "#0b1215" }}>
            <PitchGenWordmark size={28} />
          </div>
          <div className="rounded-xl bg-accent-strong p-4 text-white" style={{ ["--gap" as string]: "#0f5563" }}>
            <PitchGenMark size={40} />
          </div>
        </div>
        <p className="hint mt-4">{tokens.logo.mark}. Ink on light, white on dark or teal. Minimum size 16px.</p>
      </Section>

      <Section title="Teal scale">
        <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
          {teal.map(([k, v]) => (
            <div key={k}>
              <div className="h-14 rounded-lg border border-line" style={{ background: v }} />
              <p className="mt-1 text-xs">
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
              <div className="h-12 rounded-lg border border-line" style={{ background: `var(--${k})` }} />
              <p className="mt-1 text-xs">
                {k}
                <span className="block text-mute">{v}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="hint mt-3">
          Contrast on white: fg {tokens.colour.contrast["fg on bg"]}, fg-2 {tokens.colour.contrast["fg-2 on bg"]}, mute {tokens.colour.contrast["mute on bg"]}, accent {tokens.colour.contrast["accent on bg"]}. All pass AA for body text.
        </p>
      </Section>

      <Section title="Type">
        <p className="text-6xl leading-none">Sora Bold</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-accent-strong">Semibold for hooks, loglines and section intros.</p>
        <p className="mt-6 max-w-xl text-fg-2">Inter 400 at 16px for body copy, 1.55 line height. Inter 600 for labels and buttons. Black copy on white, fg-2 for secondary.</p>
        <p className="eyebrow mt-4">Eyebrow label, 0.72rem, 0.14em tracking, teal</p>
      </Section>

      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-soft">Soft</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
          <StatusBadge status="draft" />
          <StatusBadge status="in_review" />
          <StatusBadge status="published" />
          <StatusBadge status="published" demo />
          <span className="step-dot">1</span>
          <span className="step-dot muted">2</span>
        </div>
        <div className="mt-5 grid max-w-lg gap-4">
          <div>
            <label className="label">Text field</label>
            <input className="field" placeholder="Placeholder" defaultValue="" />
            <p className="hint">Helper text sits under the field.</p>
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
            <p className="mt-2">White, line border, 12px radius.</p>
          </div>
          <div className="panel p-4 text-sm">
            <span className="eyebrow">Panel</span>
            <p className="mt-2">Surface tint for hero panels and casting cards.</p>
          </div>
          <div className="rounded-xl bg-accent-soft p-4 text-sm">
            <span className="eyebrow">Accent soft</span>
            <p className="mt-2">Teal wash for notices, welcome strips and active tabs.</p>
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
