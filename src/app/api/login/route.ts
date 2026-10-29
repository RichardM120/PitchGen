import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, VIEWER_COOKIE, expectedToken, relativeRedirect, safeEqual } from "@/lib/auth";

const BASE = "/pitchgen";
const WEEK = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const email = String(form.get("email") ?? "").trim().slice(0, 120);
  const nextPath = String(form.get("next") ?? "/");
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

  const expected = await expectedToken();
  const secret = process.env.PITCHGEN_SECRET ?? "pitchgen";
  const bytes = new TextEncoder().encode(`${password}:${secret}`);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (!expected || !safeEqual(hash, expected)) {
    return relativeRedirect(`${BASE}/login?error=1&next=${encodeURIComponent(safeNext)}`);
  }

  const res = new NextResponse(null, { status: 303, headers: { Location: `${BASE}${safeNext === "/" ? "" : safeNext}` } });
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: BASE, maxAge: WEEK };
  res.cookies.set(AUTH_COOKIE, expected, opts);
  if (email) res.cookies.set(VIEWER_COOKIE, email, opts);
  return res;
}
