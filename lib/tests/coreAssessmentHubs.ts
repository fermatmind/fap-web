import { CAREER_ASSESSMENT_LANDING_PATH } from "@/lib/career/assessmentEntry";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { DisplayLocale } from "@/lib/i18n/locales";

type Copy = readonly [zh: string, traditional: string, en: string];
export type CoreHub = "career" | "mbti" | "holland";

export const coreHubPaths = {
  career: CAREER_ASSESSMENT_LANDING_PATH,
  mbti: `/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}`,
  holland: `/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}`,
} as const;

export function hubCopy(locale: DisplayLocale, copy: Copy) {
  return copy[locale === "zh" ? 0 : locale === "zh-TW" ? 1 : 2];
}

export const coreHubContent = {
  career: {
    label: ["职业测试（94题）", "職涯測驗（94 題）", "Career Assessment (94 questions)"],
    question: ["哪些工作值得我进一步了解？", "哪些工作值得我進一步了解？", "Which roles should I explore next?"],
    timing: ["94题 · 约12–15分钟", "94 題 · 約 12–15 分鐘", "94 questions · about 12–15 min"],
    dimensions: ["职业兴趣42题、工作方式20题、工作条件24题、当前情况8题。当前情况用于记录背景。", "職涯興趣 42 題、工作方式 20 題、工作條件 24 題、目前情況 8 題。現況用於記錄背景。", "42 interest, 20 work-style, 24 work-condition and 8 background questions. Background questions provide context."],
    result: ["六维兴趣概览与初步职业候选，深度报告可选付费", "六維興趣概覽與初步職涯選項，深度報告可選購", "Six-interest overview and initial roles; optional paid deep report"],
    audience: ["选专业、找工作或考虑转行的人", "正在選科系、找工作或考慮轉職的人", "Choosing a major, looking for work or changing careers"],
  },
  mbti: {
    label: ["MBTI测试", "MBTI 人格測驗", "MBTI-style personality test"],
    question: ["我习惯怎样获取信息、做决定和与人合作？", "我習慣如何取得資訊、做決定及與人合作？", "How do I prefer to take in information, decide and work with others?"],
    timing: ["93题约10分钟，144题约15分钟", "93 題約 10 分鐘，144 題約 15 分鐘", "93 questions in about 10 min or 144 in about 15 min"],
    dimensions: ["源自荣格心理类型理论的四组偏好 E/I、S/N、T/F、J/P。荣格八维是类型解读框架。", "源自榮格心理類型理論的四組偏好 E/I、S/N、T/F、J/P。榮格八維是類型解讀框架。", "Four preference pairs rooted in Jung’s psychological types: E/I, S/N, T/F and J/P. Cognitive functions are an interpretive framework."],
    result: ["四字母类型、四组偏好与沟通和工作情境解读", "四字母類型、四組偏好與溝通及工作情境解讀", "Four-letter type, four preference pairs and guidance for work and communication"],
    audience: ["想理解自我、沟通和协作偏好的人", "想了解自己、溝通及合作偏好的人", "Exploring self-understanding, communication or collaboration"],
  },
  holland: {
    label: ["霍兰德职业兴趣测试", "霍蘭德職業興趣測驗", "Holland Code Interest Test"],
    question: ["我更愿意投入哪些工作活动？", "我更願意投入哪些工作活動？", "Which work activities would I enjoy doing?"],
    timing: ["60题 · 约8分钟", "60 題 · 約 8 分鐘", "60 questions · about 8 min"],
    dimensions: ["霍兰德 RIASEC 六类活动兴趣，每维10题。", "霍蘭德 RIASEC 六類活動興趣，每個面向 10 題。", "Six Holland RIASEC interests, with 10 questions per dimension."],
    result: ["0–100量尺分数、六维兴趣排序和前三字母代码", "0–100 量尺分數、六維興趣排序及前三字母代碼", "Six interest scores on a 0–100 scale and a three-letter code"],
    audience: ["想从具体活动着手缩小探索范围的人", "想從具體活動縮小探索範圍的人", "Starting career exploration with specific activities"],
  },
} as const satisfies Record<CoreHub, Record<string, Copy>>;

export const coreHubOrder = ["career", "mbti", "holland"] as const;
