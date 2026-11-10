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
import { borrowedBookSections, borrowedBookFaq } from "./BorrowedBookEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#borrowed-book-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BorrowedBookPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "borrowed-book") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/borrowed-book`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: borrowedBookSections, faq: borrowedBookFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创借书情境 · 完整画像免费", "Original borrowing scenes · Full portraits free", "原創借書情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "In each imagined borrowing scene, choose the part of the agreement you would focus on: a return plan, an optional reading exchange or care preferences. There are no right answers. Finish six questions to see all counts and highest ties; saving or another test is not required.", zh: traditional ? "每個想像借書場景，選擇更想關注的約定部分：歸還安排、可選閱讀交流或愛惜偏好。沒有標準答案。六題完成後檢視全部次數與最高並列；無需儲存或先做其他測驗。" : "每个想象借书场景，选择更想关注的约定部分：归还安排、可选阅读交流或爱惜偏好。没有标准答案。六题完成后查看全部次数与最高并列；无需保存或先做其他测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="borrowed-book-methods"><h2 id="borrowed-book-methods">{text("借阅约定、书籍使用与结果读法", "Borrowing agreements, book handling and result readings", "借閱約定、書籍使用與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`borrowed-book-${s.id}`}><h3 id={`borrowed-book-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种借书约定画像：完整公开指南", "Three borrowing-agreement portraits: complete public guides", "三種借書約定人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("借书约定方式测试常见问题", "Borrowed-book quiz: frequently asked questions", "借書約定方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="borrowed-book-references"><h2 id="borrowed-book-references" className="text-xl font-semibold">{text("书籍使用与保管的背景资料", "Background on book handling and care", "書籍使用與保管的背景資料")}</h2><ol className="mt-4 space-y-2"><li id="borrowed-book-reference-1"><a className="underline" rel="noopener noreferrer" href="https://guides.loc.gov/preserving-your-books/handling">{text("1. 美国国会图书馆：书籍使用与支撑", "1. Library of Congress: handling and supporting books", "1. 美國國會圖書館：書籍使用與支撐")}</a></li><li id="borrowed-book-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.archives.gov/publications/prologue/2015/summer/preserving-books.html">{text("2. 美国国家档案馆：保存书籍", "2. US National Archives: preserving books", "2. 美國國家檔案館：儲存書籍")}</a></li><li id="borrowed-book-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/basic-care-books.html">{text("3. 加拿大文物保护研究所：书籍基本保管", "3. Canadian Conservation Institute: basic care of books", "3. 加拿大文物保護研究所：書籍基本保管")}</a></li></ol></section>
  </Container></Surface>;
}
