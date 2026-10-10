import { useState } from "react";
import { iconUrl } from "../format";

type ItemId = keyof typeof ITEMS;

const ITEMS = {
  perfectExalt: {
    name: "Perfect Exalted Orb",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBZGRNb2RUb1JhcmUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/ad7c366789/CurrencyAddModToRare.png",
  },
  catalysing: {
    name: "Catalysing Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uRXhhbHRDb25zdW1lUXVhbGl0eSIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/ca4d0db767/OmenOnExaltConsumeQuality.png",
  },
  dextralExalt: {
    name: "Dextral Exalted Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvVm9vZG9vT21lbnMzWWVsbG93Iiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/ed7cf06fa4/VoodooOmens3Yellow.png",
  },
  sinistralCrystal: {
    name: "Sinistral Crystallising Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uUGVyZmVjdEVzc2VuY2VQcmVmaXgiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/75263d6201/OmenOnPerfectEssencePrefix.png",
  },
  sinistralAnnul: {
    name: "Sinistral Annulment Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvVm9vZG9vT21lbnMyUHVycGxlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/b9eaf38592/VoodooOmens2Purple.png",
  },
  annul: {
    name: "Orb of Annulment",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQW5udWxsT3JiIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/2daba8ccca/AnnullOrb.png",
  },
  light: {
    name: "Omen of Light",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQW5udWxSZW1vdmVBYnlzc01vZCIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/eb39bcb3d7/OmenOnAnnulRemoveAbyssMod.png",
  },
  breachEssence: {
    name: "Breach Essence",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXNzZW5jZS9CcmVhY2hFc3NlbmNlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/60e81fa5eb/BreachEssence.png",
  },
  xophCatalyst: {
    name: "Xoph's Catalyst (Fire Resistance)",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaENhdGFseXN0RmlyZSIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/05b1999374/BreachCatalystFire.png",
  },
  tulCatalyst: {
    name: "Tul's Catalyst (Cold Resistance)",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaENhdGFseXN0Q29sZCIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/c3bc9abf43/BreachCatalystCold.png",
  },
  eshCatalyst: {
    name: "Esh's Catalyst (Lightning Resistance)",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaENhdGFseXN0TGlnaHRuaW5nIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/299e62fc33/BreachCatalystLightning.png",
  },
  reaverCatalyst: {
    name: "Reaver Catalyst",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaENhdGFseXN0QXR0YWNrIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/ccc363f502/BreachCatalystAttack.png",
  },
  greaterExalt: {
    name: "Greater Exalted Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvVm9vZG9vT21lbnMxWWVsbG93Iiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/22d9b6478d/VoodooOmens1Yellow.png",
  },
  dextralNecro: {
    name: "Dextral Necromancy Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQWJ5c3NBZGRTdWZmaXhlcyIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/93e1dd20ce/OmenOnAbyssAddSuffixes.png",
  },
  abyssalEchoes: {
    name: "Omen of Abyssal Echoes",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQWJ5c3NSZXJvbGxPcHRpb25zIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/9690f99016/OmenOnAbyssRerollOptions.png",
  },
  sinistralNecro: {
    name: "Sinistral Necromancy Omen",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT21lbnMvT21lbk9uQWJ5c3NBZGRQcmVmaXhlcyIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/1c0a646414/OmenOnAbyssAddPrefixes.png",
  },
  collarbone: {
    name: "Preserved Calicle",
    image: "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQWJ5c3MvUHJlc2VydmVkQ2FsdmljbGUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/6f63f7462d/PreservedCalvicle.png",
  },
} as const;

export type ModKind = "fractured" | "desecrated" | "new" | "gamble";
export type Mod = { text: string; kind?: ModKind; hint?: string } | null;

export type RingState = {
  quality?: string;
  prefixes: Mod[];
  suffixes: Mod[];
  note?: string;
};

type StepId = "start" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "done" | "B" | "V1" | "V2" | "V3" | "M1" | "M2" | "M3" | "M4";

