import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { FunQuizClient } from "./FunQuizClient";
import { enchantedLibrarySections, enchantedLibraryFaq } from "./EnchantedLibraryEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#enchanted-library-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function EnchantedLibraryPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "enchanted-library") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/enchanted-library`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "每次3至4次选择 · 约2分钟 · 无需注册" : "3–4 choices per reading · About 2 minutes · No registration"}</span><span>{zh ? "原创图书馆短篇 · 三种完整结局免费" : "Original library tale · Three full endings free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Read each conflicting-catalogue scene and choose one of its two options. Three or four linked choices lead to one complete ending; you do not need to visit all five scenes. No uploaded records, entry agreement, MBTI result or saved progress is required.", zh: "阅读每个目录冲突情境，从两个选项中选一项。沿三至四个相连选择走到一个完整结局，不需要遍历全部五个情境。无需上传记录、入口同意、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{enchantedLibrarySections[0].title[locale]}</h2>{enchantedLibrarySections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="enchanted-library-methods"><h2 id="enchanted-library-methods">{zh ? "记录、见闻与未解问题：结局及阅读方法" : "Records, testimony and open questions: endings and reading"}</h2><div className="explore-reading-sections">{enchantedLibrarySections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`enchanted-library-${s.id}`}><h3 id={`enchanted-library-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种魔法图书馆结局：完整公开指南" : "Three enchanted-library endings: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。" : "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "魔法图书馆分支故事常见问题" : "Enchanted Library Branching Story: frequently asked questions"}</h2>{[quiz.seo.faq,...enchantedLibraryFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="enchanted-library-references"><h2 id="enchanted-library-references" className="text-xl font-semibold">{zh ? "信息评价与口述见闻参考" : "Information evaluation and oral-history references"}</h2><ol className="mt-4 space-y-2"><li id="enchanted-library-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.ala.org/acrl/standards/ilframework">{zh ? "1. ACRL：信息素养框架中的情境与权威" : "1. ACRL: contextual authority in information literacy"}</a></li><li id="enchanted-library-reference-2"><a className="underline" rel="noopener noreferrer" href="https://oralhistory.org/oha-core-principles/">{zh ? "2. Oral History Association：回忆、情境与使用许可" : "2. Oral History Association: recollection, context and permission"}</a></li><li id="enchanted-library-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.unesco.org/mil4teachers/fr/module3/unit3?hub=16">{zh ? "3. UNESCO：学术与科学信息评价（法文）" : "3. UNESCO: evaluating academic and scientific information (French)"}</a></li></ol></section>
  </Container></main>;
}
