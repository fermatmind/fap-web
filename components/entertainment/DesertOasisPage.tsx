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
import { desertOasisSections, desertOasisFaq } from "./DesertOasisEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#desert-oasis-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DesertOasisPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "desert-oasis") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/desert-oasis`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: desertOasisSections, faq: desertOasisFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创想象空间设计 · 完整画像免费", "Original imaginary space design · Full portraits free", "原創想像空間設計 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imaginary oasis scene, choose the detail you would emphasise: clear information, a shared picture or space to pause. Visitors have already arrived safely and have everything they need. Complete six choices for all counts and highest ties; no real travel, agreement or saved progress is required.", zh: traditional ? "每個想像綠洲情境，選擇會先強調的細節：清楚資訊、共同畫面或停留空間。訪客已安全抵達，所需已備齊。六題完成後檢視全部次數與最高並列，無需真實旅行、入口同意或儲存進度。" : "每个想象绿洲情境，选择会先强调的细节：清楚信息、共同画面或停留空间。访客已安全抵达，所需已备齐。六题完成后查看全部次数与最高并列，无需真实旅行、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="desert-oasis-methods"><h2 id="desert-oasis-methods">{text("三种空间侧重、设计取舍与结果读法", "Three spatial priorities, design tradeoffs and result readings", "三種空間側重、設計取捨與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`desert-oasis-${s.id}`}><h3 id={`desert-oasis-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种想象绿洲画像：完整公开指南", "Three imaginary oasis portraits: complete public guides", "三種想像綠洲人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("想象绿洲歇脚站测试常见问题", "Imaginary Oasis Design Quiz: frequently asked questions", "想像綠洲歇腳站測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="desert-oasis-references"><h2 id="desert-oasis-references" className="text-xl font-semibold">{text("包容性设计、展陈与公共空间参考", "Inclusive design, exhibitions and public-space references", "包容性設計、展陳與公共空間參考")}</h2><ol className="mt-4 space-y-2"><li id="desert-oasis-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.designcouncil.org.uk/fileadmin/uploads/dc/Documents/the-principles-of-inclusive-design.pdf">{text("1. CABE／Design Council：包容性设计原则", "1. CABE / Design Council: principles of inclusive design", "1. CABE／Design Council：包容性設計原則")}</a></li><li id="desert-oasis-reference-2"><a className="underline" rel="noopener noreferrer" href="https://affiliations.si.edu/wp-content/uploads/PDFs/Accessible-Exhibition-Design.pdf">{text("2. Smithsonian：无障碍展陈设计指导", "2. Smithsonian: accessible exhibition design guidance", "2. Smithsonian：無障礙展陳設計指導")}</a></li><li id="desert-oasis-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.pps.org/article/grplacefeat">{text("3. Project for Public Spaces：公共场所的观察框架", "3. Project for Public Spaces: qualities of public places", "3. Project for Public Spaces：公共場所的觀察框架")}</a></li></ol></section>
  </Container></Surface>;
}
