import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { href } from "@/lib/base";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/95 px-4 py-3 text-sm backdrop-blur md:gap-6 md:px-6">
        <Link href="/studio">
          <PitchGenWordmark size={26} />
        </Link>
        <span className="hidden rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-strong sm:inline">Studio</span>
        <nav className="ml-1 flex items-center gap-4 font-medium text-mute md:ml-4 md:gap-6">
          <Link href="/studio" className="inline-flex items-center gap-1.5 hover:text-fg">
            <LayoutGrid size={16} /> <span className="hidden sm:inline">My pitches</span>
          </Link>
          <Link href="/studio/new" className="inline-flex items-center gap-1.5 hover:text-fg">
            <Plus size={16} /> <span className="hidden sm:inline">Create new</span>
          </Link>
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <form method="post" action={href("/api/logout")}>
            <button className="font-medium text-mute hover:text-fg">Sign out</button>
          </form>
        </span>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 text-xs text-mute md:px-6">
        <span>PitchGen Studio</span>
        <span className="flex items-center gap-4">
          <span className="font-semibold uppercase tracking-wider">Admin</span>
          <Link href="/design-system" className="hover:text-fg">
            Design system
          </Link>
          <Link href="/" className="hover:text-fg">
            View as guest
          </Link>
        </span>
      </footer>
    </div>
  );
}
