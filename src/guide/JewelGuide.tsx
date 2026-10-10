import { useState } from "react";
import { iconUrl } from "../format";
import { ArrowIcon, EndIcon, RingPanel, type RingState } from "./CraftGuidePage";

const EMERALD_ICON = "https://cdn.poe2db.tw/image/Art/2DItems/Jewels/EmeraldJewel.webp";

const ITEMS = {
  annul: {
    name: "Orb of Annulment",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQW5udWxsT3JiIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/2daba8ccca/AnnullOrb.png",
  },
  chaos: {
    name: "Chaos Orb",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/c0ca392a78/CurrencyRerollRare.png",
  },
  exalt: {
    name: "Exalted Orb",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBZGRNb2RUb1JhcmUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/ad7c366789/CurrencyAddModToRare.png",
  },
  contempt: {
    name: "Potent Distilled Contempt",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGlzdGlsbGVkRW1vdGlvbnMvVW5pcXVlQmVhc3RFbW90aW9uIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/d126680055/UniqueBeastEmotion.png",
  },
  ferocity: {
    name: "Potent Distilled Ferocity",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGlzdGlsbGVkRW1vdGlvbnMvVW5pcXVlQ29uc3RydWN0c0Vtb3Rpb24iLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/c4ddf1e927/UniqueConstructsEmotion.png",
  },
  cranium: {
    name: "Preserved Cranium",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQWJ5c3MvUHJlc2VydmVkQ3Jhbml1bSIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/791fdae503/PreservedCranium.png",
  },
  abyssalEchoes: {
    name: "Omen of Abyssal Echoes",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQWJ5c3NSZXJvbGxPcHRpb25zIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/9690f99016/OmenOnAbyssRerollOptions.png",
  },
  light: {
    name: "Omen of Light",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQW5udWxSZW1vdmVBYnlzc01vZCIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/eb39bcb3d7/OmenOnAnnulRemoveAbyssMod.png",
  },
  dextralAnnul: {
    name: "Dextral Annulment Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvVm9vZG9vT21lbnMzUHVycGxlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/d901658529/VoodooOmens3Purple.png",
  },
  dextralErasure: {
    name: "Dextral Erasure Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvVm9vZG9vT21lbnMzRGFyayIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/6e2bb52963/VoodooOmens3Dark.png",
  },
  divine: {
    name: "Divine Orb",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/2986e220b3/CurrencyModValues.png",
  },
} as const;

type ItemId = keyof typeof ITEMS;
type JewelStepId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type JewelStep = {
  id: JewelStepId;
  title: string;
  body: string[];
  items: ItemId[];
  jewel: RingState;
  note?: string;
  next?: { label: string; to: JewelStepId | "end"; ok: boolean; endText?: string }[];
};

// Option texts and ranges based on poe2db (English) Emerald Jewel modifiers, values are example numbers.
const FRAC_P = "20% increased Damage against Rare and Unique Enemies"; // (10–20)%
const ATTACK_P = "15% increased Attack Damage"; // (5–15)%
const DESECRATED_P = "10% increased Evasion Rating · 8% increased Attack Damage"; // Desecrated (5–10)% · (4–8)%
const CRIT_BONUS_S = "+20% to Critical Strike Damage Bonus with Attacks"; // (10–20)%
const JUNK_S = "15% increased Freeze Buildup with Quarterstaves";
const JUNK_S2 = "15% increased Critical Strike Damage Bonus with Spears";
const CONTEMPT_S = "+1 to Maximum Prefix Modifiers"; // Potent Distilled Contempt (Emerald Suffix)
const FEROCITY_S = "50% increased Prefix Effect"; // Potent Distilled Ferocity (40–60)%

