import type { Questionnaire, Text } from "./types";

/** Original editorial topics. No CIPS item, factor, cutoff or population comparison. */
export const IMPOSTER20_TOPICS = ["contribution", "feedback", "evaluation", "comparison", "preparation"] as const;
export type Imposter20Topic = typeof IMPOSTER20_TOPICS[number];
export type Imposter20Readout = { numericCount: number; skippedCount: number; requiredCount: 4; sum: number | null; mean: number | null };
export type Imposter20Result = Record<Imposter20Topic, Imposter20Readout>;
export type Imposter20Questionnaire = Questionnaire & { kind: "imposter20"; imposter20: { subtitle: Text; privacy: Text; editionNotice: Text; attribution: Text } };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown) => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const prompts = [
  {
    "en": "After finishing something successfully, I explained it to myself without including what I had contributed.",
    "zh": "顺利完成一件事后，我在心里解释原因时，没有把自己的具体贡献算进去。"
  },
  {
    "en": "When several people contributed to a good outcome, I treated my own part as if it did not count.",
    "zh": "几个人共同取得成果时，我觉得自己做的那部分不值得算作贡献。"
  },
  {
    "en": "I found it easier to name the circumstances behind a good outcome than the actions I had taken.",
    "zh": "回顾好结果时，我更容易说出外部条件，而说不清自己采取过的行动。"
  },
  {
    "en": "A useful result felt like an exception that told me nothing about what I could do.",
    "zh": "做出了有用的成果，我仍觉得那只是例外，完全不能说明自己能做什么。"
  },
  {
    "en": "When someone praised a specific part of my work, I mentally dismissed that part.",
    "zh": "别人肯定我做的某个具体部分时，我在心里把那部分否定了。"
  },
  {
    "en": "I assumed positive feedback was mainly politeness before checking what the person meant.",
    "zh": "还没弄清对方具体指什么，我就先认定肯定反馈主要是客气。"
  },
  {
    "en": "I left a conversation remembering a small correction but not the positive feedback given alongside it.",
    "zh": "一次交流后，我记住了一处小修正，却忘记同时收到的肯定。"
  },
  {
    "en": "I changed the subject when someone tried to discuss something I had done well.",
    "zh": "有人想具体聊我做得好的地方时，我转开了话题。"
  },
  {
    "en": "Before an ordinary review, I imagined others concluding that I did not belong in the role.",
    "zh": "普通检查或评议前，我想象别人会认为我不配待在这个位置。"
  },
  {
    "en": "I treated a question about my work as a sign that the other person doubted my whole ability.",
    "zh": "别人询问我做的事情时，我把这看成对方怀疑我的全部能力。"
  },
  {
    "en": "Not knowing one answer made me worry that everything else I had contributed would be dismissed.",
    "zh": "有一个问题答不上来，就让我担心自己其他贡献也会被全部否定。"
  },
  {
    "en": "I held back a useful question because I worried it would expose me as undeserving of my place.",
    "zh": "我担心一个有用的问题会让人觉得我不配在这里，于是没有问。"
  },
  {
    "en": "I compared another person’s polished outcome with the unfinished parts of my own work.",
    "zh": "我拿别人已经整理好的成果，比较自己尚未完成的部分。"
  },
  {
    "en": "I used someone else’s speed as evidence against myself without knowing their starting point or support.",
    "zh": "不知道别人的基础和支持条件，我就用对方的速度来否定自己。"
  },
  {
    "en": "Seeing another person succeed made my own recent progress seem not worth counting.",
    "zh": "看到别人取得进展后，我觉得自己最近的进步不值得一提。"
  },
  {
    "en": "I imagined that other people had fewer doubts because I could not see their difficulties.",
    "zh": "因为看不见别人的困难，我便想象他们比我少很多疑虑。"
  },
  {
    "en": "After meeting the agreed requirements, I kept preparing because I feared an ordinary mistake would expose me.",
    "zh": "已经达到约定要求后，我仍因害怕普通失误会暴露自己而继续准备。"
  },
  {
    "en": "I repeatedly checked something already checked because I worried one error would invalidate my place.",
    "zh": "已经检查过的内容，我因担心一个错误会否定自己的位置而反复检查。"
  },
  {
    "en": "I spent extra time hiding signs that I was still learning, rather than asking for the guidance I needed.",
    "zh": "我把额外时间花在掩饰自己仍在学习，而没有寻求需要的指导。"
  },
  {
    "en": "I postponed calling a task finished because I felt I had to prove more than the stated requirements.",
    "zh": "我觉得必须证明超出明示要求的东西，因而迟迟不把任务视为完成。"
  }
];
const anchors = [
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
    "en": "No opportunity / prefer not to answer",
    "zh": "没有对应情境／不愿回答"
  }
];

