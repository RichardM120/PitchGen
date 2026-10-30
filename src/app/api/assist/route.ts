import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PitchDeckSchema } from "@/types/pitch";

export const maxDuration = 60;

// AI assist inside the editor. Two modes:
//   rewrite: rework one section with an instruction (tighten, punchier...)
//   fill:    draft every empty field from what the rest of the deck says
// Returns a partial deck for the section; the editor shows before/after.

const Body = z.object({
  deck: z.unknown(),
  section: z.enum(["hero", "world_and_engine", "casting", "production", "episodic_arc", "team"]),
  mode: z.enum(["rewrite", "fill"]),
  instruction: z.string().max(400).optional().default(""),
});

const STYLE = {
  tighten: "Cut every unnecessary word. Keep every fact. Shorter sentences.",
  punchier: "Sharper, more confident. Lead with the hook. No hedging.",
  atmospheric: "More texture and mood: place, weather, light, the feel of the world. Still precise.",
  simpler: "Plainer language a busy commissioner can skim. No jargon.",
  expand: "Add depth and specificity where it is thin, without inventing real people or credits.",
} as const;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { deck, section, mode, instruction } = parsed.data;
  const current = PitchDeckSchema.safeParse(deck);
  if (!current.success) return NextResponse.json({ error: "Deck does not validate; save fixes first." }, { status: 400 });

  const d = current.data;
  const target = d[section];
  const style = (STYLE as Record<string, string>)[instruction] ?? instruction;

  const prompt = `You are a senior UK TV and film development executive and script editor.
You are editing ONE section of a pitch deck. Return ONLY the JSON for that section, same shape and keys as the current value, nothing else, no code fences.

Rules: UK English. No em dashes. No marketing filler. Never invent real actor or crew names; use "Wishlist (TBC)" placeholders. Keep media URLs exactly as they are. Keep array lengths unless the task says otherwise.

Section: "${section}"
Task: ${mode === "fill" ? 'Fill in every empty string or empty array in this section using the rest of the deck for context. Leave non-empty values exactly as they are, except media URLs which always stay as they are.' : `Rewrite the prose in this section. Style: ${style || "tighter and more confident"}. Keep facts, names and structure.`}

Current section value:
${JSON.stringify(target, null, 2)}

The rest of the deck, for context:
${JSON.stringify({ ...d, [section]: undefined }, null, 2).slice(0, 12000)}`;

  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
  const res = await client.messages.create({ model, max_tokens: 4000, messages: [{ role: "user", content: prompt }] });
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    const candidate = { ...d, [section]: JSON.parse(json) };
    const ok = PitchDeckSchema.safeParse(candidate);
    if (!ok.success) return NextResponse.json({ error: "The suggestion did not validate. Try again." }, { status: 422 });
    return NextResponse.json({ section, value: ok.data[section] });
  } catch {
    return NextResponse.json({ error: "The model returned something that was not JSON. Try again." }, { status: 422 });
  }
}
