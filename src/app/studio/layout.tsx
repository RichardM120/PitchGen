import Link from "next/link";
import { LayoutGrid, Palette, Sparkles } from "lucide-react";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { href } from "@/lib/base";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-ink/90 px-4 py-2.5 text-xs backdrop-blur md:gap-6 md:px-5">
        <Link href="/studio">
          <PitchGenWordmark size={22} />
        </Link>
        <span className="hidden rounded-full bg-teal-800 sm:inline px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-200">Studio</span>
        <nav className="ml-1 flex items-center gap-4 text-mute md:ml-4 md:gap-5">
          <Link href="/studio" className="inline-flex items-center gap-1.5 hover:text-paper">
            <LayoutGrid size={16} /> <span className="hidden sm:inline">Slate</span>
          </Link>
          <Link href="/studio/new" className="inline-flex items-center gap-1.5 hover:text-paper">
            <Sparkles size={16} /> <span className="hidden sm:inline">New from notes</span>
          </Link>
          <Link href="/design-system" className="inline-flex items-center gap-1.5 hover:text-paper">
            <Palette size={16} /> <span className="hidden sm:inline">Design system</span>
          </Link>
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <Link href="/" className="hidden text-mute hover:text-paper sm:inline">
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
