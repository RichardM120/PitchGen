# PitchGen Roadmap

Live path: **cwcasting.com/pitchgen** (password protected, noindex).
Product: interactive, watermarked HTML pitch portals for UK drama. PitchGen is its own brand, piloted under the CW Casting domain until it has one of its own.

## How it is built

| Layer | V1 (now) | Phase 2 | Phase 3 |
|---|---|---|---|
| Frontend | Next.js 16 App Router, Tailwind 4, basePath `/pitchgen` | Producer Studio editor | Per-deck branding |
| Hosting | Own Vercel project, rewritten from `cwcasting` project | same | same |
| Data | Vercel Blob JSON, Zod validated (bundled sample as fallback) | Neon Postgres when telemetry lands | multi-tenant |
| Access | Studio, shared and per-deck passcodes; signed cookies; viewer email watermark | Per-recipient links, expiry | SSO for studios |
| AI intake | `/api/generate`: Claude for prose and PDFs, Whisper for audio | Section-level regenerate | Concept stills |
| Video | Upload to Blob or paste a link | Mux upload + HLS | Play-time telemetry |
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

## Phase 2: AI intake and editor (shipped 29 Oct 2026)

- [x] PitchGen design system: blue teal tokens, logo, type, controls (`/design-system`, `design-system/tokens.json`)
- [x] Pitch store on Vercel Blob (`src/lib/store.ts`); swap for Neon later without touching pages
- [x] Producer Studio: slate, create blank, duplicate, delete
- [x] Editor with tabs, live preview, Cmd+S save, JSON power tab
- [x] Media uploads to Vercel Blob: images to 25MB, video to 500MB, or paste a link
- [x] `/api/generate`: notes, PDF treatment or voice note to a validated deck (needs ANTHROPIC_API_KEY; audio needs OPENAI_API_KEY)
- [x] Three access levels: studio passcode, shared viewer passcode, per-deck passcode
- [x] Recipient name per deck for the watermark
- [x] Mount path in one env var (`NEXT_PUBLIC_BASE_PATH`) ready for PitchGen's own domain
- [ ] Set ANTHROPIC_API_KEY in Vercel to switch on generation
- [ ] Mux for HLS streaming and play telemetry (Blob video is progressive download for now)

## Phase 2.1: Light theme and guided flow (30 Oct 2026)

- [x] White, teal, black copy; Sora + Inter; design system v2
- [x] Passcode-only login straight into the Studio
- [x] Studio home: hero panel, demo deck, how-it-works, My pitches
- [x] Demo project with generated stills in `public/demo/the-saltings/` (`tools/make-demo-stills.py`)
- [x] Four-step wizard: Start, Add material, Refine (editor with per-tab guidance and checklist), Preview and publish
- [x] Publish flow: drafts are private; viewers only see published decks

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
