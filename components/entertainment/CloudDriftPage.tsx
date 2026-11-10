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
import { cloudDriftSections, cloudDriftFaq } from "./CloudDriftEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#cloud-drift-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CloudDriftPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "cloud-drift") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/cloud-drift`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: cloudDriftSections, faq: cloudDriftFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {traditional ? null : <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创云形想象情境 · 完整画像免费", "Original cloud-drift scenes · Full portraits free", "原創雲形想像情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined cloud scene, choose an outline, a next moment or an unnamed shape. Complete six choices for three counts and every highest tie. No drawing, photograph, outdoor task or saved progress is needed.", zh: traditional ? "每個虛構雲形場景，選擇勾出輪廓、接上下一刻或保留未命名形狀。六題完成後檢視三項次數與全部最高並列。無需繪畫、照片、戶外任務或儲存進度。" : "每个虚构云形场景，选择勾出轮廓、接上下一刻或保留未命名形状。六题完成后查看三项次数与全部最高并列。无需绘画、照片、户外任务或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="cloud-drift-methods"><h2 id="cloud-drift-methods">{text("三种云形玩法、知觉研究与结果读法", "Three cloud-play approaches, perception research and result readings", "三種雲形玩法、知覺研究與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`cloud-drift-${s.id}`}><h3 id={`cloud-drift-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种看云创意画像：完整公开指南", "Three cloud-drift portraits: complete public guides", "三種看雲創意人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("看云小游戏常见问题", "Cloud Shape Quiz: frequently asked questions", "看雲小遊戲常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="cloud-drift-references"><h2 id="cloud-drift-references" className="text-xl font-semibold">{text("视觉知觉、创作活动与云分类背景", "Visual perception, creative activities and cloud classification", "視覺知覺、創作活動與雲分類背景")}</h2><ol className="mt-4 space-y-2"><li id="cloud-drift-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.nature.com/articles/s41467-020-18325-8">{text("1. Wardle等（2020）：面孔空想性错视的神经表征研究", "1. Wardle et al. (2020): Rapid and dynamic processing of face pareidolia in the human brain", "1. Wardle等（2020）：面孔空想性錯視的神經表徵研究")}</a></li><li id="cloud-drift-reference-2"><a className="underline" rel="noopener noreferrer" href="https://nmaahc.si.edu/sites/default/files/downloads/resources/activity_book_m_early_learners_edition.pdf">{text("2. Smithsonian NMAAHC：早期学习活动册，散落纸片与涂鸦活动", "2. Smithsonian NMAAHC: early-learning activity book, loose shapes and scribble activities", "2. Smithsonian NMAAHC：早期學習活動冊，散落紙片與塗鴉活動")}</a></li><li id="cloud-drift-reference-3"><a className="underline" rel="noopener noreferrer" href="https://scied.ucar.edu/learning-zone/clouds">{text("3. UCAR科学教育中心：云的形成、类型与学习活动", "3. UCAR Center for Science Education: cloud formation, types and activities", "3. UCAR科學教育中心：雲的形成、型別與學習活動")}</a></li></ol></section>
  </Container></Surface>;
}
