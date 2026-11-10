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
import { birdwatchingSections, birdwatchingFaq } from "./BirdwatchingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#birdwatching-companion-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BirdwatchingPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "birdwatching-companion") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/birdwatching-companion`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: birdwatchingSections, faq: birdwatchingFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {traditional ? null : <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创观鸟同行 · 完整画像免费", "Original birdwatching scenes · Full portraits free", "原創賞鳥同行 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Choose how you would participate in each imagined scene: wait, record or help someone locate the view. There are no right answers. Finish six questions to see all counts and highest ties; no saving choice or prior test is required.", zh: traditional ? "每個想像場景選更想採用的參與方式：等待、記錄或幫同伴找到視野。沒有標準答案。六題完成後檢視全部次數與最高並列；無需儲存或先做其他測驗。" : "每个想象场景选更想采用的参与方式：等待、记录或帮同伴找到视野。没有标准答案。六题完成后查看全部次数与最高并列；无需保存或先做其他测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="birdwatching-companion-methods"><h2 id="birdwatching-companion-methods">{text("同行方式、观察记录与结果读法", "Companion styles, observation records and result readings", "同行方式、觀察記錄與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`birdwatching-companion-${s.id}`}><h3 id={`birdwatching-companion-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种观鸟同行画像：完整公开指南", "Three birdwatching-companion portraits: complete public guides", "三種賞鳥同行人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("观鸟同行测试常见问题", "Birdwatching companion quiz: frequently asked questions", "賞鳥同行測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="birdwatching-companion-references"><h2 id="birdwatching-companion-references" className="text-xl font-semibold">{text("真实观鸟与记录的背景资料", "Background for real birding and recording", "真實賞鳥與記錄的背景資料")}</h2><ol className="mt-4 space-y-2"><li id="birdwatching-companion-reference-1"><a className="underline" rel="noopener noreferrer" href="https://support.ebird.org/en/support/solutions/articles/48000795623">{text("1. eBird：观察记录的基本要求与良好做法", "1. eBird: Best Practices for observation records", "1. eBird：觀察記錄的基本要求與良好做法")}</a></li><li id="birdwatching-companion-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.aba.org/aba-code-of-birding-ethics/">{text("2. 美国观鸟协会：观鸟伦理准则", "2. American Birding Association: Code of Birding Ethics", "2. 美國賞鳥協會：賞鳥倫理準則")}</a></li></ol></section>
  </Container></Surface>;
}
