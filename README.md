# PitchGen

Private, password-protected HTML pitch portals for TV and film, served at
**cwcasting.com/pitchgen**. Part of CW Casting.

## Run locally

```bash
npm install
cp .env.example .env.local   # set PITCHGEN_PASSWORD
npm run dev                   # http://localhost:3000/pitchgen
```

## Add a pitch

1. Run `prompts/master-extraction-prompt.md` in Claude with your notes, transcript or treatment.
2. Save the JSON as `data/pitches/<slug>.json`.
3. Import it in `src/lib/pitches.ts`. The build fails if it does not match `src/types/pitch.ts`.
4. Push. Vercel deploys; the deck is at `/pitchgen/p/<slug>`.

## Structure

```
data/pitches/          deck JSON (V1 source of truth)
prompts/               AI extraction prompt
src/types/pitch.ts     Zod schema + types
src/lib/               pitch loader, auth helpers
src/proxy.ts           password gate for every route
src/app/               dashboard, /login, /p/[slug], /api/login, /api/logout
src/components/deck/   deck sections
src/components/ui/     media, video modal, watermark
```

See [ROADMAP.md](ROADMAP.md) for the build plan.

## Producer Studio (Phase 2)

- `/studio` with the studio passcode: create, duplicate, delete and edit pitches.
- `/studio/new`: paste notes or attach a PDF or voice note; the deck is drafted and saved.
- Editor: tabs on the left, live deck on the right, Cmd+S to save. Images and video upload straight to Vercel Blob.
- Access tab: set a deck-only passcode and a recipient name for the watermark.
- `/design-system`: tokens, logo, type and controls.
