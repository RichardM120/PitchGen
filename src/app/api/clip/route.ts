import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPitch, savePitch } from "@/lib/store";

export const maxDuration = 60;

// Receives a frame from the Save to PitchGen extension and adds it to a
// pitch's media library with the page it came from as the credit.
// Admin only (proxy enforces it). Multipart: file, slug, credit, pageUrl.
export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "").replace(/[^a-z0-9-]/g, "");
  const credit = String(form.get("credit") ?? "").slice(0, 200);
  const pageUrl = String(form.get("pageUrl") ?? "").slice(0, 500);
  const file = form.get("file");
  if (!slug || !(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Missing file or pitch." }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Image is over 25MB." }, { status: 413 });

  const deck = await getPitch(slug);
  if (!deck) return NextResponse.json({ error: "Pitch not found." }, { status: 404 });

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const name = (file.name || `clip.${ext}`).replace(/[^a-zA-Z0-9.-]/g, "_");
  const blob = await put(`images/${slug}/${Date.now().toString(36)}-${name}`, file, { access: "public", addRandomSuffix: true, cacheControlMaxAge: 60 * 60 * 24 * 365 });

  const asset = { url: blob.url, kind: "image" as const, name, credit: credit || pageUrl, added_at: new Date().toISOString() };
  await savePitch({ ...deck, media: [asset, ...deck.media] });
  return NextResponse.json({ ok: true, url: blob.url, slug });
}
