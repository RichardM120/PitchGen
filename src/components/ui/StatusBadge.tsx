const LABEL = { draft: "Draft", in_review: "In review", published: "Published" } as const;
const TONE = {
  draft: "bg-surface-2 text-fg-2",
  in_review: "bg-amber-100 text-amber-900",
  published: "bg-teal-100 text-teal-800",
} as const;

export function StatusBadge({ status, demo }: { status: keyof typeof LABEL; demo?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${demo ? "bg-fg text-white" : TONE[status]}`}>
      {demo ? "Demo" : LABEL[status]}
    </span>
  );
}
