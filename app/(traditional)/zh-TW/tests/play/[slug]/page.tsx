import type { Metadata } from "next";
import Link from "next/link";
import { BeachcomberPage } from "@/components/entertainment/BeachcomberPage";
import { BirdwatchingPage } from "@/components/entertainment/BirdwatchingPage";
import { CloudDriftPage } from "@/components/entertainment/CloudDriftPage";
import { StoryEditorialPage } from "@/components/entertainment/StoryEditorialPage";
import { contentImagePath, quizPath } from "@/lib/entertainment/guides";
import { requireTraditionalLegacyStory, requireTraditionalStoryQuiz } from "@/lib/i18n/zh-TW/legacyStoryReader";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Props = { params: Promise<{ slug: string }> };
const naturePages = {
  beachcomber: BeachcomberPage,
  "birdwatching-companion": BirdwatchingPage,
  "cloud-drift": CloudDriftPage,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = await requireTraditionalStoryQuiz((await params).slug);
  const url = quizPath("zh-TW", quiz.slug);
  const { title, description } = quiz.seo;
  return {
    title: title.zh,
    description: description.zh,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: { title: title.zh, description: description.zh, locale: "zh_TW", url, images: [contentImagePath(quiz, "zh-TW")] },
  };
}

export default async function TraditionalStoryPage({ params }: Props) {
  const { slug } = await params;
  const quiz = await requireTraditionalStoryQuiz(slug);
  const NaturePage = Object.hasOwn(naturePages, slug) ? naturePages[slug as keyof typeof naturePages] : null;
  const shared = NaturePage ? null : await requireTraditionalLegacyStory(slug);
  const displayText = shared ? await loadTraditionalAssessmentText() : undefined;
  return <>
    <nav aria-label="測驗語言" className="flex flex-wrap gap-4 py-2 text-sm">
      <Link href="/zh-TW/tests/play" className="min-h-11 py-2 underline">故事測驗總覽</Link>
      <Link href={quizPath("zh", quiz.slug)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={quizPath("en", quiz.slug)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    {NaturePage ? <NaturePage quiz={quiz} locale="zh" displayLocale="zh-TW" /> :
      <StoryEditorialPage quiz={quiz} editorial={shared?.editorial} locale="zh" displayLocale="zh-TW" displayText={displayText} />}
  </>;
}
