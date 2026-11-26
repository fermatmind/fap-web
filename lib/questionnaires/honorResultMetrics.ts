import type { DisplayLocale } from "@/lib/i18n/locales";

export type HonorMetric = { id: string; label: string; value: string; position: number };
export type HonorScale = { value: number; min: number; max: number; display: string; ticks: readonly number[] };
export type HonorResultMetrics =
  | { kind: "dimensions"; label: string; rows: HonorMetric[]; tied: boolean; tieLabel?: string }
  | { kind: "scalar" | "practice"; label: string; scale?: HonorScale; tied: boolean };

export function scalePosition(value: number, min: number, max: number) {
  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
}

export const honorMetricCopy = {
  zh: {
    practice: "本轮练习成绩", scalar: "本轮读数", dimensions: "本轮维度摘要", peaks: "本轮较突出的维度",
    missing: "资料不足", axes: "独立维度", ties: "并列项",
    eastWest: "经济轴", northSouth: "社会轴", affection: "表达与接收", affectionTie: "按两侧各自并列", fourAxes: "四条独立轴",
    challenge: (title: string, score: string) => `刚刷完「${title}」，答对 ${score} 题。换你来挑战？`,
    reading: (title: string, score: string) => `刚做完「${title}」，这回是 ${score}。好奇你的结果会是什么？`,
    scan: (title: string) => `扫码试试「${title}」`,
    scanDetail: "费马测试 · 做一轮看看 · FermatMind.com",
    badges: "本轮成绩徽标", invite: "公开测试邀请", privateExport: "图卡和分享文案只包含公开测试信息。",
  },
  "zh-TW": {
    practice: "這次練習成績", scalar: "這次分數", dimensions: "這次面向摘要", peaks: "這次較突出的面向",
    missing: "資料不足", axes: "獨立面向", ties: "並列項目",
    eastWest: "經濟軸", northSouth: "社會軸", affection: "表達與接收", affectionTie: "各側分開看並列", fourAxes: "四條獨立軸",
    challenge: (title: string, score: string) => `剛做完「${title}」，答對 ${score} 題。換你挑戰看看？`,
    reading: (title: string, score: string) => `剛做完「${title}」，這次是 ${score}。好奇你會得到什麼結果？`,
    scan: (title: string) => `掃碼試試「${title}」`,
    scanDetail: "費馬測試 · 做一輪看看 · FermatMind.com",
    badges: "這次的成績徽章", invite: "公開測驗邀請", privateExport: "圖卡和分享文字只包含公開測驗資訊。",
  },
  en: {
    practice: "Practice score", scalar: "Your score this time", dimensions: "Your dimensions", peaks: "Highest scores",
    missing: "Insufficient information", axes: "Separate dimensions", ties: "Tied scores",
    eastWest: "Economic axis", northSouth: "Social axis", affection: "Giving & Receiving", affectionTie: "Ties Within Each Side", fourAxes: "Four Independent Axes",
    challenge: (title: string, score: string) => `I got ${score} on ${title}. Want to give it a go?`,
    reading: (title: string, score: string) => `Just tried ${title} and got ${score}. Curious how yours comes out?`,
    scan: (title: string) => `Scan to try ${title}`,
    scanDetail: "Try It Yourself · FermatMind.com",
    badges: "Practice badges", invite: "Public quiz invitation", privateExport: "The card and caption only include public quiz information.",
  },
} as const satisfies Record<DisplayLocale, unknown>;

export function metricSharePayload(locale: DisplayLocale, title: string, url: string, label?: string, practiceScore?: string, verdict?: string) {
  const copy = honorMetricCopy[locale];
  const text = practiceScore ? copy.challenge(title, practiceScore) : label ? copy.reading(title, label) : title;
  return { title, text: [text, label && !practiceScore ? verdict : undefined].filter(Boolean).join("\n"), url };
}
