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
import { coffeeBreakSections, coffeeBreakFaq } from "./CoffeeBreakEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#coffee-break-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CoffeeBreakPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "coffee-break") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/coffee-break`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: coffeeBreakSections, faq: coffeeBreakFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创小憩选择情境 · 完整画像免费", "Original coffee-break scenes · Full portraits free", "原創小憩選擇情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined short-break scene, choose a different setting, a small sensory ritual or easy company. Finish six choices for all three counts and every highest tie. No drink, purchase, outdoor task or saved progress is required.", zh: traditional ? "每個虛構小憩場景，選擇換個背景、感官小儀式或輕鬆作伴。六題完成後檢視三項次數與全部最高並列。無需飲品、消費、戶外任務或儲存進度。" : "每个虚构小憩场景，选择换个背景、感官小仪式或轻松作伴。六题完成后查看三项次数与全部最高并列。无需饮品、消费、户外任务或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="coffee-break-methods"><h2 id="coffee-break-methods">{text("三种小憩偏好、短休息研究与结果读法", "Three break preferences, short-break research and result readings", "三種小憩偏好、短休息研究與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`coffee-break-${s.id}`}><h3 id={`coffee-break-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种小憩方式画像：完整公开指南", "Three break-preference portraits: complete public guides", "三種小憩方式人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("小憩方式测试常见问题", "Coffee Break Style Quiz: frequently asked questions", "小憩方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="coffee-break-references"><h2 id="coffee-break-references" className="text-xl font-semibold">{text("短休息研究与方法背景", "Short-break research and method background", "短休息研究與方法背景")}</h2><ol className="mt-4 space-y-2"><li id="coffee-break-reference-1"><a className="underline" rel="noopener noreferrer" href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460">{text("1. Albulescu等（2022）：短休息对精力、疲劳与表现的系统综述及元分析", "1. Albulescu et al. (2022): micro-breaks, well-being and performance — systematic review and meta-analysis", "1. Albulescu等（2022）：短休息對精力、疲勞與表現的系統綜述及元分析")}</a></li><li id="coffee-break-reference-2"><a className="underline" rel="noopener noreferrer" href="https://ggia.berkeley.edu/practice/savoring_walk">{text("2. Greater Good in Action：品味散步活动流程", "2. Greater Good in Action: Savoring Walk practice", "2. Greater Good in Action：品味散步活動流程")}</a></li><li id="coffee-break-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.hse.gov.uk/msd/dse/work-routine.htm">{text("3. 英国HSE：显示屏工作的工作安排与休息指导", "3. UK HSE: work routine and breaks for display-screen work", "3. 英國HSE：顯示屏工作的工作安排與休息指導")}</a></li></ol></section>
  </Container></Surface>;
}
