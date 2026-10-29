import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, VIEWER_COOKIE } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const res = new NextResponse(null, { status: 303, headers: { Location: "/pitchgen/login" } });
  res.cookies.set(AUTH_COOKIE, "", { path: "/pitchgen", maxAge: 0 });
  res.cookies.set(VIEWER_COOKIE, "", { path: "/pitchgen", maxAge: 0 });
  return res;
}
