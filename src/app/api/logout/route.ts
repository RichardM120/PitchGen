import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, EMAIL_COOKIE, VIEWER_COOKIE, cookieOpts } from "@/lib/auth";
import { href } from "@/lib/base";

export async function POST(req: NextRequest) {
  const res = new NextResponse(null, { status: 303, headers: { Location: href("/login") } });
  const names = [ADMIN_COOKIE, VIEWER_COOKIE, EMAIL_COOKIE, ...req.cookies.getAll().map((c) => c.name).filter((n) => n.startsWith("pg_deck_"))];
  for (const n of names) res.cookies.set(n, "", cookieOpts(0));
  return res;
}
