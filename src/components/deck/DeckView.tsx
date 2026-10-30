import type { PitchDeckData } from "@/types/pitch";
import { CastingGrid, Episodes, HeroCover, LocationsBoard, PackageFinancials, WorldAndEngine } from "./Sections";
import { EditorialLayout } from "./EditorialLayout";
import { OnePagerLayout } from "./OnePagerLayout";
import { LookbookLayout } from "./LookbookLayout";
import { TreatmentLayout } from "./TreatmentLayout";

// The whole deck, minus chrome, in the layout the deck asks for. Used by the
// public deck page and the Studio live preview, so both render identically.
export function DeckView({ deck }: { deck: PitchDeckData }) {
  if (deck.layout === "editorial") return <EditorialLayout deck={deck} />;
  if (deck.layout === "onepager") return <OnePagerLayout deck={deck} />;
  if (deck.layout === "lookbook") return <LookbookLayout deck={deck} />;
  if (deck.layout === "treatment") return <TreatmentLayout deck={deck} />;
  return (
    <div className="bg-bg text-fg">
      <HeroCover deck={deck} />
      <WorldAndEngine deck={deck} />
      <CastingGrid deck={deck} />
      <LocationsBoard deck={deck} />
      <Episodes deck={deck} />
      <PackageFinancials deck={deck} />
    </div>
  );
}
