import type { PitchDeckData } from "@/types/pitch";
import { CastingGrid, Episodes, HeroCover, LocationsBoard, PackageFinancials, WorldAndEngine } from "./Sections";

// The whole deck, minus chrome. Used by the public deck page and the Studio
// live preview, so both always render identically.
export function DeckView({ deck }: { deck: PitchDeckData }) {
  return (
    <div style={{ ["--accent" as string]: deck.world_and_engine.color_palette[2] ?? "#2fb3c2" }}>
      <HeroCover deck={deck} />
      <WorldAndEngine deck={deck} />
      <CastingGrid deck={deck} />
      <LocationsBoard deck={deck} />
      <Episodes deck={deck} />
      <PackageFinancials deck={deck} />
    </div>
  );
}
