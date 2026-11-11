import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { ApiError } from "@/lib/api-client";
import { globalHistoryPath } from "@/lib/entertainment/global-history/config";
import { traditionalPracticeSlugs } from "@/lib/i18n/traditionalPracticePaths";
import { loadTraditionalPractice } from "@/lib/i18n/zh-TW/practiceQuestionnaires";
import { traditionalUi } from "@/lib/i18n/zh-TW/chiikawa";
import { relationshipQuestionnaireSlugs } from "@/lib/i18n/relationshipQuestionnairePaths";
import { loadTraditionalRelationshipQuestionnaire } from "@/lib/i18n/zh-TW/relationshipQuestionnaire";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const loadDirectory = cache(async () => {
  try {
    return await getTestsHubContent("zh-TW");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadDirectory();
  return {
    title: content?.seo.title ?? traditionalUi.hub["zh-TW"],
    description: content?.seo.description ?? traditionalUi.available["zh-TW"],
    alternates: {
      canonical: `${SITE_URL}/zh-TW/tests`,
      languages: content ? {
        en: `${SITE_URL}/en/tests`,
        "zh-CN": `${SITE_URL}/zh/tests`,
        "zh-TW": `${SITE_URL}/zh-TW/tests`,
        "x-default": `${SITE_URL}/zh/tests`,
      } : undefined,
    },
  };
}

export default async function TraditionalTestsDirectory() {
  const [content, quizzes, practices] = await Promise.all([
    loadDirectory(),
    Promise.all(relationshipQuestionnaireSlugs.map(loadTraditionalRelationshipQuestionnaire)),
    Promise.all(traditionalPracticeSlugs.map(loadTraditionalPractice)),
  ]);
  const practiceSection = <section aria-labelledby="traditional-practice-quizzes" className="mt-8 space-y-4">
    <h2 id="traditional-practice-quizzes" className="text-2xl font-bold">知識與技能練習</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {practices.filter(item => item !== null).map(({ quiz }) => <Link key={quiz.slug} href={questionnairePath("zh-TW", quiz.slug)} className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-xl font-semibold underline">{quiz.title.zh}</h3>
        <p className="mt-3 leading-7">{quiz.description.zh}</p>
      </Link>)}
    </div>
  </section>;
  if (!content) return <><TraditionalPilotTests />{practiceSection}</>;

  return <>
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/tests" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/tests" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <nav aria-label="測驗分類" className="mb-5 flex flex-wrap gap-5">
      <Link href="/zh-TW/tests/category/personality" className="inline-flex min-h-11 items-center underline">人格與風格</Link>
      <Link href="/zh-TW/tests/category/career" className="inline-flex min-h-11 items-center underline">職業與方向</Link>
    </nav>
    <TestsHubExperience content={content} locale="zh-TW" />
    <section id="interactive-stories" aria-labelledby="traditional-interactive-stories" className="mt-8 space-y-4">
      <h2 id="traditional-interactive-stories" className="text-2xl font-bold">互動故事</h2>
      <Link prefetch={false} href="/zh-TW/tests/play" className="block rounded-xl border border-slate-200 p-5 underline">
        瀏覽繁體故事測驗
      </Link>
      <Link prefetch={false} href={globalHistoryPath("zh-TW")} className="block rounded-xl border border-slate-200 p-5 underline">
        你的性格最像哪位歷史人物？全球卷
      </Link>
    </section>
    <section aria-labelledby="relationship-quizzes" className="mt-8 space-y-4">
      <h2 id="relationship-quizzes" className="text-2xl font-bold">關係與溝通</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.filter((quiz) => quiz !== null).map((quiz) => <Link key={quiz.slug} href={questionnairePath("zh-TW", quiz.slug)} className="rounded-xl border border-slate-200 p-5">
          <h3 className="text-xl font-semibold underline">{quiz.title.zh}</h3>
          <p className="mt-3 leading-7">{quiz.description.zh}</p>
        </Link>)}
      </div>
    </section>
  </>;
}
