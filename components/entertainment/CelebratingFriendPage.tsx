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
import { celebratingFriendSections, celebratingFriendFaq } from "./CelebratingFriendEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#celebrating-a-friend-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CelebratingFriendPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "celebrating-a-friend") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/celebrating-a-friend`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: celebratingFriendSections, faq: celebratingFriendFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创报喜回应情境 · 完整画像免费", "Original good-news response scenes · Full portraits free", "原創報喜回應情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined good-news scene, choose listening, a personal note or invited company. There are no right answers. Finish six questions for all counts and highest ties; no friend’s name, private messages or saving choice is required.", zh: traditional ? "每個虛構報喜場景，選擇傾聽、個人小箋或受邀作伴。沒有標準答案。六題完成後檢視全部次數與最高並列；無需朋友姓名、私人資訊或儲存選擇。" : "每个虚构报喜场景，选择倾听、个人小笺或受邀作伴。没有标准答案。六题完成后查看全部次数与最高并列；无需朋友姓名、私人信息或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="celebrating-a-friend-methods"><h2 id="celebrating-a-friend-methods">{text("回应形式、研究背景与结果读法", "Response formats, research background and result readings", "回應形式、研究背景與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`celebrating-a-friend-${s.id}`}><h3 id={`celebrating-a-friend-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种报喜回应画像：完整公开指南", "Three good-news response portraits: complete public guides", "三種報喜回應人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("回应朋友好消息测试常见问题", "Friend’s good-news quiz: frequently asked questions", "回應朋友好訊息測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="celebrating-a-friend-references"><h2 id="celebrating-a-friend-references" className="text-xl font-semibold">{text("积极事件分享研究与回应练习资料", "Positive-event sharing research and response practices", "積極事件分享研究與回應練習資料")}</h2><ol className="mt-4 space-y-2"><li id="celebrating-a-friend-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.sas.rochester.edu/psy/people/faculty/reis_harry/assets/pdf/GableReisImpettAsher_2004.pdf">{text("1. Gable等（2004）：积极事件分享原始研究", "1. Gable et al. (2004): What Do You Do When Things Go Right?", "1. Gable等（2004）：積極事件分享原始研究")}</a></li><li id="celebrating-a-friend-reference-2"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/17059309/">{text("2. Gable等（2006）：积极事件回应研究摘要", "2. Gable et al. (2006): supportive responses study abstract", "2. Gable等（2006）：積極事件回應研究摘要")}</a></li><li id="celebrating-a-friend-reference-3"><a className="underline" rel="noopener noreferrer" href="https://ggia.berkeley.edu/practice/capitalizing_on_positive_events">{text("3. Greater Good in Action：回应积极事件练习", "3. Greater Good in Action: Capitalizing on Positive Events", "3. Greater Good in Action：回應積極事件練習")}</a></li></ol></section>
  </Container></Surface>;
}