type Step = {
  id: StepId;
  title: string;
  body: string[];
  items: ItemId[];
  ring: RingState;
  tone?: "fail";
  callout?: string;
  branch?: { label: string; from: StepId };
  next?: { label: string; to: StepId | "end"; ok: boolean; endText?: string }[];
};

// Option texts and tier ranges based on poe2db (English) ring modifiers.
const RARITY_P = "Item Rarity in Maps increased by 18%"; // Prefix Tier 1 (16–19)%
const RARITY_S = "Item Rarity in Maps increased by 17%"; // Suffix Tier 1 (15–18)%
const FIRE_RES = "+43% to Fire Resistance"; // Tier 1 (41–45)%
const ALL_RES = "+16% to all Elemental Resistances"; // Tier 1 (15–16)%
const ATTACK_T1 = "Adds 15 to 28 Physical Damage to Attacks"; // Tier 1 (12–19) to (22–32)
const MAX_QUALITY = "Maximum Quality increased by +20%"; // Breach Essence

const TIER_HINTS: Record<string, string> = {
  [RARITY_P]: "Tier 1",
  [RARITY_S]: "Tier 1",
  [FIRE_RES]: "Tier 1",
  [ALL_RES]: "Tier 1",
  [ATTACK_T1]: "Tier 1",
};

