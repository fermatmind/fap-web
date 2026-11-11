import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { traditionalPath, traditionalEquivalent, TRADITIONAL_QUIZ_PATH, TRADITIONAL_SEVEN_SINS_PATH } from "@/lib/i18n/traditionalRoutes";
import { traditionalLikertRoute } from "@/lib/i18n/traditionalLikertPaths";
import { traditionalPracticeRoute } from "@/lib/i18n/traditionalPracticePaths";
import { traditionalArchetypeRoute } from "@/lib/i18n/traditionalArchetypePaths";
import { relationshipQuestionnaireRoute } from "@/lib/i18n/relationshipQuestionnairePaths";
import { SITE_URL } from "@/lib/site";
import { ChiikawaReading } from "@/components/i18n/zh-TW/ChiikawaReading";
import { ChiikawaTake } from "@/components/i18n/zh-TW/ChiikawaTake";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";
import { ChiikawaPortrait } from "@/components/questionnaires/ChiikawaPortrait";

type Props = { params: Promise<{ path?: string[] }>; searchParams?: Promise<{ edition?: string | string[] }> };
const entry = `/zh-TW${TRADITIONAL_QUIZ_PATH}`;
async function route(props: Props) {
  const segments = (await props.params).path ?? [];
  const path = `/zh-TW${segments.length ? `/${segments.join("/")}` : ""}`;
  if (traditionalPath(path) !== path) notFound();
  return path;
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const path = await route(props);
  const likert = traditionalLikertRoute(path.slice("/zh-TW".length)) ?? traditionalDirectionalRoute(path.slice("/zh-TW".length));
  if (likert) {
    const { traditionalLikertMetadata } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return traditionalLikertMetadata(likert);
  }
  const practice = traditionalPracticeRoute(path.slice("/zh-TW".length));
  if (practice) {
    const { traditionalPracticeMetadata } = await import("@/components/i18n/zh-TW/PracticeQuestionnairePage");
    return traditionalPracticeMetadata(practice);
  }
  const archetype = traditionalArchetypeRoute(path.slice("/zh-TW".length));
  if (archetype) {
    const { traditionalArchetypeMetadata } = await import("@/components/i18n/zh-TW/ArchetypeQuestionnairePage");
    return traditionalArchetypeMetadata(archetype);
  }
  if (relationshipQuestionnaireRoute(path.slice("/zh-TW".length))) {
    const { relationshipQuestionnaireMetadata } = await import("@/components/i18n/zh-TW/RelationshipQuestionnairePage");
    return relationshipQuestionnaireMetadata(path);
  }
  if (path.startsWith(`/zh-TW${TRADITIONAL_SEVEN_SINS_PATH}`)) {
    const { sevenSinsTraditionalMetadata } = await import("@/components/i18n/zh-TW/SevenSinsPage");
    return sevenSinsTraditionalMetadata(path);
  }
  const { traditionalQuiz: quiz, traditionalUi: ui } = await import("@/lib/i18n/zh-TW/chiikawa");
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  const equivalent = traditionalEquivalent(path);
  const guideCopy = profile && ui.chiikawaGuideSeo[profile.id as keyof typeof ui.chiikawaGuideSeo];
  const title = guideCopy?.title["zh-TW"] ?? profile?.seo?.title["zh-TW"] ?? (profile ? profile.title["zh-TW"] : path.startsWith(entry) ? quiz.seoTitle["zh-TW"] : ui.hub["zh-TW"]);
  const description = guideCopy?.description["zh-TW"] ?? profile?.seo?.description["zh-TW"] ?? (profile ? profile.summary["zh-TW"] : path.startsWith(entry) ? quiz.description["zh-TW"] : ui.available["zh-TW"]);
  const languages = equivalent ? { "zh-TW": `${SITE_URL}${path}`, "zh-CN": `${SITE_URL}${path.replace("/zh-TW", "/zh")}`, en: `${SITE_URL}${path.replace("/zh-TW", "/en")}`, "x-default": `${SITE_URL}${path.replace("/zh-TW", "/en")}` } : undefined;
  return { title, description, alternates: { canonical: `${SITE_URL}${path.endsWith("/take") ? entry : path}`, languages }, robots: path.endsWith("/take") ? { index: false, follow: false, noarchive: true } : undefined,
    openGraph: { title, description, locale: "zh_TW", type: "website", url: `${SITE_URL}${path}`, images: [`${SITE_URL}/images/test-covers/chiikawa.webp`] } };
}
function Languages({ path }: { path: string }) {
  const suffix = path.replace("/zh-TW", "");
  return <nav aria-label="測評語言" className="mb-8 flex flex-wrap gap-5 text-sm"><span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span><Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link><Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link></nav>;
}
export default async function TraditionalPage(props: Props) {
  const path = await route(props);
  const likert = traditionalLikertRoute(path.slice("/zh-TW".length)) ?? traditionalDirectionalRoute(path.slice("/zh-TW".length));
  if (likert?.slug === "cognitive-functions-test") {
    const { TraditionalCognitiveFunctionsPage } = await import("@/components/i18n/zh-TW/TraditionalCognitiveFunctionsPage");
    const edition = likert.take ? (await props.searchParams)?.edition : undefined;
    return <TraditionalCognitiveFunctionsPage {...likert} edition={edition} />;
  }
  if (likert) {
    const { LikertQuestionnairePage } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return <LikertQuestionnairePage {...likert} />;
  }
  const practice = traditionalPracticeRoute(path.slice("/zh-TW".length));
  if (practice) {
    const { PracticeQuestionnairePage } = await import("@/components/i18n/zh-TW/PracticeQuestionnairePage");
    return <PracticeQuestionnairePage {...practice} />;
  }
  const archetype = traditionalArchetypeRoute(path.slice("/zh-TW".length));
  if (archetype) {
    const { ArchetypeQuestionnairePage } = await import("@/components/i18n/zh-TW/ArchetypeQuestionnairePage");
    return <ArchetypeQuestionnairePage {...archetype} />;
  }
  if (relationshipQuestionnaireRoute(path.slice("/zh-TW".length))) {
    const { RelationshipQuestionnairePage } = await import("@/components/i18n/zh-TW/RelationshipQuestionnairePage");
    return <RelationshipQuestionnairePage path={path} />;
  }
  if (path.startsWith(`/zh-TW${TRADITIONAL_SEVEN_SINS_PATH}`)) {
    const { SevenSinsTraditionalPage } = await import("@/components/i18n/zh-TW/SevenSinsPage");
    return <SevenSinsTraditionalPage path={path} />;
  }
  const { traditionalQuiz: quiz, traditionalUi: ui } = await import("@/lib/i18n/zh-TW/chiikawa");
  if (path.endsWith("/take")) return <ChiikawaTake />;
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  if (profile) return <div className="space-y-6"><Languages path={path} /><p>{ui.public["zh-TW"]}</p><ChiikawaReading profile={profile} level={1} /><Link href={entry} className="inline-block min-h-11 py-2 underline">{ui.return["zh-TW"]}</Link><Link href={`${entry}/take`} className="ml-5 inline-block min-h-11 py-2 underline">{ui.start["zh-TW"]}</Link></div>;
  if (path !== entry) return <TraditionalPilotTests />;
  return <div className="space-y-8"><Languages path={path} /><h1 className="text-3xl font-bold sm:text-4xl">{quiz.title["zh-TW"]}</h1><p className="text-lg leading-8">{quiz.description["zh-TW"]}</p><p className="whitespace-pre-line leading-8">{quiz.introduction["zh-TW"]}</p><Link href={`${entry}/take`} className="inline-block min-h-11 rounded-full bg-slate-900 px-7 py-3 font-semibold text-white">{ui.start["zh-TW"]}</Link>
    <p className="whitespace-pre-line leading-8">{quiz.instructions!["zh-TW"]}</p>
    {quiz.guide.map(section => <section key={section.id} className="space-y-3"><h2 className="text-2xl font-semibold">{section.title["zh-TW"]}</h2>{section.paragraphs.map((text, index) => <p key={index} className="whitespace-pre-line leading-8">{text["zh-TW"]}</p>)}</section>)}
    <section className="space-y-5"><h2 className="text-2xl font-bold">{ui.guides["zh-TW"]}</h2><div className="grid gap-5 sm:grid-cols-2">{quiz.profiles.map(profile => <Link key={profile.id} href={`${entry}/results/${profile.id}`} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"><ChiikawaPortrait id={profile.id} className="size-20 rounded-xl" /><h3 className="text-xl font-semibold underline">{profile.title["zh-TW"]}</h3><p className="leading-7">{profile.headline["zh-TW"]}</p></Link>)}</div></section>
    <section className="space-y-3"><h2 className="text-2xl font-bold">來源與範圍</h2><p className="leading-8">本站原創同人情境題與角色解讀，不是官方測驗或臨床評估。繁體版保留原題本與計分規則。</p><ul className="list-disc space-y-3 pl-5">{quiz.references?.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="underline">{reference.title["zh-TW"]}</a></li>)}</ul></section>
    <section className="space-y-5"><h2 className="text-2xl font-bold">{ui.faq["zh-TW"]}</h2>{quiz.faq.map((faq, index) => <div key={index}><h3 className="text-xl font-semibold">{faq.question["zh-TW"]}</h3><p className="mt-3 whitespace-pre-line leading-8">{faq.answer["zh-TW"]}</p></div>)}</section>
  </div>;
}
