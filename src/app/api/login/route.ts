import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  EMAIL_COOKIE,
  VIEWER_COOKIE,
  adminToken,
  cookieOpts,
  deckCookie,
  deckToken,
  safeEqual,
  viewerToken,
} from "@/lib/auth";
import { BASE, href } from "@/lib/base";
import { getPitch } from "@/lib/store";

// One login form, three outcomes. The passcode is tried against the studio
// passcode, then the shared viewer passcode, then (if a deck is named) that
// deck's own passcode. Highest matching level wins.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const email = String(form.get("email") ?? "").trim().slice(0, 120);
  const deck = String(form.get("deck") ?? "").replace(/[^a-z0-9-]/g, "");
  const next = String(form.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const fail = () =>
    new NextResponse(null, {
      status: 303,
      headers: {
        Location: `${BASE}/login?error=1&next=${encodeURIComponent(safeNext)}${deck ? `&deck=${deck}` : ""}`,
      },
    });

  const admin = process.env.PITCHGEN_ADMIN_PASSWORD ?? "";
  const viewer = process.env.PITCHGEN_PASSWORD ?? "";

  let cookie: { name: string; value: string } | null = null;
  let location = href(safeNext);

  if (admin && safeEqual(password, admin)) {
    cookie = { name: ADMIN_COOKIE, value: await adminToken() };
  } else if (viewer && safeEqual(password, viewer)) {
    cookie = { name: VIEWER_COOKIE, value: await viewerToken() };
    if (safeNext.startsWith("/studio")) location = href("/");
  } else if (deck) {
    const d = await getPitch(deck);
    const code = d?.security.passcode ?? "";
    if (d && code && safeEqual(password, code)) {
      cookie = { name: deckCookie(deck), value: await deckToken(deck) };
      location = href(`/p/${deck}`);
    }
  }

  if (!cookie) return fail();

  const res = new NextResponse(null, { status: 303, headers: { Location: location } });
  res.cookies.set(cookie.name, cookie.value, cookieOpts());
  if (email) res.cookies.set(EMAIL_COOKIE, email, cookieOpts());
  return res;
}
