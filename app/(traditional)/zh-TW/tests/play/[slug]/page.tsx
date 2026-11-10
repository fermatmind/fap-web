import type { Metadata } from "next";
import Link from "next/link";
import { StoryEditorialPage } from "@/components/entertainment/StoryEditorialPage";
import { quizPath } from "@/lib/entertainment/guides";
import { requireTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStoryReader";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quiz } = await requireTraditionalLegacyStory((await params).slug);
  const url = quizPath("zh-TW", quiz.slug);
  const { title, description } = quiz.seo;
  return {
    title: title.zh,
    description: description.zh,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: { title: title.zh, description: description.zh, locale: "zh_TW", url, images: [`/og/fun/${quiz.slug}?locale=zh-TW&v=${quiz.version}`] },
  };
}

export default async function TraditionalStoryPage({ params }: Props) {
  const { quiz, editorial } = await requireTraditionalLegacyStory((await params).slug);
  const displayText = await loadTraditionalAssessmentText();
  return <>
    <nav aria-label="測驗語言" className="flex flex-wrap gap-4 py-2 text-sm">
      <Link href="/zh-TW/tests/play" className="min-h-11 py-2 underline">故事測驗總覽</Link>
      <Link href={quizPath("zh", quiz.slug)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={quizPath("en", quiz.slug)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <StoryEditorialPage quiz={quiz} editorial={editorial} locale="zh" displayLocale="zh-TW" displayText={displayText} />
  </>;
}
