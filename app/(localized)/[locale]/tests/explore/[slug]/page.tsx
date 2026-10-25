import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isDirectionalConfigurationValid } from "@/lib/questionnaires/scoring";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug } = await params, locale = resolveLocale(input);
  const quiz = await loadQuestionnaire(slug);
  if (!quiz) return { title: "Test unavailable", robots: { index: false, follow: false } };
  return buildPageMetadata({ locale, pathname: questionnairePath(locale, slug), title: quiz.seoTitle[locale], description: quiz.description[locale], imagePath: `/og/fun/${slug}?locale=${locale}&v=${quiz.version}`, alternatesByLocale: { en: questionnairePath("en", slug), zh: questionnairePath("zh", slug), xDefault: questionnairePath("en", slug) } });
}

export default async function QuestionnairePage({ params }: Props) {
  const { locale: input, slug } = await params, locale = resolveLocale(input), zh = locale === "zh";
  const quiz = await loadQuestionnaire(slug);
  if (!quiz) notFound();
  if (!isDirectionalConfigurationValid(quiz)) throw new Error("QUESTIONNAIRE_CONFIGURATION_UNAVAILABLE");
  const path = questionnairePath(locale, slug);
  return <main className="bg-slate-50 py-10 text-slate-950"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "自编风格问卷 · 完整结果免费" : "Original style questionnaire · Full results free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? `${quiz.questions.length}题 · 约${quiz.minutes}分钟 · 无需注册` : `${quiz.questions.length} questions · about ${quiz.minutes} minutes · no signup`}</p>
    <QuestionnaireClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-purpose"><h2 id="questionnaire-purpose" className="text-2xl font-semibold">{zh ? "这份问卷探索什么？" : "What does this test explore?"}</h2><p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "计分怎样产生结果？" : "How do choices become a result?"}</h2>{quiz.guide.filter(section => ["raw-wins-explanation", "ties-explanation", "low-direction-explanation"].includes(section.id)).map(section => <p key={section.id}>{section.paragraphs[0][locale]}</p>)}</section>
    <section className="my-8" aria-labelledby="questionnaire-results"><h2 id="questionnaire-results" className="text-2xl font-semibold">{zh ? "全部结果说明" : "Explore every result"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "下面是公开说明，不是任何人的私人作答。四个单项和全部并列组合均有完整报告；先阅读也不会影响你的计分。" : "These are public explanations, not anyone's private attempt. Full reports cover all four single directions and every tied combination. Reading one does not affect your score."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8 text-slate-700">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="questionnaire-faq"><h2 id="questionnaire-faq" className="text-2xl font-semibold">{zh ? "关于这项测试" : "Questions about this test"}</h2>{quiz.faq.map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{faq.answer[locale]}</p></section>)}</section>
    <details className="my-8 rounded-lg border border-slate-200 bg-white p-5 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "题本、结果读法与使用范围" : "Questionnaire, reading guide and scope"}</summary>{quiz.guide.filter(section => !["raw-wins-explanation", "ties-explanation", "low-direction-explanation"].includes(section.id)).map(section => <section key={section.id} className="mt-5"><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((text, index) => <p key={index}>{text[locale]}</p>)}</section>)}</details>
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time><br />{zh ? "题本／计分／报告源版本" : "Source question / scoring / report versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}
