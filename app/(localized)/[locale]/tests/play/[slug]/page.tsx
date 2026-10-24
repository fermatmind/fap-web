import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { JsonLd } from "@/components/seo/JsonLd";
import catalog from "@/lib/entertainment/catalog.json";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug } = await params;
  const locale = resolveLocale(input);
  const quiz = await loadFunQuiz(slug);
  if (!quiz) return { title: "Quiz unavailable", robots: { index: false, follow: false } };
  return buildPageMetadata({ locale, pathname: `/${locale}/tests/play/${slug}`, title: quiz.title[locale], description: quiz.description[locale], alternatesByLocale: { en: `/en/tests/play/${slug}`, zh: `/zh/tests/play/${slug}`, xDefault: `/en/tests/play/${slug}` } });
}

export default async function FunQuizPage({ params }: Props) {
  const { locale: input, slug } = await params;
  const locale = resolveLocale(input);
  const quiz = await loadFunQuiz(slug);
  if (!quiz) notFound();
  const zh = locale === "zh";
  const card = catalog.find(item => item.slug === slug)!;
  const questionCount = card.minQuestionCount === card.questionCount ? `${card.questionCount}` : `${card.minQuestionCount}–${card.questionCount}`;
  const path = `/${locale}/tests/play/${slug}`;
  return <main className="bg-slate-50 py-10 text-slate-950">
    <Container className="max-w-3xl">
      <JsonLd id={`fun-breadcrumb-${slug}`} data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
      <JsonLd id={`fun-page-${slug}`} data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
      <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
      <p className="text-sm font-semibold text-violet-800">{zh ? "原创 · 轻娱乐 · 完整结果免费" : "Original · Just for fun · Full results free"}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
      <p className="mt-3 text-sm text-slate-600">{zh ? `${questionCount} 题 · 约 ${quiz.minutes} 分钟 · 无需注册或先做其他测试` : `${questionCount} questions · about ${quiz.minutes} minutes · no signup or prerequisite test`}</p>
      <FunQuizClient quiz={quiz} locale={locale} />
      <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{zh ? "这次探索什么？" : "What does this quiz explore?"}</h2><p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
      <section className="my-8 space-y-4 leading-8" aria-labelledby="quiz-method"><h2 id="quiz-method" className="text-2xl font-semibold">{zh ? "结果怎样产生？" : "How is your result decided?"}</h2>
        <p>{quiz.mechanism === "tally" ? (zh ? "每个选项给对应的故事画像累计分数。最高分画像成为本次结果；同分时会完整展示所有并列画像，按事先设定的顺序排列，不随机抽取。这些分数只服务于本故事，不是心理量尺或人群排名。" : "Each option adds its declared points to a story portrait. The highest total leads; ties show every leading portrait in the authored order. No result is drawn at random. Points belong only to this story, not a psychological scale or population ranking.") : (zh ? "每次选择沿明确的故事分支前进，最终抵达写好的结局。修改前面的选择会清除后续分支答案；相同选择路径得到相同结局，不随机抽取。" : "Each choice follows an explicit story branch to an authored ending. Changing an earlier choice clears later branch answers. The same path gives the same ending, without a random draw.")}</p>
        <p>{zh ? "所有题目、完整画像、生活例子与小行动均免费。答案在浏览器内计算，不发送至服务器，也不写入网址。只有你主动勾选后，本标签页才临时保存进度；24小时后失效，题目版本变更后不再恢复；完成、退出清除或重测会删除。浏览器禁止存储时，仍可在当前页面完成。" : "Every question, full portrait, example, and small experiment is free. Answers are evaluated in your browser, never sent to a server or put in the URL. Tab-session saving is optional, expires after 24 hours, and is not reused after a quiz-version change. It clears on completion, exit-and-clear, or retake. You can still finish on this page if storage is unavailable."}</p>
      </section>
      <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="mb-4 text-2xl font-semibold">{zh ? "认识故事里的不同画像" : "Meet the possible portraits"}</h2>
        <p className="mb-4 leading-7 text-slate-600">{zh ? "这是公开的画像介绍，不是任何人的个人作答结果。没有哪种更优秀，你也可能在不同情境里认出不同的一面。" : "These are public portrait introductions, not anyone’s personal answers or result. No portrait is superior; different situations may bring out different sides."}</p>
        <div className="space-y-4">{quiz.results.map(result => <article className="rounded-lg border border-slate-200 bg-white p-5" key={result.id}><h3 className="text-lg font-semibold">{result.title[locale]}</h3><p className="mt-3 leading-8 text-slate-700">{result.summary[locale]}</p></article>)}</div>
      </section>
      <p className="mt-8 text-sm text-slate-600">{zh ? "内容与规则版本" : "Content and rules version"} {quiz.version} · {zh ? "实质更新" : "Substantive update"} <time dateTime={quiz.updated}>{quiz.updated}</time></p>
    </Container>
  </main>;
}
