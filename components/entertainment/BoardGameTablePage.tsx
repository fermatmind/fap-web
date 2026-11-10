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
import { boardGameTableSections, boardGameTableFaq } from "./BoardGameTableEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#board-game-table-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BoardGameTablePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "board-game-table") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/board-game-table`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: boardGameTableSections, faq: boardGameTableFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创桌游情境 · 完整画像免费", "Original game-night scenes · Full portraits free", "原創桌遊情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Choose how you would participate in each imagined game-night scene: explain rules, enjoy a challenge or welcome different experience levels. There are no right answers. Finish six questions to see all counts and highest ties; saving or another test is not required.", zh: traditional ? "每個想像桌遊場景選更想採用的參與方式：解釋規則、享受挑戰或照應不同經驗的同桌。沒有標準答案。六題完成後檢視全部次數與最高並列；無需儲存或先做其他測驗。" : "每个想象桌游场景选更想采用的参与方式：解释规则、享受挑战或照应不同经验的同桌。没有标准答案。六题完成后查看全部次数与最高并列；无需保存或先做其他测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="board-game-table-methods"><h2 id="board-game-table-methods">{text("同桌贡献、规则依据与结果读法", "Table contributions, rules references and result readings", "同桌貢獻、規則依據與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`board-game-table-${s.id}`}><h3 id={`board-game-table-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种桌游同桌画像：完整公开指南", "Three board-game-table portraits: complete public guides", "三種桌遊同桌人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("桌游同桌角色测试常见问题", "Board-game role quiz: frequently asked questions", "桌遊同桌角色測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="board-game-table-references"><h2 id="board-game-table-references" className="text-xl font-semibold">{text("桌游规则与玩家研究的背景资料", "Background on board-game rules and player research", "桌遊規則與玩家研究的背景資料")}</h2><ol className="mt-4 space-y-2"><li id="board-game-table-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.gigamic.com/faq/category/nos-jeux">{text("1. Gigamic：规则书、下载与教学视频", "1. Gigamic: rulebooks, downloads and instructional videos", "1. Gigamic：規則書、下載與教學影片")}</a></li><li id="board-game-table-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.daysofwonder.com/game/ticket-to-ride/">{text("2. Days of Wonder：《车票之旅》官方规则入口", "2. Days of Wonder: official Ticket to Ride rulebooks", "2. Days of Wonder：《車票之旅》官方規則入口")}</a></li><li id="board-game-table-reference-3"><a className="underline" rel="noopener noreferrer" href="https://quanticfoundry.com/2016/08/03/board-game-profile/">{text("3. Quantic Foundry：桌游动机研究的开发方法", "3. Quantic Foundry: developing the Board Game Motivation Profile", "3. Quantic Foundry：桌遊動機研究的開發方法")}</a></li></ol></section>
  </Container></Surface>;
}