const MAIN_STEPS: Step[] = [
  {
    id: "start",
    title: "Start — Best Base",
    body: [
      "Start with the best base: Fractured Item Rarity prefix, along with Item Rarity and a Tier 1 Resistance on suffixes.",
      "If you couldn't find a best base and bought an alternative base (without resistance), follow the Base Crafting steps first — once finished, skip steps 1 & 2 and join at step 3.",
    ],
    items: [],
    next: [
      { label: "If Best Base", to: "1", ok: true },
      { label: "If Alternative Base", to: "M1", ok: true },
    ],
    ring: {
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, null],
      note: "Best Base",
    },
  },
  {
    id: "1",
    title: "Catalyst Application — 20% Resistance Catalyst Quality",
    body: [
      "Buy catalysts matching your suffix resistance and apply them up to 20% quality.",
      "Use Xoph's Catalyst for Fire, Tul's Catalyst for Cold, or Esh's Catalyst for Lightning — use only one.",
    ],
    items: ["xophCatalyst", "tulCatalyst", "eshCatalyst"],
    ring: {
      quality: "Quality 20% (Fire)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, null],
      note: "No modifier changes — quality increased",
    },
  },
  {
    id: "2",
    title: "Catalysing Omen — Targeting All Elemental Resistances",
    body: [
      "Target All Elemental Resistances using Catalysing Omen + Dextral Exalted Omen + Greater Exalted Omen + Perfect Exalted Orb.",
      "Greater Exalted Omen adds 2 modifiers. If suffixes are full, the extra modifier goes to prefixes — effectively preparing a junk mod for step 3.",
      "Catalysing Omen consumes all catalyst quality — quality drops to 0% afterwards.",
      "If All Elemental Resistances doesn't roll, it's a fail. Continue if a useful modifier hits.",
      "If no useful modifier hits, you cannot salvage it with an annulment (due to the Item Rarity suffix).",
    ],
    items: ["catalysing", "dextralExalt", "greaterExalt", "perfectExalt"],
    tone: "fail",
    next: [
      { label: "On Success", to: "3", ok: true },
      { label: "On Failure", to: "end", ok: false, endText: "End (Cannot salvage with annul)" },
    ],
    ring: {
      quality: "Quality 0% (Consumed by Catalysing Omen)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: "+120 to Accuracy Rating", kind: "new", hint: "Junk mod" }, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES, kind: "new" }],
      note: "Suffixes completed + 1 prefix mod",
    },
  },
  {
    id: "3",
    title: "Check Prefix Modifier",
    body: [
      "Check the modifier added to prefixes in step 2.",
      "If it's a junk mod, proceed to step 4 — this is the slot to replace with Breach Essence.",
      "If Tier 1 Attack Damage hit instead, switch to the Variant route.",
    ],
    items: [],
    next: [
      { label: "If Junk Mod", to: "4", ok: true },
      { label: "If Tier 1 Attack Mod", to: "V1", ok: true },
    ],
    ring: {
      quality: "Quality 0%",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: "+120 to Accuracy Rating", hint: "Junk mod" }, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "When a junk mod is present",
    },
  },
  {
    id: "4",
    title: "Breach Essence — Maximum Quality +20%",
    body: [
      "Replace the junk modifier using Breach Essence + Sinistral Crystallising Omen.",
      "Breach Essence adds 'Maximum Quality increased by +20%' to prefixes — this mod is required to apply catalyst quality up to 40%.",
    ],
    items: ["breachEssence", "sinistralCrystal"],
    ring: {
      quality: "Quality 0% (Max 40%)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: MAX_QUALITY, kind: "new" }, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Junk mod → Max Quality +20%",
    },
  },
  {
    id: "5",
    title: "Catalyst Application — 20% Reaver Catalyst Quality",
    body: [
      "Current state: Fractured Item Rarity prefix + Max Quality +20% · Suffixes completed.",
      "Apply Reaver Catalyst (Attack) up to 20% quality.",
    ],
    items: ["reaverCatalyst"],
    ring: {
      quality: "Quality 20% (Attack)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: MAX_QUALITY }, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "No modifier changes — quality increased",
    },
  },
  {
    id: "6",
    title: "Catalysing Omen — Praying for Tier 1 Attack",
    body: [
      "Pray for Tier 1 Attack Damage using Catalysing Omen + Perfect Exalted Orb.",
      "Catalyst quality is fully consumed here.",
    ],
    items: ["catalysing", "perfectExalt"],
    next: [
      { label: "On Success", to: "7", ok: true },
      { label: "On Failure", to: "B", ok: false },
    ],
    ring: {
      quality: "Quality 0% (Consumed by Catalysing Omen)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: MAX_QUALITY }, { text: ATTACK_T1, kind: "new" }],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "All 3 prefix slots filled",
    },
  },
  {
    id: "7",
    title: "Reaver Catalyst 40% Quality",
    body: [
      "While the Maximum Quality +20% modifier is still present, apply Reaver Catalyst up to 40% quality.",
      "Make sure to do this before the mod gets removed in the next step.",
    ],
    callout: "Be sure to reach 40% quality before Maximum Quality +20% is removed — failing means wasting Reaver Catalyst costs.",
    items: ["reaverCatalyst"],
    ring: {
      quality: "Quality 40% (Attack)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, { text: MAX_QUALITY }, { text: ATTACK_T1 }],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "No modifier changes — Attack quality 0% → 40%",
    },
  },
  {
    id: "8",
    title: "Abyssal Desecration 50:50",
    body: [
      "The ultimate coin flip. Use Sinistral Necromancy Omen + Preserved Calicle to target prefix Abyssal Desecration 50:50.",
      "Success if Maximum Quality +20% gets desecrated. If Tier 1 Attack gets wiped, restart from step 6 — the 40% Reaver Catalyst quality will be consumed by Catalysing Omen.",
    ],
    items: ["sinistralNecro", "collarbone"],
    next: [
      { label: "On Success", to: "9", ok: true },
      { label: "On Failure (Tier 1 Attack wiped)", to: "6", ok: false },
    ],
    ring: {
      quality: "Quality 40% (Attack)",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: MAX_QUALITY, kind: "gamble" },
        { text: ATTACK_T1, kind: "gamble" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "One of the two is desecrated 50:50 — Max Quality side is success",
    },
  },
  {
    id: "9",
    title: "Game Over — Infinite Omen of Light Loop",
    body: ["If step 8 succeeded, it's game over. Loop Omen of Light + Orb of Annulment until Tier 1 Attack hits."],
    items: ["light", "annul", "sinistralNecro", "collarbone"],
    next: [{ label: "On Success", to: "done", ok: true }],
    ring: {
      quality: "Quality 40% (Attack)",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: "Desecrated → Loop until Tier 1 Attack hits", kind: "desecrated" },
        { text: ATTACK_T1 },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Omen of Light removes only desecrated mods, keeping the rest safe",
    },
  },
  {
    id: "done",
    title: "Completed — Full Rarity Gold Ring",
    body: [
      "Prefixes: Fractured Item Rarity increased + Added Physical Damage to Attacks (Tier 1) + Desecrated mod.",
      "Suffixes: Item Rarity increased + Tier 1 Resistance + All Elemental Resistances.",
      "Done. Buying it ready is financially and mentally better.",
    ],
    items: [],
    ring: {
      quality: "Quality 40% (Attack)",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: ATTACK_T1 },
        { text: "Tier 1 Attack Desecrated mod locked", kind: "desecrated" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Completed State",
    },
  },
];

