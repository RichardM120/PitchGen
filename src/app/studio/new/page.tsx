import { GenerateForm } from "@/components/studio/GenerateForm";

export const metadata = { title: "New from notes" };

export default function NewPitchPage() {
  const ready = Boolean(process.env.ANTHROPIC_API_KEY);
  const audio = Boolean(process.env.OPENAI_API_KEY);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-8">
      <p className="eyebrow">AI intake</p>
      <h1 className="mt-1 font-display text-4xl italic">New pitch from notes</h1>
      <p className="mt-3 text-sm text-mute">
        Paste a treatment, writer notes or a transcript, or attach a PDF{audio ? " or a voice note" : ""}. PitchGen drafts the
        full deck, saves it, and opens it in the editor for you to refine.
      </p>
      {!ready && (
        <p className="mt-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Generation is off until ANTHROPIC_API_KEY is set in Vercel. You can still create a blank pitch from the slate.
        </p>
      )}
      <GenerateForm disabled={!ready} audio={audio} />
    </main>
  );
}
