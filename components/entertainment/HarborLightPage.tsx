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
import { harborLightSections, harborLightFaq } from "./HarborLightEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#harbor-light-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function HarborLightPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "harbor-light") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/harbor-light`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创虚构港口情境 · 完整画像免费" : "Original fictional harbor scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Imagine the illustrated harbor and choose the design you would favor in each scene. There are no correct answers or live light tasks. Complete all six choices to read three raw counts and every highest full portrait.", zh: "想象插画港口，选择每个场景里较喜欢的设计。没有正确答案，也无实际灯光任务。答完六题查看三项原始次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{harborLightSections[0].title[locale]}</h2>{harborLightSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="harbor-light-methods"><h2 id="harbor-light-methods">{zh ? "节奏、图例与故事：计分及完整读法" : "Pulse, key and legend: counts and complete readings"}</h2><div className="explore-reading-sections">{harborLightSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`harbor-light-${s.id}`}><h3 id={`harbor-light-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种虚构港灯：完整公开指南" : "Three harbor-light emphases: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "虚构港灯灯语测试常见问题" : "Fictional Harbor Light Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...harborLightFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="harbor-light-references"><h2 id="harbor-light-references" className="text-xl font-semibold">{zh ? "光学史料与可读设计参考" : "Optical history and readable-design references"}</h2><ol className="mt-4 space-y-2"><li id="harbor-light-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.nps.gov/articles/fresnellens.htm">{zh ? "1. 美国国家公园管理局：菲涅耳透镜的光学与历史背景" : "1. National Park Service: Fresnel lens technology and historical context"}</a></li><li id="harbor-light-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">{zh ? "2. W3C：WCAG颜色使用准则的解释" : "2. W3C: understanding the WCAG use-of-color criterion"}</a></li><li id="harbor-light-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html">{zh ? "3. W3C：非文本内容与文字替代的解释" : "3. W3C: non-text content and text alternatives"}</a></li></ol></section>
  </Container></main>;
}
