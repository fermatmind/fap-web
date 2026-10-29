import type { Questionnaire, Text } from "./types";

/** Original editorial families. Literal response records, without a psychometric scale or classification. */
export const SYNES15_TOPICS = ["symbol-color", "sound-color", "sequence-space", "personification", "taste-touch"] as const;
export type Synes15Topic = typeof SYNES15_TOPICS[number];
export const SYNES15_CHOICES = ["yes", "no", "unsure", "na"] as const;
export type Synes15Choice = typeof SYNES15_CHOICES[number];
export type Synes15Readout = { counts: Record<Synes15Choice, number>; responses: { questionId: string; choice: Synes15Choice }[]; requiredCount: 3 };
export type Synes15Result = Record<Synes15Topic, Synes15Readout>;
export type Synes15Questionnaire = Questionnaire & { kind: "synes15"; synes15: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const prompts = [
  {
    "en": "Without choosing a colour on purpose, a familiar written character or number brought a particular colour to mind.",
    "zh": "没有刻意选择颜色时，一个熟悉的书写字符或数字会自行带出某种颜色印象。"
  },
  {
    "en": "On separate ordinary occasions, I noticed the same written character or number bringing a similar colour impression.",
    "zh": "在不同的普通场合，我注意到同一个书写字符或数字带来相似的颜色印象。"
  },
  {
    "en": "Thinking about a familiar written symbol brought a colour impression even when I was not looking at a coloured version of it.",
    "zh": "即使没有看着彩色版本，只是想到一个熟悉的书写符号，也会带出颜色印象。"
  },
  {
    "en": "An ordinary sound was accompanied by a colour-like impression that I had not deliberately invented.",
    "zh": "听到普通声音时，伴随出现了并非我刻意编造的颜色样印象。"
  },
  {
    "en": "A familiar voice or musical sound brought a shape-like impression alongside the sound.",
    "zh": "熟悉的人声或音乐声音出现时，同时伴随某种形状样印象。"
  },
  {
    "en": "On another occasion, a similar sound brought a recognizably similar colour or shape impression without my planning it.",
    "zh": "另一次听到相似声音时，没有事先安排，也出现了可辨认的相似颜色或形状印象。"
  },
  {
    "en": "A familiar ordered sequence, such as weekdays or numbers, seemed to occupy particular positions in an imagined space.",
    "zh": "熟悉的有序序列，例如星期或数字，仿佛在脑中空间里占据某些位置。"
  },
  {
    "en": "The spatial layout of one familiar sequence came to mind without my choosing how to arrange it.",
    "zh": "某个熟悉序列的空间布局会自行浮现，并非我当时选择怎样排列。"
  },
  {
    "en": "I noticed a similar spatial layout for the same familiar sequence on separate occasions.",
    "zh": "在不同场合，我注意到同一个熟悉序列具有相似的空间布局。"
  },
  {
    "en": "A familiar letter, number or weekday seemed to have a personality-like quality without my inventing a story about it.",
    "zh": "没有编故事时，一个熟悉的字母、数字或星期会带有某种类似性格的特征。"
  },
  {
    "en": "A particular symbol or sequence member felt characteristically serious, playful or otherwise person-like on more than one occasion.",
    "zh": "某个符号或序列成员不止一次显得严肃、活泼，或具有其他类似人的特征。"
  },
  {
    "en": "A personality-like impression came with a familiar symbol even when the task was simply reading or counting.",
    "zh": "即使只是在阅读或计数，熟悉的符号也会同时带来类似性格的印象。"
  },
  {
    "en": "A familiar word was accompanied by a taste-like or mouth-texture impression without my deliberately recalling a meal.",
    "zh": "没有刻意回想某顿饭时，一个熟悉词语会伴随味道样或口腔质感样印象。"
  },
  {
    "en": "Seeing someone receive an ordinary, non-painful touch was accompanied by a touch-like impression on my own body.",
    "zh": "看到别人受到普通且不疼痛的触碰时，我自己身体上也会伴随某种触觉样印象。"
  },
  {
    "en": "A familiar word or written symbol brought a specific touch-like or bodily-location impression without deliberate visualization.",
    "zh": "没有刻意想象时，一个熟悉词语或书写符号会带出某种具体触觉样或身体位置印象。"
  }
];
const anchors = [
  {
    "en": "Yes — I can recall this experience",
    "zh": "记得有过这种体验"
  },
  {
    "en": "No — I had relevant occasions, but did not recall this experience",
    "zh": "有相关机会，但未记得出现这种体验"
  },
  {
    "en": "I am not sure how to answer",
    "zh": "不确定如何回答"
  },
  {
    "en": "No relevant opportunity / prefer not to answer",
    "zh": "没有相关机会／不愿回答"
  }
];

export function isSynes15ConfigurationValid(q: unknown): q is Synes15Questionnaire {
  if (!record(q) || q.slug !== "synesthesia-test" || q.kind !== "synes15" || q.code !== "FM_SYNES15" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 5 || !record(q.source)
    || q.source.kind !== "fermatmind_original_synesthetic_experience_checklist" || q.source.formCode !== "fm_synes15_original_v1"
    || q.source.itemBankVersion !== "fm_synes15_original_bilingual_v1" || q.source.scoringVersion !== "five_families_3_literal_fourchoice_counts_and_item_readback_no_scale_v1"
    || q.source.resultContentVersion !== "fm_synes15_five_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "11fd17bf232878dbde4ad36249f8211d7aad2304e85568a1f37e016bbbe4221d" || q.source.resultContentSha256 !== "b29836a14756092c273c122e9b3dfd346131784bfe17a11674a6ad00a9b5c7a5"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.synes15) || ![q.synes15.subtitle, q.synes15.privacy, q.synes15.editionNotice, q.synes15.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 15 || !Array.isArray(q.directions) || q.directions.length !== 5
    || !Array.isArray(q.profiles) || q.profiles.length !== 5) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === SYNES15_TOPICS[i] && d.itemCount === 3 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === `SYX_${String(i + 1).padStart(2, "0")}`
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === 4 && Array.from(question.options).every((o, j) => record(o)
      && o.id === SYNES15_CHOICES[j] && o.score === (j === 0 ? 1 : j === 1 ? 0 : null) && o.directionId === SYNES15_TOPICS[Math.floor(i / 3)]
      && record(o.label) && o.label.en === anchors[j].en && o.label.zh === anchors[j].zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === SYNES15_TOPICS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://www.sussex.ac.uk/synaesthesia/faq", "https://onlinelibrary.wiley.com/doi/full/10.1111/cogs.13189", "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1893904/full"][i]);
}

/** Literal counts only. Unsure and no opportunity/decline remain distinct from no. */
export function scoreSynes15(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 15; result: Synes15Result } {
  if (!isSynes15ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !SYNES15_CHOICES.includes(v as Synes15Choice))) return { status: "invalid", answered: 0 };
  if (entries.length !== 15) return { status: "incomplete", answered: entries.length };
  const result = {} as Synes15Result;
  for (const id of SYNES15_TOPICS) {
    const responses = q.questions.filter(s => s.options[0].directionId === id).map(s => ({ questionId: s.id, choice: answers[s.id] as Synes15Choice }));
    const counts = { yes: 0, no: 0, unsure: 0, na: 0 };
    for (const response of responses) counts[response.choice]++;
    result[id] = { counts, responses, requiredCount: 3 };
  }
  return { status: "complete", answered: 15, result };
}
