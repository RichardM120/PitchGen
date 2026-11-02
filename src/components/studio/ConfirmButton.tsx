"use client";

import { useState } from "react";

// Two-step destructive button for forms: first click asks, second submits.
export function ConfirmButton({
  children,
  question,
  confirmLabel = "Yes, delete",
  className = "btn btn-danger py-1.5 text-sm",
  disabled,
  title,
}: {
  children: React.ReactNode;
  question: string;
  confirmLabel?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className={className} disabled={disabled} title={title} onClick={() => setAsking(true)}>
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-900">
      <span>{question}</span>
      <button type="submit" className="btn btn-danger py-1 text-xs">
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-ghost py-1 text-xs" onClick={() => setAsking(false)}>
        Cancel
      </button>
    </span>
  );
}
