import { NextResponse } from "next/server";
import { listPitches } from "@/lib/store";

// Slate listing for the browser extension. Admin only (proxy enforces it).
export async function GET() {
  const decks = await listPitches();
  return NextResponse.json({
    pitches: decks.map((d) => ({ slug: d.slug, title: d.hero.title || "Untitled", status: d.status, demo: d.is_demo })),
  });
}
