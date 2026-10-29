import type { Questionnaire, Text } from "./types";

/** Original editorial topics. No VVIQ item, condition band, cutoff or population comparison. */
export const IMAGERY12_TOPICS = ["objects", "faces", "places", "motion"] as const;
export type Imagery12Topic = typeof IMAGERY12_TOPICS[number];
export type Imagery12Readout = { numericCount: number; skippedCount: number; requiredCount: 3; sum: number | null; mean: number | null };
export type Imagery12Result = Record<Imagery12Topic, Imagery12Readout>;
export type Imagery12Questionnaire = Questionnaire & { kind: "imagery12"; imagery12: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const prompts = [
  {
    "en": "Imagine a smooth white bowl with one blue dot on its side. Rate any mental picture of its shape and dot.",
    "zh": "想象一只光滑的白碗，碗侧有一个蓝点。给你脑中出现的碗形和蓝点画面评分。"
  },
  {
    "en": "Picture three wooden beads joined by a red string on a plain desk. Rate the visual image that comes to mind.",
    "zh": "想象三颗木珠由一根红线连着，放在普通桌面上。给脑中出现的视觉画面评分。"
  },
  {
    "en": "Imagine a striped cloth folded beside a small metal key. Rate any pictured appearance, rather than how well you understand the description.",
    "zh": "想象一块条纹布折叠后放在一把小金属钥匙旁。请评脑中画面的样子，而不是对描述理解得有多好。"
  },
  {
    "en": "Imagine an invented adult face with one eyebrow slightly raised. Rate the mental picture, if any.",
    "zh": "想象一张虚构的成年人面孔，一侧眉毛略微抬起。给脑中画面评分；没有画面也可以如实选择。"
  },
  {
    "en": "Imagine a fictional adult face seen from the side, with a short fringe above the forehead. Rate its pictured appearance.",
    "zh": "想象一张从侧面看到的虚构成年人面孔，额前有一小段刘海。给你脑中出现的外观画面评分。"
  },
  {
    "en": "Imagine an invented adult face with a small smile and round glasses. Rate any visual image you experience.",
    "zh": "想象一张虚构的成年人面孔，带一点微笑，戴圆框眼镜。给实际体验到的脑中视觉画面评分。"
  },
  {
    "en": "Imagine an empty hallway with a bench on the left and a round wall clock ahead. Rate any mental picture of the scene.",
    "zh": "想象一条空走廊，左边有长凳，前方墙上有圆钟。给脑中的场景画面评分。"
  },
  {
    "en": "Imagine a reading corner with a square rug and a narrow window. Rate its visual appearance in your mind.",
    "zh": "想象一个阅读角落，有方形地毯和窄窗。给脑中出现的视觉样子评分。"
  },
  {
    "en": "Picture an unoccupied bus shelter with a yellow sign and two grey seats. Rate any mental picture, not your knowledge of where things would be.",
    "zh": "想象一处无人的候车亭，有黄色标牌和两张灰色座椅。请评脑中画面，而不是对这些东西位置的理解。"
  },
  {
    "en": "Imagine a paper square slowly rotating above a tabletop. Rate any pictured movement in your mind.",
    "zh": "想象一个纸方片在桌面上方缓慢旋转。给你脑中出现的运动画面评分。"
  },
  {
    "en": "Imagine a green marble rolling down a short wooden ramp. Rate the visual image of that movement, if any.",
    "zh": "想象一颗绿色弹珠沿一小段木斜坡滚下。给脑中出现的运动画面评分。"
  },
  {
    "en": "Imagine a small paper flag gently moving from side to side. Rate any mental picture of the movement.",
    "zh": "想象一面小纸旗轻轻地左右摆动。给脑中出现的运动画面评分。"
  }
];
const anchors = [
  {
    "en": "No visual image to rate",
    "zh": "没有可评分的视觉画面"
  },
  {
    "en": "A barely formed visual impression",
    "zh": "只有很微弱的视觉印象"
  },
  {
    "en": "An image with a few visible features",
    "zh": "画面中有少量可辨的特征"
  },
  {
    "en": "A fairly clear image with several features",
    "zh": "画面较清楚，有几种可辨特征"
  },
  {
    "en": "A very clear, detailed mental image",
    "zh": "脑中画面很清楚，细节丰富"
  },
  {
    "en": "Did not try / unsure how to rate / prefer to skip",
    "zh": "没有尝试／不确定如何评分／不愿回答"
  }
];

export function isImagery12ConfigurationValid(q: unknown): q is Imagery12Questionnaire {
  if (!record(q) || q.slug !== "aphantasia-test" || q.kind !== "imagery12" || q.code !== "FM_IMAGERY12" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 4 || !record(q.source)
    || q.source.kind !== "fermatmind_original_visual_imagery_reflection" || q.source.formCode !== "fm_imagery12_original_v1"
    || q.source.itemBankVersion !== "fm_imagery12_original_bilingual_v1" || q.source.scoringVersion !== "four_contexts_3_direct_0to4_completegroups_no_total_v1"
    || q.source.resultContentVersion !== "fm_imagery12_four_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "90d4fc5c48bb93da95256b7bbcc69152cad9cc992aaf47e7958c742455308ecf" || q.source.resultContentSha256 !== "15152b6718145ffdf23040db57a23db2cb20fa3f5966a275cfcf9c64669210ea"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.imagery12) || ![q.imagery12.subtitle, q.imagery12.privacy, q.imagery12.editionNotice, q.imagery12.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 12 || !Array.isArray(q.directions) || q.directions.length !== 4
    || !Array.isArray(q.profiles) || q.profiles.length !== 4) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === IMAGERY12_TOPICS[i] && d.itemCount === 3 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === `IMG_${String(i + 1).padStart(2, "0")}`
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === 6 && Array.from(question.options).every((o, j) => record(o)
      && o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j) && o.directionId === IMAGERY12_TOPICS[Math.floor(i / 3)]
      && record(o.label) && o.label.en === anchors[j].en && o.label.zh === anchors[j].zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === IMAGERY12_TOPICS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11437436/", "https://pmc.ncbi.nlm.nih.gov/articles/PMC9018072/", "https://pubmed.ncbi.nlm.nih.gov/40992607/"][i]);
}

/** All three ratings are required per context. No image is zero; NA is never imputed. */
export function scoreImagery12(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 12; result: Imagery12Result } {
  if (!isImagery12ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !["0", "1", "2", "3", "4", "na"].includes(v))) return { status: "invalid", answered: 0 };
  if (entries.length !== 12) return { status: "incomplete", answered: entries.length };
  const result = {} as Imagery12Result;
  for (const id of IMAGERY12_TOPICS) {
    const values = q.questions.filter(s => s.options[0].directionId === id).map(s => answers[s.id]).filter(v => v !== "na").map(Number);
    const sum = values.reduce((a, b) => a + b, 0), rated = values.length;
    result[id] = { numericCount: rated, skippedCount: 3 - rated, requiredCount: 3, sum: rated >= 3 ? sum : null, mean: rated >= 3 ? sum / rated : null };
  }
  return { status: "complete", answered: 12, result };
}
