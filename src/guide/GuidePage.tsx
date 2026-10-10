import { RingGuide } from "./CraftGuidePage";
import { JewelGuide } from "./JewelGuide";

export type GuideTab = "ring" | "jewel";

/** Crafting Guide — Select which guide to view from the left menu. */
export function GuidePage({ tab }: { tab: GuideTab }) {
  return tab === "ring" ? <RingGuide /> : <JewelGuide />;
}
