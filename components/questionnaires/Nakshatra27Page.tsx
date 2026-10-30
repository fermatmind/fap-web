import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { Nakshatra27Client } from "./Nakshatra27Client";
import { QuestionnaireReport } from "./QuestionnaireReport";

function Sources({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section aria-labelledby="nakshatra-sources" className="my-8 space-y-4 leading-8"><h2 id="nakshatra-sources" className="text-2xl font-semibold">{locale === "zh" ? "来源与本版编辑范围" : "Sources and this edition’s editorial scope"}</h2><p>{locale === "zh" ? "印度气象局说明支持27等分框架，不是本工具精确计算认证。SIMBAD提供角宿一目录坐标；Astronomy Engine提供MIT许可计算函数；NASA/JPL用于独立月球采样比较。IGNOU教材提供所选传统符号变体与gana表，Jyotish Global教学资料补充Vimshottari主星和Shravana耳朵符号。它们不是人格效度证据。27篇场景、反例与反思为费马原创，不转载教材正文。" : "IMD explains the 27-sector framework and does not certify this calculator. SIMBAD supplies the Spica catalogue direction; MIT-licensed Astronomy Engine supplies computation; NASA/JPL supplies independent Moon comparison samples. IGNOU teaching materials supply the selected traditional symbol variants and gana table; Jyotish Global teaching materials supply Vimshottari rulers and the Shravana ear symbol. These sources do not establish personality validity. The 27 sets of scenes, counterexamples and reflections are FermatMind originals, without reproduced textbook prose."}</p><ul className="space-y-2">{quiz.references?.map(r => <li key={r.url}><a href={r.url} rel="noreferrer" className="inline-block min-h-11 py-2 underline">{r.title[locale]}</a></li>)}</ul></section>;
}
export function Nakshatra27Page({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} href={`/${locale}/tests#more-tests`} className="inline-block min-h-11 py-2 underline">{zh ? "全部测试与工具" : "All tests and tools"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "出生宿文化工具 · 27篇完整公开指南" : "Birth-star cultural tool · 27 full public guides"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p><p className="mt-5 leading-8">{quiz.introduction[locale]}</p><p className="mt-3 text-sm leading-7">{quiz.instructions![locale]}</p>
    <Nakshatra27Client quiz={quiz} locale={locale} />
    <section aria-labelledby="nakshatra-method" className="my-8 space-y-5 leading-8"><h2 id="nakshatra-method" className="text-2xl font-semibold">{zh ? "计算口径与读法" : "Calculation convention and reading"}</h2>{quiz.guide.map(s => <section key={s.id} id={`nakshatra-${s.id}`}><h3 className="font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p className="mt-2" key={i}>{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="nakshatra-all-guides" className="my-8"><h2 id="nakshatra-all-guides" className="text-2xl font-semibold">{zh ? "全部27篇完整解释" : "All 27 complete readings"}</h2><p className="my-4 leading-8">{zh ? "每篇八节区分传统名称、符号、Vimshottari主星、gana与本版原创场景。无需出生资料即可阅读；名称不是人格类型，gana不是人品、性别或社会等级。" : "Each eight-section reading distinguishes traditional names, symbols, Vimshottari rulers and gana from this edition’s original scenes. Read without birth details. Names are not personality types, and gana is not a measure of character, gender or social rank."}</p><ul className="space-y-4">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, p.id)} className="inline-block min-h-11 py-2 text-lg font-semibold underline">{p.title[locale]}</Link><p className="mt-2 leading-8">{p.summary[locale]}</p></li>)}</ul></section>
    <section aria-labelledby="nakshatra-faq" className="my-8 space-y-5"><h2 id="nakshatra-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></div>)}</section>
    <Sources quiz={quiz} locale={locale} /><p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
export function Nakshatra27GuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.seo!.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} href={entry} className="inline-block min-h-11 py-2 underline">{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "完整文化指南 · 不含个人出生资料" : "Complete cultural guide · No personal birth details"}</p><h1 className="my-5 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`nakshatra-public-${profile.id}`} />
    <section aria-labelledby="nakshatra-public-method" className="my-8 space-y-5 leading-8"><h2 id="nakshatra-public-method" className="text-2xl font-semibold">{zh ? "本工具的计算与输入边界" : "This calculator’s convention and input limits"}</h2>{quiz.guide.slice(0, 4).map(s => <section key={s.id}><h3 className="font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p className="mt-2" key={i}>{p[locale]}</p>)}</section>)}</section>
    <Sources quiz={quiz} locale={locale} /><Link prefetch={false} href={entry} className="my-5 inline-block min-h-11 py-2 font-semibold underline">{zh ? "返回计算器与全部27篇指南" : "Return to the calculator and all 27 guides"}</Link>
    <nav aria-label={zh ? "其他出生宿指南" : "Other birth-star guides"}><ul className="space-y-3">{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, p.id)} className="inline-block min-h-11 py-2 underline">{p.title[locale]}</Link></li>)}</ul></nav>
  </Container></main>;
}
