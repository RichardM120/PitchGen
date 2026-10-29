import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine, Printer } from "lucide-react";
import { getPitch } from "@/lib/store";
import { EMAIL_COOKIE, isAdmin, isViewer } from "@/lib/auth";
import { Watermark } from "@/components/ui/Watermark";
import { NAV } from "@/components/deck/Sections";
import { DeckView } from "@/components/deck/DeckView";
import { PrintButton } from "@/components/ui/PrintButton";
import { PitchGenMark } from "@/components/brand/Logo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const deck = await getPitch((await params).slug);
  return { title: deck?.hero.title ?? "Pitch" };
}

export default async function DeckPage({ params }: Params) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();

  const c = await cookies();
  const email = c.get(EMAIL_COOKIE)?.value;
  const admin = await isAdmin(c);
  const viewer = await isViewer(c);
  const who = email || deck.security.watermark_recipient || "Confidential";
  const mark = `${email ? `Viewed by ${who}` : who} · Confidential`;

  return (
    <>
      <Watermark text={mark} />

      <nav className="no-print sticky top-0 z-30 flex items-center gap-6 overflow-x-auto border-b border-line bg-ink/90 px-5 py-3 text-xs backdrop-blur md:px-12 lg:px-20">
        {viewer ? (
          <Link href="/" className="shrink-0" aria-label="PitchGen home">
            <PitchGenMark size={22} />
          </Link>
        ) : (
          <PitchGenMark size={22} />
        )}
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} className="shrink-0 text-mute hover:text-paper">
            {n.label}
          </a>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-4">
          {admin && (
            <Link href={`/studio/${deck.slug}`} className="inline-flex items-center gap-1.5 text-accent hover:text-teal-300">
              <PenLine size={14} /> Edit
            </Link>
          )}
          <PrintButton>
            <Printer size={14} /> PDF
          </PrintButton>
        </span>
      </nav>

      <main>
        <DeckView deck={deck} />
      </main>

      <footer className="flex items-center justify-between border-t border-line px-5 py-8 text-xs text-mute md:px-12 lg:px-20">
        <span>{deck.hero.title} · Confidential development material</span>
        <span className="inline-flex items-center gap-2">
          <PitchGenMark size={16} /> PitchGen
        </span>
      </footer>
    </>
  );
}
