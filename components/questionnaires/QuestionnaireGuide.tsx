import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuestionnaireCharacterSource } from "./QuestionnaireCharacterSource";
import { QuestionnairePpsAttribution } from "./QuestionnairePpsAttribution";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

type Props = { params: Promise<{ locale: string; slug: string; profile: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug, profile: id } = await params, locale = resolveLocale(input);
  const quiz = await loadQuestionnaire(slug), profile = quiz?.profiles.find(p => p.id === id);
  if (!quiz || !profile) return { title: "Result guide unavailable", robots: { index: false, follow: false } };
  return buildPageMetadata({ locale, pathname: questionnaireGuidePath(locale, slug, id), title: profile.seo?.title[locale] ?? `${profile.title[locale]} · ${quiz.title[locale]}`, description: profile.seo?.description[locale] ?? profile.summary[locale], imagePath: `/og/fun/${slug}?locale=${locale}&portrait=${id}&v=${quiz.version}`, alternatesByLocale: { en: questionnaireGuidePath("en", slug, id), zh: questionnaireGuidePath("zh", slug, id), xDefault: questionnaireGuidePath("en", slug, id) } });
}
export default async function QuestionnaireResultGuide({ params }: Props) {
  const { locale: input, slug, profile: id } = await params, locale = resolveLocale(input), zh = locale === "zh";
  const quiz = await loadQuestionnaire(slug), profile = quiz?.profiles.find(p => p.id === id);
  if (!quiz || !profile) notFound();
  const path = questionnaireGuidePath(locale, slug, id), entry = questionnairePath(locale, slug);
  return <main className="bg-slate-50 py-10 text-slate-950"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "公开结果说明" : "Public result explanation"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">{profile.title[locale]}</h1>
    <p className="my-5 leading-8 text-slate-600">{quiz.kind === "attachment" ? (zh ? "本页解释成人两维框架的一种风格原型，不是本次派给你的类型或私人答卷。完整测试分别呈现关系担心与亲近退缩的连续均分，四份说明都可先读，不以固定阈值划分人群。" : "This page explains one adult prototype in a two-dimensional framework, not a type assigned to you or a private attempt. The full test presents continuous means for worry and distance from closeness. All four guides can be read first, without fixed cutoffs dividing people into groups.") : quiz.kind === "affection" ? (zh ? "本页解释同一种关心方式的表达与接收两侧，不是个人答卷或均分。完整测试分别呈现十项自评；每侧至少3条有效评分才显示均分，不排名或强派类型。" : "This guide explains giving and receiving for one way of caring, not a personal attempt or mean. The full test presents ten separate summaries; each side needs at least three ratings for a mean, without ranking or forced types.") : quiz.kind === "optimism" ? (zh ? "本页是IPIP乐观原始总分的一份公开读法，不是私人答卷或固定人格。十条全部有效才生成个人总分与均分；五份阅读区域及18、26、34、42边界两份并列为本站编辑约定，不是官方类型或人群常模。" : "This is one public reading of an IPIP Optimism raw total, not a private attempt or fixed personality. All ten ratings are required for a personal total and mean. Five regions and both adjacent guides at 18, 26, 34 and 42 are website editorial conventions, not official types or population norms.") : quiz.kind === "extraversion" ? (zh ? "本页是IPIP外向性原始分数的一种公开读法，不是个人答卷。十项全部有效才生成总分和均分；四种阅读区间与边界并列是本站约定，不是IPIP官方人格分类或人群常模。" : "This is a public reading of an IPIP extraversion raw score, not a personal attempt. All ten ratings are required for a total and mean. Four reading bands and adjacent boundary matches are website conventions, not official IPIP personality categories or population norms.") : quiz.kind === "alignment" ? (zh ? "本页是两轴九阵营框架的公开解释，不是个人答卷或道德判定。完成24题后才显示本次计数与全部边界匹配；这里可以先读含义、相邻比较和计分局限。" : "This is a public explanation of a two-axis character alignment, not a personal attempt or moral verdict. Your counts and every boundary match appear only after all 24 items; read the meaning, neighbouring comparisons and scoring limits here first.") : quiz.kind === "likert" ? (zh ? `本页说明其中一部分的计算和读法，不是你的个人均分。完整作答后会同时呈现${quiz.directions.length}部分；资料不足时明确显示，不用零分代替。` : `This guide explains one part of the reflection, not your personal mean. A complete attempt presents all ${quiz.directions.length} parts together and marks insufficient information explicitly, rather than substituting a zero.`) : (zh ? "本页介绍满足对应原始计数规则时怎样阅读结果，不关联任何人的答案或成绩。你可以先阅读，再决定是否作答。" : "This guide explains how to read a result when its raw-count rule is met. It is not a record of anyone's answers or score. You can read it before deciding whether to take the test.")}</p>
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "免费开始完整测试" : "Start the full test for free"}</Link>
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} /></div>
    {quiz.slug === "character-strengths" && <QuestionnaireCharacterSource locale={locale} />}
    {quiz.slug === "people-pleaser" && <QuestionnairePpsAttribution locale={locale} />}
    <section className="my-8" aria-labelledby="other-questionnaire-results"><h2 id="other-questionnaire-results" className="text-2xl font-semibold">{zh ? "比较其他结果" : "Compare other results"}</h2><ul className="mt-4 space-y-2">{quiz.profiles.filter(p => p.id !== id).map(other => <li key={other.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, slug, other.id)}>{other.title[locale]}</Link></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8"><h2 className="text-2xl font-semibold">{zh ? "计分与阅读问题" : "Scoring and reading questions"}</h2>{quiz.faq.slice(0, 3).map((faq, index) => <section key={index}><h3 className="font-semibold">{faq.question[locale]}</h3><p className="mt-2">{faq.answer[locale]}</p></section>)}</section>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回测试，作出自己的选择" : "Return to the test and make your own choices"}</Link>
    <p className="mt-8 text-sm text-slate-600">{zh ? "内容版本" : "Content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
