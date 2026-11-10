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
import { groupChatRoleSections, groupChatRoleFaq } from "./GroupChatRoleEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#group-chat-role-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function GroupChatRolePage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "group-chat-role") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/group-chat-role`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: groupChatRoleSections, faq: groupChatRoleFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创日常群聊情境 · 完整画像免费", "Original group-chat scenes · Full portraits free", "原創日常群聊情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Think of one casual group chat you enjoy and choose how you would respond in each scene. No chat history is needed. Complete all six choices to read the three counts and every highest full portrait.", zh: traditional ? "參照一個自己喜歡的輕鬆群聊，選擇每個場景裡可能採用的回應。不需要聊天記錄。答完六題檢視三項次數與全部最高完整人物側寫。" : "参照一个自己喜欢的轻松群聊，选择每个场景里可能采用的回应。不需要聊天记录。答完六题查看三项次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="group-chat-role-methods"><h2 id="group-chat-role-methods">{text("信息、话题与连接：计分、情境与完整读法", "Signal, spark and connection: counts, context and complete readings", "資訊、話題與連線：計分、情境與完整讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`group-chat-role-${s.id}`}><h3 id={`group-chat-role-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种群聊贡献：完整公开指南", "Three group-chat-role emphases: complete public guides", "三種群聊貢獻：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與可選小嚐試。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("群聊角色趣味测试常见问题", "Group Chat Role Quiz: frequently asked questions", "群聊角色趣味測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="group-chat-role-references"><h2 id="group-chat-role-references" className="text-xl font-semibold">{text("沟通理论与消息组织参考", "Communication theory and message-organization references", "溝通理論與訊息組織參考")}</h2><ol className="mt-4 space-y-2"><li id="group-chat-role-reference-1"><a className="underline" rel="noopener noreferrer" href="https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions">{text("1. Slack：用讨论串组织相关回复（产品文档）", "1. Slack: organizing related replies with threads (product documentation)", "1. Slack：用討論串組織相關回復（產品文件）")}</a></li><li id="group-chat-role-reference-2"><a className="underline" rel="noopener noreferrer" href="https://web.stanford.edu/~clark/1990s/Clark%2C%20H.H.%20_%20Brennan%2C%20S.E.%20_Grounding%20in%20communication_%201991.pdf">{text("2. Clark与Brennan（1991）：沟通中的共同理解、目的与媒介", "2. Clark & Brennan (1991): grounding, purpose and communication media", "2. Clark與Brennan（1991）：溝通中的共同理解、目的與媒介")}</a></li><li id="group-chat-role-reference-3"><a className="underline" rel="noopener noreferrer" href="https://zulip.com/help/introduction-to-topics">{text("3. Zulip：话题结构与异步对话背景（产品文档）", "3. Zulip: topics and asynchronous conversational context (product documentation)", "3. Zulip：話題結構與非同步對話背景（產品文件）")}</a></li></ol></section>
  </Container></Surface>;
}
