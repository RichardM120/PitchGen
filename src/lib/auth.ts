// Shared-password gate. The cookie holds a SHA-256 of password + secret, so
// rotating either env var signs everyone out. Web Crypto only, so it runs in
// the proxy as well as in route handlers.

export const AUTH_COOKIE = "pg_session";
export const VIEWER_COOKIE = "pg_viewer";

export async function expectedToken(): Promise<string | null> {
  const password = process.env.PITCHGEN_PASSWORD;
  const secret = process.env.PITCHGEN_SECRET ?? "pitchgen";
  if (!password) return null;
  const bytes = new TextEncoder().encode(`${password}:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Relative redirects keep the browser on cwcasting.com when PitchGen is
// served through the cwcasting rewrite rather than on its own vercel.app host.
export function relativeRedirect(location: string, status = 303): Response {
  return new Response(null, { status, headers: { Location: location } });
}
