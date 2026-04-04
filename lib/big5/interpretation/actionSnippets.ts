import { BIG5_DOMAIN_ORDER, type Big5DomainCode } from "@/lib/big5/taxonomy";
import { normalizeTraitBand, type Big5TraitBand } from "@/lib/big5/interpretation/domainInterpretation";

export type Big5ActionSnippetPack = {
  leverage?: readonly string[];
  watch_out?: readonly string[];
  experiment?: readonly string[];
};

export type Big5ActionPlanSelection = {
  leverage: string[];
  watch_out: string[];
  experiment: string[];
};

export const BIG5_ACTION_SNIPPETS: Record<Big5DomainCode, Record<Big5TraitBand, Big5ActionSnippetPack>> = {
  O: {
    high: {
      leverage: [
        "Keep one active lane for exploration so new ideas do not disappear once daily work takes over.",
        "Use your range to connect distant inputs, then translate the pattern into one practical next move.",
      ],
      watch_out: [
        "Your openness can keep a decision in draft mode when the situation already needs closure.",
        "Be careful not to keep upgrading the framework while the execution window is getting smaller.",
      ],
      experiment: [
        "When a new idea appears, force it through a simple test: what changes this week if it is actually worth keeping?",
        "Limit open research time before a decision so curiosity feeds action instead of replacing it.",
      ],
    },
    mid: {
      leverage: [
        "You can usually move between experimentation and practicality without overcommitting to either side.",
        "Use that range to test alternatives without losing the thread of the original goal.",
      ],
      watch_out: [
        "Your balance can become indecision if you keep both novelty and stability equally alive for too long.",
        "Do not wait for perfect conceptual clarity before making a workable choice.",
      ],
      experiment: [
        "Pick one area where you will deliberately try a new approach and one area where you will keep the proven method.",
        "At the end of a decision, write down what stayed stable and what you intentionally changed.",
      ],
    },
    low: {
      leverage: [
        "Your preference for concrete approaches can protect you from unnecessary complexity and drift.",
        "Use that steadiness to turn vague conversations into practical next steps quickly.",
      ],
      watch_out: [
        "The risk is dismissing useful alternatives too early because they feel unfamiliar or too abstract.",
        "A highly proven method can become a ceiling if the context has already changed underneath it.",
      ],
      experiment: [
        "Once a week, test one small unfamiliar method without asking it to prove itself immediately.",
        "When you reject an idea, force yourself to name one condition under which it might still be useful.",
      ],
    },
  },
  C: {
    high: {
      leverage: [
        "Your structure is an asset when you turn it into reliable momentum rather than private pressure.",
        "Use your planning strength to make progress visible early for yourself and for other people.",
      ],
      watch_out: [
        "High standards can quietly turn into rigidity or self-criticism when reality refuses the plan.",
        "Be careful not to spend more energy controlling the system than moving the work forward.",
      ],
      experiment: [
        "Before tightening a plan, decide what part truly needs precision and what can stay flexible.",
        "When a task slips, revise the system first instead of treating the miss as a character failure.",
      ],
    },
    mid: {
      leverage: [
        "You can usually keep a task moving without making structure heavier than it needs to be.",
        "Use that flexibility to stay dependable while adapting when the plan changes.",
      ],
      watch_out: [
        "Because you are not strongly attached to one system, important details can drift when pressure rises.",
        "A moderate structure works only if you still choose a few non-negotiable checkpoints.",
      ],
      experiment: [
        "Pick one deadline and define the smallest visible checkpoint that proves you are still on track.",
        "At the start of the week, decide which two obligations deserve the most disciplined follow-through.",
      ],
    },
    low: {
      leverage: [
        "Your lighter structure can help you stay adaptable and keep moving when a rigid plan would slow down.",
        "Use that flexibility where experimentation matters more than polish.",
      ],
      watch_out: [
        "The main risk is leaving too much to mood, urgency, or memory when the work needs repeatability.",
        "Freedom stops helping once important details exist only in your head.",
      ],
      experiment: [
        "Choose one recurring task and build the smallest repeatable checklist that removes decision friction.",
        "When you delay a task, identify whether the blocker is lack of clarity, lack of structure, or plain avoidance.",
      ],
    },
  },
  E: {
    high: {
      leverage: [
        "Your outward energy can create momentum quickly, especially when a group needs visible direction.",
        "Use your social presence to make ideas easier for other people to enter and respond to.",
      ],
      watch_out: [
        "Fast external momentum can outrun reflection, especially when your first read is persuasive but incomplete.",
        "Do not assume high interaction automatically means high alignment.",
      ],
      experiment: [
        "After a strong meeting, pause and write what still needs quiet thinking before you treat the conversation as settled.",
        "In one discussion this week, speak second instead of first and see what changes in the quality of the exchange.",
      ],
    },
    mid: {
      leverage: [
        "You can usually step forward when the room needs it and step back when depth matters more than visibility.",
        "Use that range to match your energy to the context instead of performing one style everywhere.",
      ],
      watch_out: [
        "A balanced position can become reactive if you only mirror the room instead of choosing your role deliberately.",
        "Do not let ambiguity about visibility make you quieter than the situation requires.",
      ],
      experiment: [
        "Before a conversation, decide whether your role is to energize, clarify, or listen, then act on that choice directly.",
        "Track which settings leave you more engaged afterward and which ones mainly drain you.",
      ],
    },
    low: {
      leverage: [
        "Your reserve can protect focus and keep your responses more deliberate when a room is noisy or fast.",
        "Use that steadier pacing to bring depth where other people are moving too quickly.",
      ],
      watch_out: [
        "The risk is that good thinking stays private long enough that other people read it as disengagement.",
        "If you wait for the perfect moment to speak, the group may move on without your input.",
      ],
      experiment: [
        "Choose one setting this week where you contribute earlier than usual, even if the thought is still 80 percent formed.",
        "When you leave a meeting with something unsaid, write down what stopped you and whether the reason was valid.",
      ],
    },
  },
  A: {
    high: {
      leverage: [
        "Your cooperative instinct helps lower friction and makes other people easier to work with under pressure.",
        "Use that relational ease to build trust before a conversation becomes difficult.",
      ],
      watch_out: [
        "The risk is softening a needed boundary or absorbing extra work to keep the atmosphere smooth.",
        "Harmony is costly when it prevents clear disagreement where disagreement is necessary.",
      ],
      experiment: [
        "In one conversation this week, state the boundary first and the reassurance second.",
        "When you say yes to help, check whether you are helping on purpose or avoiding the discomfort of saying no.",
      ],
    },
    mid: {
      leverage: [
        "You can often cooperate without disappearing and disagree without making the whole exchange hostile.",
        "Use that balance when a situation needs both tact and firmness.",
      ],
      watch_out: [
        "A middle position can drift into vagueness if you keep smoothing the tone without clarifying the actual line.",
        "Do not confuse being fair with staying noncommittal.",
      ],
      experiment: [
        "In a disagreement, separate what you are willing to flex on from what you are not before the discussion starts.",
        "After a difficult exchange, check whether you protected both the relationship and the decision quality.",
      ],
    },
    low: {
      leverage: [
        "Your directness can protect standards, expose weak reasoning, and stop false harmony from becoming policy.",
        "Use that candor where precision matters more than social smoothing.",
      ],
      watch_out: [
        "The risk is being more cutting than the situation requires, especially when you are already convinced.",
        "If people feel pressed rather than engaged, your point may be right but still fail to land.",
      ],
      experiment: [
        "Before pushing back, name the shared goal first so your disagreement is easier to absorb.",
        "Once a week, ask one clarifying question before delivering your critique and compare the result.",
      ],
    },
  },
  N: {
    high: {
      leverage: [
        "Your sensitivity helps you notice weak signals early and catch pressure before other people admit it is building.",
        "Use that early detection to intervene upstream instead of only absorbing the stress yourself.",
      ],
      watch_out: [
        "The cost is that your system may keep treating possibility as immediate threat even after the facts calm down.",
        "When stress stays unframed, it can start writing the whole story instead of informing one part of it.",
      ],
      experiment: [
        "When pressure spikes, write two columns: what is actually happening, and what your nervous system is predicting.",
        "Build one short reset ritual for the moment after a stressful task so activation does not bleed into the next one.",
      ],
    },
    mid: {
      leverage: [
        "You can usually register pressure without becoming fully organized around it, which supports steadier judgment.",
        "Use that range to stay alert without handing stress the steering wheel.",
      ],
      watch_out: [
        "A moderate position can hide accumulating strain if you assume you are fine simply because you are still functioning.",
        "Do not wait for stress to become visible damage before you adjust your load.",
      ],
      experiment: [
        "At the end of the day, note one signal that pressure is rising before it becomes obvious.",
        "Name one condition that reliably helps you recover faster, then make it easier to repeat on purpose.",
      ],
    },
    low: {
      leverage: [
        "Your steadiness can be a real asset in pressure-heavy environments because noise does not take over as easily.",
        "Use that calm to stabilize situations that would otherwise escalate too quickly.",
      ],
      watch_out: [
        "The risk is under-reading softer emotional signals in yourself or assuming other people can regulate the way you do.",
        "Stability helps most when it stays connected to context instead of becoming emotional distance.",
      ],
      experiment: [
        "In a stressful situation, ask yourself what signal a more pressure-sensitive person would already be noticing.",
        "Once a week, review one setback and name the emotion first before moving straight to the fix.",
      ],
    },
  },
};

