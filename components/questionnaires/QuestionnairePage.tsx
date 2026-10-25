import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
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
  if (!isQuestionnaireConfigurationValid(quiz)) throw new Error("QUESTIONNAIRE_CONFIGURATION_UNAVAILABLE");
  const path = questionnairePath(locale, slug);
  return <main className="bg-slate-50 py-10 text-slate-950"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{quiz.kind === "archetype" ? (zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free") : quiz.kind === "likert" ? (zh ? "原创自我观察问卷 · 完整结果免费" : "Original self-reflection questionnaire · Full results free") : (zh ? "自编风格问卷 · 完整结果免费" : "Original style questionnaire · Full results free")}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? `${quiz.questions.length}题 · 约${quiz.minutes}分钟 · 无需注册` : `${quiz.questions.length} questions · about ${quiz.minutes} minutes · no signup`}</p>
    <QuestionnaireClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-purpose"><h2 id="questionnaire-purpose" className="text-2xl font-semibold">{zh ? "这份问卷探索什么？" : "What does this test explore?"}</h2><p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "计分怎样产生结果？" : "How do choices become a result?"}</h2>{quiz.guide.filter(section => ["raw-wins-explanation", "ties-explanation", "low-direction-explanation", "facet-scoring", "facet-reading", "facet-comparison", "archetype-counts", "archetype-ties", "archetype-metaphor"].includes(section.id)).map(section => <p key={section.id}>{section.paragraphs[0][locale]}</p>)}</section>
    <section className="my-8" aria-labelledby="questionnaire-results"><h2 id="questionnaire-results" className="text-2xl font-semibold">{zh ? "全部结果说明" : "Explore every result"}</h2><p className="my-4 leading-8 text-slate-600">{quiz.kind === "likert" ? (zh ? `下方完整解释${quiz.directions.length}部分各自在观察什么。它们会在完成后同时呈现，不是互斥的人格类型；公开说明不关联任何人的答案或均分。` : `Read what each of the ${quiz.directions.length} parts explores. Your complete result presents them together; they are not mutually exclusive personality types. These public guides contain no one’s answers or personal means.`) : quiz.kind === "archetype" ? (zh ? `下方列出全部${quiz.profiles.length}份结果的完整公开说明，不关联个人作答。最高计数并列时，每份匹配报告都会完整呈现；你也可以先比较其他结果。` : `Read all ${quiz.profiles.length} complete public result guides below. They contain no private attempts. Every highest-count tie gets its full report, and you can compare other results before answering.`) : (zh ? "下面是公开说明，不是任何人的私人作答。四个单项和全部并列组合均有完整报告；先阅读也不会影响你的计分。" : "These are public explanations, not anyone's private attempt. Full reports cover all four single directions and every tied combination. Reading one does not affect your score.")}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8 text-slate-700">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="questionnaire-faq"><h2 id="questionnaire-faq" className="text-2xl font-semibold">{zh ? "关于这项测试" : "Questions about this test"}</h2>{quiz.faq.map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{faq.answer[locale]}</p></section>)}</section>
    <details className="my-8 rounded-lg border border-slate-200 bg-white p-5 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "题本、结果读法与使用范围" : "Questionnaire, reading guide and scope"}</summary>{quiz.guide.filter(section => !["raw-wins-explanation", "ties-explanation", "low-direction-explanation", "facet-scoring", "facet-reading", "facet-comparison", "archetype-counts", "archetype-ties", "archetype-metaphor"].includes(section.id)).map(section => <section key={section.id} className="mt-5"><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((text, index) => <p key={index}>{text[locale]}</p>)}</section>)}</details>
    {quiz.references?.length ? <section className="my-8 leading-8" aria-labelledby="questionnaire-references"><h2 id="questionnaire-references" className="text-xl font-semibold">{zh ? "背景研究与来源范围" : "Background research and its scope"}</h2><ul className="mt-3 list-disc pl-5">{quiz.references.map(reference => <li key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul><p className="mt-3 text-sm text-slate-600">{zh ? "这些研究提供背景，不是对本站题本的验证，也不能用于个人诊断。" : "These studies provide background, not validation of this questionnaire or an individual diagnosis."}</p></section> : null}
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time><br />{zh ? "题本／计分／报告源版本" : "Source question / scoring / report versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}