const STEPS: JewelStep[] = [
  {
    id: "1",
    title: "Choose Jewel Base & 3-Modifier Side",
    body: [
      "Choose a jewel base with your desired modifiers and decide whether to place 3 modifiers on prefixes or suffixes.",
      "Example: Emerald · 3 Prefixes.",
    ],
    items: [],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: CRIT_BONUS_S }, { text: FEROCITY_S }],
      note: "Goal — Emerald 3 Prefixes",
    },
  },
  {
    id: "2",
    title: "Prepare Fractured Base for 3-Modifier Side",
    body: ["Craft or buy a base fractured with your desired modifier on the side meant for 3 mods (prefixes in this example)."],
    items: [],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: "8% increased Elemental Damage", hint: "Junk mod" }],
      suffixes: [{ text: JUNK_S, hint: "Junk mod" }, { text: JUNK_S2, hint: "Junk mod" }],
      note: "Fractured Base",
    },
  },
  {
    id: "3",
    title: "Annul & Chaos for Second Desired Prefix",
    body: [
      "Use Orbs of Annulment to leave only the fractured mod and 1 other mod.",
      "Use Chaos Orbs until another desired prefix mod lands — 2 prefixes completed (1 fractured).",
    ],
    items: ["annul", "chaos"],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P, kind: "new" }],
      suffixes: [{ text: JUNK_S, hint: "Kept mod" }, null],
      note: "2 Prefixes Completed (1 Fractured)",
    },
  },
  {
    id: "4",
    title: "Apply 2 Exalted Orbs + Potent Distilled Contempt",
    body: [
      "Apply 2 Exalted Orbs to reach 4 total modifiers.",
      "Apply Potent Distilled Contempt to add '+1 to Maximum Prefix Modifiers' on suffixes — removes 1 random mod (66% success rate).",
    ],
    items: ["exalt", "contempt"],
    note: "If a prefix modifier gets removed (33% chance), it fails — return to step 3.",
    next: [
      { label: "If Suffix Removed (66%)", to: "5", ok: true },
      { label: "If Prefix Removed (33%)", to: "3", ok: false },
    ],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, null],
      suffixes: [{ text: JUNK_S }, { text: CONTEMPT_S, kind: "new" }],
      note: "Allows 3 Prefix Slots",
    },
  },
  {
    id: "5",
    title: "Desecrate with Preserved Cranium — Roll Desired Mod",
    body: [
      "Desecrate using Preserved Cranium to roll your desired prefix modifier.",
      "Keep Omen of Abyssal Echoes and Omen of Light prepared in advance.",
    ],
    items: ["cranium", "abyssalEchoes", "light", "annul"],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: JUNK_S }, { text: CONTEMPT_S }],
      note: "3 Prefixes Completed",
    },
  },
  {
    id: "6",
    title: "Remove +1 Prefix Modifier Suffix",
    body: [
      "To remove '+1 to Maximum Prefix Modifiers', use Dextral Annulment Omen + Orb of Annulment.",
      "If it fails, use Dextral Erasure Omen + Chaos Orb.",
    ],
    items: ["dextralAnnul", "annul", "dextralErasure", "chaos"],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: JUNK_S }, null],
      note: "Keeps 3 Prefixes · 1 Empty Suffix Slot",
    },
  },
  {
    id: "7",
    title: "Fill 2 Suffixes & Chaos for Desired Suffix",
    body: [
      "Fill suffixes to 2 slots and roll Chaos Orbs until 1 desired suffix lands.",
      "Using Chaos Orbs only rerolls suffixes at this point, so it is safe to spam.",
    ],
    items: ["exalt", "chaos"],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: CRIT_BONUS_S, kind: "new" }, { text: JUNK_S2, hint: "Junk mod" }],
      note: "1 Desired Suffix Secured",
    },
  },
  {
    id: "8",
    title: "Potent Distilled Ferocity — 40~60% Increased Prefix Effect",
    body: ["Apply Potent Distilled Ferocity to add '(40–60)% increased Prefix Effect' to suffixes."],
    items: ["ferocity"],
    note: "If the desired suffix gets removed (50% chance), it fails — return to step 7.",
    next: [
      { label: "If Junk Mod Removed (50%)", to: "9", ok: true },
      { label: "If Desired Suffix Removed (50%)", to: "7", ok: false },
    ],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: CRIT_BONUS_S }, { text: FEROCITY_S, kind: "new" }],
      note: "Suffixes Completed",
    },
  },
  {
    id: "9",
    title: "Divine Values & Apply Catalyst/Quality",
    body: ["Once suffixes are complete, use Divine Orbs to refine numbers. Finalize with quality when values are optimal."],
    items: ["divine"],
    next: [{ label: "When Optimal", to: "end", ok: true, endText: "Complete" }],
    jewel: {
      prefixes: [{ text: FRAC_P, kind: "fractured" }, { text: ATTACK_P }, { text: DESECRATED_P, kind: "desecrated" }],
      suffixes: [{ text: CRIT_BONUS_S }, { text: FEROCITY_S }],
      note: "Complete — 5-Modifier Jewel",
    },
  },
];

