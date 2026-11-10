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
import { fictionalCafeSections, fictionalCafeFaq } from "./FictionalCafeEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#fictional-cafe-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FictionalCafePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "fictional-cafe") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/fictional-cafe`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: fictionalCafeSections, faq: fictionalCafeFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创虚构咖啡馆情境 · 完整画像免费", "Original impossible-café scenes · Full portraits free", "原創虛構咖啡館情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Choose the invitation you would offer in each impossible café scene: a tiny object performance, a sentence to borrow or an unnamed shade. Complete all six for three raw counts and every highest portrait. No artwork, personal writing, entry agreement, MBTI result or saved progress is required.", zh: traditional ? "每個不可能咖啡館場景，選擇更想提供的邀請：物品小表演、可借句子或無名顏色。六題完成後檢視三項原始次數與全部最高人物側寫。無需作品、私人文字、入口同意、MBTI結果或儲存進度。" : "每个不可能咖啡馆场景，选择更想提供的邀请：物品小表演、可借句子或无名颜色。六题完成后查看三项原始次数与全部最高画像。无需作品、私人文字、入口同意、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="fictional-cafe-methods"><h2 id="fictional-cafe-methods">{text("三种创作邀请、透明计数与结果读法", "Three creative invitations, transparent counts and result readings", "三種創作邀請、透明計數與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`fictional-cafe-${s.id}`}><h3 id={`fictional-cafe-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种不可能咖啡馆画像：完整公开指南", "Three impossible-café portraits: complete public guides", "三種不可能咖啡館人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("不可能咖啡馆设计测试常见问题", "Impossible Café Design Quiz: frequently asked questions", "不可能咖啡館設計測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="fictional-cafe-references"><h2 id="fictional-cafe-references" className="text-xl font-semibold">{text("写作形式、可访问性与创造性思维参考", "Writing formats, accessibility and creative-thinking references", "寫作形式、可訪問性與創造性思維參考")}</h2><ol className="mt-4 space-y-2"><li id="fictional-cafe-reference-1"><a className="underline" rel="noopener noreferrer" href="https://poets.org/text/play-exquisite-corpse">{text("1. 美国诗人学会：接龙诗的合作写作规则", "1. Academy of American Poets: collaborative Exquisite Corpse rules", "1. 美國詩人學會：接龍詩的合作寫作規則")}</a></li><li id="fictional-cafe-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">{text("2. W3C：理解颜色的使用", "2. W3C: Understanding Use of Color", "2. W3C：理解顏色的使用")}</a></li><li id="fictional-cafe-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.oecd.org/en/topics/sub-issues/creative-thinking.html">{text("3. OECD：创造性思维与PISA评估说明", "3. OECD: creative thinking and PISA assessment overview", "3. OECD：創造性思維與PISA評估說明")}</a></li></ol></section>
  </Container></Surface>;
}
