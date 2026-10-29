const LABEL = { draft: "Draft", in_review: "In review", sent: "Sent" } as const;
const TONE = {
  draft: "border-line text-mute",
  in_review: "border-warn/50 text-warn",
  sent: "border-ok/50 text-ok",
} as const;

export function StatusBadge({ status }: { status: keyof typeof LABEL }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${TONE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
