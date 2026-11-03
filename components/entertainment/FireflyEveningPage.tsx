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
import { fireflyEveningSections, fireflyEveningFaq } from "./FireflyEveningEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#firefly-evening-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FireflyEveningPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "firefly-evening") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/firefly-evening`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "每次3次选择 · 约2分钟 · 无需注册" : "3 choices per reading · About 2 minutes · No registration"}</span><span>{zh ? "原创纸灯展短篇 · 三种完整结局免费" : "Original paper-light tale · Three full endings free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Read each paper-light scene and choose one of its two options. Three linked choices lead to one complete ending; you do not need to visit all five scenes. There is no score, entry agreement, prior MBTI or required saving. No real lights, wildlife or personal memories are needed.", zh: "阅读每个纸灯展情境，从两个选项中选一项。三个相连选择通向一个完整结局，无需遍历全部五个场景。没有分数、入口同意、MBTI前置或强制保存，也无需真实灯具、野生动物或私人记忆。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{fireflyEveningSections[0].title[locale]}</h2>{fireflyEveningSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="firefly-evening-methods"><h2 id="firefly-evening-methods">{zh ? "共同收尾、闭场信号与最后一眼：结局及阅读方法" : "Shared closure, a closing signal and the last view: endings and reading"}</h2><div className="explore-reading-sections">{fireflyEveningSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`firefly-evening-${s.id}`}><h3 id={`firefly-evening-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种纸萤之夜结局：完整公开指南" : "Three paper-firefly endings: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。" : "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "纸萤之夜分支故事常见问题" : "Paper Firefly Branching Story: frequently asked questions"}</h2>{[quiz.seo.faq,...fireflyEveningFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="firefly-evening-references"><h2 id="firefly-evening-references" className="text-xl font-semibold">{zh ? "分支叙事、临时灯展与自然背景参考" : "Branching narrative, temporary light events and nature references"}</h2><ol className="mt-4 space-y-2"><li id="firefly-evening-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.inklestudios.com/ink/web-tutorial/">{zh ? "1. Inkle：选择与相连叙事段落的入门教程" : "1. Inkle: introductory choices and linked narrative sections"}</a></li><li id="firefly-evening-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.fetedeslumieres.lyon.fr/fr/page/horaires-et-dates-fete-des-lumieres-2026">{zh ? "2. 里昂灯光节：具体活动时段说明（法文）" : "2. Fête des Lumières, Lyon: event-specific hours (French)"}</a></li><li id="firefly-evening-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.nps.gov/grsm/learn/nature/fireflies.htm">{zh ? "3. 美国国家公园管理局：真实萤火虫与观赏背景" : "3. U.S. National Park Service: living fireflies and viewing context"}</a></li></ol></section>
  </Container></main>;
}
