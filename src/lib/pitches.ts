import { PitchDeckSchema, type PitchDeckData } from "@/types/pitch";
import saltings from "../../data/pitches/the-saltings.json";

// V1: decks are JSON files committed to the repo. Phase 2 swaps this module
// for a database read without touching any page or component.
const raw: unknown[] = [saltings];

const decks: PitchDeckData[] = raw.map((d) => PitchDeckSchema.parse(d));

export function listPitches(): PitchDeckData[] {
  return decks;
}

export function getPitch(slug: string): PitchDeckData | undefined {
  return decks.find((d) => d.slug === slug);
}
