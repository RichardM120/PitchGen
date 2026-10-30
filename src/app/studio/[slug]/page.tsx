import { notFound } from "next/navigation";
import { getPitch } from "@/lib/store";
import { Editor } from "@/components/studio/Editor";

export default async function EditPitch({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();
  const { welcome } = await searchParams;
  return <Editor initial={deck} welcome={welcome === "1"} />;
}
