// The one place the mount path lives. Today PitchGen is piloted at
// cwcasting.com/pitchgen; when it moves to its own domain set
// NEXT_PUBLIC_BASE_PATH="" in Vercel and redeploy.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/pitchgen";

export function href(path: string): string {
  return `${BASE}${path === "/" ? "" : path}` || "/";
}
