import type { MixedQuestionnaireEditorial } from "@/lib/i18n/zh-TW/mixedQuestionnaires";
import { EightQuizOverview } from "./EightQuizOverview";
import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { sbti31LandingSections, sbti31LandingFaq, sbti31LandingReferences } from "./Sbti31LandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { sbti31Profiles, type Sbti31Questionnaire } from "@/lib/questionnaires/sbti31";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireSbti31Client } from "./QuestionnaireSbti31Client";
import { Sbti31Portrait } from "./Sbti31Portrait";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
function Method({ quiz, locale, traditionalCopy }: { quiz: Sbti31Questionnaire; locale: Locale; traditionalCopy?: (text: string) => string }) {
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  return <section className="my-10 space-y-7" aria-labelledby="sbti31-method"><h2 id="sbti31-method" className="text-2xl font-semibold">{locale === "zh" ? displayText("原版说明与使用方式") : "Original edition and how to use it"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>;
}
function GuideList({ quiz, locale, exclude, traditionalCopy }: { quiz: Sbti31Questionnaire; locale: Locale; exclude?: string; traditionalCopy?: (text: string) => string }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  return <section id="sbti31-guides" className="my-10 scroll-mt-24" aria-labelledby="sbti31-guides-heading"><h2 id="sbti31-guides-heading" className="text-2xl font-semibold">{locale === "zh" ? displayText("全部25种原版结果说明") : "All 25 original result guides"}</h2><p className="my-4 leading-8">{locale === "zh" ? displayText("作答前也可完整阅读；这些公开页面不含任何个人答卷或分数。") : "Read every guide before answering. These public pages contain no personal answers or scores."}</p><ul className="sbti31-public-grid">{quiz.profiles.filter(p => p.id !== exclude).map(p => <li key={p.id} className="rounded-xl border bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-xl font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-8">{p.summary[locale]}</p></li>)}</ul></section>;
}
export function Sbti31Page({ quiz, locale , take = false, traditionalCopy, localizedEditorial }: { quiz: Sbti31Questionnaire; locale: Locale ; take?: boolean; traditionalCopy?: (text: string) => string; localizedEditorial?: MixedQuestionnaireEditorial }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const sectionCopy = localizedEditorial?.sections ?? sbti31LandingSections;
  const faqCopy = localizedEditorial?.faq ?? sbti31LandingFaq;
  const referenceCopy = localizedEditorial?.extraReferences ?? sbti31LandingReferences;
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <QuestionnaireSbti31Client quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti31-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? displayText("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="sbti31-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{zh ? <><span className="inline-block">{quiz.title.zh.split("：")[0]}：</span><span className="inline-block">{quiz.title.zh.split("：").slice(1).join("：")}</span></> : quiz.title.en}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? displayText("原31题 · 约6分钟 · 不计时 · 无需注册") : "31 original questions · About 6 minutes · Untimed · No signup"}</span><span>{zh ? displayText("25种趣味画像 · 完整结果免费") : "25 playful portraits · Full results free"}</span></div>
    <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <EightQuizOverview quiz={quiz} locale={locale} traditionalCopy={traditionalCopy} />
    <section className="my-8 space-y-4"><h2 className="text-2xl font-semibold">{sectionCopy[0].title[locale]}</h2><p className="leading-8">{quiz.introduction[locale]}</p>{sectionCopy[0].paragraphs.map((p,i)=><p className="leading-8" key={i}>{p[locale]}</p>)}</section>
    <Method quiz={quiz} locale={locale} traditionalCopy={traditionalCopy} /><GuideList quiz={quiz} locale={locale} traditionalCopy={traditionalCopy} />
    <section className="my-10 space-y-6"><h2 className="text-2xl font-semibold">{zh ? displayText("常见问题") : "Frequently asked questions"}</h2>{[...quiz.faq, ...faqCopy].map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <section className="explore-reading-library"><h2>{zh ? displayText("深入阅读：原规则、显示值与趣味结果的读法") : "Reading in depth: original rules, display values and playful results"}</h2>{sectionCopy.slice(1).map(s=><section key={s.id}><h3>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}</div></section>)}</section>
    <aside className="my-8 border-t pt-6 text-sm leading-7"><h2 className="text-xl font-semibold">{zh ? displayText("框架比较的参考来源") : "Reference for the framework comparison"}</h2><p>{zh ? displayText("以下来源仅解释MBTI偏好框架，不验证本SBTI题本或画像。") : "This source explains the MBTI preference framework; it does not validate this SBTI bank or its portraits."}</p>{referenceCopy.map(r=><p key={r.url}><a className="inline-block min-h-11 py-2 underline" href={r.url}>{r.title[locale]}</a></p>)}</aside>
    <p className="text-sm leading-7 text-slate-600">{zh ? displayText("网页英文为工作译文，原中文题本与原计分不变。") : "Web English is a working translation; original Chinese questions and scoring are unchanged."}</p>
  </Container></main>;
}
export function Sbti31GuidePage({ quiz, profile, locale, traditionalCopy }: { quiz: Sbti31Questionnaire; profile: QuestionnaireProfile; locale: Locale; traditionalCopy?: (text: string) => string }) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const zh = locale === "zh", entry = questionnairePath(displayLocale, quiz.slug), path = questionnaireGuidePath(displayLocale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti31-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} /><JsonLd id="sbti31-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? displayText("面包屑") : "Breadcrumb"}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link></nav><h1 className="my-4 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1><p className="my-5 leading-8">{zh ? displayText("这是原31题玩法的公开画像说明，不含你的答卷或分数。原版趣味叙述、15维说明和补充观察都可以直接阅读。") : "This is a public portrait guide for the original 31-question edition, without your answers or scores. Read the original playful story, fifteen descriptions and additional reflection directly."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${entry}#take-test`}>{zh ? displayText("返回原31题入口") : "Return to the original 31 questions"}</Link>
    <Sbti31Portrait code={sbti31Profiles.find(p => p.id === profile.id)!.code} name={profile.headline[locale]} locale={locale} traditional={Boolean(traditionalCopy)} />
    <div className="my-6 rounded-xl border bg-white p-5 sm:p-8"><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix={`original31-${profile.id}`} traditional={Boolean(traditionalCopy)} /></div><Method quiz={quiz} locale={locale} traditionalCopy={traditionalCopy} /><GuideList quiz={quiz} locale={locale} exclude={profile.id} traditionalCopy={traditionalCopy} />
  </Container></main>;
}
