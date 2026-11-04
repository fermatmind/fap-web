import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { tenKeyLandingSections, tenKeyLandingFaq } from "./TenKeyLandingEditorial";
import { TenKeyClient } from "./TenKeyClient";

function cited(text: string) {
  return text.split(/(\[\d+\])/g).map((part, index) => /^\[\d+\]$/.test(part)
    ? <a key={index} className="disc-source-citation" href={`#ten-key-test-reference-${part.slice(1, -1)}`}>{part}</a> : part);
}

export function TenKeyPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <TenKeyClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? "3种模式 · 每轮真实60秒 · 无需注册" : "3 modes · Real 60-second rounds · No signup"}</span><span>{zh ? "原创数字录入练习 · 计时结果与完整复习免费" : "Original number-entry practice · Timed results and full revision free"}</span></div>
    <QuestionnaireTakeEntry quiz={{ slug: quiz.slug }} locale={locale} />
    </ExploreTestIntro>

    <section className="my-8 space-y-4 leading-8" aria-labelledby="ten-key-purpose"><h2 id="ten-key-purpose" className="text-2xl font-semibold">{zh ? "10-Key数字录入测试：三种格式与真实输入" : "10-Key number-entry practice: three formats and real input"}</h2><p>{quiz.introduction[locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`ten-key-guide-${section.id}`}><h2 id={`ten-key-guide-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="explore-reading-library" aria-label={zh ? "数字录入方法与结果解读" : "Number-entry methods and result interpretation"}>{tenKeyLandingSections.map(section => <section key={section.id} className="explore-reading-section" aria-labelledby={section.id}><h2 id={section.id} className="text-2xl font-semibold">{section.title[locale]}</h2><div>{section.paragraphs.map((paragraph, index) => <p key={index}>{cited(paragraph[locale])}</p>)}</div></section>)}</section>
    <section className="my-8" aria-labelledby="ten-key-public-guides"><h2 id="ten-key-public-guides" className="text-2xl font-semibold">{zh ? "三份完整公开复习指南" : "All three complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "每个模式均有完整算例、单位、改错与设备说明，可在开始前阅读。它们不是成绩等级或私人答卷，不需要达到某个速度才能解锁。" : "Each mode has worked examples, units, editing rules and device limits. Read them before starting. They are not score bands or private attempts, and no speed is required to unlock them."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="ten-key-faq"><h2 id="ten-key-faq" className="text-2xl font-semibold">{zh ? "10-Key测试常见问题：计时、KPH与准确率" : "10-Key Test FAQ: timing, KPH and accuracy"}</h2>{[...quiz.faq, ...tenKeyLandingFaq].map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{cited(faq.answer[locale])}</p></section>)}</section>
    <section className="my-8 leading-8" aria-labelledby="ten-key-references"><h2 id="ten-key-references" className="text-xl font-semibold">{zh ? "技术背景与来源范围" : "Technical background and source scope"}</h2><ul className="mt-3 list-disc pl-5">{quiz.references?.map((reference, index) => <li id={`ten-key-test-reference-${index + 1}`} key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul><p className="mt-3 text-sm text-slate-600">{zh ? "这些文档说明浏览器API的行为与限制，不验证本数字源、练习成效或招聘用途。数字、规则与完整指南均为本站原创。" : "These documents describe browser API behaviour and limits. They do not validate this number bank, training outcomes or hiring use. The numbers, rules and full guides are original to this edition."}</p></section>
  </Container></main>;
}
