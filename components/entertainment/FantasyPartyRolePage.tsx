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
import { fantasyPartyRoleSections, fantasyPartyRoleFaq } from "./FantasyPartyRoleEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#fantasy-party-role-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function FantasyPartyRolePage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "fantasy-party-role") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/fantasy-party-role`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创奇幻图书馆情境 · 完整画像免费" : "Original fantasy-library scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Choose how you would help the imaginary library party in each scene: clarify the route, share resources and limits, or adapt a tool. All six answers produce three raw counts and every highest portrait. No game knowledge, team, entry agreement or saved progress is required.", zh: "每个场景，选择更想怎样帮助想象中的图书馆小队：弄清路线、照顾共同资源与界限，或改造工具。六题完成后查看三项原始次数及全部最高画像。无需游戏知识、组队、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{fantasyPartyRoleSections[0].title[locale]}</h2>{fantasyPartyRoleSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="fantasy-party-role-methods"><h2 id="fantasy-party-role-methods">{zh ? "三种冒险贡献、透明计数与结果读法" : "Three adventure contributions, transparent counts and result readings"}</h2><div className="explore-reading-sections">{fantasyPartyRoleSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`fantasy-party-role-${s.id}`}><h3 id={`fantasy-party-role-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种幻想小队画像：完整公开指南" : "Three fantasy-party-role portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "幻想冒险小队角色测试常见问题" : "Fantasy Adventure Party Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...fantasyPartyRoleFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="fantasy-party-role-references"><h2 id="fantasy-party-role-references" className="text-xl font-semibold">{zh ? "角色扮演形式与共同游戏参考" : "Roleplaying format and shared-play references"}</h2><ol className="mt-4 space-y-2"><li id="fantasy-party-role-reference-1"><a className="underline" rel="noopener noreferrer" href="https://cairnrpg.com/first-edition/cairn-srd/">{zh ? "1. Cairn：玩家提问、团队协作与探索原则" : "1. Cairn: player information, teamwork and exploration principles"}</a></li><li id="fantasy-party-role-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.adventure.game/rules/">{zh ? "2. Quest：基本对话式玩法" : "2. Quest: basic conversational play"}</a></li><li id="fantasy-party-role-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.daggerheart.com/sessionzero/">{zh ? "3. Daggerheart：共同期待与虚构内容调整资料" : "3. Daggerheart: shared expectations and tools for adjusting fiction"}</a></li></ol></section>
  </Container></main>;
}
