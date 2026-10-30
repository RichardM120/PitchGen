import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPitch } from "@/lib/store";
import { Editor } from "@/components/studio/Editor";

export default async function EditPitch({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();
  const { welcome } = await searchParams;
  // Public share links use the host the page was served from (cwcasting.com via the rewrite).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const origin = host ? `https://${host.split(",")[0].trim()}` : "";
  return <Editor initial={deck} welcome={welcome === "1"} aiReady={Boolean(process.env.ANTHROPIC_API_KEY)} origin={origin} />;
}
