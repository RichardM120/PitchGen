import type { Metadata } from "next";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { href } from "@/lib/base";

export const metadata: Metadata = { title: "Private access" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; mode?: string; deck?: string }>;
}) {
  const { error, next, mode, deck } = await searchParams;
  const studio = mode === "studio";

  return (
    <main className="glow grain flex min-h-screen items-center justify-center px-4">
      <form method="post" action={href("/api/login")} className="card w-full max-w-sm p-8">
        <PitchGenWordmark size={30} />
        <h1 className="mt-6 font-display text-3xl italic">{studio ? "Producer Studio" : "Private screening"}</h1>
        <p className="mt-2 text-sm text-mute">
          {studio
            ? "Enter the studio passcode to create and edit pitches."
            : "Confidential development material. Every page is watermarked to the viewer."}
        </p>

        <input type="hidden" name="next" value={next ?? "/"} />
        {deck && <input type="hidden" name="deck" value={deck} />}

        {!studio && (
          <>
            <label className="label mt-7" htmlFor="email">
              Your email (for the watermark)
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className="field" />
          </>
        )}

        <label className={`label ${studio ? "mt-7" : "mt-4"}`} htmlFor="password">
          Passcode
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />

        {error && <p className="mt-3 text-sm text-danger">That passcode did not match.</p>}

        <button type="submit" className="btn btn-primary mt-6 w-full justify-center">
          Enter
        </button>
      </form>
    </main>
  );
}
