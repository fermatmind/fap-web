import type { Questionnaire, Text } from "./types";

/** Original sensory-behaviour topics. No Sensory Profile items, threshold axes, norms or type assignment. */
export const SENS16_TOPICS = ["late-noticing", "input-seeking", "input-distraction", "input-reducing"] as const;
export type Sens16Topic = typeof SENS16_TOPICS[number];
export type Sens16Readout = { numericCount: number; skippedCount: number; requiredCount: 4; sum: number | null; mean: number | null };
export type Sens16Result = Record<Sens16Topic, Sens16Readout>;
export type Sens16Questionnaire = Questionnaire & { kind: "sens16"; sens16: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const prompts = [
  {
    "en": "I noticed a change in the lighting of a familiar room only after someone pointed it out.",
    "zh": "熟悉房间的光线变了，我直到有人指出才察觉。"
  },
  {
    "en": "During a shared task, I became aware that a background sound had stopped only when someone mentioned it.",
    "zh": "共同做事时，我直到有人提起才意识到背景声音已经停了。"
  },
  {
    "en": "I realised that the feel of something I routinely handled had changed only after a second, explicit cue.",
    "zh": "经常拿用的东西手感变了，我在第二次明确提示后才意识到。"
  },
  {
    "en": "After an ordinary room temperature change, I noticed it later when another person drew attention to it.",
    "zh": "房间温度发生普通变化后，另一个人提醒时我才察觉。"
  },
  {
    "en": "When I could freely choose the setup for a quiet task, I added a gentle sound because I wanted more sensory input.",
    "zh": "可以自由布置安静任务的环境时，我因想多一点感官输入而加了轻柔声音。"
  },
  {
    "en": "During an ordinary pause, I chose a brief, comfortable movement because sitting still felt too lacking in sensory input.",
    "zh": "普通休息间隙，静坐感觉感官输入太少，我会选择短暂且舒适的活动。"
  },
  {
    "en": "When choosing among equally practical materials, I deliberately picked a noticeable texture for the sensation itself.",
    "zh": "在同样实用的材料中选择时，我会为了触感本身而特意选质感明显的材料。"
  },
  {
    "en": "While setting up a personal space, I added a visual detail because I wanted more to look at.",
    "zh": "布置个人空间时，我因想多一点可看的东西而增加视觉细节。"
  },
  {
    "en": "A background sound repeatedly pulled my attention away from an ordinary task while I stayed in the same setup.",
    "zh": "保持原来环境做普通任务时，背景声音反复把我的注意拉走。"
  },
  {
    "en": "A change in surrounding brightness kept interrupting what I was doing even though I did not alter the setting.",
    "zh": "周围亮度的变化不断打断正在做的事，但我没有调整环境。"
  },
  {
    "en": "The feel of a material kept drawing my attention away from a task while I continued using it.",
    "zh": "继续使用某种材料做事时，它的触感不断把我的注意拉走。"
  },
  {
    "en": "A background smell kept intruding on my attention while I stayed with an otherwise ordinary activity.",
    "zh": "继续一项普通活动时，背景气味不断闯入我的注意。"
  },
  {
    "en": "I deliberately reduced unnecessary background sound before or during a task because that input felt unwelcome.",
    "zh": "任务前或过程中，因为不想要那种输入，我会特意减少不必要的背景声音。"
  },
  {
    "en": "I chose an available place with fewer changing visual inputs because I wanted less sensory input.",
    "zh": "有地方可选时，我因想减少感官输入而选择视觉变化更少的位置。"
  },
  {
    "en": "I changed an optional material or surface to reduce a touch sensation I did not want.",
    "zh": "可以选择材料或表面时，我会为了减少不想要的触感而更换它。"
  },
  {
    "en": "When I could choose the setting, I selected one with less background scent because I wanted less smell input.",
    "zh": "可以选择环境时，我因想减少气味输入而选背景气味更少的地方。"
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

export function isSens16ConfigurationValid(q: unknown): q is Sens16Questionnaire {
  if (!record(q) || q.slug !== "sensory-sensitivity" || q.kind !== "sens16" || q.code !== "FM_SENS16" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 5 || !record(q.source)
    || q.source.kind !== "fermatmind_original_sensory_response_reflection" || q.source.formCode !== "fm_sens16_original_v1"
    || q.source.itemBankVersion !== "fm_sens16_original_bilingual_v1" || q.source.scoringVersion !== "four_topics_4_direct_0to4_completegroups_no_total_axes_or_winner_v1"
    || q.source.resultContentVersion !== "fm_sens16_four_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "0bc46df92095b872a9c928350fdc89867b8e25ff2bfc2d4a3028511dca579939" || q.source.resultContentSha256 !== "89651349ef2e4e645b15184fb2a2b415ef1b729b6955f4641856bd31d0ba1abc"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.sens16) || ![q.sens16.subtitle, q.sens16.privacy, q.sens16.editionNotice, q.sens16.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 16 || !Array.isArray(q.directions) || q.directions.length !== 4
    || !Array.isArray(q.profiles) || q.profiles.length !== 4) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === SENS16_TOPICS[i] && d.itemCount === 4 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === `SEN_${String(i + 1).padStart(2, "0")}`
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === 6 && Array.from(question.options).every((o, j) => record(o)
      && o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j) && o.directionId === SENS16_TOPICS[Math.floor(i / 4)]
      && record(o.label) && o.label.en === anchors[j].en && o.label.zh === anchors[j].zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === SENS16_TOPICS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 2 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2022.811547/full", "https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Motor-Sensory/Adolescent-Adult-Sensory-Profile/p/100000434"][i]);
}

/** All four numeric responses are required per topic. NA is never imputed; no total or axis is calculated. */
export function scoreSens16(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 16; result: Sens16Result } {
  if (!isSens16ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !["0", "1", "2", "3", "4", "na"].includes(v))) return { status: "invalid", answered: 0 };
  if (entries.length !== 16) return { status: "incomplete", answered: entries.length };
  const result = {} as Sens16Result;
  for (const id of SENS16_TOPICS) {
    const values = q.questions.filter(s => s.options[0].directionId === id).map(s => answers[s.id]).filter(v => v !== "na").map(Number);
    const sum = values.reduce((a, b) => a + b, 0), rated = values.length;
    result[id] = { numericCount: rated, skippedCount: 4 - rated, requiredCount: 4, sum: rated >= 4 ? sum : null, mean: rated >= 4 ? sum / rated : null };
  }
  return { status: "complete", answered: 16, result };
}
