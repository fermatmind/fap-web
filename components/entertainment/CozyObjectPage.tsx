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
import { cozyObjectSections, cozyObjectFaq } from "./CozyObjectEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#cozy-object-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CozyObjectPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "cozy-object") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/cozy-object`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: cozyObjectSections, faq: cozyObjectFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创温暖物件场景 · 完整画像免费", "Original cozy object scenes · Full portraits free", "原創溫暖物件場景 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined cozy scene, choose the invitation you prefer: a familiar beginning, a softly edged place or room for an unfinished thought. Finish six choices for all three counts and every highest tie. No object purchase, private writing or saved progress is required.", zh: traditional ? "每個虛構溫暖場景，選擇更想保留的邀請：熟悉的開頭、柔和停留處或未完念頭的空間。六題完成後檢視三項次數與全部最高並列。無需購買物件、提交私人文字或儲存進度。" : "每个虚构温暖场景，选择更想保留的邀请：熟悉的开头、柔和停留处或未完念头的空间。六题完成后查看三项次数与全部最高并列。无需购买物件、提交私人文字或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="cozy-object-methods"><h2 id="cozy-object-methods">{text("三种物件场景、创作方法与结果读法", "Three object scenes, creative methods and result readings", "三種物件場景、創作方法與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`cozy-object-${s.id}`}><h3 id={`cozy-object-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种温暖物件画像：完整公开指南", "Three cozy object portraits: complete public guides", "三種溫暖物件人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("温暖小物场景测试常见问题", "Cozy Object Quiz: frequently asked questions", "溫暖小物場景測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="cozy-object-references"><h2 id="cozy-object-references" className="text-xl font-semibold">{text("物件观察与创作方法参考", "Object observation and creative practice references", "物件觀察與創作方法參考")}</h2><ol className="mt-4 space-y-2"><li id="cozy-object-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.nationalwritingproject.uk/writers-notebook">{text("1. National Writing Project UK：写作者笔记本的选择与想法生成", "1. National Writing Project UK: choice and idea generation in a writer’s notebook", "1. National Writing Project UK：寫作者筆記本的選擇與想法生成")}</a></li><li id="cozy-object-reference-2"><a className="underline" rel="noopener noreferrer" href="https://americanhistory.si.edu/sites/default/files/PrimarySources.pdf">{text("2. Smithsonian：物件阅读与资料局限（第46至52页）", "2. Smithsonian: reading objects and source limitations (pages 46–52)", "2. Smithsonian：物件閱讀與資料侷限（第46至52頁）")}</a></li><li id="cozy-object-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.vam.ac.uk/articles/design-and-make-your-own-story">{text("3. V&A：以家中物件创作故事", "3. V&A: creating stories from household objects", "3. V&A：以家中物件創作故事")}</a></li></ol></section>
  </Container></Surface>;
}
