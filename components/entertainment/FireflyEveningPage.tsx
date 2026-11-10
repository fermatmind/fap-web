import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { traditionalBespokeEditorial } from "@/lib/i18n/zh-TW/bespokeStories";
import { StoryTakeEntry } from "./StoryTakeEntry";
import { fireflyEveningSections, fireflyEveningFaq } from "./FireflyEveningEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#firefly-evening-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FireflyEveningPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "firefly-evening") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/firefly-evening`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: fireflyEveningSections, faq: fireflyEveningFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("每次3次选择 · 约2分钟 · 无需注册", "3 choices per reading · About 2 minutes · No registration", "每次3次選擇 · 約2分鐘 · 無需註冊")}</span><span>{text("原创纸灯展短篇 · 三种完整结局免费", "Original paper-light tale · Three full endings free", "原創紙燈展短篇 · 三種完整結局免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Read each paper-light scene and choose one of its two options. Three linked choices lead to one complete ending; you do not need to visit all five scenes. There is no score, entry agreement, prior MBTI or required saving. No real lights, wildlife or personal memories are needed.", zh: traditional ? "閱讀每個紙燈展情境，從兩個選項中選一項。三個相連選擇通向一個完整結局，無需遍歷全部五個場景。沒有分數、入口同意、MBTI前置或強制儲存，也無需真實燈具、野生動物或私人記憶。" : "阅读每个纸灯展情境，从两个选项中选一项。三个相连选择通向一个完整结局，无需遍历全部五个场景。没有分数、入口同意、MBTI前置或强制保存，也无需真实灯具、野生动物或私人记忆。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="firefly-evening-methods"><h2 id="firefly-evening-methods">{text("共同收尾、闭场信号与最后一眼：结局及阅读方法", "Shared closure, a closing signal and the last view: endings and reading", "共同收尾、閉場訊號與最後一眼：結局及閱讀方法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`firefly-evening-${s.id}`}><h3 id={`firefly-evening-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种纸萤之夜结局：完整公开指南", "Three paper-firefly endings: complete public guides", "三種紙螢之夜結局：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。", "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending.", "每篇均有完整結局說明、日常例子、取捨與閱讀提示。這些是公開原創指南，不是訪客私人選擇；三篇均可直接閱讀，每次完成路線只得到一個結局。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("纸萤之夜分支故事常见问题", "Paper Firefly Branching Story: frequently asked questions", "紙螢之夜分支故事常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="firefly-evening-references"><h2 id="firefly-evening-references" className="text-xl font-semibold">{text("分支叙事、临时灯展与自然背景参考", "Branching narrative, temporary light events and nature references", "分支敘事、臨時燈展與自然背景參考")}</h2><ol className="mt-4 space-y-2"><li id="firefly-evening-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.inklestudios.com/ink/web-tutorial/">{text("1. Inkle：选择与相连叙事段落的入门教程", "1. Inkle: introductory choices and linked narrative sections", "1. Inkle：選擇與相連敘事段落的入門教程")}</a></li><li id="firefly-evening-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.fetedeslumieres.lyon.fr/fr/page/horaires-et-dates-fete-des-lumieres-2026">{text("2. 里昂灯光节：具体活动时段说明（法文）", "2. Fête des Lumières, Lyon: event-specific hours (French)", "2. 里昂燈光節：具體活動時段說明（法文）")}</a></li><li id="firefly-evening-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.nps.gov/grsm/learn/nature/fireflies.htm">{text("3. 美国国家公园管理局：真实萤火虫与观赏背景", "3. U.S. National Park Service: living fireflies and viewing context", "3. 美國國家公園管理局：真實螢火蟲與觀賞背景")}</a></li></ol></section>
  </Container></Surface>;
}
