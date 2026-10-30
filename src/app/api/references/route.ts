import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PitchDeckSchema } from "@/types/pitch";

export const maxDuration = 60;

// Reference finder. Reads the deck and writes a visual search list: queries
// to paste into ShotDeck, Flim or Shot Cafe, and reference films with DPs.
const Out = z.object({
  queries: z.array(z.object({ q: z.string(), why: z.string().default("") })).min(6).max(14),
  films: z.array(z.object({ title: z.string(), year: z.string().default(""), dp: z.string().default(""), why: z.string().default("") })).min(3).max(8),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  const deck = PitchDeckSchema.safeParse((await req.json())?.deck);
  if (!deck.success) return NextResponse.json({ error: "Deck does not validate." }, { status: 400 });
  const d = deck.data;

  const prompt = `You are a director of photography and a production designer preparing a lookbook search for a UK TV or film pitch.

From the pitch below, return ONLY JSON, no prose, no code fences:
{
  "queries": [ { "q": "short search phrase", "why": "what it is for in this pitch" } ],   // 8 to 12 items
  "films": [ { "title": "", "year": "", "dp": "cinematographer", "why": "what to take from it" } ]   // 4 to 6 items
}

Queries are for stills databases (ShotDeck, Flim, Shot Cafe). Make them concrete and searchable: light source, time of day, weather, location type, lens feel, colour, framing. Examples of the form: "sodium streetlight wet tarmac night exterior", "harbour dawn fog wide 2.39", "kitchen table argument close-up natural window light". Cover: the world, two or three key characters, the main locations, and the tone of the opening scene. UK English. No em dashes.

Films must be real, with the real cinematographer. Prefer British and European work where it fits, plus one or two wider comps.

Pitch:
Title: ${d.hero.title}
Format: ${d.hero.format}
Genre: ${d.hero.genre.join(", ")}
Comparables: ${d.hero.comparables}
Logline: ${d.hero.logline}
Synopsis: ${d.world_and_engine.synopsis}
Engine: ${d.world_and_engine.the_engine}
Locations: ${d.production.locations.map((l) => `${l.name} (${l.region}): ${l.visual_rationale}`).join("; ")}
Characters: ${d.casting.map((c) => `${c.character_name}, ${c.archetype}`).join("; ")}
Palette: ${d.world_and_engine.color_palette.join(" ")}`;

  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
  const res = await client.messages.create({ model, max_tokens: 2500, messages: [{ role: "user", content: prompt }] });
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const out = Out.safeParse(JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()));
    if (!out.success) return NextResponse.json({ error: "The suggestion did not validate. Try again." }, { status: 422 });
    return NextResponse.json({ ...out.data, generated_at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "The model returned something that was not JSON. Try again." }, { status: 422 });
  }
}
