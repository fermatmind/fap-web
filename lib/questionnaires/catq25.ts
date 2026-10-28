import type { Questionnaire, Text } from "./types";

/** Hull et al. original Appendix 1 (CC BY 4.0); no shortened-form or diagnostic thresholds. */
export const CATQ25_PART_KEYS = {
  compensation: [1, 4, 5, 8, 11, 14, 17, 20, 23],
  masking: [2, 6, 9, 12, 15, 18, 21, 24],
  assimilation: [3, 7, 10, 13, 16, 19, 22, 25],
} as const;
export const CATQ25_PARTS = ["compensation", "masking", "assimilation"] as const;
export const CATQ25_GUIDES = ["overall", ...CATQ25_PARTS] as const;
export const CATQ25_REVERSE = [3, 12, 19, 22, 24] as const;
export type CatQ25PartId = typeof CATQ25_PARTS[number];
export type CatQ25Readout = { numericCount: number; skippedCount: number; requiredCount: number; sum: number | null; mean: number | null };
export type CatQ25Result = { total: CatQ25Readout; parts: Record<CatQ25PartId, CatQ25Readout> };
export type CatQ25Questionnaire = Questionnaire & { kind: "catq25"; catq25: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const sourceItems = [
  {
    "id": "CATQ_01",
    "en": "When I am interacting with someone, I deliberately copy their body language or facial expressions",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_02",
    "en": "I monitor my body language or facial expressions so that I appear relaxed",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_03",
    "en": "I rarely feel the need to put on an act in order to get through a social situation",
    "part": "assimilation",
    "reverse": true
  },
  {
    "id": "CATQ_04",
    "en": "I have developed a script to follow in social situations (for example, a list of questions or topics of conversation)",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_05",
    "en": "I will repeat phrases that I have heard others say in the exact same way that I first heard them",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_06",
    "en": "I adjust my body language or facial expressions so that I appear interested by the person I am interacting with",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_07",
    "en": "In social situations, I feel like I’m ‘performing’ rather than being myself",
    "part": "assimilation",
    "reverse": false
  },
  {
    "id": "CATQ_08",
    "en": "In my own social interactions, I use behaviours that I have learned from watching other people interacting",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_09",
    "en": "I always think about the impression I make on other people",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_10",
    "en": "I need the support of other people in order to socialise",
    "part": "assimilation",
    "reverse": false
  },
  {
    "id": "CATQ_11",
    "en": "I practice my facial expressions and body language to make sure they look natural",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_12",
    "en": "I don’t feel the need to make eye contact with other people if I don’t want to",
    "part": "masking",
    "reverse": true
  },
  {
    "id": "CATQ_13",
    "en": "I have to force myself to interact with people when I am in social situations",
    "part": "assimilation",
    "reverse": false
  },
  {
    "id": "CATQ_14",
    "en": "I have tried to improve my understanding of social skills by watching other people",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_15",
    "en": "I monitor my body language or facial expressions so that I appear interested by the person I am interacting with",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_16",
    "en": "When in social situations, I try to find ways to avoid interacting with others",
    "part": "assimilation",
    "reverse": false
  },
  {
    "id": "CATQ_17",
    "en": "I have researched the rules of social interactions (for example, by studying psychology or reading books on human behaviour) to improve my own social skills",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_18",
    "en": "I am always aware of the impression I make on other people",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_19",
    "en": "I feel free to be myself when I am with other people",
    "part": "assimilation",
    "reverse": true
  },
  {
    "id": "CATQ_20",
    "en": "I learn how people use their bodies and faces to interact by watching television or films, or by reading fiction",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_21",
    "en": "I adjust my body language or facial expressions so that I appear relaxed",
    "part": "masking",
    "reverse": false
  },
  {
    "id": "CATQ_22",
    "en": "When talking to other people, I feel like the conversation flows naturally",
    "part": "assimilation",
    "reverse": true
  },
  {
    "id": "CATQ_23",
    "en": "I have spent time learning social skills from television shows and films, and try to use these in my interactions",
    "part": "compensation",
    "reverse": false
  },
  {
    "id": "CATQ_24",
    "en": "In social interactions, I do not pay attention to what my face or body are doing",
    "part": "masking",
    "reverse": true
  },
  {
    "id": "CATQ_25",
    "en": "In social situations, I feel like I am pretending to be ‘normal’",
    "part": "assimilation",
    "reverse": false
  }
] as const;
const anchors = ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neither Agree nor Disagree", "Somewhat Agree", "Agree", "Strongly Agree", "Skip this statement"];
const sourceInstruction = "Please read each statement below and choose the answer that best fits your experiences during social interactions.";
export function isCatQ25ConfigurationValid(q: unknown): q is CatQ25Questionnaire {
  if (!record(q) || q.kind !== "catq25" || q.slug !== "masking-test" || q.code !== "CATQ25_HULL2019" || q.version !== "1.0.0"
    || !record(q.source) || q.source.kind !== "catq25_hull2019_ccby_working_zh"
    || q.source.formCode !== "catq25_hull2019_appendix1_fm_zh_working_v1" || q.source.itemBankVersion !== q.source.formCode
    || q.source.scoringVersion !== "catq25_reverse5_three9_8_8_strictparts_total25_noimputation_v1"
    || q.source.resultContentVersion !== "fm_catq25_four_full_readings_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "dd35049e8ce4b3dd39f9190ef22253d142ab591e5a39529686789199b3a7f1c9" || q.source.resultContentSha256 !== "89f65d7192a202af66ff9ebb50c4b653d54b8829c519ae418417d963b68893de"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.instructions) || q.instructions.en !== sourceInstruction
    || !record(q.catq25) || ![q.catq25.subtitle, q.catq25.privacy, q.catq25.editionNotice, q.catq25.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 25 || !Array.isArray(q.directions) || q.directions.length !== 3
    || !Array.isArray(q.profiles) || q.profiles.length !== 4) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === CATQ25_PARTS[i] && d.itemCount === CATQ25_PART_KEYS[CATQ25_PARTS[i]].length && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => {
    const source = sourceItems[i];
    return record(question) && question.id === source.id && question.reverse === source.reverse && question.correctOptionId === undefined
      && text(question.prompt) && record(question.prompt) && question.prompt.en === source.en
      && Array.isArray(question.options) && question.options.length === 8 && Array.from(question.options).every((o, j) =>
        record(o) && o.id === (j === 7 ? "na" : String(j + 1)) && o.score === (j === 7 ? null : j + 1)
        && o.directionId === source.part && text(o.label) && record(o.label) && o.label.en === anchors[j]);
  })) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === CATQ25_GUIDES[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === (i === 0 ? 3 : 1)
    && p.directionIds.every((id, j) => id === (i === 0 ? CATQ25_PARTS[j] : p.id))
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 4 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://link.springer.com/article/10.1007/s10803-018-3792-6", "https://creativecommons.org/licenses/by/4.0/", "https://journals.sagepub.com/doi/10.1177/25739581261435868", "https://journals.sagepub.com/doi/10.1177/13623613241287964"][i]);
}

/** Only explicit source choices count. Skips withhold their part and the total, without imputation. */
export function scoreCatQ25(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 25; result: CatQ25Result } {
  if (!isCatQ25ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !Object.hasOwn(answers, id) || !sourceItems.some(s => s.id === id) || typeof v !== "string" || !["1", "2", "3", "4", "5", "6", "7", "na"].includes(v))) return { status: "invalid", answered: 0 };
  if (entries.length !== 25) return { status: "incomplete", answered: entries.length };
  const read = (numbers: readonly number[]): CatQ25Readout => {
    let numericCount = 0, sum = 0;
    for (const n of numbers) {
      const value = answers[`CATQ_${String(n).padStart(2, "0")}`];
      if (value === "na") continue;
      const numeric = Number(value);
      numericCount++; sum += (CATQ25_REVERSE as readonly number[]).includes(n) ? 8 - numeric : numeric;
    }
    return { numericCount, skippedCount: numbers.length - numericCount, requiredCount: numbers.length,
      sum: numericCount === numbers.length ? sum : null, mean: numericCount === numbers.length ? sum / numbers.length : null };
  };
  return { status: "complete", answered: 25, result: { total: read(Array.from({ length: 25 }, (_, i) => i + 1)),
    parts: { compensation: read(CATQ25_PART_KEYS.compensation), masking: read(CATQ25_PART_KEYS.masking), assimilation: read(CATQ25_PART_KEYS.assimilation) } } };
}
