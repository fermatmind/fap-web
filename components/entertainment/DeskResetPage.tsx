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
import { deskResetSections, deskResetFaq } from "./DeskResetEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#desk-reset-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DeskResetPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "desk-reset") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/desk-reset`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: deskResetSections, faq: deskResetFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创个人台面情境 · 完整画像免费", "Original personal-workspace scenes · Full portraits free", "原創個人檯面情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each small workspace scene, choose how you would arrange familiar tools, active materials or space for a first action. Imagine a personal surface, including a shared table or temporary corner. Complete six choices for all counts and highest ties; no desk photo, purchase or saved progress is required.", zh: traditional ? "每個小桌面情境，選擇會怎樣安排熟悉工具、當前材料或第一步的空間。想像個人使用的檯面，包括共用桌子或臨時角落。六題完成後檢視全部次數與最高並列，無需桌面照片、購買用品或儲存進度。" : "每个小桌面情境，选择会怎样安排熟悉工具、当前材料或第一步的空间。想象个人使用的台面，包括共用桌子或临时角落。六题完成后查看全部次数与最高并列，无需桌面照片、购买用品或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="desk-reset-methods"><h2 id="desk-reset-methods">{text("三种台面安排、使用取舍与结果读法", "Three workspace arrangements, practical tradeoffs and result readings", "三種檯面安排、使用取捨與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`desk-reset-${s.id}`}><h3 id={`desk-reset-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种桌面整理画像：完整公开指南", "Three desk-reset portraits: complete public guides", "三種桌面整理人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("桌面小整理测试常见问题", "Desk Reset Style Quiz: frequently asked questions", "桌面小整理測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="desk-reset-references"><h2 id="desk-reset-references" className="text-xl font-semibold">{text("空间认知与工位设计参考", "Spatial cognition and workstation design references", "空間認知與工位設計參考")}</h2><ol className="mt-4 space-y-2"><li id="desk-reset-reference-1"><a className="underline" rel="noopener noreferrer" href="https://adrenaline.ucsd.edu/kirsh/Articles/Space/AIJ1.html">{text("1. Kirsh（1995）：空间的智能使用", "1. Kirsh (1995): The Intelligent Use of Space", "1. Kirsh（1995）：空間的智慧使用")}</a></li><li id="desk-reset-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.osha.gov/etools/computer-workstations/components/desks">{text("2. OSHA：计算机工位的桌面安排", "2. OSHA: desk arrangements for computer workstations", "2. OSHA：計算機工位的桌面安排")}</a></li><li id="desk-reset-reference-3"><a className="underline" rel="noopener noreferrer" href="https://ressources.inrs.fr/visionneuse/ED%206538/publication/travail-sur-ecran-%28inrs-ed-6538%29.pdf">{text("3. INRS：屏幕工作与工位布置", "3. INRS: screen work and workstation layout", "3. INRS：螢幕工作與工位佈置")}</a></li></ol></section>
  </Container></Surface>;
}
