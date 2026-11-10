import { LoveLanguageExamples } from "./LoveLanguageExamples";
import { RelatedFantasyQuizzes } from "./RelatedFantasyQuizzes";
import Image from "next/image";
import Link from "next/link";
import copy from "@/lib/questionnaires/eightQuizEditorial.json";
import { eightQuizScene } from "@/lib/questionnaires/eightQuizCard";
import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { QuizResultArtwork } from "./QuizResultArtwork";

export function eightQuizLabel(slug: string, id: string, locale: Locale) {
  return (copy as Record<string, { labels: Record<string, Text> }>)[slug]?.labels[id]?.[locale];
}
export function hasTraditionalEightQuizOverview(slug: string) {
  return ["hogwarts-house-quiz", "hazbin-hotel-character-quiz", "hello-kitty"].includes(slug);
}

export function EightQuizOverview({ quiz, locale, compact = false, traditionalCopy }: {
  quiz: Questionnaire; locale: Locale; compact?: boolean; traditionalCopy?: (text: string) => string;
}) {
  const entry = (copy as Record<string, { heading: Text; intro: Text; labels: Record<string, Text>; related?: { slug: string; text: Text } }>)[quiz.slug];
  if (!entry) return null;
  const scene = eightQuizScene[quiz.slug], zh = locale === "zh";
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const relatedTraditional = entry.related && (hasTraditionalArchetype(entry.related.slug) || entry.related.slug === "chiikawa");
  const copyText = (source: string) => traditionalCopy
    ? traditionalCopy(source).replaceAll("測試", "測驗").replaceAll("分院帽", "分類帽").replaceAll("標籤頁", "分頁")
    : source;
  const Heading = compact ? "p" : "h2";
  const titleId = `${quiz.slug}-${compact ? "result-" : ""}comparison-title`;
  return <section data-eight-quiz-overview={quiz.slug} className="my-8 space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby={titleId}>
    <Heading id={titleId} className="text-2xl font-semibold">{copyText(entry.heading[locale])}</Heading>
    <p className="leading-8">{copyText(entry.intro[locale])}</p>
    {!compact && quiz.slug === "love-languages" && <LoveLanguageExamples locale={locale} />}
    {scene && <Image src={scene} width={1200} height={800} alt={zh ? copyText("本版原创主题场景插画") : "Original thematic illustration for this edition"} className="h-auto w-full rounded-lg" />}
    {Object.keys(entry.labels).length > 0 && <ul className={`grid gap-3 ${quiz.slug === "moral-alignment" ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 p-4">
      {quiz.slug === "spirit-animal" && <QuizResultArtwork slug={quiz.slug} id={profile.id} />}
      <Link prefetch={false} href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{profile.title[locale]}</Link>
      <p className="mt-1 leading-7">{copyText(entry.labels[profile.id]?.[locale] ?? "")}</p>
    </li>)}</ul>}
    {Object.keys(entry.labels).length > 0 && <p className="text-sm leading-7 text-slate-600">{zh ? copyText("指南在新标签页打开，便于并排比较并保留本页进度。每份完整指南免费。") : "Guides open in a new tab so you can compare them while keeping your progress here. Every complete guide is free."}</p>}
    {entry.related && <Link prefetch={false} target="_blank" rel="noopener" className="block min-h-11 py-2 leading-7 underline" href={questionnairePath(relatedTraditional ? displayLocale : locale, entry.related.slug)} hrefLang={traditionalCopy && !relatedTraditional ? "zh-CN" : undefined}>{copyText(entry.related.text[locale])} {zh ? copyText("（新标签页）") : "(new tab)"}</Link>}
    {!compact && <RelatedFantasyQuizzes slug={quiz.slug} locale={locale} traditional={Boolean(traditionalCopy)} traditionalCopy={traditionalCopy ? copyText : undefined} />}
    {quiz.slug === "sbti-test" && <details className="leading-7"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copyText("本版包含DRUNK和HHHH吗？有隐藏加题吗？") : "Does this edition include DRUNK and HHHH or hidden extra questions?"}</summary><p>{zh ? copyText("包含。DRUNK与HHHH都在本版25个候选代码中，固定31题全部完成后按本版引擎解析。这里没有照搬其他站点的条件加题或指定答案直达隐藏类型的攻略；请按实际感受作答。") : "Yes. DRUNK and HHHH are both among this edition’s 25 candidate codes. This engine resolves the result after all 31 fixed questions are complete. It does not use other sites’ extra conditional screens or answer shortcuts to a hidden type. Answer according to your actual preferences."}</p></details>}
    {quiz.slug === "sbti-test" && <details className="leading-7"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copyText("为什么其他SBTI站的隐藏结果不能照搬？") : "Why can’t I use another SBTI site’s hidden-result instructions?"}</summary><p>{zh ? copyText("请以本页25幅画像和31题的实际版本为准。SBTI是网络娱乐人格梗，与MBTI偏好测评是不同产品；英文同名SBTi（科学碳目标倡议）也与本测试无关。") : "Use this page’s actual 25-portrait, 31-question edition. SBTI is an internet personality meme, separate from MBTI preference assessments and unrelated to the Science Based Targets initiative (SBTi)."}</p></details>}
  </section>;
}
