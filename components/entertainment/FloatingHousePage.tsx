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
import { floatingHouseSections, floatingHouseFaq } from "./FloatingHouseEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#floating-house-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FloatingHousePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "floating-house") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/floating-house`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: floatingHouseSections, faq: floatingHouseFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创幻想住处情境 · 完整画像免费", "Original fantasy-home scenes · Full portraits free", "原創幻想住處情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Choose how the floating house connects with places in six imagined scenes: a familiar anchor, an unfolding route or planned visits. Complete all six to see three raw counts and every highest portrait. No address, drawing, entry agreement, saved progress or prior test is required.", zh: traditional ? "六個想像場景裡，選擇漂浮小屋怎樣與地方相連：熟悉錨點、展開路線或約定到訪。答完六題檢視三項原始次數與全部最高人物側寫。無需地址、繪畫、入口同意、儲存進度或先做其他測驗。" : "六个想象场景里，选择漂浮小屋怎样与地方相连：熟悉锚点、展开路线或约定到访。答完六题查看三项原始次数与全部最高画像。无需地址、绘画、入口同意、保存进度或先做其他测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="floating-house-methods"><h2 id="floating-house-methods">{text("三种地点连接、透明计分与完整结果读法", "Three place connections, transparent counts and complete result readings", "三種地點連線、透明計分與完整結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`floating-house-${s.id}`}><h3 id={`floating-house-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种漂浮小屋画像：完整公开指南", "Three floating-house portraits: complete public guides", "三種漂浮小屋人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與可選小嚐試。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("漂浮小屋归处测试常见问题", "Floating House Quiz: frequently asked questions", "漂浮小屋歸處測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="floating-house-references"><h2 id="floating-house-references" className="text-xl font-semibold">{text("想象地图、住宅设计与创造性思维参考", "Imaginary maps, home design and creative-thinking references", "想像地圖、住宅設計與創造性思維參考")}</h2><ol className="mt-4 space-y-2"><li id="floating-house-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.bnf.fr/fr/agenda/cartes-imaginaires">{text("1. 法国国家图书馆：想象地图与世界创造", "1. BnF: imaginary maps and inventing worlds", "1. 法國國家圖書館：想像地圖與世界創造")}</a></li><li id="floating-house-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.aia.org/article/5-classroom-ready-book-and-activity-pairings-school-visits">{text("2. 美国建筑师协会：梦想住宅的课堂活动", "2. AIA: classroom dream-home design activity", "2. 美國建築師協會：夢想住宅的課堂活動")}</a></li><li id="floating-house-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.oecd.org/en/topics/sub-issues/creative-thinking.html">{text("3. OECD：创造性思维与PISA评估说明", "3. OECD: creative thinking and PISA assessment overview", "3. OECD：創造性思維與PISA評估說明")}</a></li></ol></section>
  </Container></Surface>;
}
