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
import { friendshipInvitationSections, friendshipInvitationFaq } from "./FriendshipInvitationEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#friendship-invitation-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FriendshipInvitationPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "friendship-invitation") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/friendship-invitation`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: friendshipInvitationSections, faq: friendshipInvitationFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创日常邀请情境 · 完整画像免费", "Original invitation scenes · Full portraits free", "原創日常邀請情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "For each everyday invitation scene, choose the message detail you would emphasize: a clear plan, an honest interest link or room to choose. Answer as you would usually write, rather than choosing an ideal response. Complete all six for raw counts and every highest full portrait.", zh: traditional ? "每個日常邀請場景，選擇更想強調的資訊：清楚計劃、真實興趣聯絡或可選空間。按通常會寫的方式作答，不必尋找理想答案。答完六題檢視原始次數與全部最高完整人物側寫。" : "每个日常邀请场景，选择更想强调的信息：清楚计划、真实兴趣联系或可选空间。按通常会写的方式作答，不必寻找理想答案。答完六题查看原始次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="friendship-invitation-methods"><h2 id="friendship-invitation-methods">{text("三种邀请侧重、透明计数与完整结果读法", "Three invitation emphases, transparent counts and complete readings", "三種邀請側重、透明計數與完整結果讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`friendship-invitation-${s.id}`}><h3 id={`friendship-invitation-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种朋友相约邀请：完整公开指南", "Three friendship invitations: complete public guides", "三種朋友相約邀請：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與可選小嚐試。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("朋友相约邀请测试常见问题", "Friendship Invitation Quiz: frequently asked questions", "朋友相約邀請測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="friendship-invitation-references"><h2 id="friendship-invitation-references" className="text-xl font-semibold">{text("动机理论、邀请拒绝与答复不确定性研究", "Motivation theory, invitation declines and uncertain replies", "動機理論、邀請拒絕與答覆不確定性研究")}</h2><ol className="mt-4 space-y-2"><li id="friendship-invitation-reference-1"><a className="underline" rel="noopener noreferrer" href="https://selfdeterminationtheory.org/theory/">{text("1. 自我决定理论：自主意愿与关系的概念框架", "1. Self-Determination Theory: volition and relationships", "1. 自我決定理論：自主意願與關係的概念框架")}</a></li><li id="friendship-invitation-reference-2"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/38079463/">{text("2. Givi与Kirk（2024）：邀请拒绝的后果预测研究摘要", "2. Givi and Kirk (2024): abstract on predicting invitation declines", "2. Givi與Kirk（2024）：邀請拒絕的後果預測研究摘要")}</a></li><li id="friendship-invitation-reference-3"><a className="underline" rel="noopener noreferrer" href="https://doi.org/10.1016/j.jesp.2025.104814">{text("3. Givi等（2025）：邀请中“可能”答复的判断研究", "3. Givi et al. (2025): judgments about “maybe” replies", "3. Givi等（2025）：邀請中“可能”答覆的判斷研究")}</a></li></ol></section>
  </Container></Surface>;
}
