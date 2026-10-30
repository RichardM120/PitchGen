import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { PitchDeckSchema } from "@/types/pitch";
import { getPitch, savePitch } from "@/lib/store";
import { slugify } from "@/lib/slug";
import { EXTRACTION_PROMPT } from "@/lib/prompt";

export const maxDuration = 120;

// AI intake. Accepts notes (text), a PDF treatment, or an audio voice note,
// returns a validated deck saved to the store. Needs ANTHROPIC_API_KEY;
// audio additionally needs OPENAI_API_KEY (Whisper).
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set in Vercel." }, { status: 503 });
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const layout = String(form.get("layout") ?? "cinematic");
  const file = form.get("file");

  const content: Anthropic.ContentBlockParam[] = [];
  let transcript = "";

  if (file instanceof File && file.size > 0) {
    const buf = Buffer.from(await file.arrayBuffer());
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: buf.toString("base64") } });
    } else if (file.type.startsWith("audio/") || /\.(m4a|mp3|wav|ogg|webm|mp4)$/i.test(file.name)) {
      transcript = await transcribe(file);
    } else if (/\.docx$/i.test(file.name) || file.type.includes("wordprocessingml")) {
      const mammoth = await import("mammoth");
      transcript = (await mammoth.extractRawText({ buffer: buf })).value;
    } else if (/\.doc$/i.test(file.name)) {
      return NextResponse.json({ error: "Old .doc files are not supported. Save it as .docx or PDF and try again." }, { status: 400 });
    } else {
      transcript = buf.toString("utf8");
    }
  }

  const raw = [title && `Working title: ${title}`, notes && `Notes:\n${notes}`, transcript && `Transcript:\n${transcript}`]
    .filter(Boolean)
    .join("\n\n");
  if (!raw && content.length === 0) {
    return NextResponse.json({ error: "Add some notes, a PDF or a voice note." }, { status: 400 });
  }

  const slugBase = slugify(title) || "pitch";
  let slug = slugBase;
  if (await getPitch(slug)) slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;

  content.push({ type: "text", text: `${EXTRACTION_PROMPT}\n\nUse slug "${slug}".\n\nRaw material:\n\n${raw || "(see attached document)"}` });

  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
  const messages: Anthropic.MessageParam[] = [{ role: "user", content }];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.messages.create({ model, max_tokens: 8000, messages });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    try {
      const obj = JSON.parse(json) as { deck?: unknown; notes?: unknown };
      const parsed = PitchDeckSchema.safeParse(obj.deck ?? obj);
      if (parsed.success) {
        const source = file instanceof File && file.size > 0 ? file.name : notes ? "pasted notes" : "notes";
        const extraction = { source, notes: (obj.notes as Record<string, { found: string[]; inferred: string[]; missing: string[]; recommendations?: string[] }>) ?? {}, confirmed: [] };
        const deck = await savePitch({ ...parsed.data, slug, status: "draft", layout, extraction });
        return NextResponse.json({ slug: deck.slug });
      }
      messages.push({ role: "assistant", content: text });
      messages.push({
        role: "user",
        content: `That JSON failed validation. Fix these and return the full corrected JSON only:\n${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")}`,
      });
    } catch {
      messages.push({ role: "assistant", content: text });
      messages.push({ role: "user", content: "That was not valid JSON. Return the full JSON object only, no prose, no code fences." });
    }
  }
  return NextResponse.json({ error: "The model could not produce a valid deck. Try adding more detail to the notes." }, { status: 422 });
}

async function transcribe(file: File): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Voice notes need OPENAI_API_KEY (Whisper). Paste the transcript instead.");
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("model", "whisper-1");
  fd.append("language", "en");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
  return ((await res.json()) as { text: string }).text;
}
