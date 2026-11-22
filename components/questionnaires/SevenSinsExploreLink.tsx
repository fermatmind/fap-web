import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { questionnairePath } from "@/lib/questionnaires/paths";

const copy = {
  zh: ["想对照自己的两组分数？", "28 道生活题，免费查看 14 项独立得分和红金雷达图。", "做七宗罪与七美德测试"],
  "zh-TW": ["想看看自己的兩組分數？", "28 道生活情境題，免費查看 14 項個別分數和紅金雷達圖。", "做七宗罪與七美德測驗"],
  en: ["Curious how these two traits show up in your answers?", "Answer 28 everyday questions for 14 separate scores and a red-and-gold radar chart.", "Take the Seven Deadly Sins and Seven Virtues Test"],
} as const;

export function SevenSinsExploreLink({ locale, related = false }: { locale: DisplayLocale; related?: boolean }) {
  const [heading, description, label] = copy[locale];
  return <aside className="my-6 space-y-2 rounded-xl border border-emerald-900/15 bg-emerald-50 p-4" data-seven-sins-explore-link>
    <p className="font-semibold">{related ? { zh: "试试另一种日常自我观察", "zh-TW": "試試另一種日常自我觀察", en: "Explore another side of everyday behavior" }[locale] : heading}</p><p>{description}</p>
    <Link prefetch={false} className="inline-flex min-h-11 items-center font-semibold underline" href={questionnairePath(locale, "seven-sins-virtues-test")}>{label}</Link>
  </aside>;
}
