import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine, Printer } from "lucide-react";
import { getPitch } from "@/lib/store";
import { EMAIL_COOKIE, isAdmin, isViewer } from "@/lib/auth";
import { Watermark } from "@/components/ui/Watermark";
import { navFor } from "@/components/deck/Sections";
import { DeckView } from "@/components/deck/DeckView";
import { PrintButton } from "@/components/ui/PrintButton";
import { PitchGenMark } from "@/components/brand/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const deck = await getPitch((await params).slug);
  return { title: deck?.hero.title ?? "Pitch" };
}

export default async function DeckPage({ params }: Params) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();

  const c = await cookies();
  const admin = await isAdmin(c);
  const viewer = await isViewer(c);
  // Unpublished decks are only visible from the Studio.
  if (deck.status !== "published" && !admin) notFound();

  const email = c.get(EMAIL_COOKIE)?.value;
  const who = email || deck.security.watermark_recipient || "Confidential";
  const mark = `${who} · Confidential`;

  return (
    <>
      <Watermark text={mark} />

      <nav className="no-print sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-teal-200/70 bg-teal-50/95 px-5 py-3 text-[15px] backdrop-blur md:px-12 lg:px-20">
        {viewer ? (
          <Link href={admin ? "/studio" : "/"} className="shrink-0" aria-label="Back">
            <PitchGenMark size={30} />
          </Link>
        ) : (
          <PitchGenMark size={30} />
        )}
        {navFor(deck).map((n) => (
          <a key={n.id} href={`#${n.id}`} className="nav-link shrink-0">
            {n.label}
          </a>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-4">
          {admin && (
            <>
              <StatusBadge status={deck.status} demo={deck.is_demo} />
              <Link href={`/studio/${deck.slug}`} className="btn btn-soft py-1.5 text-xs">
                <PenLine size={14} /> Edit
              </Link>
            </>
          )}
          <PrintButton>
            <Printer size={14} /> <span className="hidden sm:inline">PDF</span>
          </PrintButton>
        </span>
      </nav>

      {admin && deck.status !== "published" && (
        <div className="no-print border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm font-medium text-amber-900">
          Preview. This pitch is {deck.status === "draft" ? "a draft" : "in review"} and viewers cannot see it yet. Publish it from the Studio when it is ready.
        </div>
      )}

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