const GOLD_RING_ICON = "https://cdn.poe2db.tw/image/Art/2DItems/Rings/Basetypes/GoldRing.webp";
const DESECRATED_RES = "+33% to Fire Resistance";
const RES_CATALYSTS: ItemId[] = ["xophCatalyst", "tulCatalyst", "eshCatalyst"];

const MAKE_STEPS: Step[] = [
  {
    id: "M1",
    title: "Dextral Necromancy Omen + Preserved Calicle + Omen of Abyssal Echoes — Find Any Resistance",
    body: [
      "Apply a desecrated modifier to suffixes using Dextral Necromancy Omen + Preserved Calicle.",
      "When revealing, use Omen of Abyssal Echoes to reroll options once, and pick any resistance out of the 6 choices.",
    ],
    items: ["dextralNecro", "collarbone", "abyssalEchoes"],
    next: [{ label: "If Resistance Hits", to: "M2", ok: true }],
    ring: {
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [{ text: RARITY_S }, { text: DESECRATED_RES, kind: "desecrated", hint: "Any resistance" }, null],
      note: "Desecrated resistance on suffixes",
    },
  },
  {
    id: "M2",
    title: "Apply Matching Catalyst & Roll All Elemental Resistances",
    body: [
      "Apply catalysts matching the rolled resistance up to 20% quality.",
      "Use Catalysing Omen + Dextral Exalted Omen + Perfect Exalted Orb to roll All Elemental Resistances.",
    ],
    items: [...RES_CATALYSTS, "catalysing", "dextralExalt", "perfectExalt"],
    next: [{ label: "If All Elemental Resistances Hits", to: "M3", ok: true }],
    ring: {
      quality: "Quality 0% (Consumed by Catalysing Omen)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [
        { text: RARITY_S },
        { text: DESECRATED_RES, kind: "desecrated", hint: "Any resistance" },
        { text: ALL_RES, kind: "new" },
      ],
      note: "All 3 suffix slots filled",
    },
  },
  {
    id: "M3",
    title: "Remove Desecrated Resistance with Omen of Light",
    body: ["Use Omen of Light + Orb of Annulment to remove only the desecrated resistance — the rest of the modifiers remain safe."],
    items: ["light", "annul"],
    next: [{ label: "After Removal", to: "M4", ok: true }],
    ring: {
      quality: "Quality 0%",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [{ text: RARITY_S }, null, { text: ALL_RES }],
      note: "Desecrated resistance slot is now empty",
    },
  },
  {
    id: "M4",
    title: "Reapply Catalyst and Add Desired Resistance",
    body: [
      "Apply catalysts of your desired resistance up to 20% quality again.",
      "Use Catalysing Omen + Dextral Exalted Omen + Perfect Exalted Orb to add the resistance.",
      "Suffixes now match the state after finishing step 2 of the success path.",
    ],
    items: [...RES_CATALYSTS, "catalysing", "dextralExalt", "perfectExalt"],
    next: [{ label: "After Adding Junk Prefix", to: "3", ok: true }],
    ring: {
      quality: "Quality 0% (Consumed by Catalysing Omen)",
      prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES, kind: "new" }, { text: ALL_RES }],
      note: "Base completed — Suffixes completed",
    },
  },
];

