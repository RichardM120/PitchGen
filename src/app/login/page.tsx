import type { Metadata } from "next";
import { PitchGenWordmark } from "@/components/brand/Logo";
import { href } from "@/lib/base";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; mode?: string; deck?: string }>;
}) {
  const { error, next, mode, deck } = await searchParams;
  const studio = mode === "studio" || !deck;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form method="post" action={href("/api/login")} className="card w-full max-w-md p-8 shadow-sm md:p-10">
        <PitchGenWordmark size={34} />
        <h1 className="mt-8 text-3xl">{deck ? "Private screening" : "Welcome back"}</h1>
        <p className="mt-2 text-mute">
          {deck
            ? "This pitch is confidential. Enter the passcode you were sent."
            : "Enter your passcode to open the Studio and build pitches."}
        </p>

        <input type="hidden" name="next" value={next ?? "/"} />
        {deck && <input type="hidden" name="deck" value={deck} />}

        <label className="label mt-8" htmlFor="password">
          Passcode
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus className="field text-lg" />

        {error && <p className="mt-3 text-sm font-medium text-danger">That passcode did not match. Try again.</p>}

        <button type="submit" className="btn btn-primary mt-6 w-full text-base">
          {studio ? "Open Studio" : "View pitch"}
        </button>

        <p className="mt-6 text-xs text-mute">Private, invitation-only. Pages are marked confidential and are not indexed.</p>
      </form>
    </main>
  );
}
