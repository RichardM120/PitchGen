import Link from "next/link";
import { Check } from "lucide-react";

export const WIZARD = [
  { n: 1, t: "Start" },
  { n: 2, t: "Add material" },
  { n: 3, t: "Refine" },
  { n: 4, t: "Preview and publish" },
];

// Progress strip shown on every wizard screen so the builder always knows
// where they are and what comes next.
export function Stepper({ current, slug }: { current: number; slug?: string }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {WIZARD.map((s) => {
        const done = s.n < current;
        const active = s.n === current;
        const inner = (
          <>
            <span className={`step-dot ${done || active ? "" : "muted"}`}>{done ? <Check size={14} /> : s.n}</span>
            <span className={active ? "font-semibold text-fg" : done ? "font-medium text-fg-2" : "text-mute"}>{s.t}</span>
          </>
        );
        const to = slug && s.n >= 3 ? (s.n === 3 ? `/studio/${slug}` : `/p/${slug}`) : undefined;
        return (
          <li key={s.n} className="flex items-center gap-2">
            {to && done ? (
              <Link href={to} className="flex items-center gap-2 hover:text-accent-strong">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}
