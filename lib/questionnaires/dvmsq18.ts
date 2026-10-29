import type { Questionnaire, Text } from "./types";

export const DVMSQ18_PARTS = ["symptom", "impairment"] as const;
export const DVMSQ18_GUIDES = ["overall", "symptom", "impairment"] as const;
export type Dvmsq18Part = typeof DVMSQ18_PARTS[number];
export type Dvmsq18Choice = "0" | "1" | "2" | "3" | "4" | "na";
export type Dvmsq18Gate = "yes" | "no" | "unsure" | "na";
export type Dvmsq18Readout = { rated: number; skipped: number; required: number; sum: number | null; maximum: number };
export type Dvmsq18Result = { gate: Dvmsq18Gate; total: number | null; parts: Record<Dvmsq18Part, Dvmsq18Readout> | null; responses: { questionId: string; choice: string }[] };
export type Dvmsq18Questionnaire = Questionnaire & { kind: "dvmsq18"; dvmsq18: Record<"subtitle" | "privacy" | "editionNotice" | "attribution" | "gateExamples" | "gateClarification" | "frequencyContext" | "interferenceContext" | "globalContext" | "privateContext", Text> };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
// Prompt/anchor literals: DVMSQ v1.5, Copyright 2022 Zachary J. Williams;
// Chinese working translation and added choices: FermatMind Editorial, 2026.
// These questionnaire literals are CC BY-SA 4.0; source, licence and changes appear on every public page.
// https://creativecommons.org/licenses/by-sa/4.0/
const prompts = [
  {
    "en": "Are there specific sounds that you are extremely bothered by, even if they are not loud?",
    "zh": "是否有某些特定声音，即使不响，也会让你极其困扰？"
  },
  {
    "en": "Intense feelings of irritation or annoyance?",
    "zh": "强烈的烦躁或恼怒感？"
  },
  {
    "en": "Feelings of anger or rage?",
    "zh": "愤怒或暴怒的感觉？"
  },
  {
    "en": "Feelings of fear or panic?",
    "zh": "恐惧或惊恐的感觉？"
  },
  {
    "en": "Feelings of disgust?",
    "zh": "厌恶的感觉？"
  },
  {
    "en": "Urges to run away from the sound?",
    "zh": "想要逃离这种声音的冲动？"
  },
  {
    "en": "Urges to cover your ears or block out the sound in some other way?",
    "zh": "想要捂住耳朵或用其他方式隔绝这种声音的冲动？"
  },
  {
    "en": "Urges to lash out violently at the person or object making the sound?",
    "zh": "想要猛烈攻击发出这种声音的人或物的冲动？"
  },
  {
    "en": "Feeling like you cannot control your response to the sound?",
    "zh": "感觉自己无法控制对这种声音的反应？"
  },
  {
    "en": "Difficulty focusing on anything except the sound?",
    "zh": "难以把注意力放在这种声音以外的任何事物上？"
  },
  {
    "en": "Some sort of immediate physical response? (e.g., tensing of muscles, heart racing, warmth, tingling, pain, or tightening of stomach)",
    "zh": "某种即时的身体反应？（例如肌肉绷紧、心跳加快、发热、刺麻、疼痛或胃部发紧）"
  },
  {
    "en": "How often do you avoid situations where you may potentially hear these bothersome sounds?",
    "zh": "你多常避开可能听到这些困扰声音的情境？"
  },
  {
    "en": "Your ability to interact with other people?",
    "zh": "你与他人互动的能力？"
  },
  {
    "en": "Your ability to be productive at work or school?",
    "zh": "你在工作或学习中有效完成事情的能力？"
  },
  {
    "en": "Your ability to take care of your household responsibilities?",
    "zh": "你履行家务责任的能力？"
  },
  {
    "en": "Your ability to participate in community activities (for example, festivities, religious, or other activities)?",
    "zh": "你参加社区活动的能力（例如节庆、宗教或其他活动）？"
  },
  {
    "en": "To what degree have your sound sensitivities negatively impacted your mental or emotional health?",
    "zh": "你的声音敏感在多大程度上对心理或情绪健康产生了负面影响？"
  },
  {
    "en": "To what degree do you believe that your sound sensitivities have created problems for you?",
    "zh": "你认为自己的声音敏感在多大程度上给你带来了问题？"
  },
  {
    "en": "To what degree do you believe that your sound sensitivities have made your entire life worse?",
    "zh": "你认为自己的声音敏感在多大程度上使整体生活变差？"
  }
];
const gateOptions = [
  {
    "id": "yes",
    "label": {
      "en": "Yes",
      "zh": "是"
    },
    "directionId": "gate",
    "score": 1
  },
  {
    "id": "no",
    "label": {
      "en": "No",
      "zh": "否"
    },
    "directionId": "gate",
    "score": 0
  },
  {
    "id": "unsure",
    "label": {
      "en": "I am not sure (added unscored option)",
      "zh": "不确定（本页新增，不计分）"
    },
    "directionId": "gate",
    "score": null
  },
  {
    "id": "na",
    "label": {
      "en": "Prefer not to answer (added unscored option)",
      "zh": "不愿回答（本页新增，不计分）"
    },
    "directionId": "gate",
    "score": null
  }
];
const anchors = [
  [
    {
      "en": "Never",
      "zh": "从不"
    },
    {
      "en": "Rarely",
      "zh": "很少"
    },
    {
      "en": "Sometimes",
      "zh": "有时"
    },
    {
      "en": "Often",
      "zh": "经常"
    },
    {
      "en": "Very often",
      "zh": "非常经常"
    },
    {
      "en": "Cannot judge / no relevant opportunity / prefer not to answer (unscored)",
      "zh": "无法判断／没有相关机会／不愿回答（不计分）"
    }
  ],
  [
    {
      "en": "Not at all",
      "zh": "完全没有"
    },
    {
      "en": "A little bit",
      "zh": "一点"
    },
    {
      "en": "A moderate amount",
      "zh": "中等程度"
    },
    {
      "en": "Very much",
      "zh": "很大程度"
    },
    {
      "en": "An extreme amount",
      "zh": "极大程度"
    },
    {
      "en": "Cannot judge / no relevant opportunity / prefer not to answer (unscored)",
      "zh": "无法判断／没有相关机会／不愿回答（不计分）"
    }
  ]
];
const sourceContexts = {
  "gateExamples": {
    "en": "Examples include: chewing, slurping, crunching, throat clearing, finger tapping, foot shuffling, keyboard tapping, rustling, nasal sounds, pen clicking, appliance humming, clock ticking, and animal sounds.",
    "zh": "例如：咀嚼、啜饮、嚼脆食、清嗓、手指敲击、脚步拖动、键盘敲击、窸窣声、鼻部声音、按笔声、电器嗡声、时钟滴答和动物声音。"
  },
  "gateClarification": {
    "en": "These sounds should cause significant emotional distress (e.g., extreme irritation, anger, disgust, rage, anxiety, or panic). Do NOT count sounds that bother you only because you find them too loud or physically painful.",
    "zh": "这些声音应造成显著情绪困扰（例如极度烦躁、愤怒、厌恶、暴怒、焦虑或惊恐）。不要把仅仅因为太响或造成身体疼痛而让你困扰的声音算在内。"
  },
  "frequencyContext": {
    "en": "When you are exposed to the bothersome sounds listed above, how often do you experience...",
    "zh": "当你接触上面这些困扰声音时，你多常经历……"
  },
  "interferenceContext": {
    "en": "In the past 7 days, how much did your sound sensitivities interfere with...",
    "zh": "过去7天，你的声音敏感在多大程度上干扰了……"
  },
  "globalContext": {
    "en": "For the following source questions, consider the general impact as worded; no specific time window is stated.",
    "zh": "以下源题按一般影响措辞回答，未指定具体时段。"
  },
  "privateContext": {
    "en": "Privately consider the particular bothersome sounds you had in mind. The source asks for a sound list and a physical description; this adaptation does not collect them. Do not play or recreate a sound.",
    "zh": "在心里考虑刚才所指的特定困扰声音。来源要求声音清单与身体描述，本改编不收集这些文字。不要播放或重现声音。"
  }
};
const topic = (n: number) => n === 3 ? "fear-unscored" : n <= 11 ? "symptom" : "impairment";
export function isDvmsq18ConfigurationValid(q: unknown): q is Dvmsq18Questionnaire {
  if (!record(q) || q.slug !== "misophonia-screener" || q.kind !== "dvmsq18" || q.code !== "DVMSQ18_WILLIAMS2022_CC_BY_SA"
    || q.version !== "1.0.0" || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 5 || !record(q.source)
    || q.source.kind !== "dvmsq18_v15_cc_by_sa_working_zh_web_adaptation"
    || q.source.formCode !== "dvmsq_v15_18plusgate_fmzh_web_v1"
    || q.source.itemBankVersion !== "dvmsq_v15_source18plusgate_bilingual_skips_v1"
    || q.source.scoringVersion !== "dvmsq_v15_strict10_7_total17_exclude3_gate_no_zero_no_algorithm_v1"
    || q.source.resultContentVersion !== "dvmsq_v15_three_full_guides_v1"
    || q.source.itemBankSha256 !== "829a55b4dc2644a7bc9e144bf341559e46e54aa6342760390c97ec07ceaf3bdf"
    || q.source.resultContentSha256 !== "b3ce0b96fa18cd6addfd323b2ad9490adb380233653de45d4638ea217c79792a"
    || q.source.psychometricValidationCompleted !== false
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.dvmsq18) || !["subtitle", "privacy", "editionNotice", "attribution", "gateExamples", "gateClarification", "frequencyContext", "interferenceContext", "globalContext", "privateContext"].every(k => text(q.dvmsq18 && (q.dvmsq18 as Record<string, unknown>)[k]))
    || !Object.entries(sourceContexts).every(([key, value]) => { const v = (q.dvmsq18 as Record<string, unknown>)[key]; return record(v) && v.en === value.en && v.zh === value.zh; })
    || !record(q.dvmsq18.attribution) || typeof q.dvmsq18.attribution.en !== "string" || !q.dvmsq18.attribution.en.includes("Copyright © 2022 Zachary J. Williams.")
    || !q.dvmsq18.attribution.en.includes("CC BY-SA 4.0")
    || !Array.isArray(q.questions) || q.questions.length !== 19 || !Array.isArray(q.directions) || q.directions.length !== 2
    || !Array.from(q.directions).every((d, i) => record(d) && d.id === DVMSQ18_PARTS[i] && d.itemCount === [10, 7][i] && text(d.title))
    || !Array.isArray(q.profiles) || q.profiles.length !== 3) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === (i === 0 ? "DV_S1" : `DV_${String(i).padStart(2, "0")}`)
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === (i === 0 ? 4 : 6)
    && Array.from(question.options).every((o, j) => record(o) && record(o.label) && (i === 0
      ? o.id === gateOptions[j].id && o.score === gateOptions[j].score && o.directionId === "gate" && o.label.en === gateOptions[j].label.en && o.label.zh === gateOptions[j].label.zh
      : o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j) && o.directionId === topic(i)
        && o.label.en === anchors[i <= 11 ? 0 : 1][j].en && o.label.zh === anchors[i <= 11 ? 0 : 1][j].zh)))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === DVMSQ18_GUIDES[i]
    && Array.isArray(p.directionIds) && JSON.stringify(p.directionIds) === JSON.stringify(i === 0 ? DVMSQ18_PARTS : [p.id])
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://public-pages-files-2025.frontiersin.org/articles/897901/file/data_sheet_2.pdf/897901_supplementary-materials_datasheets_2_pdf/1", "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.897901/full", "https://creativecommons.org/licenses/by-sa/4.0/"][i]);
}

