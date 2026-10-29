import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, safeEqual } from "@/lib/auth";

// Everything under /pitchgen is private except the login page and its API.
const PUBLIC_PATHS = ["/login", "/api/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname; // excludes the /pitchgen basePath
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const expected = await expectedToken();
  const cookie = req.cookies.get(AUTH_COOKIE)?.value ?? "";

  if (expected && safeEqual(cookie, expected)) return NextResponse.next();

  // Show the login screen at the requested URL (no redirect), so the browser
  // stays on cwcasting.com when served through the rewrite.
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(path)}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
