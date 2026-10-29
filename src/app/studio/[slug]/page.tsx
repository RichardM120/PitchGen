import { notFound } from "next/navigation";
import { getPitch } from "@/lib/store";
import { Editor } from "@/components/studio/Editor";

export default async function EditPitch({ params }: { params: Promise<{ slug: string }> }) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();
  return <Editor initial={deck} />;
}
