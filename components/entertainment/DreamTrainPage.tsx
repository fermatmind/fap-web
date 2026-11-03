import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { FunQuizClient } from "./FunQuizClient";
import { dreamTrainSections, dreamTrainFaq } from "./DreamTrainEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#dream-train-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DreamTrainPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "dream-train") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/dream-train`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "每次3至4次选择 · 约2分钟 · 无需注册" : "3–4 choices per reading · About 2 minutes · No registration"}</span><span>{zh ? "原创分支短篇 · 三种完整结局免费" : "Original branching tale · Three full endings free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Read each changing-ticket scene and choose one of its two options. Follow three or four linked choices to one complete ending; you do not need to visit all five scenes. No dream account, agreement, MBTI result or saved progress is required.", zh: "阅读每个会变车票情境，从两个选项中选一项。沿三至四个相连选择走到一个完整结局，不需要遍历全部五个情境。无需填写梦境、入口同意、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{dreamTrainSections[0].title[locale]}</h2>{dreamTrainSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="dream-train-methods"><h2 id="dream-train-methods">{zh ? "三种结局、分支路线与故事读法" : "Three endings, branching routes and reading the story"}</h2><div className="explore-reading-sections">{dreamTrainSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`dream-train-${s.id}`}><h3 id={`dream-train-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种梦境列车结局：完整公开指南" : "Three dream-train portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇均有完整结局说明、日常例子、取舍与创作提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。" : "Each guide contains the complete authored ending explanation, everyday example, tradeoff and creative prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "梦境列车分支故事常见问题" : "Dream Train Branching Story: frequently asked questions"}</h2>{[quiz.seo.faq,...dreamTrainFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="dream-train-references"><h2 id="dream-train-references" className="text-xl font-semibold">{zh ? "分支叙事与集体文字游戏参考" : "Branching narrative and collaborative word-game references"}</h2><ol className="mt-4 space-y-2"><li id="dream-train-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.inklestudios.com/ink/web-tutorial/">{zh ? "1. Inkle：互动小说的分支写作教程" : "1. Inkle: writing web-based interactive fiction"}</a></li><li id="dream-train-reference-2"><a className="underline" rel="noopener noreferrer" href="https://twinery.org/cookbook/questions/links.html">{zh ? "2. Twine Cookbook：段落之间的链接" : "2. Twine Cookbook: linking passages"}</a></li><li id="dream-train-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.bnf.fr/sites/default/files/2021-01/livret-jeu.pdf">{zh ? "3. BnF：超现实主义展览的集体写作活动" : "3. BnF: collaborative writing in its surrealism exhibition activity"}</a></li></ol></section>
  </Container></main>;
}
