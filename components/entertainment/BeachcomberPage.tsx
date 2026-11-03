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
import { beachcomberSections, beachcomberFaq } from "./BeachcomberEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#beachcomber-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BeachcomberPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "beachcomber") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/beachcomber`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创海岸想象 · 完整画像免费" : "Original shoreline scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{beachcomberSections[0].title[locale]}</h2>{beachcomberSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="beachcomber-methods"><h2 id="beachcomber-methods">{zh ? "观看角度、计数方法与完整结果读法" : "Viewing angles, counting and complete result readings"}</h2><div className="explore-reading-sections">{beachcomberSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`beachcomber-${s.id}`}><h3 id={`beachcomber-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种海边拾趣画像：完整公开指南" : "Three beachcomber portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与小创作提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and small creative prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "海边拾趣测试常见问题" : "Beachcomber quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...beachcomberFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="beachcomber-references"><h2 id="beachcomber-references" className="text-xl font-semibold">{zh ? "真实海岸观察的背景资料" : "Background for observing a real coast"}</h2><ol className="mt-4 space-y-2"><li id="beachcomber-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.nps.gov/pais/planyourvisit/beachcombing.htm">{zh ? "1. 美国国家公园管理局：帕德雷岛海岸观察与当地采集说明" : "1. National Park Service: Padre Island beachcombing and local collection guidance"}</a></li><li id="beachcomber-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.leavenotraceireland.org/wp-content/uploads/2020/01/Developing-Leave-No-Trace-Skills-and-Ethics-for-the-Coast_Shawe.pdf">{zh ? "2. 爱尔兰无痕户外：海岸环境指导，保留所见章节" : "2. Leave No Trace Ireland: coastal guidance, Leave What You Find section"}</a></li></ol></section>
  </Container></main>;
}
