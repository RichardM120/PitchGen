import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { getPitch, listPitches } from "@/lib/pitches";
import { VIEWER_COOKIE } from "@/lib/auth";
import { Watermark } from "@/components/ui/Watermark";
import {
  NAV,
  CastingGrid,
  Episodes,
  HeroCover,
  LocationsBoard,
  PackageFinancials,
  WorldAndEngine,
} from "@/components/deck/Sections";
import { PrintButton } from "@/components/ui/PrintButton";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listPitches().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const deck = getPitch((await params).slug);
  return { title: deck?.hero.title ?? "Pitch" };
}

export default async function DeckPage({ params }: Params) {
  const deck = getPitch((await params).slug);
  if (!deck) notFound();

  const viewer = (await cookies()).get(VIEWER_COOKIE)?.value;
  const mark = `${viewer ? `Viewed by ${viewer}` : deck.security.watermark_recipient ?? "Confidential"} · Confidential`;

  return (
    <div style={{ ["--accent" as string]: deck.world_and_engine.color_palette[3] ?? "#c9b79c" }}>
      <Watermark text={mark} />

      <nav className="no-print sticky top-0 z-30 flex items-center gap-6 overflow-x-auto border-b border-line bg-ink/90 px-5 py-3 text-xs backdrop-blur md:px-12 lg:px-20">
        <Link href="/" className="shrink-0 font-display text-base italic">
          PitchGen
        </Link>
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} className="shrink-0 text-mute hover:text-paper">
            {n.label}
          </a>
        ))}
        <span className="ml-auto shrink-0">
          <PrintButton>
            <Printer size={14} /> PDF
          </PrintButton>
        </span>
      </nav>

      <main>
        <HeroCover deck={deck} />
        <WorldAndEngine deck={deck} />
        <CastingGrid deck={deck} />
        <LocationsBoard deck={deck} />
        <Episodes deck={deck} />
        <PackageFinancials deck={deck} />
      </main>

      <footer className="border-t border-line px-5 py-8 text-xs text-mute md:px-12 lg:px-20">
        {deck.hero.title} · Confidential development material · CW Casting
      </footer>
    </div>
  );
}