function pushUnique(target: string[], items: readonly string[] | undefined, limit: number) {
  if (!items?.length) {
    return;
  }

  for (const item of items) {
    if (!item || target.includes(item)) {
      continue;
    }
    target.push(item);
    if (target.length >= limit) {
      break;
    }
  }
}

function normalizeDomainTrait(value: unknown): Big5DomainCode | null {
  const fromObject =
    value && typeof value === "object" ? Reflect.get(value as Record<string, unknown>, "key") : value;
  const normalized = String(fromObject ?? "").trim().toUpperCase();
  return BIG5_DOMAIN_ORDER.find((trait) => trait === normalized) ?? null;
}

export function selectBig5ActionPlan(params: {
  dominantTraits?: readonly unknown[] | null;
  traitBands?: Record<string, unknown> | null;
  seedActions?: readonly string[] | null;
  leverageLimit?: number;
  watchLimit?: number;
  experimentLimit?: number;
}): Big5ActionPlanSelection {
  const leverageLimit = params.leverageLimit ?? 2;
  const watchLimit = params.watchLimit ?? 2;
  const experimentLimit = params.experimentLimit ?? 4;

  const leverage: string[] = [];
  const watch_out: string[] = [];
  const experiment: string[] = [];

  pushUnique(experiment, params.seedActions ?? [], experimentLimit);

  const candidates = new Set<Big5DomainCode>();
  const dominantTraits = (params.dominantTraits ?? [])
    .map((trait) => normalizeDomainTrait(trait))
    .filter((trait): trait is Big5DomainCode => Boolean(trait));

  dominantTraits.slice(0, 2).forEach((trait) => candidates.add(trait));

  BIG5_DOMAIN_ORDER.forEach((trait) => {
    if (params.traitBands?.[trait] != null) {
      candidates.add(trait);
    }
  });

  for (const trait of candidates) {
    const band = normalizeTraitBand(
      typeof params.traitBands?.[trait] === "string" ? params.traitBands?.[trait] : null
    );
    const pack = BIG5_ACTION_SNIPPETS[trait]?.[band];
    if (!pack) {
      continue;
    }

    pushUnique(leverage, pack.leverage, leverageLimit);
    pushUnique(watch_out, pack.watch_out, watchLimit);
    pushUnique(experiment, pack.experiment, experimentLimit);

    if (leverage.length >= leverageLimit && watch_out.length >= watchLimit && experiment.length >= experimentLimit) {
      break;
    }
  }

  return {
    leverage,
    watch_out,
    experiment,
  };
}

export function selectBig5ActionSnippets(params: {
  dominantTraits?: readonly unknown[] | null;
  traitBands?: Record<string, unknown> | null;
  seedActions?: readonly string[] | null;
  limit?: number;
}): string[] {
  const selection = selectBig5ActionPlan({
    dominantTraits: params.dominantTraits,
    traitBands: params.traitBands,
    seedActions: params.seedActions,
    leverageLimit: 2,
    watchLimit: 2,
    experimentLimit: Math.max(0, (params.limit ?? 6) - 4),
  });

  return [...selection.leverage, ...selection.watch_out, ...selection.experiment].slice(0, params.limit ?? 6);
}
