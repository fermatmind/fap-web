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
import { StoryTakeEntry } from "./StoryTakeEntry";
import { groupChatRoleSections, groupChatRoleFaq } from "./GroupChatRoleEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#group-chat-role-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function GroupChatRolePage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "group-chat-role") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/group-chat-role`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创日常群聊情境 · 完整画像免费" : "Original group-chat scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Think of one casual group chat you enjoy and choose how you would respond in each scene. No chat history is needed. Complete all six choices to read the three counts and every highest full portrait.", zh: "参照一个自己喜欢的轻松群聊，选择每个场景里可能采用的回应。不需要聊天记录。答完六题查看三项次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{groupChatRoleSections[0].title[locale]}</h2>{groupChatRoleSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="group-chat-role-methods"><h2 id="group-chat-role-methods">{zh ? "信息、话题与连接：计分、情境与完整读法" : "Signal, spark and connection: counts, context and complete readings"}</h2><div className="explore-reading-sections">{groupChatRoleSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`group-chat-role-${s.id}`}><h3 id={`group-chat-role-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种群聊贡献：完整公开指南" : "Three group-chat-role emphases: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "群聊角色趣味测试常见问题" : "Group Chat Role Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...groupChatRoleFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="group-chat-role-references"><h2 id="group-chat-role-references" className="text-xl font-semibold">{zh ? "沟通理论与消息组织参考" : "Communication theory and message-organization references"}</h2><ol className="mt-4 space-y-2"><li id="group-chat-role-reference-1"><a className="underline" rel="noopener noreferrer" href="https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions">{zh ? "1. Slack：用讨论串组织相关回复（产品文档）" : "1. Slack: organizing related replies with threads (product documentation)"}</a></li><li id="group-chat-role-reference-2"><a className="underline" rel="noopener noreferrer" href="https://web.stanford.edu/~clark/1990s/Clark%2C%20H.H.%20_%20Brennan%2C%20S.E.%20_Grounding%20in%20communication_%201991.pdf">{zh ? "2. Clark与Brennan（1991）：沟通中的共同理解、目的与媒介" : "2. Clark & Brennan (1991): grounding, purpose and communication media"}</a></li><li id="group-chat-role-reference-3"><a className="underline" rel="noopener noreferrer" href="https://zulip.com/help/introduction-to-topics">{zh ? "3. Zulip：话题结构与异步对话背景（产品文档）" : "3. Zulip: topics and asynchronous conversational context (product documentation)"}</a></li></ol></section>
  </Container></main>;
}
