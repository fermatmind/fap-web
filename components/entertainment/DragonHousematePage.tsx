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
import { dragonHousemateSections, dragonHousemateFaq } from "./DragonHousemateEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#dragon-housemate-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DragonHousematePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "dragon-housemate") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/dragon-housemate`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: dragonHousemateSections, faq: dragonHousemateFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创友好龙室友情境 · 完整画像免费", "Original friendly-dragon scenes · Full portraits free", "原創友好龍室友情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each friendly dragon-housemate scene, choose how you would discuss shared space, recurring contact or a small joint solution. Use the fictional flat rather than judging a real person. Finish six choices for all counts and highest ties; no roommate reply, signed agreement, MBTI result or saved progress is required.", zh: traditional ? "每個友好龍室友情境，選擇會怎樣商量共用空間、重複聯絡或小型共同辦法。使用虛構公寓，不評價真人。六題完成後檢視全部次數與最高並列，無需室友回覆、簽署約定、MBTI結果或儲存進度。" : "每个友好龙室友情境，选择会怎样商量共用空间、重复联系或小型共同办法。使用虚构公寓，不评价真人。六题完成后查看全部次数与最高并列，无需室友回复、签署约定、MBTI结果或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="dragon-housemate-methods"><h2 id="dragon-housemate-methods">{text("三种合住协调、共同选择与结果读法", "Three shared-living approaches, joint choices and result readings", "三種合住協調、共同選擇與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`dragon-housemate-${s.id}`}><h3 id={`dragon-housemate-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种龙室友相处画像：完整公开指南", "Three dragon-housemate portraits: complete public guides", "三種龍室友相處人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("龙室友相处趣味测试常见问题", "Dragon Housemate Quiz: frequently asked questions", "龍室友相處趣味測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="dragon-housemate-references"><h2 id="dragon-housemate-references" className="text-xl font-semibold">{text("合住约定与家庭惯例研究参考", "Shared-living guidance and family-routines research references", "合住約定與家庭慣例研究參考")}</h2><ol className="mt-4 space-y-2"><li id="dragon-housemate-reference-1"><a className="underline" rel="noopener noreferrer" href="https://vancouver.housing.ubc.ca/wp-content/uploads/2023/08/Roommate-Agreement-Form.pdf">{text("1. UBC：可修改的室友约定表", "1. UBC: roommate agreement and revisiting arrangements", "1. UBC：可修改的室友約定表")}</a></li><li id="dragon-housemate-reference-2"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/12561283/">{text("2. Fiese等（2002）：家庭惯例与仪式研究综述摘要", "2. Fiese et al. (2002): family routines and rituals review abstract", "2. Fiese等（2002）：家庭慣例與儀式研究綜述摘要")}</a></li><li id="dragon-housemate-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.uottawa.ca/campus-life/sites/g/files/bhrskd281/files/2023-08/2022_SharedLiving_RoommateAgreement_FR_Final_updated%20July262023.pdf">{text("3. uOttawa：法文室友约定的讨论主题", "3. uOttawa: discussion topics in its French roommate agreement", "3. uOttawa：法文室友約定的討論主題")}</a></li></ol></section>
  </Container></Surface>;
}