const VARIANT_STEPS: Step[] = [
  {
    id: "V1",
    title: "Add One More Junk Prefix",
    body: [
      "If Tier 1 Attack landed on prefixes in step 2, apply one more junk modifier to the remaining prefix slot.",
      "If another useful modifier hits here, you can abandon the 40% quality step and finish right here.",
    ],
    items: [],
    branch: { label: "Step 3 Tier 1 Attack", from: "3" },
    next: [
      { label: "If Useful Mod Hits", to: "end", ok: true, endText: "Finish (Abandon 40% quality)" },
      { label: "If Junk Mod Hits", to: "V2", ok: false },
    ],
    ring: {
      quality: "Quality 0%",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: ATTACK_T1 },
        { text: "+120 to Accuracy Rating", kind: "new", hint: "Junk mod" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Prefix Tier 1 Attack + Junk mod",
    },
  },
  {
    id: "V2",
    title: "Sinistral Crystallising Omen + Breach Essence 50:50",
    body: [
      "Use Sinistral Crystallising Omen + Breach Essence to remove one prefix and add Maximum Quality increased by +20%.",
      "Since the fractured mod cannot be removed, either the junk mod or Tier 1 Attack will be wiped 50:50.",
    ],
    items: ["sinistralCrystal", "breachEssence"],
    next: [
      { label: "If Junk Mod Wiped", to: "V3", ok: true },
      { label: "If Tier 1 Attack Wiped", to: "B", ok: false },
    ],
    ring: {
      quality: "Quality 0% (Max 40%)",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: ATTACK_T1, kind: "gamble" },
        { text: "+120 to Accuracy Rating", kind: "gamble", hint: "Junk mod" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "One of the two is replaced by Maximum Quality +20% 50:50",
    },
  },
  {
    id: "V3",
    title: "Apply Reaver Catalyst 40% Quality Immediately",
    body: [
      "If the junk mod was wiped, prefixes are Fractured mod + Tier 1 Attack + Maximum Quality +20%, matching success path step 7.",
      "Apply Reaver Catalyst up to 40% quality right away and proceed to the finalization stage (step 8).",
    ],
    items: ["reaverCatalyst"],
    next: [{ label: "After 40% Quality", to: "8", ok: true }],
    ring: {
      quality: "Quality 40% (Attack)",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: ATTACK_T1 },
        { text: MAX_QUALITY, kind: "new" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Junk mod → Max Quality +20%, Quality 40%",
    },
  },
];

const RECOVERY_STEPS: Step[] = [
  {
    id: "B",
    title: "Sinistral Annulment Omen 50:50 Removal Gamble",
    body: [
      "Perform a 50:50 removal gamble using Sinistral Annulment Omen + Orb of Annulment.",
      "Don't panic if it fails. Even if Maximum Quality +20% gets removed, you can return to step 4 (Breach Essence) and replace the remaining failed mod.",
    ],
    items: ["sinistralAnnul", "annul"],
    branch: { label: "Step 6 Failure", from: "6" },
    next: [
      { label: "If Failed Mod Removed", to: "5", ok: true },
      { label: "If Max Quality +20% Removed", to: "4", ok: false },
    ],
    ring: {
      quality: "Quality 0%",
      prefixes: [
        { text: RARITY_P, kind: "fractured" },
        { text: MAX_QUALITY, kind: "gamble" },
        { text: "+65 to maximum Life", kind: "gamble", hint: "Failed mod" },
      ],
      suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, { text: ALL_RES }],
      note: "Fractured mod is safe, one of the other two is removed 50:50",
    },
  },
];

const TRADE_LEAGUE = "Forbidden Rites";
const TRADE_BASE_URL = `https://poe.kakaogames.com/trade2/search/poe2/${encodeURIComponent(TRADE_LEAGUE)}/`;
const TRADE_FILTER_CODE =
  "H4sIAAAAAAAACo1QXWoCMRC-SpnnIOyuUM1VioSYTCCQbEIyEWUJ9LFHaE9Q-tZHz6T2DmXVlpUidF7m9_tm5hsgk6SSgQ8QItnQA4eMqiS5dgiVAe0iAoevs4_D_uXh-Pl6en8GdoZl4E_Dz4DsNTAw1hGmS8Nq4IDb6KyyNBsBols2j_PFspm3wGAjXcFxsbc98K6rlV1BMWPRYXZxoi9-jUkEI9BH2omY0Nit8EHnPyztf0lyMXdJmlpXdTV5ZqxnJSb5JFQhpRIJ9Y2GRrp81s8kqagk1MIS-psZSgWh1qvId-it27jfyxZtHe0byZ6TeIBAAA";
