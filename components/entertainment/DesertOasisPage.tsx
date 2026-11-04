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
import { desertOasisSections, desertOasisFaq } from "./DesertOasisEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#desert-oasis-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DesertOasisPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "desert-oasis") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/desert-oasis`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创想象空间设计 · 完整画像免费" : "Original imaginary space design · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imaginary oasis scene, choose the detail you would emphasise: clear information, a shared picture or space to pause. Visitors have already arrived safely and have everything they need. Complete six choices for all counts and highest ties; no real travel, agreement or saved progress is required.", zh: "每个想象绿洲情境，选择会先强调的细节：清楚信息、共同画面或停留空间。访客已安全抵达，所需已备齐。六题完成后查看全部次数与最高并列，无需真实旅行、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{desertOasisSections[0].title[locale]}</h2>{desertOasisSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="desert-oasis-methods"><h2 id="desert-oasis-methods">{zh ? "三种空间侧重、设计取舍与结果读法" : "Three spatial priorities, design tradeoffs and result readings"}</h2><div className="explore-reading-sections">{desertOasisSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`desert-oasis-${s.id}`}><h3 id={`desert-oasis-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种想象绿洲画像：完整公开指南" : "Three imaginary oasis portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "想象绿洲歇脚站测试常见问题" : "Imaginary Oasis Design Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...desertOasisFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="desert-oasis-references"><h2 id="desert-oasis-references" className="text-xl font-semibold">{zh ? "包容性设计、展陈与公共空间参考" : "Inclusive design, exhibitions and public-space references"}</h2><ol className="mt-4 space-y-2"><li id="desert-oasis-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.designcouncil.org.uk/fileadmin/uploads/dc/Documents/the-principles-of-inclusive-design.pdf">{zh ? "1. CABE／Design Council：包容性设计原则" : "1. CABE / Design Council: principles of inclusive design"}</a></li><li id="desert-oasis-reference-2"><a className="underline" rel="noopener noreferrer" href="https://affiliations.si.edu/wp-content/uploads/PDFs/Accessible-Exhibition-Design.pdf">{zh ? "2. Smithsonian：无障碍展陈设计指导" : "2. Smithsonian: accessible exhibition design guidance"}</a></li><li id="desert-oasis-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.pps.org/article/grplacefeat">{zh ? "3. Project for Public Spaces：公共场所的观察框架" : "3. Project for Public Spaces: qualities of public places"}</a></li></ol></section>
  </Container></main>;
}