export function isImposter20ConfigurationValid(q: unknown): q is Imposter20Questionnaire {
  if (!record(q) || q.slug !== "imposter-syndrome" || q.kind !== "imposter20" || q.code !== "FM_IMPOSTER20" || q.version !== "1.0.0"
    || q.updated !== "2026-10-29" || q.category !== "framework" || q.minutes !== 6 || !record(q.source)
    || q.source.kind !== "fermatmind_original_achievement_selfdoubt_reflection" || q.source.formCode !== "fm_imposter20_original_v1"
    || q.source.itemBankVersion !== "fm_imposter20_original_bilingual_v1" || q.source.scoringVersion !== "five_topics_4_direct_0to4_min3_no_total_v1"
    || q.source.resultContentVersion !== "fm_imposter20_five_full_guides_v1" || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "0138cfbf6d8485859bebd8a97ee8ef78e1f00c7a96d97f40b6725a087e5bc9dc" || q.source.resultContentSha256 !== "8e766b1a183d70619b22a298e709a3e978ad6fc0a5599d945255cd2019eaeebf"
    || ![q.title, q.seoTitle, q.description, q.introduction, q.instructions, q.resultHeading].every(text)
    || !record(q.imposter20) || ![q.imposter20.subtitle, q.imposter20.privacy, q.imposter20.editionNotice, q.imposter20.attribution].every(text)
    || !Array.isArray(q.questions) || q.questions.length !== 20 || !Array.isArray(q.directions) || q.directions.length !== 5
    || !Array.isArray(q.profiles) || q.profiles.length !== 5) return false;
  if (!Array.from(q.directions).every((d, i) => record(d) && d.id === IMPOSTER20_TOPICS[i] && d.itemCount === 4 && text(d.title))) return false;
  if (!Array.from(q.questions).every((question, i) => record(question) && question.id === `IPR_${String(i + 1).padStart(2, "0")}`
    && question.reverse === false && question.correctOptionId === undefined && record(question.prompt)
    && question.prompt.en === prompts[i].en && question.prompt.zh === prompts[i].zh
    && Array.isArray(question.options) && question.options.length === 6 && Array.from(question.options).every((o, j) => record(o)
      && o.id === (j === 5 ? "na" : String(j)) && o.score === (j === 5 ? null : j) && o.directionId === IMPOSTER20_TOPICS[Math.floor(i / 4)]
      && record(o.label) && o.label.en === anchors[j].en && o.label.zh === anchors[j].zh))) return false;
  if (!Array.from(q.profiles).every((p, i) => record(p) && p.id === IMPOSTER20_TOPICS[i]
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === p.id
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && [p.seo.title, p.seo.description].every(text)
    && Array.isArray(p.sections) && p.sections.length === 7 && new Set(p.sections.map(s => record(s) ? s.id : null)).size === 7
    && Array.from(p.sections).every(s => record(s) && typeof s.id === "string" && !!s.id && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 4 && Array.from(q.guide).every((s, i) => record(s) && s.id === ["method", "scoring", "limits", "next"][i]
    && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 6 && Array.from(q.faq).every(f => record(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 3 && Array.from(q.references).every((r, i) => record(r) && text(r.title)
      && r.url === ["https://pmc.ncbi.nlm.nih.gov/articles/PMC13129615/", "https://pubmed.ncbi.nlm.nih.gov/41801596/", "https://www.clanceimpostorphenomenonscale.org/researchers"][i]);
}

/** Every choice must be explicit. The min-three policy is editorial, not validated imputation. */
export function scoreImposter20(q: unknown, answers: unknown): { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 20; result: Imposter20Result } {
  if (!isImposter20ConfigurationValid(q)) return { status: "unavailable", answered: 0 };
  if (!record(answers) || Reflect.ownKeys(answers).length !== Object.keys(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.entries(answers);
  if (entries.some(([id, v]) => !q.questions.some(s => s.id === id) || typeof v !== "string" || !["0", "1", "2", "3", "4", "na"].includes(v))) return { status: "invalid", answered: 0 };
  if (entries.length !== 20) return { status: "incomplete", answered: entries.length };
  const result = {} as Imposter20Result;
  for (const id of IMPOSTER20_TOPICS) {
    const values = q.questions.filter(s => s.options[0].directionId === id).map(s => answers[s.id]).filter(v => v !== "na").map(Number);
    const sum = values.reduce((a, b) => a + b, 0), rated = values.length;
    result[id] = { numericCount: rated, skippedCount: 4 - rated, requiredCount: 4, sum: rated >= 3 ? sum : null, mean: rated >= 3 ? sum / rated : null };
  }
  return { status: "complete", answered: 20, result };
}