const TRADE_QUERY = {
  status: { option: "securable" },
  type: "Gold Ring",
  stats: [
    {
      type: "and",
      filters: [
        { id: "explicit.stat_3917489142", value: { min: 33 } },
        { id: "pseudo.pseudo_number_of_empty_prefix_mods", value: { min: 2 } },
        { id: "pseudo.pseudo_number_of_empty_suffix_mods", value: { min: 1 } },
      ],
    },
  ],
  filters: {
    misc_filters: { filters: { corrupted: { option: "false" }, fractured_item: { option: "true" } } },
    type_filters: { filters: { ilvl: { min: 82 } } },
  },
};
const TRADE_FULL_URL = `${TRADE_BASE_URL}?q=${encodeURIComponent(JSON.stringify({ query: TRADE_QUERY }))}`;

function BaseSearch() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TRADE_FILTER_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="guide-search">
      <h2 className="guide-search-title">
        <img src={GOLD_RING_ICON} alt="" width={36} height={36} />
        Base Search
      </h2>
      <p>Enter the following search filter on the trade site.</p>
      <div className="guide-search-code">
        <code>{TRADE_FILTER_CODE}</code>
        <button type="button" className="ghost" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy Filter"}
        </button>
      </div>
      <p className="guide-search-note">
        Conditions: Gold Ring · Item Level 82+ · Total Item Rarity 33%+ · Empty Prefixes 2+ · Empty Suffixes 1+ · Fractured Item · Not Corrupted
      </p>
      <p className="guide-search-note">
        This filter finds both best and alternative bases — prioritize buying ones with Tier 1 resistance on suffixes if available.
      </p>
      <a className="guide-search-go" href={TRADE_FULL_URL} target="_blank" rel="noreferrer">
        Go to Trade Search with Filter Applied →
      </a>
    </section>
  );
}

const KIND_LABEL: Record<ModKind, string> = {
  fractured: "Fractured",
  desecrated: "Desecrated",
  new: "NEW",
  gamble: "50:50",
};

function isVariant(id: StepId) {
  return id === "V1" || id === "V2" || id === "V3";
}

function isMake(id: StepId) {
  return id === "M1" || id === "M2" || id === "M3" || id === "M4";
}

function isRecovery(id: StepId) {
  return id === "B";
}

type DestKind = "main" | "variant" | "recovery" | "make";

function destKind(id: StepId): DestKind {
  if (isVariant(id)) return "variant";
  if (isRecovery(id)) return "recovery";
  if (isMake(id)) return "make";
  return "main";
}

