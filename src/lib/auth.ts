// Three cookies, all HMAC-signed with PITCHGEN_SECRET so the proxy can verify
// them without a database. Rotating the secret signs everyone out.
//   pg_viewer        shared passcode (PITCHGEN_PASSWORD): all decks + dashboard
//   pg_admin         studio passcode (PITCHGEN_ADMIN_PASSWORD): everything + /studio
//   pg_deck_<slug>   a deck's own passcode: that deck only
// Web Crypto only, so this runs in the proxy as well as route handlers.

import { BASE } from "./base";

export const VIEWER_COOKIE = "pg_viewer";
export const ADMIN_COOKIE = "pg_admin";
export const EMAIL_COOKIE = "pg_email";
export const deckCookie = (slug: string) => `pg_deck_${slug.replace(/[^a-z0-9-]/g, "")}`;

const enc = new TextEncoder();

async function hmac(message: string): Promise<string> {
  const secret = process.env.PITCHGEN_SECRET ?? "dev-secret";
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const viewerToken = () => hmac("viewer");
export const adminToken = () => hmac("admin");
export const deckToken = (slug: string) => hmac(`deck:${slug}`);

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type CookieReader = { get(name: string): { value: string } | undefined };

export async function isAdmin(c: CookieReader): Promise<boolean> {
  const v = c.get(ADMIN_COOKIE)?.value ?? "";
  return v !== "" && safeEqual(v, await adminToken());
}

export async function isViewer(c: CookieReader): Promise<boolean> {
  const v = c.get(VIEWER_COOKIE)?.value ?? "";
  return (v !== "" && safeEqual(v, await viewerToken())) || (await isAdmin(c));
}

export async function canSeeDeck(c: CookieReader, slug: string): Promise<boolean> {
  if (await isViewer(c)) return true;
  const v = c.get(deckCookie(slug))?.value ?? "";
  return v !== "" && safeEqual(v, await deckToken(slug));
}

export const cookieOpts = (maxAge = 60 * 60 * 24 * 7) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: BASE || "/",
  maxAge,
});
