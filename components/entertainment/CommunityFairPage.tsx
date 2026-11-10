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
import { communityFairSections, communityFairFaq } from "./CommunityFairEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#community-fair-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CommunityFairPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "community-fair") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/community-fair`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: communityFairSections, faq: communityFairFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创自愿帮忙情境 · 完整画像免费", "Original voluntary-help scenes · Full portraits free", "原創自願幫忙情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each imagined craft-fair scene, choose a time window, one defined task or a clear handover. Finish six choices for all three counts and every highest tie. No actual volunteering, donation, application or saved progress is required.", zh: traditional ? "每個虛構手作市集場景，選擇時間段、明確任務或清楚交接。六題完成後檢視三項次數與全部最高並列。無需真實志願服務、捐款、申請或儲存進度。" : "每个虚构手作市集场景，选择时间段、明确任务或清楚交接。六题完成后查看三项次数与全部最高并列。无需真实志愿服务、捐款、申请或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="community-fair-methods"><h2 id="community-fair-methods">{text("三种贡献安排、志愿参与研究与结果读法", "Three contribution approaches, volunteering research and result readings", "三種貢獻安排、志願參與研究與結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`community-fair-${s.id}`}><h3 id={`community-fair-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种市集帮手画像：完整公开指南", "Three fair-helper portraits: complete public guides", "三種市集幫手人物側寫：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與參與提示。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("市集帮忙角色测试常见问题", "Community Fair Helper Quiz: frequently asked questions", "市集幫忙角色測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="community-fair-references"><h2 id="community-fair-references" className="text-xl font-semibold">{text("志愿参与指导与研究背景", "Volunteer involvement guidance and research background", "志願參與指導與研究背景")}</h2><ol className="mt-4 space-y-2"><li id="community-fair-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.ncvo.org.uk/help-and-guidance/safeguarding/certain-roles/volunteer-managers/recruiting-safely/getting-volunteers-started/">{text("1. NCVO：志愿者入门与角色支持指导", "1. NCVO: getting new volunteers started", "1. NCVO：志願者入門與角色支援指導")}</a></li><li id="community-fair-reference-2"><a className="underline" rel="noopener noreferrer" href="https://volunteer.ca/canadian-code-for-volunteer-involvement/">{text("2. Volunteer Canada：志愿参与准则介绍", "2. Volunteer Canada: Canadian Code for Volunteer Involvement", "2. Volunteer Canada：志願參與準則介紹")}</a></li><li id="community-fair-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.urban.org/research/publication/volunteer-management-practices-and-retention-volunteers">{text("3. Hager与Brudney（2004）：志愿管理做法与志愿者留任调查报告", "3. Hager and Brudney (2004): Volunteer Management Practices and Retention of Volunteers", "3. Hager與Brudney（2004）：志願管理做法與志願者留任調查報告")}</a></li></ol></section>
  </Container></Surface>;
}
