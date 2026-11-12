import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { notFound } from "next/navigation";
import { cache } from "react";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { relationshipQuestionnaireRoute } from "@/lib/i18n/relationshipQuestionnairePaths";
import { loadTraditionalRelationshipQuestionnaire } from "@/lib/i18n/zh-TW/relationshipQuestionnaire";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { SITE_URL } from "@/lib/site";

const loadPage = cache(async (path: string) => {
  const suffix = path.slice("/zh-TW".length);
  const route = relationshipQuestionnaireRoute(suffix);
  if (!route) notFound();
  const quiz = await loadTraditionalRelationshipQuestionnaire(route.slug);
  if (!quiz) notFound();
  const profile = quiz.profiles.find((item) => item.id === route.profileId);
  if (route.profileId && !profile) notFound();
  return { quiz, profile, route, suffix, entry: questionnairePath("zh-TW", quiz.slug) };
});

export async function relationshipQuestionnaireMetadata(path: string): Promise<Metadata> {
  const { quiz, profile, route, entry } = await loadPage(path);
  if (route.take) return questionnaireTakeMetadata(quiz.title.zh, `${SITE_URL}${entry}`);
  const title = profile?.seo?.title.zh ?? profile?.title.zh ?? quiz.seoTitle.zh;
  const description = profile?.seo?.description.zh ?? profile?.summary.zh ?? quiz.description.zh;
  return {
    title, description, alternates: { canonical: `${SITE_URL}${path}` },
    robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", type: "website", url: `${SITE_URL}${path}` },
  };
}

export async function RelationshipQuestionnairePage({ path }: { path: string }) {
  const { quiz, profile, route, suffix, entry } = await loadPage(path);
  if (route.take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <QuestionnaireClient quiz={quiz} locale="zh" />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const languages = <nav aria-label="測驗語言" className="flex flex-wrap gap-5 text-sm">
    <span aria-current="page" className="min-h-11 py-2">繁體中文</span>
    <Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
    <Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link>
  </nav>;
  const start = <Link href={`${entry}/take`} className="inline-block min-h-11 rounded-full bg-slate-900 px-7 py-3 font-semibold text-white">開始免費測驗</Link>;

  if (profile) return <Container as="main" className="space-y-6 py-10">
    {languages}
    <h1 className="text-3xl font-bold sm:text-4xl">{profile.title.zh}</h1>
    <p>公開閱讀指南，個人作答與分數只會顯示在本次測驗結果。</p>
    <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale="zh" traditional headingLevel={2} />
    <div className="flex flex-wrap gap-5">
      <Link href={entry} className="min-h-11 py-2 underline">返回測驗介紹</Link>{start}
    </div>
  </Container>;

  return <main className="bg-slate-50 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl space-y-8">
    {languages}
    <ExploreTestIntro slug={quiz.slug} locale="zh-TW">
      <h1>{quiz.title.zh}</h1>
      <p>{quiz.description.zh}</p>
      <div id="take-test" className="space-y-4">
        <Link href={`${entry}/take`} className="explore-intro-entry" data-explore-start>開始免費測驗<span aria-hidden="true">→</span></Link>
        {quiz.instructions && <p className="text-sm leading-7 text-slate-600">{quiz.instructions.zh}</p>}
      </div>
    </ExploreTestIntro>
    <p className="whitespace-pre-line leading-8">{quiz.introduction.zh}</p>
    {quiz.guide.map((section) => <section key={section.id} className="space-y-3">
      <h2 className="text-2xl font-semibold">{section.title.zh}</h2>
      {section.paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line leading-8">{paragraph.zh}</p>)}
    </section>)}
    <section className="space-y-4" aria-labelledby="relationship-guides">
      <h2 id="relationship-guides" className="text-2xl font-bold">完整閱讀指南</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {quiz.profiles.map((item) => <Link key={item.id} href={questionnaireGuidePath("zh-TW", quiz.slug, item.id)} className="rounded-xl border border-slate-200 p-5">
          <h3 className="text-xl font-semibold underline">{item.title.zh}</h3>
          <p className="mt-3 leading-7">{item.summary.zh}</p>
        </Link>)}
      </div>
    </section>
    <section className="space-y-4" aria-labelledby="relationship-faq">
      <h2 id="relationship-faq" className="text-2xl font-bold">常見問題</h2>
      {quiz.faq.map((item, index) => <div key={index}>
        <h3 className="text-xl font-semibold">{item.question.zh}</h3>
        <p className="mt-2 whitespace-pre-line leading-8">{item.answer.zh}</p>
      </div>)}
    </section>
    {quiz.references?.length ? <section className="space-y-4" aria-labelledby="relationship-references">
      <h2 id="relationship-references" className="text-2xl font-bold">參考資料</h2>
      <ul className="list-disc space-y-3 pl-5">
        {quiz.references.map((item) => <li key={item.url}><a href={item.url} className="underline">{item.title.zh}</a></li>)}
      </ul>
    </section> : null}
  </Container></main>;
}
