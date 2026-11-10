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
import { browserTabsSections, browserTabsFaq } from "./BrowserTabsEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#browser-tabs-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BrowserTabsPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "browser-tabs") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/browser-tabs`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: browserTabsSections, faq: browserTabsFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创休闲浏览情境 · 完整画像免费", "Original casual-browsing scenes · Full portraits free", "原創休閒瀏覽情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each fictional browsing scene, choose what you would keep: a question, one small trial or an optional interest shelf. There are no right answers. Finish six questions to see all counts and highest ties; no real links, history access or saving choice is required.", zh: traditional ? "每個虛構瀏覽場景，選擇更想留住的用途：一個問題、一次小試或可選興趣架。沒有標準答案。六題完成後檢視全部次數與最高並列；無需真實連結、歷史許可權或儲存選擇。" : "每个虚构浏览场景，选择更想留住的用途：一个问题、一次小试或可选兴趣架。没有标准答案。六题完成后查看全部次数与最高并列；无需真实链接、历史权限或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="browser-tabs-methods"><h2 id="browser-tabs-methods">{text("页面用途、研究背景与结果读法", "Page functions, research background and result readings", "頁面用途、研究背景與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`browser-tabs-${s.id}`}><h3 id={`browser-tabs-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种休闲标签页画像：完整公开指南", "Three casual-tab portraits: complete public guides", "三種休閒標籤頁人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("休闲浏览标签页测试常见问题", "Browser-tab style quiz: frequently asked questions", "休閒瀏覽標籤頁測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="browser-tabs-references"><h2 id="browser-tabs-references" className="text-xl font-semibold">{text("浏览使用研究与工具背景资料", "Research and tool background for browsing", "瀏覽使用研究與工具背景資料")}</h2><ol className="mt-4 space-y-2"><li id="browser-tabs-reference-1"><a className="underline" rel="noopener noreferrer" href="https://josephcc.com/static/papers/233987809/paper.pdf">{text("1. Chang等（2021）：标签页使用成本研究原文", "1. Chang et al. (2021): original study of browser-tab usage costs", "1. Chang等（2021）：標籤頁使用成本研究原文")}</a></li><li id="browser-tabs-reference-2"><a className="underline" rel="noopener noreferrer" href="https://support.google.com/chrome/answer/2391819?hl=en">{text("2. Google Chrome：标签页与分组管理说明", "2. Google Chrome: managing tabs and tab groups", "2. Google Chrome：標籤頁與分組管理說明")}</a></li><li id="browser-tabs-reference-3"><a className="underline" rel="noopener noreferrer" href="https://support.mozilla.org/fr/kb/groupes-onglets">{text("3. Mozilla Firefox：标签页分组说明（法文）", "3. Mozilla Firefox: tab groups (French)", "3. Mozilla Firefox：標籤頁分組說明（法文）")}</a></li></ol></section>
  </Container></Surface>;
}
