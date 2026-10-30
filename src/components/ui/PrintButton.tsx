"use client";

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 font-medium text-mute hover:text-fg">
      {children}
    </button>
  );
}
