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
import { giftNoteSections, giftNoteFaq } from "./GiftNoteEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#gift-note-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function GiftNotePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "gift-note") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/gift-note`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: giftNoteSections, faq: giftNoteFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创附言写作情境 · 完整画像免费", "Original note-writing scenes · Full portraits free", "原創附言寫作情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Imagine each gift-note scene and choose the wording you would favor now. No gift purchase or message entry is needed. Complete all six choices to read the three raw counts and every highest full portrait.", zh: traditional ? "想像每個禮物附言場景，選擇此刻較願意採用的措辭。無需買禮物或輸入資訊。答完六題檢視三項原始次數與全部最高完整人物側寫。" : "想象每个礼物附言场景，选择此刻较愿意采用的措辞。无需买礼物或输入信息。答完六题查看三项原始次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="gift-note-methods"><h2 id="gift-note-methods">{text("记忆、感谢与祝愿：写作侧重及完整读法", "Memory, thanks and wishes: writing emphases and complete readings", "記憶、感謝與祝願：寫作側重及完整讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`gift-note-${s.id}`}><h3 id={`gift-note-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种礼物附言：完整公开指南", "Three gift-note emphases: complete public guides", "三種禮物附言：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與可選小嚐試。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("礼物小笺表达测试常见问题", "Gift Note Style Quiz: frequently asked questions", "禮物小箋表達測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="gift-note-references"><h2 id="gift-note-references" className="text-xl font-semibold">{text("感恩表达研究与便条写作参考", "Gratitude research and practical note-writing references", "感恩表達研究與便條寫作參考")}</h2><ol className="mt-4 space-y-2"><li id="gift-note-reference-1"><a className="underline" rel="noopener noreferrer" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4988174/">{text("1. Algoe等（2016）：伴侣感恩对话中的赞赏表达与感知回应", "1. Algoe et al. (2016): other-praising gratitude and perceived responsiveness", "1. Algoe等（2016）：伴侶感恩對話中的讚賞表達與感知回應")}</a></li><li id="gift-note-reference-2"><a className="underline" rel="noopener noreferrer" href="https://ideas.hallmark.com/articles/thank-you-ideas/how-to-write-a-thank-you-note/">{text("2. Hallmark：感谢便条的实用写作结构（礼仪建议）", "2. Hallmark: practical thank-you note structure (etiquette advice)", "2. Hallmark：感謝便條的實用寫作結構（禮儀建議）")}</a></li><li id="gift-note-reference-3"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/29949445/">{text("3. Kumar与Epley（2018）：感恩表达者对接收反应的预期研究", "3. Kumar & Epley (2018): expectations about receiving gratitude", "3. Kumar與Epley（2018）：感恩表達者對接收反應的預期研究")}</a></li></ol></section>
  </Container></Surface>;
}
