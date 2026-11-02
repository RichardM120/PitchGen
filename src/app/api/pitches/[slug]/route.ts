import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getPitch, savePitch } from "@/lib/store";
import { revalidatePath } from "next/cache";

// Read or replace one deck as JSON. Admin only (proxy enforces it). Used by
// scripts and the extension; the Studio editor uses server actions.
type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const deck = await getPitch(slug);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deck);
}

export async function PUT(req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const deck = await savePitch({ ...body, slug });
    revalidatePath("/");
    revalidatePath(`/p/${slug}`);
    return NextResponse.json({ slug: deck.slug, updated_at: deck.updated_at });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