/** Source v1.5: fear item 3 is retained but never counted. No provisional diagnostic algorithm. */
export function scoreDvmsq18(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: number; result: Dvmsq18Result } {
  if (!isDvmsq18ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers), gates = ["yes", "no", "unsure", "na"], choices = ["0", "1", "2", "3", "4", "na"];
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !(id === "DV_S1" ? gates : choices).includes(v))) return { status: "invalid", answered: 0 };
  if (!Object.hasOwn(answers, "DV_S1")) return entries.length ? { status: "invalid", answered: 0 } : { status: "incomplete", answered: 0 };
  const gate = answers.DV_S1 as Dvmsq18Gate;
  if (gate !== "yes") {
    if (entries.length !== 1) return { status: "invalid", answered: 0 };
    return { status: "complete", answered: 1, result: { gate, total: gate === "no" ? 0 : null, parts: null, responses: [{ questionId: "DV_S1", choice: gate }] } };
  }
  if (entries.length !== 19) return { status: "incomplete", answered: entries.length };
  const parts = {} as Record<Dvmsq18Part, Dvmsq18Readout>;
  for (const id of DVMSQ18_PARTS) {
    const items = q.questions.filter(s => s.options[0].directionId === id), values = items.map(s => answers[s.id]).filter(v => v !== "na").map(Number);
    parts[id] = { rated: values.length, skipped: items.length - values.length, required: items.length, maximum: items.length * 4,
      sum: values.length === items.length ? values.reduce((a, b) => a + b, 0) : null };
  }
  const total = parts.symptom.sum !== null && parts.impairment.sum !== null ? parts.symptom.sum + parts.impairment.sum : null;
  return { status: "complete", answered: 19, result: { gate, total, parts, responses: q.questions.map(s => ({ questionId: s.id, choice: answers[s.id] as string })) } };
}
