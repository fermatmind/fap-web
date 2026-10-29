import type { Questionnaire, Text } from "./types";

/** Original anger-response topics. No STAXI-2 items, norms, diagnostic classification or risk assessment. */
export const ANGER20_TOPICS = ["anger-occurrence", "outward-expression", "kept-inside", "perceived-choice"] as const;
export type Anger20Topic = typeof ANGER20_TOPICS[number];
export type Anger20Readout = { numericCount: number; skippedCount: number; requiredCount: 5; sum: number | null; mean: number | null };
export type Anger20Result = Record<Anger20Topic, Anger20Readout>;
export type Anger20Questionnaire = Questionnaire & { kind: "anger20"; anger20: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const prompts = [
  {
    "en": "When a small change disrupted an ordinary plan, I felt angry about it.",
    "zh": "普通安排被小变化打乱时，我为此生气。"
  },
  {
    "en": "When an everyday task went wrong in a way I thought could have been avoided, I felt frustrated or angry.",
    "zh": "日常任务出岔子、而我觉得本可避免时，我感到挫败或生气。"
  },
  {
    "en": "When someone took a different view in an ordinary conversation, I noticed anger arising in me.",
    "zh": "普通谈话中对方看法不同，我察觉自己生起怒意。"
  },
  {
    "en": "When an ordinary practical goal was blocked, I experienced anger or frustration.",
    "zh": "普通实际目标受阻时，我体验到生气或挫败。"
  },
  {
    "en": "When a small everyday boundary I had stated was overlooked, I felt angry.",
    "zh": "已说清的日常小界限被忽略时，我感到生气。"
  },
  {
    "en": "While I was angry, I spoke in a noticeably sharper tone.",
    "zh": "生气时，我说话的语气明显变得尖锐。"
  },
  {
    "en": "While I was angry, I said directly that I was upset.",
    "zh": "生气时，我直接说出自己感到不快。"
  },
  {
    "en": "While I was angry, I let that feeling show in the wording of a brief message.",
    "zh": "生气时，我让简短信息的措辞流露出这种感受。"
  },
  {
    "en": "While I was angry, I let my facial expression show the feeling rather than hide it.",
    "zh": "生气时，我让脸上的表情流露这种感受，没有遮掩。"
  },
  {
    "en": "While I was angry, I used emphatic gestures to show that I was upset.",
    "zh": "生气时，我用明显的手势表达自己不快。"
  },
  {
    "en": "While I felt angry, I deliberately kept that feeling out of what I said.",
    "zh": "心里生气时，我刻意不让说出的话透露这种感受。"
  },
  {
    "en": "While I felt angry, I maintained an even tone so that the feeling would remain private.",
    "zh": "心里生气时，我保持平稳语气，好让这种感受不被知道。"
  },
  {
    "en": "When I could choose whether to name my anger, I chose to leave it unspoken.",
    "zh": "可以选择是否说出自己生气时，我选择不提这种感受。"
  },
  {
    "en": "After an ordinary activity ended, I kept my remaining anger to myself rather than mentioning it.",
    "zh": "普通活动结束后，我把仍有的怒意留给自己，没有提起。"
  },
  {
    "en": "While still angry, I gave a neutral response to avoid revealing the feeling.",
    "zh": "仍在生气时，我用中性回应避免透露这种感受。"
  },
  {
    "en": "While I felt angry, I felt able to choose my next words rather than speak automatically.",
    "zh": "心里生气时，我感到自己仍能选择接下来的话，而非自动说出口。"
  },
  {
    "en": "While I felt angry, I felt I had the option of taking a safe pause before replying.",
    "zh": "心里生气时，我感到自己有在回复前安全暂停的选项。"
  },
  {
    "en": "While I felt angry, I felt free to wait before sending a nonessential message.",
    "zh": "心里生气时，我感到自己可以等一等再发送非必要的信息。"
  },
  {
    "en": "While I felt angry, I felt I could stop a routine exchange and return to it later if needed.",
    "zh": "心里生气时，我感到需要时可以暂停普通交流，之后再回来处理。"
  },
  {
    "en": "While I felt angry, I felt there was more than one acceptable way for me to respond.",
    "zh": "心里生气时，我感到自己有不止一种可以接受的回应方式。"
  }
];
const anchors = [
  {
    "en": "Never on relevant occasions",
    "zh": "有相关机会时从未如此"
  },
  {
    "en": "Rarely on relevant occasions",
    "zh": "有相关机会时很少如此"
  },
  {
    "en": "Sometimes on relevant occasions",
    "zh": "有相关机会时有时如此"
  },
  {
    "en": "Often on relevant occasions",
    "zh": "有相关机会时经常如此"
  },
  {
    "en": "Almost always on relevant occasions",
    "zh": "有相关机会时几乎总如此"
  },
  {
    "en": "No relevant occasion / unsure / prefer not to answer",
    "zh": "没有相关机会／不确定／不愿回答"
  }
];

export function isAnger20ConfigurationValid(q: unknown): q is Anger20Questionnaire {
  if (!record(q) || q.slug !== "anger-issues-screener" || q.kind !== "anger20" || q.code !== "FM_ANGER20" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 6 || !record(q.source)
    || q.source.kind !== "fermatmind_original_anger_response_reflection" || q.source.formCode !== "fm_anger20_original_v1"
    || q.source.itemBankVersion !== "fm_anger20_original_bilingual_v1" || q.source.scoringVersion !== "four_topics_5_direct_0to4_completegroups_conditionalNA_no_total_or_risk_v1"
    || q.source.resultContentVersion !== "fm_anger20_four_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "73e044d85487db130f789234eb22cd5921c1f40646e244225edf7c38fedd01f2" || q.source.resultContentSha256 !== "67a9e79be6e699a11e9597f543b3806643a2f350fa1abc94a9657e55fdf41392"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.anger20) || ![q.anger20.subtitle, q.anger20.privacy, q.anger20.editionNotice, q.anger20.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 20 || !Array.isArray(q.directions) || q.directions.length !== 4
    || !Array.isArray(q.profiles) || q.profiles.length !== 4) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === ANGER20_TOPICS[i] && d.itemCount === 5 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === `ANG_${String(i + 1).padStart(2, "0")}`
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === 6 && Array.from(question.options).every((o, j) => record(o)
      && o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j) && o.directionId === ANGER20_TOPICS[Math.floor(i / 5)]
      && record(o.label) && o.label.en === anchors[j].en && o.label.zh === anchors[j].zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === ANGER20_TOPICS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://www.parinc.com/products/STAXI-2", "https://www.parinc.com/product/groups/staxi-assessments", "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anger/"][i]);
}

/** All five numeric responses are required per topic. Conditional no-opportunity remains NA, never inferred from another part; no total or risk is calculated. */
export function scoreAnger20(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; result: Anger20Result } {
  if (!isAnger20ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !["0", "1", "2", "3", "4", "na"].includes(v))) return { status: "invalid", answered: 0 };
  if (entries.length !== 20) return { status: "incomplete", answered: entries.length };
  const result = {} as Anger20Result;
  for (const id of ANGER20_TOPICS) {
    const values = q.questions.filter(s => s.options[0].directionId === id).map(s => answers[s.id]).filter(v => v !== "na").map(Number);
    const sum = values.reduce((a, b) => a + b, 0), rated = values.length;
    result[id] = { numericCount: rated, skippedCount: 5 - rated, requiredCount: 5, sum: rated >= 5 ? sum : null, mean: rated >= 5 ? sum / rated : null };
  }
  return { status: "complete", answered: 20, result };
}
