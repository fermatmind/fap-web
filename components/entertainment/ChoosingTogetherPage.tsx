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
import { choosingTogetherSections, choosingTogetherFaq } from "./ChoosingTogetherEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#choosing-together-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function ChoosingTogetherPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "choosing-together") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/choosing-together`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: choosingTogetherSections, faq: choosingTogetherFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创共同选择情境 · 完整画像免费", "Original shared-choice scenes · Full portraits free", "原創共同選擇情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined shared-choice scene, choose criteria, turns, a small trial or separate parts. Finish all six for the four counts and every highest tie. No correct answers, partner’s answers, entry agreement or saving step is required.", zh: traditional ? "每個虛構共同選擇場景，選擇說清條件、輪流、小試或拆分部分。六題完成後檢視四項次數與全部最高並列。沒有標準答案，無需另一人作答，也不要求入口勾選或儲存進度。" : "每个虚构共同选择场景，选择说清条件、轮流、小试或拆分部分。六题完成后查看四项次数与全部最高并列。没有标准答案，无需另一人作答，也不要求入口勾选或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="choosing-together-methods"><h2 id="choosing-together-methods">{text("四种共同选择方法、研究背景与结果读法", "Four shared-choice approaches, research background and result readings", "四種共同選擇方法、研究背景與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`choosing-together-${s.id}`}><h3 id={`choosing-together-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("四种共同选择画像：完整公开指南", "Four shared-choice portraits: complete public guides", "四種共同選擇人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；四种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all four directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；四種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-2">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("一起做小决定测试常见问题", "Choosing Together Quiz: frequently asked questions", "一起做小決定測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="choosing-together-references"><h2 id="choosing-together-references" className="text-xl font-semibold">{text("共同决策研究与方法背景", "Joint decision research and method background", "共同決策研究與方法背景")}</h2><ol className="mt-4 space-y-2"><li id="choosing-together-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.pon.harvard.edu/daily/negotiation-skills-daily/negotiation-skills-expanding-the-pie-integrative-bargaining-versus-distributive-bargaining/">{text("1. Harvard PON：关切、选项与协商标准", "1. Harvard PON: interests, options and negotiation criteria", "1. Harvard PON：關切、選項與協商標準")}</a></li><li id="choosing-together-reference-2"><a className="underline" rel="noopener noreferrer" href="https://dschool.stanford.edu/tools/no-build-hack">{text("2. Stanford d.school：通过简易原型探索问题", "2. Stanford d.school: The No-Build Hack", "2. Stanford d.school：通過簡易原型探索問題")}</a></li><li id="choosing-together-reference-3"><a className="underline" rel="noopener noreferrer" href="https://journals.sagepub.com/doi/10.1177/00222437261439058">{text("3. Wight等（2026）：共同决策的沟通模式原始研究", "3. Wight et al. (2026): Communication Patterns in Joint Decision-Making", "3. Wight等（2026）：共同決策的溝通模式原始研究")}</a></li></ol></section>
  </Container></Surface>;
}
