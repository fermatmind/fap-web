import { sevenSinsChineseGuideProfile } from "@/lib/questionnaires/sevenSinsChineseSeo";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { notFound } from "next/navigation";
import { traditionalSevenSins as quiz, traditionalSevenSinsEditorial as editorial } from "@/lib/i18n/zh-TW/sevenSins";
import { miniVirtuesDefinitions, scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import { SITE_URL } from "@/lib/site";
import { QuestionnaireSevenSinsSample } from "@/components/questionnaires/QuestionnaireSevenSinsOverview";
import { SevenSinsReading } from "./SevenSinsReading";
import { SevenSinsTake } from "./SevenSinsTake";

const entry = "/zh-TW/tests/explore/seven-sins-virtues-test";
export function sevenSinsTraditionalMetadata(path: string): Metadata {
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  const take = path === `${entry}/take`, canonical = take ? entry : path;
  const display = profile && sevenSinsChineseGuideProfile(quiz.slug, "zh", profile);
  const title = display ? sevenSinsDisplay(display.seo!.title.zh, "zh-TW") : quiz.seoTitle["zh-TW"];
  const description = display ? sevenSinsDisplay(display.seo!.description.zh, "zh-TW") : quiz.description["zh-TW"];
  return { title, description, alternates: { canonical: `${SITE_URL}${canonical}`, languages: take ? undefined : {
    "zh-TW": `${SITE_URL}${path}`, "zh-CN": `${SITE_URL}${path.replace("/zh-TW", "/zh")}`, en: `${SITE_URL}${path.replace("/zh-TW", "/en")}`, "x-default": `${SITE_URL}${path.replace("/zh-TW", "/en")}`,
  } }, robots: take ? { index: false, follow: false, noarchive: true } : undefined,
  openGraph: { title, description, locale: "zh_TW", type: "website", url: `${SITE_URL}${canonical}`, images: [`${SITE_URL}/images/test-covers/seven-sins-virtues-test.webp`] } };
}
function Languages({ path }: { path: string }) {
  const suffix = path.replace("/zh-TW", "");
  return <nav aria-label="測評語言" className="mb-8 flex flex-wrap gap-5 text-sm"><span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span><Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link><Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link></nav>;
}
export function SevenSinsTraditionalPage({ path }: { path: string }) {
  if (path === `${entry}/take`) return <SevenSinsTake />;
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  if (profile) return <Container as="main" className="space-y-6 py-10"><Languages path={path} /><p>公開閱讀指南，不含任何人的作答或分數。</p><SevenSinsReading profile={profile} level={1} /><div className="flex flex-wrap gap-5"><Link href={entry} className="min-h-11 py-2 underline">返回測試介紹</Link><Link href={`${entry}#questionnaire-results`} className="min-h-11 py-2 underline">比較全部七組</Link><Link href={`${entry}/take`} className="min-h-11 py-2 underline">開始免費測試</Link></div></Container>;
  if (path !== entry) notFound();
  const sample = scoreMiniVirtuesQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(question => [question.id, "4"])));
  return <Container as="main" className="space-y-8 py-10"><Languages path={path} /><h1 className="text-3xl font-bold sm:text-4xl">{quiz.title["zh-TW"]}</h1><p className="text-lg leading-8">{quiz.description["zh-TW"]}</p>
    <div className="flex flex-wrap gap-5"><Link href={`${entry}/take`} className="min-h-11 rounded-full bg-slate-900 px-7 py-3 font-semibold text-white">開始免費測試</Link><a href="#seven-sins-sample" className="min-h-11 py-3 underline">先看結果範例</a></div>
    {sample.status === "complete" && sample.model === "dual" && <QuestionnaireSevenSinsSample result={sample} locale="zh-TW" />}
    <p className="whitespace-pre-line leading-8">{quiz.introduction["zh-TW"]}</p><p className="whitespace-pre-line leading-8">{quiz.instructions!["zh-TW"]}</p>
    {quiz.guide.map(section => <section key={section.id} className="space-y-3"><h2 className="text-2xl font-semibold">{section.title["zh-TW"]}</h2>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
    <section id="questionnaire-results" className="space-y-5"><h2 className="text-2xl font-bold">七組主題與完整指南</h2><div className="grid gap-5 sm:grid-cols-2">{quiz.profiles.map(profile => {
      const pair = miniVirtuesDefinitions.find(pair => pair.profileId === profile.id)!;
      return <Link key={profile.id} href={`${entry}/results/${profile.id}`} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-xl font-semibold underline">{sevenSinsDisplay(sevenSinsChineseGuideProfile(quiz.slug, "zh", profile).title.zh, "zh-TW")}</h3><p className="font-semibold">{sevenSinsDisplay(pair.sin.zh, "zh-TW")} · {sevenSinsDisplay(pair.virtue.zh, "zh-TW")}</p><p className="leading-7">{profile.headline["zh-TW"]}</p></Link>;
    })}</div></section>
    <section className="space-y-5"><h2 className="text-2xl font-bold">常見問題</h2>{[...quiz.faq, ...editorial.virtuesLandingFaq].map((faq, index) => <section key={index} className="space-y-3"><h3 className="text-xl font-semibold">{faq.question["zh-TW"]}</h3><p className="whitespace-pre-line leading-8">{faq.answer["zh-TW"]}</p></section>)}</section>
    {editorial.virtuesLandingSections.map(section => <section key={section.id} className="space-y-3"><h2 className="text-2xl font-semibold">{section.title["zh-TW"]}</h2>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
    <section className="space-y-3"><h2 className="text-2xl font-bold">來源與範圍</h2><p className="leading-8">本站原創反思題本，尚未完成心理計量驗證。文化及研究資料用於理解主題，不是本題本的效度證明。繁體版保留原題號、選項分值與14項分開計分。</p><ol className="list-decimal space-y-3 pl-5">{[...(quiz.references ?? []), ...editorial.virtuesLandingReferences].map((reference, index) => <li key={`${reference.url}-${index}`}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="break-words underline">{reference.title["zh-TW"]}</a></li>)}</ol></section>
  </Container>;
}
