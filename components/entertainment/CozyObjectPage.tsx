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
import { cozyObjectSections, cozyObjectFaq } from "./CozyObjectEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#cozy-object-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CozyObjectPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "cozy-object") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/cozy-object`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创温暖物件场景 · 完整画像免费" : "Original cozy object scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined cozy scene, choose the invitation you prefer: a familiar beginning, a softly edged place or room for an unfinished thought. Finish six choices for all three counts and every highest tie. No object purchase, private writing or saved progress is required.", zh: "每个虚构温暖场景，选择更想保留的邀请：熟悉的开头、柔和停留处或未完念头的空间。六题完成后查看三项次数与全部最高并列。无需购买物件、提交私人文字或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{cozyObjectSections[0].title[locale]}</h2>{cozyObjectSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="cozy-object-methods"><h2 id="cozy-object-methods">{zh ? "三种物件场景、创作方法与结果读法" : "Three object scenes, creative methods and result readings"}</h2><div className="explore-reading-sections">{cozyObjectSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`cozy-object-${s.id}`}><h3 id={`cozy-object-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种温暖物件画像：完整公开指南" : "Three cozy object portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "温暖小物场景测试常见问题" : "Cozy Object Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...cozyObjectFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="cozy-object-references"><h2 id="cozy-object-references" className="text-xl font-semibold">{zh ? "物件观察与创作方法参考" : "Object observation and creative practice references"}</h2><ol className="mt-4 space-y-2"><li id="cozy-object-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.nationalwritingproject.uk/writers-notebook">{zh ? "1. National Writing Project UK：写作者笔记本的选择与想法生成" : "1. National Writing Project UK: choice and idea generation in a writer’s notebook"}</a></li><li id="cozy-object-reference-2"><a className="underline" rel="noopener noreferrer" href="https://americanhistory.si.edu/sites/default/files/PrimarySources.pdf">{zh ? "2. Smithsonian：物件阅读与资料局限（第46至52页）" : "2. Smithsonian: reading objects and source limitations (pages 46–52)"}</a></li><li id="cozy-object-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.vam.ac.uk/articles/design-and-make-your-own-story">{zh ? "3. V&A：以家中物件创作故事" : "3. V&A: creating stories from household objects"}</a></li></ol></section>
  </Container></main>;
}
