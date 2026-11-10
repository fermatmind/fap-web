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
import { campfireStorytellerSections, campfireStorytellerFaq } from "./CampfireStorytellerEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#campfire-storyteller-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CampfireStorytellerPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "campfire-storyteller") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/campfire-storyteller`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: campfireStorytellerSections, faq: campfireStorytellerFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创口述故事情境 · 完整画像免费", "Original spoken-story scenes · Full portraits free", "原創口述故事情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined story-circle scene, choose a short suspenseful moment, a light turn or an invitation to continue. There are no right answers. Finish six questions for all counts and highest ties; no recording, real story or saving choice is required.", zh: traditional ? "每個虛構故事圈場景，選擇一小段懸念、輕巧轉折或邀請續句。沒有標準答案。六題完成後檢視全部次數與最高並列；無需錄音、真實故事或儲存選擇。" : "每个虚构故事圈场景，选择一小段悬念、轻巧转折或邀请续句。没有标准答案。六题完成后查看全部次数与最高并列；无需录音、真实故事或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="campfire-storyteller-methods"><h2 id="campfire-storyteller-methods">{text("讲述方式、研究背景与结果读法", "Storytelling approaches, research background and result readings", "講述方式、研究背景與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`campfire-storyteller-${s.id}`}><h3 id={`campfire-storyteller-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种围坐讲述画像：完整公开指南", "Three story-circle portraits: complete public guides", "三種圍坐講述人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("围坐讲故事角色测试常见问题", "Campfire storyteller quiz: frequently asked questions", "圍坐講故事角色測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="campfire-storyteller-references"><h2 id="campfire-storyteller-references" className="text-xl font-semibold">{text("讲述实践与叙事研究参考资料", "Storytelling practice and narrative research references", "講述實踐與敘事研究參考資料")}</h2><ol className="mt-4 space-y-2"><li id="campfire-storyteller-reference-1"><a className="underline" rel="noopener noreferrer" href="https://storynet.org/what-is-storytelling/">{text("1. National Storytelling Network：讲述与听者互动", "1. National Storytelling Network: What Is Storytelling?", "1. National Storytelling Network：講述與聽者互動")}</a></li><li id="campfire-storyteller-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.01392/full">{text("2. Delatorre等（2018）：不确定性与悬念的实验研究", "2. Delatorre et al. (2018): uncertainty and suspense experiment", "2. Delatorre等（2018）：不確定性與懸念的實驗研究")}</a></li><li id="campfire-storyteller-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.teachingenglish.org.uk/teaching-resources/teaching-secondary/activities/pre-intermediate-a2/storylines">{text("3. British Council：Storylines共同续写活动", "3. British Council: Storylines shared narrative activity", "3. British Council：Storylines共同續寫活動")}</a></li></ol></section>
  </Container></Surface>;
}
