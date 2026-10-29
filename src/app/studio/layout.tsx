import Link from "next/link";
import { LayoutGrid, Palette, Sparkles } from "lucide-react";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { href } from "@/lib/base";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 flex items-center gap-6 border-b border-line bg-ink/90 px-5 py-3 text-xs backdrop-blur">
        <Link href="/studio">
          <PitchGenWordmark size={22} />
        </Link>
        <span className="rounded-full bg-teal-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-200">Studio</span>
        <nav className="ml-4 flex items-center gap-5 text-mute">
          <Link href="/studio" className="inline-flex items-center gap-1.5 hover:text-paper">
            <LayoutGrid size={14} /> Slate
          </Link>
          <Link href="/studio/new" className="inline-flex items-center gap-1.5 hover:text-paper">
            <Sparkles size={14} /> New from notes
          </Link>
          <Link href="/design-system" className="inline-flex items-center gap-1.5 hover:text-paper">
            <Palette size={14} /> Design system
          </Link>
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <Link href="/" className="text-mute hover:text-paper">
            View as guest
          </Link>
          <form method="post" action={href("/api/logout")}>
            <button className="text-mute hover:text-paper">Sign out</button>
          </form>
        </span>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
