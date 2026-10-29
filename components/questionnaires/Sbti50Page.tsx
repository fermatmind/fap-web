import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Sbti50Questionnaire } from "@/lib/questionnaires/sbti50";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireSbti50Client } from "./QuestionnaireSbti50Client";
import { QuestionnaireReport } from "./QuestionnaireReport";

function Method({ quiz, locale }: { quiz: Sbti50Questionnaire; locale: Locale }) {
  return <section className="my-10 space-y-7" aria-labelledby="sbti50-method">
    <h2 id="sbti50-method" className="text-2xl font-semibold">{locale === "zh" ? "版本、次数算法与使用边界" : "Edition, counting method and scope"}</h2>
    {quiz.guide.map(section => <section key={section.id}>
      <h3 className="text-xl font-semibold">{section.title[locale]}</h3>
      {section.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 leading-8">{paragraph[locale]}</p>)}
    </section>)}
  </section>;
}

function GuideList({ quiz, locale, exclude }: { quiz: Sbti50Questionnaire; locale: Locale; exclude?: string }) {
  return <section id="sbti50-guides" className="my-10 scroll-mt-24" aria-labelledby="sbti50-guide-heading">
    <h2 id="sbti50-guide-heading" className="text-2xl font-semibold">{locale === "zh" ? "全部完整主题指南" : "Every complete theme guide"}</h2>
    <p className="my-4 leading-8">{locale === "zh" ? "不作答即可免费阅读。所有公开指南对每个人相同，不含私人答案或次数；不是个人类型证明。" : "Free without answering. Public guides are identical for everyone, without private choices or counts; they are not proof of a personal type."}</p>
    <ul className="space-y-5">{quiz.profiles.filter(profile => profile.id !== exclude).map(profile => <li key={profile.id} className="rounded-xl border bg-white p-5">
      <Link prefetch={false} className="inline-block min-h-11 py-2 text-xl font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link>
      <p className="mt-2 leading-8">{profile.summary[locale]}</p>
    </li>)}</ul>
  </section>;
}

export function Sbti50Page({ quiz, locale }: { quiz: Sbti50Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti50-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="sbti50-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "自有主题Web修订 · 五十组成对选择 · 非标准人格量表" : "Owned-theme Web repair · Fifty paired choices · Entertainment"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <p className="my-4 text-sm leading-7">{zh ? "50组 · 约8分钟 · 不计时 · 25篇完整读法免费 · 无需注册" : "50 pairs · About 8 minutes · Untimed · 25 full guides free · No signup"}</p>
    <p className="leading-8">{quiz.introduction[locale]}</p>
    <QuestionnaireSbti50Client quiz={quiz} locale={locale} />
    <GuideList quiz={quiz} locale={locale} />
    <Method quiz={quiz} locale={locale} />
    <section className="my-10 space-y-6" aria-labelledby="sbti50-faq"><h2 id="sbti50-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>
      {quiz.faq.map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2 leading-8">{faq.answer[locale]}</p></section>)}
    </section>
    <p className="text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website edition"}: {quiz.version} · {quiz.updated}</p>
  </Container></main>;
}

export function Sbti50GuidePage({ quiz, profile, locale }: { quiz: Sbti50Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti50-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="sbti50-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <h1 className="my-4 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是对所有人相同的通用完整主题读法，不含个人次数或答案。适用于明示的费马50组修订版，不断言你具有一种固定人格。" : "This complete general theme reading is identical for everyone, with no personal count or answers. It belongs to the labeled FermatMind fifty-choice repair and does not assert a fixed personality."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${entry}#take-test`}>{zh ? "了解并免费开始50组选择" : "See the edition and start 50 choices free"}</Link>
    <div className="my-6 rounded-xl border bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`public-${profile.id}`} /></div>
    <Method quiz={quiz} locale={locale} />
    <GuideList quiz={quiz} locale={locale} exclude={profile.id} />
  </Container></main>;
}
