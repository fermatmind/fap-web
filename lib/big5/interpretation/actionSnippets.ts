import type { Big5DomainCode } from "@/lib/big5/taxonomy";
import { normalizeInterpretationBand, type Big5InterpretationBand } from "@/lib/big5/interpretation/domainInterpretation";

type Big5ActionSnippetLibrary = Record<Big5DomainCode, Record<Big5InterpretationBand, readonly string[]>>;

export const BIG5_ACTION_SNIPPETS: Big5ActionSnippetLibrary = {
  O: {
    high: [
      "Reserve one weekly block for option exploration before locking execution.",
      "Convert new ideas into short decision memos with explicit stop criteria.",
      "Run one bounded experiment per cycle instead of parallel speculative tracks.",
    ],
    mid: [
      "Use a two-track plan: one path for reliable delivery and one for controlled exploration.",
      "Document assumptions before major pivots to keep alignment stable.",
      "Review alternatives once per sprint, not continuously.",
    ],
    low: [
      "Schedule periodic external input to avoid narrowing the option space too early.",
      "Pilot one low-risk variation before finalizing major process choices.",
      "Use checklists to compare at least two alternatives on key decisions.",
    ],
  },
  C: {
    high: [
      "Set weekly completion thresholds and publish progress at a fixed cadence.",
      "Batch similar tasks to reduce switching and protect throughput.",
      "Define pre-mortem failure points before execution starts.",
    ],
    mid: [
      "Keep one stable execution routine and one adaptive slot for urgent changes.",
      "Use lightweight retrospectives to tune planning without overfitting.",
      "Define done-criteria per task to prevent scope drift.",
    ],
    low: [
      "Commit to a daily top-three list before opening communication channels.",
      "Use external accountability checkpoints for milestones that matter.",
      "Introduce default templates for recurring decisions and handoffs.",
    ],
  },
  E: {
    high: [
      "Convert social momentum into explicit action owners and deadlines.",
      "Protect deep-work windows immediately after high-interaction sessions.",
      "Use concise meeting summaries to retain decision clarity.",
    ],
    mid: [
      "Alternate collaboration blocks with solo execution blocks each day.",
      "Choose one high-leverage conversation per week and define the target outcome.",
      "Use async updates when live discussion adds limited value.",
    ],
    low: [
      "Prepare key talking points before high-stakes meetings.",
      "Use structured status updates to increase visibility without extra social load.",
      "Create repeatable communication templates for recurring stakeholder touchpoints.",
    ],
  },
  A: {
    high: [
      "State non-negotiable boundaries before offering concessions.",
      "Use explicit role expectations to protect collaborative goodwill.",
      "Escalate unresolved conflicts early to avoid silent accumulation.",
    ],
    mid: [
      "Use disagreement protocols that separate problem critique from person critique.",
      "Document decisions with rationale when consensus is partial.",
      "Balance cooperation goals with measurable ownership outcomes.",
    ],
    low: [
      "Add one deliberate perspective-taking step before hard pushback.",
      "Pair direct feedback with clear next-step proposals.",
      "Check relational impact after high-friction decisions.",
    ],
  },
  N: {
    high: [
      "Maintain a weekly decompression routine protected like a core task.",
      "Translate uncertainty into ranked risk items with response owners.",
      "Use decision deadlines to prevent repetitive threat rehearsal.",
    ],
    mid: [
      "Track stress spikes and tie them to concrete workflow triggers.",
      "Create short reset rituals between high-cognitive tasks.",
      "Use if-then planning for predictable pressure points.",
    ],
    low: [
      "Run periodic risk reviews to avoid under-detecting weak warning signals.",
      "Invite external challenge on high-confidence assumptions.",
      "Use scenario drills for decisions with high downside cost.",
    ],
  },
};

function normalizeTraitCode(value: unknown): Big5DomainCode | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "O" || normalized === "C" || normalized === "E" || normalized === "A" || normalized === "N") {
    return normalized;
  }
  return null;
}

function normalizeTraitBands(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, band] of Object.entries(value as Record<string, unknown>)) {
    const trait = normalizeTraitCode(key);
    if (!trait) continue;
    normalized[trait] = String(band ?? "").trim().toLowerCase();
  }
  return normalized;
}

export function selectBig5ActionSnippets({
  dominantTraits,
  traitBands,
  seedActions,
  limit = 4,
}: {
  dominantTraits: unknown[];
  traitBands: unknown;
  seedActions: unknown[];
  limit?: number;
}): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();

  const push = (candidate: unknown) => {
    const normalized = String(candidate ?? "").trim();
    if (!normalized) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    deduped.push(normalized);
  };

  for (const action of seedActions) {
    push(action);
  }

  const normalizedBands = normalizeTraitBands(traitBands);
  const normalizedTraits = dominantTraits
    .map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return normalizeTraitCode((item as Record<string, unknown>).key);
      }
      return normalizeTraitCode(item);
    })
    .filter((item): item is Big5DomainCode => item !== null)
    .slice(0, 2);

  for (const trait of normalizedTraits) {
    const band = normalizeInterpretationBand(normalizedBands[trait] ?? "mid");
    const snippets = BIG5_ACTION_SNIPPETS[trait][band];
    for (const snippet of snippets) {
      push(snippet);
      if (deduped.length >= limit) {
        return deduped.slice(0, limit);
      }
    }
  }

  return deduped.slice(0, limit);
}