export function ArrowIcon({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d={back ? "M10 3 5 8l5 5M5 8h9" : "M6 3l5 5-5 5M11 8H2"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EndIcon({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d={ok ? "M3 8.5 6.5 12 13 4.5" : "M4 4l8 8M12 4l-8 8"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function stepLabel(id: StepId) {
  if (id === "start") return "Start";
  if (id === "done") return "Complete";
  if (isRecovery(id)) return `Recovery ${id}`;
  if (isVariant(id)) return `Variant ${id.slice(1)}`;
  if (isMake(id)) return `Craft ${id.slice(1)}`;
  return `Step ${id}`;
}

function stateLabel(id: StepId) {
  if (id === "start") return "Pre-craft";
  if (id === "done") return "Complete";
  if (isRecovery(id)) return `After Recovery ${id}`;
  if (isVariant(id)) return `After Variant ${id.slice(1)}`;
  if (isMake(id)) return `After Base Craft ${id.slice(1)}`;
  return `After Step ${id}`;
}

function ModLine({ mod }: { mod: Mod }) {
  if (!mod)
    return (
      <li className="ring-mod empty">
        <span>Empty Slot</span>
      </li>
    );
  return (
    <li className={`ring-mod${mod.kind ? ` ${mod.kind}` : ""}`} title={mod.text}>
      {mod.kind && <span className="ring-mod-tag">{KIND_LABEL[mod.kind]}</span>}
      <span>{mod.text}</span>
      {(mod.hint ?? TIER_HINTS[mod.text]) && <small className="ring-mod-hint">{mod.hint ?? TIER_HINTS[mod.text]}</small>}
    </li>
  );
}

export function RingPanel({
  ring,
  id,
  stateText,
  itemName = "Gold Ring",
  itemIcon = GOLD_RING_ICON,
}: {
  ring: RingState;
  id?: StepId;
  stateText?: string;
  itemName?: string;
  itemIcon?: string;
}) {
  const state = stateText ?? (id ? stateLabel(id) : "");
  return (
    <div className="ring-panel" aria-label={`${state} ring state example`}>
      {ring.note && <p className="ring-title">{ring.note}</p>}
      <div className="ring-panel-head">
        <strong className="ring-name">
          <img src={itemIcon} alt="" width={28} height={28} loading="lazy" />
          {itemName}
        </strong>
        <span>{state} · Example</span>
      </div>
      {ring.quality && <p className="ring-quality">{ring.quality}</p>}
      <p className="ring-group">Prefixes</p>
      <ul>
        {ring.prefixes.map((mod, i) => (
          <ModLine key={i} mod={mod} />
        ))}
      </ul>
      <p className="ring-group">Suffixes</p>
      <ul>
        {ring.suffixes.map((mod, i) => (
          <ModLine key={i} mod={mod} />
        ))}
      </ul>
    </div>
  );
}

export function RingGuide() {
  const [flash, setFlash] = useState<StepId | null>(null);

  const goStep = (id: StepId) => {
    document.getElementById(`guide-step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFlash(id);
    window.setTimeout(() => setFlash((cur) => (cur === id ? null : cur)), 1600);
  };

  const renderStep = (step: Step) => {
    const mainIndex = MAIN_STEPS.indexOf(step);
    const following = mainIndex >= 0 ? MAIN_STEPS[mainIndex + 1] : undefined;
    const next = step.next ?? (following ? [{ label: "Next Step", to: following.id, ok: true }] : undefined);
    const recovery = isRecovery(step.id);
    const variant = isVariant(step.id);
    const make = isMake(step.id);
    const classes = [
      "guide-step",
      step.tone,
      step.id === "start" || step.id === "done" ? "base" : "",
      recovery ? "recovery" : "",
      variant ? "variant" : "",
      make ? "make" : "",
      flash === step.id ? "flash" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <li key={step.id} id={`guide-step-${step.id}`} className={classes}>
        <span className="guide-step-no">{make ? step.id.slice(1) : recovery || variant ? step.id : step.id === "start" ? "Start" : step.id === "done" ? "Done" : step.id}</span>
        <RingPanel ring={step.ring} id={step.id} />
        <div className="guide-step-body">
          <h3>
            {step.branch && (
              <button
                type="button"
                className={`guide-back dest-${destKind(step.branch.from)}`}
                onClick={() => goStep(step.branch!.from)}
                title={`Return to ${stepLabel(step.branch.from)}`}
              >
                <span className="guide-go-icon">
                  <ArrowIcon back />
                </span>
                {step.branch.label}
              </button>
            )}
            {recovery && <span className="guide-recovery-tag">Recovery {step.id}</span>}
            {variant && <span className="guide-variant-tag">Variant {step.id.slice(1)}</span>}
            {make && <span className="guide-make-tag">Craft {step.id.slice(1)}</span>}
            {step.title}
          </h3>
          <ul>
            {step.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {step.callout && (
            <p className="guide-key-note">
              <strong>Crucial</strong> {step.callout}
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
                    className={`guide-go dest-${destKind(n.to as StepId)}`}
                    onClick={() => goStep(n.to as StepId)}
                    title={`Go to ${stepLabel(n.to as StepId)}`}
                  >
                    <span className="guide-go-label">{n.label}</span>
                    <span className="guide-go-dest">{stepLabel(n.to as StepId)}</span>
                    <span className="guide-go-icon">
                      <ArrowIcon />
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="page guide-page">
      <header className="hero">
        <div>
          <p className="eyebrow">Path of Exile 2 · Crafting Guide</p>
          <h1>Full Rarity Gold Ring Guide</h1>
          <p className="lede">
            Step-by-step full rarity ring crafting. <strong>Numbered steps (1–9)</strong> are the success path. On failure, follow the{" "}
            <strong>Recovery path (Recovery B)</strong> to rejoin the success path. If Tier 1 Attack hits alongside prefixes in step 2, branch to the <strong>Variant route (Variant 1–3)</strong>.
          </p>
        </div>
      </header>

      <p className="guide-legend">
        Modifiers and values on the ring examples are for <strong>demonstration purposes</strong>. Actual modifiers and ranges may vary.
      </p>

      <h2 className="guide-section-title">Required Bases</h2>
      <p className="guide-legend">
        Gold Ring · Item Level 82+ (required for Tier 1 resistances). Fractured Item Rarity increased on prefix, and Item Rarity increased on suffix are common; starting point differs depending on whether a Tier 1 resistance suffix is present.
      </p>
      <div className="guide-base-shapes">
        <section className="guide-base-shape">
          <RingPanel
            stateText="Buy Ready"
            ring={{
              prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
              suffixes: [{ text: RARITY_S }, { text: FIRE_RES }, null],
              note: "Best Base — Includes Tier 1 resistance",
            }}
          />
          <p>Base with Tier 1 resistance already on suffixes. Buy this if available and start from step 1 of the success path.</p>
          <button type="button" className="guide-go dest-main" onClick={() => goStep("start")}>
            <span className="guide-go-label">If Best Base</span>
            <span className="guide-go-dest">Start</span>
            <span className="guide-go-icon">
              <ArrowIcon />
            </span>
          </button>
        </section>
        <section className="guide-base-shape">
          <RingPanel
            stateText="When Unavailable"
            ring={{
              prefixes: [{ text: RARITY_P, kind: "fractured" }, null, null],
              suffixes: [{ text: RARITY_S }, null, null],
              note: "Alternative Base — No resistance",
            }}
          />
          <p>Base bought when the best base is unavailable. Fill suffixes using the base crafting steps, then join at step 3 of the success path.</p>
          <button type="button" className="guide-go dest-make" onClick={() => goStep("M1")}>
            <span className="guide-go-label">If Alternative Base</span>
            <span className="guide-go-dest">Craft 1</span>
            <span className="guide-go-icon">
              <ArrowIcon />
            </span>
          </button>
        </section>
      </div>

      <BaseSearch />

      <h2 className="guide-section-title make">Base Crafting — For Alternative Bases</h2>
      <p className="guide-legend">
        How to manually fill the suffixes of an alternative base (without resistance) when the best base isn't listed. Once finished, suffixes match the state after completing step 2 of the success path, allowing you to skip steps 1 & 2 and join at step 3.
      </p>
      <ol className="guide-steps">{MAKE_STEPS.map(renderStep)}</ol>

      <h2 className="guide-section-title">Success Path — Starting from Best Base</h2>
      <ol className="guide-steps">{MAIN_STEPS.map(renderStep)}</ol>

      <h2 className="guide-section-title variant">Variant Route</h2>
      <p className="guide-legend">A shortcut used when Tier 1 Attack hits alongside prefixes in step 2.</p>
      <ol className="guide-steps">{VARIANT_STEPS.map(renderStep)}</ol>

      <h2 className="guide-section-title recovery">Failure Recovery Path</h2>
      <p className="guide-legend">Steps taken only upon failure. Use the button below to rejoin the success path once completed.</p>
      <ol className="guide-steps">{RECOVERY_STEPS.map(renderStep)}</ol>
    </div>
  );
}
