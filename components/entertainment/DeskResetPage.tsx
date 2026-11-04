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
import { deskResetSections, deskResetFaq } from "./DeskResetEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#desk-reset-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DeskResetPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "desk-reset") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/desk-reset`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创个人台面情境 · 完整画像免费" : "Original personal-workspace scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each small workspace scene, choose how you would arrange familiar tools, active materials or space for a first action. Imagine a personal surface, including a shared table or temporary corner. Complete six choices for all counts and highest ties; no desk photo, purchase or saved progress is required.", zh: "每个小桌面情境，选择会怎样安排熟悉工具、当前材料或第一步的空间。想象个人使用的台面，包括共用桌子或临时角落。六题完成后查看全部次数与最高并列，无需桌面照片、购买用品或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{deskResetSections[0].title[locale]}</h2>{deskResetSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="desk-reset-methods"><h2 id="desk-reset-methods">{zh ? "三种台面安排、使用取舍与结果读法" : "Three workspace arrangements, practical tradeoffs and result readings"}</h2><div className="explore-reading-sections">{deskResetSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`desk-reset-${s.id}`}><h3 id={`desk-reset-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种桌面整理画像：完整公开指南" : "Three desk-reset portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "桌面小整理测试常见问题" : "Desk Reset Style Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...deskResetFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="desk-reset-references"><h2 id="desk-reset-references" className="text-xl font-semibold">{zh ? "空间认知与工位设计参考" : "Spatial cognition and workstation design references"}</h2><ol className="mt-4 space-y-2"><li id="desk-reset-reference-1"><a className="underline" rel="noopener noreferrer" href="https://adrenaline.ucsd.edu/kirsh/Articles/Space/AIJ1.html">{zh ? "1. Kirsh（1995）：空间的智能使用" : "1. Kirsh (1995): The Intelligent Use of Space"}</a></li><li id="desk-reset-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.osha.gov/etools/computer-workstations/components/desks">{zh ? "2. OSHA：计算机工位的桌面安排" : "2. OSHA: desk arrangements for computer workstations"}</a></li><li id="desk-reset-reference-3"><a className="underline" rel="noopener noreferrer" href="https://ressources.inrs.fr/visionneuse/ED%206538/publication/travail-sur-ecran-%28inrs-ed-6538%29.pdf">{zh ? "3. INRS：屏幕工作与工位布置" : "3. INRS: screen work and workstation layout"}</a></li></ol></section>
  </Container></main>;
}
