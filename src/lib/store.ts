import { del, list, put } from "@vercel/blob";
import { PitchDeckSchema, type PitchDeckData } from "@/types/pitch";
import sample from "../../data/pitches/the-saltings.json";

// Pitch store. Decks live as JSON in Vercel Blob at pitches/<slug>.json.
// The bundled demo deck is always on the slate; a Blob copy with the same slug
// overrides it (so the demo can be edited and reset). Swap this file for a
// database later; the pages only use these functions.

const PREFIX = "pitches/";
const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const seeds: PitchDeckData[] = [PitchDeckSchema.parse(sample)];
export const DEMO_SLUG = seeds[0].slug;

function merge(fromBlob: PitchDeckData[]): PitchDeckData[] {
  const bySlug = new Map(seeds.map((d) => [d.slug, d]));
  for (const d of fromBlob) bySlug.set(d.slug, d);
  return [...bySlug.values()].sort((a, b) => {
    if (a.is_demo !== b.is_demo) return a.is_demo ? 1 : -1;
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
}

async function readBlob(url: string, uploadedAt: Date): Promise<PitchDeckData | null> {
  // The public CDN URL is cached; the uploadedAt stamp busts it after a save.
  const res = await fetch(`${url}?v=${uploadedAt.getTime()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const parsed = PitchDeckSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

export async function listPitches(): Promise<PitchDeckData[]> {
  if (!hasBlob()) return merge([]);
  const { blobs } = await list({ prefix: PREFIX, limit: 500 });
  const decks = (
    await Promise.all(blobs.filter((b) => b.pathname.endsWith(".json")).map((b) => readBlob(b.url, b.uploadedAt)))
  ).filter((d): d is PitchDeckData => d !== null);
  return merge(decks);
}

export async function getPitch(slug: string): Promise<PitchDeckData | undefined> {
  if (!hasBlob()) return seeds.find((d) => d.slug === slug);
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json`, limit: 1 });
  const b = blobs.find((x) => x.pathname === `${PREFIX}${slug}.json`);
  if (!b) return seeds.find((d) => d.slug === slug);
  return (await readBlob(b.url, b.uploadedAt)) ?? undefined;
}

export async function savePitch(data: unknown): Promise<PitchDeckData> {
  const deck = PitchDeckSchema.parse(data);
  deck.updated_at = new Date().toISOString();
  if (!hasBlob()) throw new Error("No BLOB_READ_WRITE_TOKEN; cannot save outside Vercel.");
  await put(`${PREFIX}${deck.slug}.json`, JSON.stringify(deck, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  return deck;
}

// Deleting the demo resets it to the bundled version rather than removing it.
export async function deletePitch(slug: string): Promise<void> {
  if (!hasBlob()) return;
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.json`, limit: 1 });
  await Promise.all(blobs.map((b) => del(b.url)));
}

export function newPitchSkeleton(title: string, slug: string): PitchDeckData {
  return PitchDeckSchema.parse({
    project_id: `pg-${Date.now().toString(36)}`,
    slug,
    status: "draft",
    is_demo: false,
    security: { is_password_protected: true, passcode: "", watermark_recipient: "" },
    hero: { title, format: "", genre: [], comparables: "", logline: "" },
    world_and_engine: {
      synopsis: "",
      the_engine: "",
      why_now: "",
      color_palette: ["#04171c", "#0f5563", "#2fb3c2", "#6fd0da", "#eef6f7"],
      mood_stills: [],
    },
    casting: [],
    production: {
      locations: [],
      financials: {
        indicative_budget_band: "",
        uk_tax_relief_eligible: false,
        tax_relief_notes: "",
        co_pro_opportunities: [],
        existing_attachments_or_funding: "",
      },
    },
    episodic_arc: [],
    team: [],
  });
}
