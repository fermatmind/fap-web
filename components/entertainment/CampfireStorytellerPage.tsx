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
import { campfireStorytellerSections, campfireStorytellerFaq } from "./CampfireStorytellerEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#campfire-storyteller-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CampfireStorytellerPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "campfire-storyteller") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/campfire-storyteller`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创口述故事情境 · 完整画像免费" : "Original spoken-story scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined story-circle scene, choose a short suspenseful moment, a light turn or an invitation to continue. There are no right answers. Finish six questions for all counts and highest ties; no recording, real story or saving choice is required.", zh: "每个虚构故事圈场景，选择一小段悬念、轻巧转折或邀请续句。没有标准答案。六题完成后查看全部次数与最高并列；无需录音、真实故事或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{campfireStorytellerSections[0].title[locale]}</h2>{campfireStorytellerSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="campfire-storyteller-methods"><h2 id="campfire-storyteller-methods">{zh ? "讲述方式、研究背景与结果读法" : "Storytelling approaches, research background and result readings"}</h2><div className="explore-reading-sections">{campfireStorytellerSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`campfire-storyteller-${s.id}`}><h3 id={`campfire-storyteller-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种围坐讲述画像：完整公开指南" : "Three story-circle portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "围坐讲故事角色测试常见问题" : "Campfire storyteller quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...campfireStorytellerFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="campfire-storyteller-references"><h2 id="campfire-storyteller-references" className="text-xl font-semibold">{zh ? "讲述实践与叙事研究参考资料" : "Storytelling practice and narrative research references"}</h2><ol className="mt-4 space-y-2"><li id="campfire-storyteller-reference-1"><a className="underline" rel="noopener noreferrer" href="https://storynet.org/what-is-storytelling/">{zh ? "1. National Storytelling Network：讲述与听者互动" : "1. National Storytelling Network: What Is Storytelling?"}</a></li><li id="campfire-storyteller-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.01392/full">{zh ? "2. Delatorre等（2018）：不确定性与悬念的实验研究" : "2. Delatorre et al. (2018): uncertainty and suspense experiment"}</a></li><li id="campfire-storyteller-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.teachingenglish.org.uk/teaching-resources/teaching-secondary/activities/pre-intermediate-a2/storylines">{zh ? "3. British Council：Storylines共同续写活动" : "3. British Council: Storylines shared narrative activity"}</a></li></ol></section>
  </Container></main>;
}
