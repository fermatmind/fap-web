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
import { dinnerHostSections, dinnerHostFaq } from "./DinnerHostEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#dinner-host-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DinnerHostPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "dinner-host") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/dinner-host`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: dinnerHostSections, faq: dinnerHostFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创轻松聚餐情境 · 完整画像免费", "Original casual-dinner scenes · Full portraits free", "原創輕鬆聚餐情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined casual dinner, choose how you would arrange the flow, guest choices or preparation scale. Think about a fictional evening with people you know, without planning an actual menu. Finish six choices for all counts and highest ties; no cooking, invitation, agreement or saved progress is required.", zh: traditional ? "每個想像聚餐情境，選擇會怎樣安排節奏、來客選擇或準備規模。想像與熟人的虛構夜晚，無需實際擬選單。六題完成後檢視全部次數與最高並列，無需做飯、發邀請、入口同意或儲存進度。" : "每个想象聚餐情境，选择会怎样安排节奏、来客选择或准备规模。想象与熟人的虚构夜晚，无需实际拟菜单。六题完成后查看全部次数与最高并列，无需做饭、发邀请、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="dinner-host-methods"><h2 id="dinner-host-methods">{text("三种请客安排、工作量与结果读法", "Three hosting arrangements, workload and result readings", "三種請客安排、工作量與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`dinner-host-${s.id}`}><h3 id={`dinner-host-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种轻松聚餐主人画像：完整公开指南", "Three dinner-host portraits: complete public guides", "三種輕鬆聚餐主人人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("轻松聚餐主人测试常见问题", "Casual Dinner Host Quiz: frequently asked questions", "輕鬆聚餐主人測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="dinner-host-references"><h2 id="dinner-host-references" className="text-xl font-semibold">{text("聚餐安排与共同用餐研究参考", "Hosting guidance and social-eating research references", "聚餐安排與共同用餐研究參考")}</h2><ol className="mt-4 space-y-2"><li id="dinner-host-reference-1"><a className="underline" rel="noopener noreferrer" href="https://emilypost.com/advice/party-etiquette-tips-for-hosts-and-guests">{text("1. Emily Post：聚会主人与来客的安排建议", "1. Emily Post: practical guidance for hosts and guests", "1. Emily Post：聚會主人與來客的安排建議")}</a></li><li id="dinner-host-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.foodstandards.gov.scot/consumer-advice/food-safety/food-allergies/cooking-for-people-with-allergies">{text("2. Food Standards Scotland：为有食物过敏的人准备餐食", "2. Food Standards Scotland: cooking for people with allergies", "2. Food Standards Scotland：為有食物過敏的人準備餐食")}</a></li><li id="dinner-host-reference-3"><a className="underline" rel="noopener noreferrer" href="https://link.springer.com/article/10.1007/s40750-017-0061-4">{text("3. Dunbar（2017）：共同用餐的功能研究", "3. Dunbar (2017): Breaking Bread: the Functions of Social Eating", "3. Dunbar（2017）：共同用餐的功能研究")}</a></li></ol></section>
  </Container></Surface>;
}