const WANTED = {
  prefixes: [
    { text: "(10–20)% increased Damage against Rare and Unique Enemies", tag: "Fractured Candidate" },
    { text: "(6–16)% increased Damage with Quarterstaves", tag: "Fractured Candidate" },
    { text: "20% increased maximum Energy Shield", tag: "Fractured Candidate" },
    { text: "(5–15)% increased Attack Damage" },
    { text: "(5–15)% increased Elemental Damage" },
    { text: "(10–20)% increased Evasion Rating" },
    { text: "(5–10)% increased Evasion Rating · (4–8)% increased Attack Damage", tag: "Desecrated" },
    { text: "(5–10)% increased maximum Energy Shield · (4–8)% increased Attack Damage", tag: "Desecrated" },
  ],
  suffixes: [{ text: "+(10–20)% to Critical Strike Damage Bonus with Attacks" }, { text: "(6–16)% increased Attack Critical Strike Chance" }],
};

function stepLabel(id: JewelStepId) {
  return `Step ${id}`;
}

export function JewelGuide() {
  const [flash, setFlash] = useState<JewelStepId | null>(null);

  const goStep = (id: JewelStepId) => {
    document.getElementById(`jewel-step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFlash(id);
    window.setTimeout(() => setFlash((cur) => (cur === id ? null : cur)), 1600);
  };

  return (
    <div className="page guide-page">
      <header className="hero">
        <div>
          <p className="eyebrow">Path of Exile 2 · Crafting Guide</p>
          <h1>Crafting a 5-Modifier Jewel</h1>
          <p className="lede">
            Crafting sequence for a 5-modifier jewel with 3 prefixes + 2 suffixes. Example shown for <strong>Emerald · 3 Prefixes</strong>.
          </p>
        </div>
      </header>

      <p className="guide-legend">
        Modifiers and values on the jewel examples are for <strong>demonstration purposes</strong>. Actual modifiers and ranges may vary.
      </p>

      <section className="guide-search">
        <h2 className="guide-search-title">
          <img src={EMERALD_ICON} alt="" width={36} height={36} />
          Desired Modifier List — Emerald
        </h2>
        <div className="jewel-wanted">
          <div>
            <p className="ring-group">Prefixes</p>
            <ul>
              {WANTED.prefixes.map((m) => (
                <li key={m.text}>
                  {m.tag && <span className={`jewel-wanted-tag${m.tag === "Desecrated" ? " desecrated" : ""}`}>{m.tag}</span>}
                  {m.text}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ring-group">Suffixes</p>
            <ul>
              {WANTED.suffixes.map((m) => (
                <li key={m.text}>{m.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <h2 className="guide-section-title">Crafting Steps</h2>
      <ol className="guide-steps">
        {STEPS.map((step, index) => {
          const following = STEPS[index + 1];
          const next = step.next ?? (following ? [{ label: "Next Step", to: following.id, ok: true }] : undefined);
          return (
            <li
              key={step.id}
              id={`jewel-step-${step.id}`}
              className={`guide-step${flash === step.id ? " flash" : ""}`}
            >
              <span className="guide-step-no">{step.id}</span>
              <RingPanel
                ring={step.jewel}
                stateText={`After Step ${step.id}`}
                itemName="Emerald"
                itemIcon={EMERALD_ICON}
              />
              <div className="guide-step-body">
                <h3>{step.title}</h3>
                <ul>
                  {step.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {step.note && (
                  <p className="guide-key-note">
                    <strong>On Failure</strong> {step.note}
                  </p>
                )}
                {step.items.length > 0 && (
                  <div className="guide-items">
                    {step.items.map((id) => (
                      <span key={id} className="guide-item" title={ITEMS[id].name}>
                        <img src={iconUrl(ITEMS[id].image)} alt="" width={28} height={28} loading="lazy" />
                        {ITEMS[id].name}
                      </span>
                    ))}
                  </div>
                )}
                {next && (
                  <div className="guide-next">
                    {next.map((n) =>
                      n.to === "end" ? (
                        <span key={n.label} className={`guide-go end ${n.ok ? "ok" : "fail"}`}>
                          <span className="guide-go-label">{n.label}</span>
                          <span className="guide-go-dest">{n.endText ?? "End"}</span>
                          <span className="guide-go-icon">
                            <EndIcon ok={n.ok} />
                          </span>
                        </span>
                      ) : (
                        <button
                          key={n.label}
                          type="button"
                          className="guide-go dest-main"
                          onClick={() => goStep(n.to as JewelStepId)}
                          title={`Go to ${stepLabel(n.to as JewelStepId)}`}
                        >
                          <span className="guide-go-label">{n.label}</span>
                          <span className="guide-go-dest">{stepLabel(n.to as JewelStepId)}</span>
                          <span className="guide-go-icon">
                            <ArrowIcon back={!n.ok} />
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
