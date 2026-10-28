import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { NatalChartQuestionnaire, NatalSignProfile } from "@/lib/questionnaires/natalChart";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { NatalChartClient } from "./NatalChartClient";
import { NatalAnglesGuide, NatalAspectGuide, NatalChartAttribution, NatalMotionGuide, NatalSignGuideBody } from "./NatalChartReport";

export function NatalChartPage({ quiz, locale }: { quiz: NatalChartQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与工具" : "All tests and tools"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "已知时间星盘 · 十二份完整符号指南免费" : "Known-time chart · Twelve complete symbol guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p><p className="mt-3 text-sm leading-7 text-slate-600">{quiz.instructions[locale]}</p>
    <NatalChartClient quiz={quiz} locale={locale} />
    <NatalAspectGuide quiz={quiz} locale={locale} />
    <NatalMotionGuide quiz={quiz} locale={locale} />
    <NatalAnglesGuide quiz={quiz} locale={locale} />
    <section aria-labelledby="natal-method" className="my-8 space-y-5 leading-8"><h2 id="natal-method" className="text-2xl font-semibold">{zh ? "计算、读法与使用范围" : "Calculation, reading and scope"}</h2>{quiz.guide.map(section => <section key={section.id}><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((p, index) => <p key={index} className="mt-2">{p[locale]}</p>)}</section>)}
      <details data-natal-house-guide className="rounded-lg border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold">{zh ? "十二宫完整符号参考（无需出生资料）" : "Complete twelve-house reference, without birth information"}</summary>
        <ol className="mt-4 space-y-5">{quiz.natalChart.houseContexts.map(house => <li key={house.number} data-natal-house-reference={house.number}><h3 className="font-semibold">{zh ? `第${house.number}宫` : `House ${house.number}`} · {house.topic[locale]}</h3><p className="mt-2">{house.reading[locale]}</p></li>)}</ol>
      </details>
    </section>
    <section aria-labelledby="natal-guides" className="my-8"><h2 id="natal-guides" className="text-2xl font-semibold">{zh ? "十二星座完整公开解释" : "Twelve complete public sign readings"}</h2><p className="my-4 leading-8">{zh ? "无需出生信息即可阅读。每份均区分太阳、月亮、上升与其他天体角色，并提供日常例子和反思；不是十二份人格测量结果。" : "No birth information is needed. Each reading distinguishes Sun, Moon, rising and other-body roles, with ordinary scenes and reflections. These are not twelve measured personality outcomes."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8">{profile.summary[locale]}</p></li>)}</ul></section>
    <section aria-labelledby="natal-faq" className="my-8 space-y-5"><h2 id="natal-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    <NatalChartAttribution quiz={quiz} locale={locale} />
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}

export function NatalChartGuidePage({ quiz, profile, locale }: { quiz: NatalChartQuestionnaire; profile: NatalSignProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.seo.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "星盘符号完整解释 · 不含个人出生资料" : "Complete chart-symbol reading · No personal birth data"}</p>
    <h1 className="my-5 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <NatalSignGuideBody profile={profile} locale={locale} idPrefix={`natal-public-${profile.id}`} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="natal-guide-method"><h2 id="natal-guide-method" className="text-2xl font-semibold">{zh ? "把符号与计算分开" : "Keep symbols separate from computation"}</h2><p>{quiz.natalChart.boundaries.calculationVsMeaning[locale]}</p><p>{quiz.natalChart.boundaries.rounding[locale]}</p><p>{quiz.natalChart.boundaries.timezone[locale]}</p><p>{quiz.natalChart.privacy[locale]}</p></section>
    <NatalChartAttribution quiz={quiz} locale={locale} />
    <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 font-semibold underline" href={entry}>{zh ? "返回计算器与全部解释" : "Return to the calculator and all readings"}</Link>
    <nav aria-label={zh ? "其他星座解释" : "Other sign readings"}><ul className="space-y-3">{quiz.profiles.filter(item => item.id !== profile.id).map(item => <li key={item.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, item.id)}>{item.title[locale]}</Link></li>)}</ul></nav>
  </Container></main>;
}
