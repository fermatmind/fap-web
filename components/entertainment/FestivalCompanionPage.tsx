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
import { StoryTakeEntry } from "./StoryTakeEntry";
import { festivalCompanionSections, festivalCompanionFaq } from "./FestivalCompanionEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#festival-companion-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FestivalCompanionPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "festival-companion") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/festival-companion`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创插画节庆情境 · 完整画像免费" : "Original illustrated-festival scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each illustrated festival scene, choose the arrangement you prefer: one shared highlight, room for separate interests or a short new experience. Answer all six to see three counts and every highest portrait. No actual event, companion, entry agreement or saved progress is required.", zh: "每个插画节庆场景，选择更喜欢的安排：一个共同重点、为分开兴趣留空间，或一段短新体验。六题完成后查看三项次数及全部最高画像。无需真实活动、同伴、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{festivalCompanionSections[0].title[locale]}</h2>{festivalCompanionSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="festival-companion-methods"><h2 id="festival-companion-methods">{zh ? "三种同行安排、透明计数与结果读法" : "Three companion arrangements, transparent counts and result readings"}</h2><div className="explore-reading-sections">{festivalCompanionSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`festival-companion-${s.id}`}><h3 id={`festival-companion-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种节庆同行画像：完整公开指南" : "Three festival-companion portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "节庆同行方式测试常见问题" : "Festival Companion Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...festivalCompanionFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="festival-companion-references"><h2 id="festival-companion-references" className="text-xl font-semibold">{zh ? "参与条件与动机研究参考" : "Participation conditions and motivation research references"}</h2><ol className="mt-4 space-y-2"><li id="festival-companion-reference-1"><a className="underline" rel="noopener noreferrer" href="https://festival.si.edu/accessibility">{zh ? "1. 史密森民俗节：感官信息与参与服务" : "1. Smithsonian Folklife Festival: sensory information and accessibility services"}</a></li><li id="festival-companion-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.festivaloffavignon.com/page/accessibilite">{zh ? "2. Off Avignon：节目与场地参与信息" : "2. Off Avignon: programme and venue accessibility information"}</a></li><li id="festival-companion-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf">{zh ? "3. Ryan与Deci（2000）：自我决定理论综述" : "3. Ryan and Deci (2000): self-determination theory review"}</a></li></ol></section>
  </Container></main>;
}
