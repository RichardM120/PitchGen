import { NextRequest, NextResponse } from "next/server";
import { canSeeDeck, isAdmin, isViewer } from "@/lib/auth";

// Access rules. Paths here exclude the basePath.
//   /login, /api/login, /api/logout   public
//   /studio/*, /design-system        admin
//   /p/<slug>                        viewer, admin, or that deck's passcode
//   everything else                  viewer or admin
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const c = req.cookies;

  if (["/login", "/api/login", "/api/logout"].some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  let allowed = false;
  let mode: "viewer" | "studio" = "viewer";
  const deckMatch = path.match(/^\/p\/([a-z0-9-]+)/);

  if (path.startsWith("/studio") || path.startsWith("/design-system") || path.startsWith("/api/")) {
    mode = "studio";
    allowed = await isAdmin(c);
  } else if (deckMatch) {
    allowed = await canSeeDeck(c, deckMatch[1]);
  } else {
    allowed = await isViewer(c);
  }

  if (allowed) return NextResponse.next();
  if (path.startsWith("/api/")) return new NextResponse("Unauthorised", { status: 401 });

  // Show the login screen at the requested URL (no redirect), so the browser
  // stays on the public domain when served through a rewrite.
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(path)}&mode=${mode}${deckMatch ? `&deck=${deckMatch[1]}` : ""}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
