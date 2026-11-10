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
import { comfortOfferSections, comfortOfferFaq } from "./ComfortOfferEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#comfort-offer-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function ComfortOfferPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "comfort-offer") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/comfort-offer`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: comfortOfferSections, faq: comfortOfferFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创日常陪伴情境 · 完整画像免费", "Original comfort-offer scenes · Full portraits free", "原創日常陪伴情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined ordinary friend scene, choose a practical offer, room to talk or undemanding company. Finish six choices for all three counts and every highest tie. No friend’s information, message, response or saved progress is required.", zh: traditional ? "每個虛構朋友場景，選擇實際小幫助、說話空間或低要求作伴。六題完成後檢視三項次數與全部最高並列。無需朋友資料、訊息、回覆或儲存進度。" : "每个虚构朋友场景，选择实际小帮助、说话空间或低要求作伴。六题完成后查看三项次数与全部最高并列。无需朋友资料、消息、回复或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="comfort-offer-methods"><h2 id="comfort-offer-methods">{text("三种陪伴邀请、支持研究与结果读法", "Three company offers, support research and result readings", "三種陪伴邀請、支援研究與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`comfort-offer-${s.id}`}><h3 id={`comfort-offer-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种陪伴方式画像：完整公开指南", "Three company-offer portraits: complete public guides", "三種陪伴方式人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("陪伴方式测试常见问题", "Comfort and Company Quiz: frequently asked questions", "陪伴方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="comfort-offer-references"><h2 id="comfort-offer-references" className="text-xl font-semibold">{text("倾听、社会支持与方法背景", "Listening, social support and method background", "傾聽、社會支援與方法背景")}</h2><ol className="mt-4 space-y-2"><li id="comfort-offer-reference-1"><a className="underline" rel="noopener noreferrer" href="https://stars.library.ucf.edu/scopus2010/9657/">{text("1. Weger等（2014）：初次互动中积极倾听的实验研究", "1. Weger et al. (2014): active listening in initial interactions", "1. Weger等（2014）：初次互動中積極傾聽的實驗研究")}</a></li><li id="comfort-offer-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.ucsbcrlab.com/uploads/4/3/4/7/43470485/newlookatsocialsupport_pspr.pdf">{text("2. Feeney与Collins（2015）：关系支持与成长的理论综述", "2. Feeney and Collins (2015): theoretical review of social support and thriving", "2. Feeney與Collins（2015）：關係支援與成長的理論綜述")}</a></li><li id="comfort-offer-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.mentalhealth.org.uk/explore-mental-health/blogs/how-good-listening-skills-can-support-someones-mental-health-and-wellbeing">{text("3. Mental Health Foundation：倾听的公开实践指导", "3. Mental Health Foundation: public guidance on listening", "3. Mental Health Foundation：傾聽的公開實踐指導")}</a></li></ol></section>
  </Container></Surface>;
}
