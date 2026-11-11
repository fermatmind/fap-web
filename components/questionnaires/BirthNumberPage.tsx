import type { Questionnaire } from "@/lib/questionnaires/types";
import { TraditionalQuestionnaireCopy } from "./TraditionalQuestionnaireCopy";
import type { CulturalEditorial } from "@/lib/i18n/zh-TW/culturalSymbolQuestionnaires";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { birthNumberSections, birthNumberFaq } from "./BirthNumberLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import type { BirthNumberProfile, BirthNumberQuestionnaire } from "@/lib/questionnaires/birthNumber";
import { BirthNumberClient } from "./BirthNumberClient";
import { BirthNumberAttribution, BirthNumberGuideBody } from "./BirthNumberReport";

export function BirthNumberPage({ quiz, locale, traditionalCopy, localizedEditorial, readings }: { quiz: BirthNumberQuestionnaire; locale: Locale; traditionalCopy?: (text: string) => string; localizedEditorial?: CulturalEditorial; readings?: Questionnaire["profiles"] }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const sectionCopy = localizedEditorial?.sections ?? birthNumberSections;
  const faqCopy = localizedEditorial?.faq ?? birthNumberFaq;
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <BirthNumberClient quiz={quiz} readingProfiles={quiz.profiles.map(profile => ({ ...profile, ...(readings?.find(item => item.id === profile.id) ?? prepareResultProfile(quiz.slug, profile)) }))} locale={locale} />;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? displayText("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={displayLocale} entryLink>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? displayText("两种规则 · 约2分钟 · 无需注册") : "Two rules · About 2 minutes · No registration"}</span><span>{zh ? displayText("两种日期规则 · 十二篇原创符号指南") : "Two date rules · Twelve original symbolic guides"}</span></div>
    </ExploreTestIntro>

    {traditionalCopy ? <TraditionalQuestionnaireCopy>{engine}</TraditionalQuestionnaireCopy> : engine}
    <section className="my-8 space-y-4 leading-8" aria-labelledby="birth-number-purpose"><h2 id="birth-number-purpose" className="text-2xl font-semibold">{sectionCopy[0].title[locale]}</h2>{sectionCopy[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.instructions[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="birth-number-in-depth"><h2 id="birth-number-in-depth">{zh ? displayText("日期数字运算：完整规则、算例与读法") : "Date-number calculations: complete rules, examples and interpretation"}</h2><div className="explore-reading-sections">{sectionCopy.slice(1).map(s=><section key={s.id} className="explore-reading-section" aria-labelledby={`birth-number-chapter-${s.id}`}><h3 id={`birth-number-chapter-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}</div></section>)}</div></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="birth-number-method"><h2 id="birth-number-method" className="text-2xl font-semibold">{zh ? displayText("运算、读法与隐私") : "Calculation, interpretation and privacy"}</h2>{quiz.guide.map(section => <section key={section.id}><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p className="mt-2" key={index}>{paragraph[locale]}</p>)}</section>)}</section>
    <BirthNumberAttribution quiz={quiz} locale={locale} displayCopy={traditionalCopy} />
    <section className="my-8" aria-labelledby="birth-number-public-guides"><h2 id="birth-number-public-guides" className="text-2xl font-semibold">{zh ? displayText("十二篇完整公开指南") : "Twelve complete public guides"}</h2><ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="birth-number-faq"><h2 id="birth-number-faq" className="text-2xl font-semibold">{zh ? displayText("常见问题") : "Frequently asked questions"}</h2>{[...quiz.faq, ...faqCopy].map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
  </Container></main>;
}

export function BirthNumberGuidePage({ quiz, profile, locale, traditionalCopy }: { quiz: BirthNumberQuestionnaire; profile: BirthNumberProfile; locale: Locale; traditionalCopy?: (text: string) => string }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const zh = locale === "zh", entry = questionnairePath(displayLocale, quiz.slug), path = questionnaireGuidePath(displayLocale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.seo!.description[locale], locale })} />
    <nav aria-label={zh ? displayText("面包屑") : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? displayText("原创符号故事 · 完整读法免费") : "Original symbolic story · Full guide, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8 text-slate-600">{zh ? displayText("本篇公开指南不需要生日。运算规则说明标签怎样产生，故事、情境与问题由费马原创，不据此推断人格或未来。") : "This public guide needs no birth date. The rule explains how a label is produced; FermatMind wrote the story, scenes and questions without inferring personality or the future."}</p>
    <BirthNumberGuideBody profile={{ ...profile, ...prepareResultProfile(quiz.slug, profile) }} locale={locale} headingLevel={2} idPrefix={`birth-public-${profile.id}`} displayCopy={traditionalCopy} />
    <BirthNumberAttribution quiz={quiz} locale={locale} displayCopy={traditionalCopy} />
    <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 font-semibold underline" href={entry}>{zh ? displayText("查看两种规则并计算") : "See both rules and calculate"}</Link>
    <nav aria-label={zh ? displayText("其他符号指南") : "Other symbolic guides"}><ul className="space-y-3">{quiz.profiles.filter(item => item.id !== profile.id).map(item => <li key={item.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, item.id)}>{item.title[locale]}</Link></li>)}</ul></nav>
  </Container></main>;
}
