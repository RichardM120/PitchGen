import { NewPitchWizard } from "@/components/studio/NewPitchWizard";

export const metadata = { title: "Create new" };

export default function NewPitchPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-12">
      <NewPitchWizard aiReady={Boolean(process.env.ANTHROPIC_API_KEY)} audio={Boolean(process.env.OPENAI_API_KEY)} canSave={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
    </main>
  );
}
