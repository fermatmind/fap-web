import { TraditionalQuestionnaireCopy } from "./TraditionalQuestionnaireCopy";
import type { CulturalEditorial } from "@/lib/i18n/zh-TW/culturalSymbolQuestionnaires";
import { wetonStoryEntryInstructions, WetonStoryAnsweringInstructions } from "./WetonStoryInstructions";
import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { WetonStory35Client } from "./WetonStory35Client";
import { wetonStorySections, wetonStoryFaq } from "./WetonStoryLandingEditorial";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#weton-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
export function WetonStory35Page({ quiz, locale, take = false, traditionalCopy, localizedEditorial }: { quiz: Questionnaire; locale: Locale; take?: boolean; traditionalCopy?: (text: string) => string; localizedEditorial?: CulturalEditorial}) {
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const sectionCopy = localizedEditorial?.sections ?? wetonStorySections;
  const faqCopy = localizedEditorial?.faq ?? wetonStoryFaq;
 const zh=locale==="zh",path=questionnairePath(displayLocale,quiz.slug);
 const engine = <WetonStory35Client quiz={quiz} locale={locale} intro={<><h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="explore-intro-meta">{zh?displayText("35题 · 约12分钟 · 无需注册 · 35篇完整指南免费"):"35 choices · about 12 minutes · no signup · 35 full guides free"}</p></>}/>;
  if (take) return traditionalCopy ? <TraditionalQuestionnaireCopy>{engine}</TraditionalQuestionnaireCopy> : engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
 <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{name:"FermatMind",path:`/${displayLocale}`},{name:zh?displayText("全部测试"):"All tests",path:`/${displayLocale}/tests`},{name:quiz.title[locale],path}])}/>
 <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({path,title:quiz.title[locale],description:quiz.description[locale],locale})}/>
 <ExploreTestIntro slug={quiz.slug} locale={locale}>{<><h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="explore-intro-meta">{zh?displayText("35题 · 约12分钟 · 无需注册 · 35篇完整指南免费"):"35 choices · about 12 minutes · no signup · 35 full guides free"}</p></>}<QuestionnaireTakeEntry quiz={{ slug: quiz.slug }} locale={locale} displayLocale={displayLocale} /><p className="text-sm leading-7">{displayText(wetonStoryEntryInstructions[locale])}</p></ExploreTestIntro>
 <WetonStoryAnsweringInstructions quiz={quiz} locale={locale} displayCopy={traditionalCopy} />
 {traditionalCopy ? <TraditionalQuestionnaireCopy><WetonStory35Client quiz={quiz} locale={locale} calendarOnly /></TraditionalQuestionnaireCopy> : <WetonStory35Client quiz={quiz} locale={locale} calendarOnly />}
 <section className="my-8 space-y-4 leading-8" aria-labelledby="weton-purpose"><h2 id="weton-purpose">{sectionCopy[0].title[locale]}</h2>{sectionCopy[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]}/></p>)}<p>{quiz.introduction[locale]}</p></section>
 <section className="explore-reading-library" aria-labelledby="weton-methods"><h2 id="weton-methods">{zh?displayText("故事计数、历法运算与文化背景"):"Story counts, calendar arithmetic and cultural context"}</h2><div className="explore-reading-sections">{[...sectionCopy.slice(1),...quiz.guide].map(s=><section key={s.id} className="explore-reading-section" aria-labelledby={`weton-method-${s.id}`}><h3 id={`weton-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]}/></p>)}</div></section>)}</div></section>
 <section className="my-10" aria-labelledby="weton-library"><h2 id="weton-library">{zh?displayText("35种原创故事组合：完整公开指南"):"35 original story pairings: complete public guides"}</h2><p className="my-4 leading-8">{zh?displayText("每篇八节，包含独立场景、反例、分组计数及有范围的文化背景。无需作答或输入日期，直接打开全文；页面不含任何人的私人结果。"):"Each eight-section guide includes a distinct scene, a contrasting example, separate-bank counts and bounded cultural context. Open the full text without answers or dates; these pages contain no visitor’s private result."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p=><li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(displayLocale,quiz.slug,p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
 <section className="my-10 space-y-5 leading-8" aria-labelledby="weton-faq"><h2 id="weton-faq">{zh?displayText("Weton故事与历法常见问题"):"Weton story and calendar questions"}</h2>{[...quiz.faq,...faqCopy].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
 <section className="my-8" aria-labelledby="weton-references"><h2 id="weton-references">{zh?displayText("历法与文化来源"):"Calendar and cultural sources"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i)=><li key={r.url} id={`weton-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
 </Container></main>;
}
