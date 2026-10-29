import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// Issues short-lived client upload tokens so the browser sends media straight
// to Vercel Blob (images up to 25MB, video up to 500MB) without passing
// through a function. The proxy already restricts this route to admins.
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const video = /\.(mp4|mov|m4v|webm)$/i.test(pathname);
        return {
          allowedContentTypes: video
            ? ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"]
            : ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
          maximumSizeInBytes: video ? 500 * 1024 * 1024 : 25 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
