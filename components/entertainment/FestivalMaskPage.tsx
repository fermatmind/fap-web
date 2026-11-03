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
import { festivalMaskSections, festivalMaskFaq } from "./FestivalMaskEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#festival-mask-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FestivalMaskPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "festival-mask") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/festival-mask`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创虚构装扮情境 · 完整画像免费" : "Original costume-design scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Choose a costume detail for each invented festival scene: one small signal, a framed view or a paper-ribbon path. Answer all six for three raw counts and every highest complete portrait. No wearing, sound, upload, entry agreement, saving or prior test is required.", zh: "每个虚构节庆场景选一处装扮细节：小信号、景物视框或纸带路径。六题后查看三项原始次数与全部最高完整画像。无需佩戴、声音、上传、入口同意、保存或先做其他测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{festivalMaskSections[0].title[locale]}</h2>{festivalMaskSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="festival-mask-methods"><h2 id="festival-mask-methods">{zh ? "三种装扮动作、透明计数与完整结果读法" : "Three costume actions, transparent counts and complete result readings"}</h2><div className="explore-reading-sections">{festivalMaskSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`festival-mask-${s.id}`}><h3 id={`festival-mask-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种原创节庆角色：完整公开指南" : "Three original festival characters: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "原创节庆面具设计测试常见问题" : "Original Festival Mask Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...festivalMaskFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="festival-mask-references"><h2 id="festival-mask-references" className="text-xl font-semibold">{zh ? "舞台服装、设计样稿与可访问性参考" : "Stage costumes, design sketches and accessibility references"}</h2><ol className="mt-4 space-y-2"><li id="festival-mask-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.operadeparis.fr/apropos/theatres-et-ateliers/ateliers-costumes">{zh ? "1. 巴黎歌剧院：舞台服装工坊与制作流程" : "1. Paris Opera: costume workshops and production"}</a></li><li id="festival-mask-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.bnf.fr/fr/mediatheque/bal-masque">{zh ? "2. 法国国家图书馆：化装舞会与服装设计样稿" : "2. BnF: masked balls and costume design sketches"}</a></li><li id="festival-mask-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html">{zh ? "3. W3C：理解感官特征与操作说明" : "3. W3C: Understanding Sensory Characteristics"}</a></li></ol></section>
  </Container></main>;
}
