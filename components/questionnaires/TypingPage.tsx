import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { typingLandingSections, typingLandingFaq, typingLandingReferences } from "./TypingLandingEditorial";
import { DiscCitations } from "./DiscLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { TypingClient } from "./TypingClient";

export function TypingPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const references = [...(quiz.references ?? []), ...typingLandingReferences];
  const renderCopy = (text: string) => <DiscCitations text={text} locale={locale} referencePrefix="typing-speed" />;
  const engine = <TypingClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? "英/中文两种原文模式 · 每轮60秒 · 无需注册 · 允许改错" : "English and Chinese passage modes · 60 seconds per round · No signup · Corrections allowed"}</span><span>{zh ? "原创打字练习 · 真实计时与完整指南免费" : "Original typing practice · Real timing and complete guides, free"}</span></div>
    <QuestionnaireTakeEntry quiz={{ slug: quiz.slug }} locale={locale} />
    </ExploreTestIntro>

    <section className="my-8 space-y-4 leading-8" aria-labelledby="typing-purpose"><h2 id="typing-purpose" className="text-2xl font-semibold">{zh ? "打字速度测试：英文WPM、中文CPM与一分钟抄录" : "Typing Speed Test: English WPM, Chinese CPM and one-minute copying"}</h2><p>{quiz.introduction[locale]}</p><p>{quiz.instructions![locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`typing-source-${section.id}`}><h2 id={`typing-source-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="explore-reading-library" aria-labelledby="typing-reading"><h2 id="typing-reading" className="text-2xl font-semibold">{zh ? "打字结果读法：单位、改错与输入条件" : "Reading typing results: units, corrections and input conditions"}</h2><div className="explore-reading-sections">{typingLandingSections.map(section => <section key={section.id} className="explore-reading-section"><h3>{section.title[locale]}</h3><div>{section.paragraphs.map((p,i)=><p key={i}>{renderCopy(p[locale])}</p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="typing-public-guides"><h2 id="typing-public-guides" className="text-2xl font-semibold">{zh ? "两份完整公开复习指南" : "Both complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "英文与中文各有完整公式、算例、改错、输入法与设备说明；可开始前阅读，任何速度都不影响内容权限。它们是语言模式指南，不是分数档位或私人输入记录。" : "Each language has complete formulas, examples, correction, IME and device notes. Read them before starting; no speed unlocks or restricts content. These are mode guides, not score bands or private input records."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="typing-faq"><h2 id="typing-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{[...quiz.faq, ...typingLandingFaq].map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="typing-references"><h2 id="typing-references" className="text-2xl font-semibold">{zh ? "参考文献与计量方法" : "References and measurement methods"}</h2><ul className="mt-4 space-y-3">{references.map((reference,index) => <li key={reference.url} id={`typing-speed-reference-${index+1}`}><a href={reference.url} className="underline" rel="noopener noreferrer">[{index+1}] {reference.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
