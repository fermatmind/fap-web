import { BIG5_DOMAIN_ORDER, type Big5DomainCode } from "@/lib/big5/taxonomy";

export type Big5TraitBand = "high" | "mid" | "low";

export type Big5DomainInterpretationEntry = {
  domain_id: Big5DomainCode;
  definition: string;
  bands: Record<Big5TraitBand, string>;
  upside: string;
  tradeoff: string;
  impression: string;
  scene_line: string;
};

const DOMAIN_COPY: Record<Big5DomainCode, Omit<Big5DomainInterpretationEntry, "domain_id">> = {
  O: {
    definition:
      "Openness tracks how strongly you move toward novelty, imagination, and broader frames for making sense of things.",
    bands: {
      high: "You currently lean toward curiosity, experimentation, and expanding the frame before settling on one answer.",
      mid: "You can explore new ideas without losing contact with what is practical, proven, or already working.",
      low: "You tend to prefer familiar methods, concrete evidence, and a clearer path from question to answer.",
    },
    upside: "This can help you notice possibilities early, connect distant ideas, and stay mentally flexible when the context changes.",
    tradeoff:
      "The cost is that broad exploration can outrun practical constraints, or keep decisions open longer than the situation needs.",
    impression: "Your default style is to widen the frame before committing to one interpretation.",
    scene_line:
      "In daily life this often shows up in how quickly you reframe a question, test alternatives, or lose energy for repetitive routines.",
  },
  C: {
    definition:
      "Conscientiousness tracks how strongly you lean toward structure, follow-through, and regulating yourself around goals.",
    bands: {
      high: "You currently lean toward planning ahead, keeping order, and staying responsible for the details that carry a task.",
      mid: "You can stay dependable without feeling locked into one rigid way of organizing work or time.",
      low: "You tend to work with more spontaneity, looser structure, and more tolerance for unfinished edges while a task is still moving.",
    },
    upside: "This can help you convert intentions into repeatable progress and give other people a clearer sense that you will follow through.",
    tradeoff:
      "The cost is that strong structure can harden into overcontrol, while lighter structure can leave too much to mood or last-minute pressure.",
    impression: "Your default style is to regulate effort through systems, habits, and visible checkpoints.",
    scene_line:
      "In daily life this often shows up in how early you prepare, how tightly you manage deadlines, and how uneasy unfinished work feels.",
  },
  E: {
    definition:
      "Extraversion tracks how much you draw energy from outward engagement, visible momentum, and social stimulation.",
    bands: {
      high: "You currently lean toward external engagement, speaking up early, and gaining energy from visible interaction.",
      mid: "You can step forward when the context needs it, while still keeping space for quieter processing and recovery.",
      low: "You tend to conserve energy, prefer lower-stimulation settings, and think before making yourself part of the room.",
    },
    upside: "This can help you create momentum quickly, make yourself known, and keep interaction moving when a group stalls.",
    tradeoff:
      "The cost is that high outward energy can crowd reflection, while lower outward energy can leave your thinking under-shared or under-seen.",
    impression: "Your default style is to regulate energy through either outward participation or selective reserve.",
    scene_line:
      "In daily life this often shows up in how quickly you enter conversations, how long social settings feel sustainable, and how much space you need to reset.",
  },
  A: {
    definition:
      "Agreeableness tracks how strongly you lean toward cooperation, accommodation, trust, and relational smoothness.",
    bands: {
      high: "You currently lean toward warmth, flexibility, and preserving workable relationships even when there is some friction.",
      mid: "You can cooperate without disappearing, and hold a position without needing every interaction to become a fight.",
      low: "You tend to be more skeptical, more willing to push back, and less motivated by harmony for its own sake.",
    },
    upside: "This can help you build trust, reduce avoidable friction, and keep collaboration workable when personalities differ.",
    tradeoff:
      "The cost is that stronger accommodation can soften necessary boundaries, while lower accommodation can make candor feel sharper than you intend.",
    impression: "Your default style is to manage tension through either cooperation, firmness, or a deliberate balance between both.",
    scene_line:
      "In daily life this often shows up in how easily you compromise, how quickly you question motives, and how directly you surface disagreement.",
  },
  N: {
    definition:
      "Neuroticism tracks how strongly you react to stress, uncertainty, inner friction, and emotionally costly situations.",
    bands: {
      high: "You currently lean toward stronger vigilance, more noticeable emotional shifts, and faster stress activation under pressure.",
      mid: "You can register stress clearly without being fully driven by it, especially when the situation becomes more predictable.",
      low: "You tend to stay steadier under pressure, recover more quickly, and give less internal weight to uncertainty or emotional noise.",
    },
    upside: "This can help you detect risk early, stay sensitive to weak signals, and notice when something important feels off.",
    tradeoff:
      "The cost is that stronger sensitivity can turn into over-reading or longer recovery loops, while lower sensitivity can miss softer warning signs.",
    impression: "Your default style is to register pressure either intensely and early, or with more emotional distance and stability.",
    scene_line:
      "In daily life this often shows up in how long stress lingers, how much uncertainty keeps running in the background, and how easily a setback follows you into the next task.",
  },
};

export const BIG5_DOMAIN_INTERPRETATION: Record<Big5DomainCode, Big5DomainInterpretationEntry> =
  BIG5_DOMAIN_ORDER.reduce<Record<Big5DomainCode, Big5DomainInterpretationEntry>>((acc, domainId) => {
    acc[domainId] = {
      domain_id: domainId,
      ...DOMAIN_COPY[domainId],
    };
    return acc;
  }, {} as Record<Big5DomainCode, Big5DomainInterpretationEntry>);

export function normalizeTraitBand(value: string | null | undefined): Big5TraitBand {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "high" || normalized === "low") {
    return normalized;
  }
  return "mid";
}

export function resolveDomainInterpretation(domainId: Big5DomainCode, bandRaw: string | null | undefined) {
  const band = normalizeTraitBand(bandRaw);
  const entry = BIG5_DOMAIN_INTERPRETATION[domainId];

  return {
    ...entry,
    band,
    band_copy: entry.bands[band],
  };
}
