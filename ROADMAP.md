# PitchGen Roadmap

Live path: **cwcasting.com/pitchgen** (password protected, noindex).
Product: interactive, watermarked HTML pitch portals for UK drama, built by CW Casting.

## How it is built

| Layer | V1 (now) | Phase 2 | Phase 3 |
|---|---|---|---|
| Frontend | Next.js 16 App Router, Tailwind 4, basePath `/pitchgen` | Producer Studio editor | Per-deck branding |
| Hosting | Own Vercel project, rewritten from `cwcasting` project | same | same |
| Data | JSON files in `data/pitches/` validated by Zod | Neon Postgres (same as OpenCasting) | multi-tenant |
| Access | One shared passcode, signed cookie, viewer email watermark | Per-deck passcodes | Per-recipient links, expiry |
| AI intake | Manual: run `prompts/master-extraction-prompt.md` in Claude | `/api/generate`: Whisper or Gemini for audio, Claude for prose | Concept stills (FLUX/Imagen) |
| Video | `<video>` from any URL | Mux upload + HLS | Play-time telemetry |
| Analytics | none | Vercel Analytics | Slide dwell + tape plays to DB |

## Phase 1: V1 private portal (this commit)

- [x] Next.js app scaffold, basePath `/pitchgen`
- [x] Pitch schema (Zod) and sample deck "The Saltings"
- [x] Deck renderer: hero, world and engine, casting, locations, episodes, package
- [x] Casting cards with self-tape modal
- [x] Password gate (proxy.ts) + viewer-email watermark on every page
- [x] Print-to-PDF stylesheet (A4 landscape)
- [x] noindex headers and metadata
- [x] GitHub repo `RichardM120/pitchgen` and push
- [x] Vercel project `pitchgen`, env vars `PITCHGEN_PASSWORD`, `PITCHGEN_SECRET`
- [x] Rewrite in cwcasting repo `vercel.json` (see below)
- [ ] Add first real project (e.g. Sadie on the Farm) as `data/pitches/<slug>.json`

## Phase 2: AI intake and editor (weeks 2 to 3)

- [ ] `/api/generate`: upload voice note / PDF treatment, return validated JSON
- [ ] Producer Studio: form on left, live deck on right, save to Neon
- [ ] Media uploads to Vercel Blob (stills, headshots) and Mux (tapes)
- [ ] Per-deck passcodes and recipient name

## Phase 3: Telemetry and pilots (weeks 3 to 4)

- [ ] Log section views and tape plays per viewer
- [ ] Producer dashboard: who opened what, for how long
- [ ] 3 concierge pilots at £1,500 to £2,500 per deck

## Wiring cwcasting.com/pitchgen

In the cwcasting repo, add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/pitchgen", "destination": "https://pitchgen-richard-9136.vercel.app/pitchgen" },
    { "source": "/pitchgen/:path*", "destination": "https://pitchgen-richard-9136.vercel.app/pitchgen/:path*" }
  ]
}
```

Done: the `pitchgen` project's Deployment Protection is off for production (the app has its own gate), otherwise the rewrite gets Vercel's SSO wall.

## Corrections to the blueprint

- AVEC is **34% gross, about 25.5% net** for film and high-end TV, not "34% net".
- Animation and children's TV: **39% gross, about 29.25% net**.
- UK Independent Film Tax Credit: **53% gross, about 39.75% net**, films with core costs up to £15M.
- Model names in the blueprint (Claude 3.7 Sonnet, Gemini 2.5) are out of date; pick current models at Phase 2.
