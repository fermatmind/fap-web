import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { discEntryDefinition } from "@/lib/questionnaires/discEntry";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { DiscCitations, discLandingSummary, discVisiblePrivacyAnswer } from "./DiscLandingEditorial";
import { DiscEntryClient } from "./DiscEntryClient";

/** The existing DISC landing body, without the other tools' client references. */
export function DiscPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const methods = ["raw-wins-explanation", "ties-explanation", "low-direction-explanation"];
  const references = (quiz.references ?? []).filter(reference => !["jobcannon.io", "idrlabs.com"].includes(new URL(reference.url).hostname.replace(/^www\./, "")));
  const copy = (text: string) => <DiscCitations text={text} locale={locale} referencePrefix="disc" />;
  const engine = <DiscEntryClient quiz={discEntryDefinition(quiz)} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
      <p className="explore-intro-meta"><span>{zh ? `${quiz.questions.length}题 · 约${quiz.minutes}分钟 · 无需注册` : `${quiz.questions.length} questions · about ${quiz.minutes} minutes · no signup`}</span><span>{zh ? "自编风格问卷 · 完整结果免费" : "Original style questionnaire · Full results free"}</span></p>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-purpose">
      <h2 id="questionnaire-purpose" className="text-2xl font-semibold">{zh ? "DISC测试测什么？四类行为风格与本站题本" : "What does DISC measure? The model and this questionnaire"}</h2>
      <p>{copy(quiz.introduction[locale])}</p>
      <div className="disc-direction-definitions">{quiz.guide.find(section => section.id === "not-a-fixed-identity")?.paragraphs.map((paragraph, index) => <p key={index}>{copy(paragraph[locale])}</p>)}</div>
    </section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method">
      <h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "24道题如何计分？原始次数与并列规则" : "How are 24 choices scored? Counts and tie rules"}</h2>
      {quiz.guide.filter(section => methods.includes(section.id)).map(section => <div className="disc-method-part" key={section.id}><h3>{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}>{copy(paragraph[locale])}</p>)}</div>)}
    </section>
    <section className="my-8" aria-labelledby="questionnaire-results">
      <h2 id="questionnaire-results" className="text-2xl font-semibold">{zh ? "DISC测试结果：四个方向与全部15种组合" : "DISC results: four directions and all 15 leader combinations"}</h2>
      <p className="my-4 leading-8">{zh ? "下面是公开的结果阅读指南，不是当前访客的私人作答。四项单方向与全部最高并列共15种组合均有完整说明，包括行为例子、情境取舍、计分读法与动物标签对照。先阅读指南不会改动之后的题目或计分规则。" : "These are public reading guides, not the current visitor’s private result. All 15 single-direction or highest-count tied combinations have complete explanations, including behavioral examples, contextual trade-offs, scoring and animal-label comparisons. Reading them does not change the questions or scoring rules."}</p>
      <ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8 text-slate-700">{discLandingSummary(profile, locale)}</p></li>)}</ul>
    </section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="questionnaire-faq"><h2 id="questionnaire-faq" className="text-2xl font-semibold">{zh ? "DISC测试常见问题" : "DISC test: frequently asked questions"}</h2>{quiz.faq.map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{copy(faq.question.en === "Where are answers calculated, and can I save progress?" ? discVisiblePrivacyAnswer(locale) : faq.answer[locale])}</p></section>)}</section>
    <section className="explore-reading-library" aria-labelledby="questionnaire-reading-scope"><h2 id="questionnaire-reading-scope">{zh ? "DISC结果读法、研究证据与使用范围" : "Reading DISC results: research evidence and scope"}</h2><div className="explore-reading-sections">{quiz.guide.filter(section => !methods.includes(section.id) && section.id !== "not-a-fixed-identity").map(section => <section key={section.id} className="explore-reading-section"><h3>{section.title[locale]}</h3><div>{section.paragraphs.map((text, index) => <p key={index}>{copy(text[locale])}</p>)}</div></section>)}</div></section>
    <section className="my-8 leading-8" aria-labelledby="questionnaire-references"><h2 id="questionnaire-references" className="text-xl font-semibold">{zh ? "参考文献与来源说明" : "References and source notes"}</h2><ul className="mt-3 list-disc pl-5">{references.map(reference => { const index = quiz.references!.indexOf(reference); return <li key={reference.url} id={`disc-reference-${index + 1}`}><a className="underline" href={reference.url}>{`[${index + 1}] `}{reference.title[locale]}</a></li>; })}</ul></section>
  </Container></main>;
}
