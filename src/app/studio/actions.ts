"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deletePitch, getPitch, newPitchSkeleton, savePitch } from "@/lib/store";

async function requireAdmin() {
  if (!(await isAdmin(await cookies()))) throw new Error("Unauthorised");
}

export type SaveResult = { ok: true; updated_at: string } | { ok: false; errors: string[] };

export async function savePitchAction(data: unknown): Promise<SaveResult> {
  await requireAdmin();
  try {
    const deck = await savePitch(data);
    revalidatePath("/");
    revalidatePath(`/p/${deck.slug}`);
    return { ok: true, updated_at: deck.updated_at! };
  } catch (e) {
    if (e instanceof ZodError) {
      return { ok: false, errors: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
    }
    return { ok: false, errors: [(e as Error).message] };
  }
}

export async function createPitchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "Untitled";
  let slug = slugify(title) || `pitch-${Date.now().toString(36)}`;
  if (await getPitch(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  await savePitch(newPitchSkeleton(title, slug));
  revalidatePath("/");
  redirect(`/studio/${slug}`);
}

export async function duplicatePitchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const from = String(formData.get("slug") ?? "");
  const src = await getPitch(from);
  if (!src) return;
  const slug = `${from}-copy-${Date.now().toString(36).slice(-4)}`;
  await savePitch({ ...src, slug, project_id: `pg-${Date.now().toString(36)}`, status: "draft", hero: { ...src.hero, title: `${src.hero.title} (copy)` } });
  revalidatePath("/");
  redirect(`/studio/${slug}`);
}

export async function deletePitchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deletePitch(String(formData.get("slug") ?? ""));
  revalidatePath("/");
  redirect("/studio");
}
