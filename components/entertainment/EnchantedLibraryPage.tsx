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
import { enchantedLibrarySections, enchantedLibraryFaq } from "./EnchantedLibraryEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#enchanted-library-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function EnchantedLibraryPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "enchanted-library") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/enchanted-library`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: enchantedLibrarySections, faq: enchantedLibraryFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("每次3至4次选择 · 约2分钟 · 无需注册", "3–4 choices per reading · About 2 minutes · No registration", "每次3至4次選擇 · 約2分鐘 · 無需註冊")}</span><span>{text("原创图书馆短篇 · 三种完整结局免费", "Original library tale · Three full endings free", "原創圖書館短篇 · 三種完整結局免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Read each conflicting-catalogue scene and choose one of its two options. Three or four linked choices lead to one complete ending; you do not need to visit all five scenes. No uploaded records, entry agreement, MBTI result or saved progress is required.", zh: traditional ? "閱讀每個目錄衝突情境，從兩個選項中選一項。沿三至四個相連選擇走到一個完整結局，不需要遍歷全部五個情境。無需上傳記錄、入口同意、MBTI結果或儲存進度。" : "阅读每个目录冲突情境，从两个选项中选一项。沿三至四个相连选择走到一个完整结局，不需要遍历全部五个情境。无需上传记录、入口同意、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="enchanted-library-methods"><h2 id="enchanted-library-methods">{text("记录、见闻与未解问题：结局及阅读方法", "Records, testimony and open questions: endings and reading", "記錄、見聞與未解問題：結局及閱讀方法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`enchanted-library-${s.id}`}><h3 id={`enchanted-library-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种魔法图书馆结局：完整公开指南", "Three enchanted-library endings: complete public guides", "三種魔法圖書館結局：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。", "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending.", "每篇均有完整結局說明、日常例子、取捨與閱讀提示。這些是公開原創指南，不是訪客私人選擇；三篇均可直接閱讀，每次完成路線只得到一個結局。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("魔法图书馆分支故事常见问题", "Enchanted Library Branching Story: frequently asked questions", "魔法圖書館分支故事常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="enchanted-library-references"><h2 id="enchanted-library-references" className="text-xl font-semibold">{text("信息评价与口述见闻参考", "Information evaluation and oral-history references", "資訊評價與口述見聞參考")}</h2><ol className="mt-4 space-y-2"><li id="enchanted-library-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.ala.org/acrl/standards/ilframework">{text("1. ACRL：信息素养框架中的情境与权威", "1. ACRL: contextual authority in information literacy", "1. ACRL：資訊素養框架中的情境與權威")}</a></li><li id="enchanted-library-reference-2"><a className="underline" rel="noopener noreferrer" href="https://oralhistory.org/oha-core-principles/">{text("2. Oral History Association：回忆、情境与使用许可", "2. Oral History Association: recollection, context and permission", "2. Oral History Association：回憶、情境與使用許可")}</a></li><li id="enchanted-library-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.unesco.org/mil4teachers/fr/module3/unit3?hub=16">{text("3. UNESCO：学术与科学信息评价（法文）", "3. UNESCO: evaluating academic and scientific information (French)", "3. UNESCO：學術與科學資訊評價（法文）")}</a></li></ol></section>
  </Container></Surface>;
}
