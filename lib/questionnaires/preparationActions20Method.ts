/** Original planning-action self-report summaries; no total, readiness bands or predictions. */
export const PREPARATION_ACTION_FORMS = {
  "freelance-ready": {
    prefix: "FRA",
    domains: ["service-and-enquiries", "project-agreement", "operating-plan", "delivery-routine", "boundaries-and-review"],
  },
  "remote-work": {
    prefix: "RWA",
    domains: ["setup-and-access", "work-planning", "handover-and-decisions", "help-and-coordination", "boundaries-and-recovery"],
  },
} as const;

export type PreparationActionForm = keyof typeof PREPARATION_ACTION_FORMS;
export type PreparationActionAnswer = 0 | 1 | 2 | 3 | "na";
export type PreparationActionDomain = {
  id: string;
  profileId: string;
  itemIds: string[];
  rows: { itemId: string; answer: PreparationActionAnswer }[];
  counts: { unstarted: number; draft: number; tried: number; reviewed: number; notRated: number };
  ratedItems: number;
  requiredItems: 4;
  sum: number | null;
  mean: number | null;
};
export type PreparationActionReport = {
  form: PreparationActionForm;
  answered: 20;
  domains: PreparationActionDomain[];
};

export function isPreparationActionForm(value: unknown): value is PreparationActionForm {
  return value === "freelance-ready" || value === "remote-work";
}

export function preparationActionItemIds(form: PreparationActionForm): string[] {
  return Array.from({ length: 20 }, (_, i) => `${PREPARATION_ACTION_FORMS[form].prefix}_${String(i + 1).padStart(2, "0")}`);
}

/** Accept own data properties only. Unknown, partial, coerced and accessor inputs yield no report. */
export function scorePreparationActions20(form: unknown, input: unknown): PreparationActionReport | null {
  if (!isPreparationActionForm(form) || !input || typeof input !== "object" || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) return null;
  const ids = preparationActionItemIds(form);
  const known = new Set(ids);
  const values = new Map<string, PreparationActionAnswer>();
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string" || !known.has(key)) return null;
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) return null;
    const answer: unknown = descriptor.value;
    if (answer !== "na" && answer !== 0 && answer !== 1 && answer !== 2 && answer !== 3) return null;
    values.set(key, answer);
  }
  if (values.size !== 20) return null;
  return {
    form,
    answered: 20,
    domains: PREPARATION_ACTION_FORMS[form].domains.map((id, domainIndex) => {
      const itemIds = ids.slice(domainIndex * 4, domainIndex * 4 + 4);
      const rows = itemIds.map(itemId => ({ itemId, answer: values.get(itemId)! }));
      const counts = { unstarted: 0, draft: 0, tried: 0, reviewed: 0, notRated: 0 };
      let numericSum = 0;
      for (const { answer } of rows) {
        if (answer === "na") counts.notRated++;
        else {
          numericSum += answer;
          counts[(["unstarted", "draft", "tried", "reviewed"] as const)[answer]]++;
        }
      }
      const complete = counts.notRated === 0;
      return {
        id,
        profileId: `${id}-reading`,
        itemIds,
        rows,
        counts,
        ratedItems: 4 - counts.notRated,
        requiredItems: 4,
        sum: complete ? numericSum : null,
        mean: complete ? Math.round(numericSum / 4 * 10) / 10 : null,
      };
    }),
  };
}
