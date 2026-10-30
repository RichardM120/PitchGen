import { notFound } from "next/navigation";
import { getPitch } from "@/lib/store";
import { ReviewFlow } from "@/components/studio/ReviewFlow";

export const metadata = { title: "Review" };

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const deck = await getPitch((await params).slug);
  if (!deck) notFound();
  return <ReviewFlow initial={deck} aiReady={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}
