import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import type { NineStarYearProfile, NineStarYearQuestionnaire } from "@/lib/questionnaires/nineStarYear";
import { NineStarYearClient } from "./NineStarYearClient";
import { NineStarYearAttribution, NineStarYearGuideBody } from "./NineStarYearReport";

export function NineStarYearPage({ quiz, locale }: { quiz: NineStarYearQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与工具" : "All tests and tools"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "年度文化参考 · 九篇完整指南免费" : "Annual cultural reference · Nine complete guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p><p className="mt-3 text-sm leading-7 text-slate-600">{quiz.instructions[locale]}</p>
    <NineStarYearClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-5 leading-8" aria-labelledby="nine-star-method"><h2 id="nine-star-method" className="text-2xl font-semibold">{zh ? "运算、立春界点与隐私" : "Calculation, seasonal boundary and privacy"}</h2>{quiz.guide.map(section => <section key={section.id}><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p className="mt-2" key={index}>{paragraph[locale]}</p>)}</section>)}</section>
    <NineStarYearAttribution quiz={quiz} locale={locale} />
    <section className="my-8" aria-labelledby="nine-star-public-guides"><h2 id="nine-star-public-guides" className="text-2xl font-semibold">{zh ? "九篇完整公开文化指南" : "Nine complete public cultural guides"}</h2><ul className="mt-5 space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 font-medium">{profile.headline[locale]}</p><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="nine-star-faq"><h2 id="nine-star-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
  </Container></main>;
}

export function NineStarYearGuidePage({ quiz, profile, locale }: { quiz: NineStarYearQuestionnaire; profile: NineStarYearProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.seo.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "文化象义 · 完整公开指南" : "Cultural meanings · Complete public guide"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="mt-4 text-lg font-semibold">{profile.headline[locale]}</p>
    <p className="my-5 leading-8 text-slate-600">{zh ? "本篇文化指南无需输入年份。它解释传统符号、相邻标签的区别与费马原创日常例子，不显示任何人的年份、界点选择或个人结果。" : "This cultural guide needs no year input. It explains traditional symbols, distinctions between adjacent labels and FermatMind’s original everyday examples, without displaying anyone’s year, boundary-side selection or personal result."}</p>
    <NineStarYearGuideBody profile={profile} locale={locale} headingLevel={2} idPrefix={`nine-star-public-${profile.id}`} />
    <NineStarYearAttribution quiz={quiz} locale={locale} />
    <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 font-semibold underline" href={entry}>{zh ? "查看节年规则与条件计算" : "See the year rule and conditional calculation"}</Link>
    <nav aria-label={zh ? "其他九星文化指南" : "Other Nine Star cultural guides"}><ul className="space-y-3">{quiz.profiles.filter(item => item.id !== profile.id).map(item => <li key={item.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, item.id)}>{item.title[locale]}</Link></li>)}</ul></nav>
  </Container></main>;
}
