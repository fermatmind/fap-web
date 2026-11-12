import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { sevenSinsChineseGuideProfile } from "@/lib/questionnaires/sevenSinsChineseSeo";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { notFound } from "next/navigation";
import { traditionalSevenSins as quiz, traditionalSevenSinsEditorial as editorial } from "@/lib/i18n/zh-TW/sevenSins";
import { miniVirtuesDefinitions } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import { SITE_URL } from "@/lib/site";
import { buildSevenSinsSample, QuestionnaireSevenSinsSample } from "@/components/questionnaires/QuestionnaireSevenSinsOverview";
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
  return <nav aria-label="測評語言" className="mb-8 flex flex-wrap gap-5 text-sm"><span aria-current="page" className="min-h-11 py-2">繁體中文</span><Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link><Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link></nav>;
}
export function SevenSinsTraditionalPage({ path }: { path: string }) {
  if (path === `${entry}/take`) return <SevenSinsTake />;
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  if (profile) return <Container as="main" className="space-y-6 py-10"><Languages path={path} /><p>公開閱讀指南，不含任何人的作答或分數。</p><SevenSinsReading profile={profile} level={1} /><div className="flex flex-wrap gap-5"><Link href={entry} className="min-h-11 py-2 underline">返回測試介紹</Link><Link href={`${entry}#questionnaire-results`} className="min-h-11 py-2 underline">比較全部七組</Link><Link href={`${entry}/take`} className="min-h-11 py-2 underline">開始免費測試</Link></div></Container>;
  if (path !== entry) notFound();
  const sample = buildSevenSinsSample(quiz);
  return <main className="bg-slate-50 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl space-y-8">
    <Languages path={path} />
    <ExploreTestIntro slug={quiz.slug} locale="zh-TW" sideContent={sample.status === "complete" && sample.model === "dual" ? <QuestionnaireSevenSinsSample result={sample} locale="zh-TW" /> : undefined}>
      <h1>{quiz.title["zh-TW"]}</h1>
      <p>{quiz.description["zh-TW"]}</p>
      <div id="take-test" className="space-y-4" data-questionnaire-take-entry>
        <Link href={`${entry}/take`} className="explore-intro-entry" data-explore-start>開始免費測試<span aria-hidden="true">→</span></Link>
        <a href="#seven-sins-sample" className="ml-4 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">先看結果範例</a>
        <p className="text-sm leading-7 text-slate-600">{quiz.instructions!["zh-TW"]}</p>
      </div>
    </ExploreTestIntro>
    <nav aria-label="七宗罪測驗閱讀導覽" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <a className="inline-block min-h-11 py-2 underline underline-offset-4" href="#questionnaire-results">七宗罪與七美德對照</a>
      <a className="inline-block min-h-11 py-2 underline underline-offset-4" href="#questionnaire-method">雷達圖與分數怎麼看</a>
      <a className="inline-block min-h-11 py-2 underline underline-offset-4" href="#questionnaire-reading-scope">文化背景與完整讀法</a>
    </nav>
    <p className="whitespace-pre-line leading-8">{quiz.introduction["zh-TW"]}</p>
    {quiz.guide.map((section, index) => <section key={section.id} id={index === 0 ? "questionnaire-method" : undefined} className="space-y-3"><h2 className="text-2xl font-semibold">{section.title["zh-TW"]}</h2>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
    <section id="questionnaire-results" className="space-y-5"><h2 className="text-2xl font-bold">七組主題與完整指南</h2><div className="grid gap-5 sm:grid-cols-2">{quiz.profiles.map(profile => {
      const pair = miniVirtuesDefinitions.find(pair => pair.profileId === profile.id)!;
      return <Link key={profile.id} href={`${entry}/results/${profile.id}`} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-xl font-semibold underline">{sevenSinsDisplay(sevenSinsChineseGuideProfile(quiz.slug, "zh", profile).title.zh, "zh-TW")}</h3><p className="font-semibold">{sevenSinsDisplay(pair.sin.zh, "zh-TW")} · {sevenSinsDisplay(pair.virtue.zh, "zh-TW")}</p><p className="leading-7">{profile.headline["zh-TW"]}</p></Link>;
    })}</div></section>
    <section className="space-y-5"><h2 className="text-2xl font-bold">常見問題</h2>{[...quiz.faq, ...editorial.virtuesLandingFaq].map((faq, index) => <section key={index} className="space-y-3"><h3 className="text-xl font-semibold">{faq.question["zh-TW"]}</h3><p className="whitespace-pre-line leading-8">{faq.answer["zh-TW"]}</p></section>)}</section>
    {editorial.virtuesLandingSections.map((section, index) => <section key={section.id} id={index === 0 ? "questionnaire-reading-scope" : undefined} className="space-y-3"><h2 className="text-2xl font-semibold">{section.title["zh-TW"]}</h2>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
    <section className="space-y-3"><h2 className="text-2xl font-bold">來源與範圍</h2><p className="leading-8">本站原創反思題本，尚未完成心理計量驗證。文化及研究資料用於理解主題，不是本題本的效度證明。繁體版保留原題號、選項分值與14項分開計分。</p><ol className="list-decimal space-y-3 pl-5">{[...(quiz.references ?? []), ...editorial.virtuesLandingReferences].map((reference, index) => <li key={`${reference.url}-${index}`}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="break-words underline">{reference.title["zh-TW"]}</a></li>)}</ol></section>
  </Container></main>;
}
