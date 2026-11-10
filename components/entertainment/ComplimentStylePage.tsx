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
import { complimentStyleSections, complimentStyleFaq } from "./ComplimentStyleEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#compliment-style-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function ComplimentStylePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "compliment-style") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/compliment-style`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: complimentStyleSections, faq: complimentStyleFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创日常欣赏情境 · 完整画像免费", "Original everyday appreciation scenes · Full portraits free", "原創日常欣賞情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined appreciation scene, choose a visible detail, a process the person shared or an effect you experienced. Finish six choices for all three counts and every highest tie. No actual compliment, recipient response or saved progress is required.", zh: traditional ? "每個虛構欣賞場景，選擇可見細節、對方分享的過程或自身體驗的影響。六題完成後檢視三項次數與全部最高並列。無需真實讚美、接收者回復或儲存進度。" : "每个虚构欣赏场景，选择可见细节、对方分享的过程或自身体验的影响。六题完成后查看三项次数与全部最高并列。无需真实赞美、接收者回复或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="compliment-style-methods"><h2 id="compliment-style-methods">{text("三种欣赏表达、赞美研究与结果读法", "Three appreciation voices, compliment research and result readings", "三種欣賞表達、讚美研究與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`compliment-style-${s.id}`}><h3 id={`compliment-style-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种具体欣赏画像：完整公开指南", "Three appreciation portraits: complete public guides", "三種具體欣賞人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("具体夸奖方式测试常见问题", "Compliment Style Quiz: frequently asked questions", "具體誇獎方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="compliment-style-references"><h2 id="compliment-style-references" className="text-xl font-semibold">{text("赞美研究与表达方法背景", "Compliment research and communication background", "讚美研究與表達方法背景")}</h2><ol className="mt-4 space-y-2"><li id="compliment-style-reference-1"><a className="underline" rel="noopener noreferrer" href="https://ecommons.cornell.edu/entities/publication/0698c45d-1d7b-474b-87d5-ed8c784e6172">{text("1. Boothby与Bohns（2021；2020在线）：赞美预期与接收体验的实验研究", "1. Boothby and Bohns (2021; online 2020): expectations and recipients’ experience of compliments", "1. Boothby與Bohns（2021；2020線上）：讚美預期與接收體驗的實驗研究")}</a></li><li id="compliment-style-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii/">{text("2. Center for Creative Leadership：情境、行为、影响与意图的反馈指导", "2. Center for Creative Leadership: Situation–Behavior–Impact and intent guidance", "2. Center for Creative Leadership：情境、行為、影響與意圖的反饋指導")}</a></li><li id="compliment-style-reference-3"><a className="underline" rel="noopener noreferrer" href="https://ggia.berkeley.edu/practice/gratitude_letter">{text("3. Greater Good in Action：感恩信练习", "3. Greater Good in Action: Gratitude Letter practice", "3. Greater Good in Action：感恩信練習")}</a></li></ol></section>
  </Container></Surface>;
}
