import type { Metadata } from "next";

export const metadata: Metadata = { title: "Private access" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="grain flex min-h-screen items-center justify-center px-4">
      <form
        method="post"
        action="/pitchgen/api/login"
        className="w-full max-w-sm border border-line bg-ink-2 p-8"
      >
        <p className="eyebrow">CW Casting presents</p>
        <h1 className="mt-2 font-display text-4xl italic">PitchGen</h1>
        <p className="mt-3 text-sm text-mute">
          Confidential development material. Access is logged and every page is watermarked
          to the viewer.
        </p>

        <input type="hidden" name="next" value={next ?? "/"} />

        <label className="mt-8 block text-xs text-mute" htmlFor="email">
          Your email (used for the watermark)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full border border-line bg-ink px-3 py-2 text-paper outline-none focus:border-accent"
        />

        <label className="mt-4 block text-xs text-mute" htmlFor="password">
          Passcode
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full border border-line bg-ink px-3 py-2 text-paper outline-none focus:border-accent"
        />

        {error && <p className="mt-3 text-sm text-red-300">That passcode did not match.</p>}

        <button
          type="submit"
          className="mt-6 w-full bg-paper py-2.5 text-sm font-medium tracking-wide text-ink hover:bg-accent"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
