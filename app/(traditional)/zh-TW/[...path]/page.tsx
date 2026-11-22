import { PortfolioFlagshipLanding, hasPortfolioFlagship } from "@/components/tests/PortfolioFlagshipLanding";
import { preparePortfolioLanding } from "@/components/tests/PortfolioLandingPreview";
import { hasPortfolioLanding } from "@/lib/entertainment/portfolioLanding";
import { ArchiveGuideShare } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import type { ReactNode } from "react";
import { ExploreTestShell } from "@/components/tests/ExploreTestShell";
import { CharacterQuizLanding } from "@/components/questionnaires/CharacterQuizLanding";
import catalog from "@/lib/questionnaires/catalog.json";
import { traditionalMixedQuestionnaireRoute } from "@/lib/i18n/traditionalMixedQuestionnairePaths";
import { traditionalCulturalSymbolRoute } from "@/lib/i18n/traditionalCulturalSymbolPaths";
import { traditionalObservationRoute } from "@/lib/i18n/traditionalObservationPaths";
import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { notFound } from "next/navigation";
import { traditionalPath, traditionalEquivalent, TRADITIONAL_QUIZ_PATH, TRADITIONAL_SEVEN_SINS_PATH } from "@/lib/i18n/traditionalRoutes";
import { traditionalLikertRoute } from "@/lib/i18n/traditionalLikertPaths";
import { traditionalPracticeRoute } from "@/lib/i18n/traditionalPracticePaths";
import { traditionalArchetypeRoute } from "@/lib/i18n/traditionalArchetypePaths";
import { relationshipQuestionnaireRoute } from "@/lib/i18n/relationshipQuestionnairePaths";
import { SITE_URL, canonicalUrl } from "@/lib/site";
import { PublicGuideShare } from "@/components/questionnaires/PublicGuideShare";
import { ChiikawaReading } from "@/components/i18n/zh-TW/ChiikawaReading";
import { ChiikawaTake } from "@/components/i18n/zh-TW/ChiikawaTake";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";

type Props = { params: Promise<{ path?: string[] }>; searchParams?: Promise<{ edition?: string | string[] }> };
const entry = `/zh-TW${TRADITIONAL_QUIZ_PATH}`;
async function route(props: Props) {
  const segments = (await props.params).path ?? [];
  const path = `/zh-TW${segments.length ? `/${segments.join("/")}` : ""}`;
  if (traditionalPath(path) !== path) notFound();
  return path;
}
async function readMetadata(props: Props): Promise<Metadata> {
  const path = await route(props);
  if (path === "/zh-TW/tests/explore/disc") {
    const { generateMetadata } = await import("@/app/(localized)/[locale]/tests/explore/disc/page");
    return generateMetadata({params: Promise.resolve({locale: "zh-TW"})});
  }
  const mixed = traditionalMixedQuestionnaireRoute(path.slice("/zh-TW".length));
  if (mixed) {
    const { traditionalMixedQuestionnaireMetadata } = await import("@/components/i18n/zh-TW/TraditionalMixedQuestionnairePage");
    return traditionalMixedQuestionnaireMetadata(mixed);
  }
  const culturalSymbol = traditionalCulturalSymbolRoute(path.slice("/zh-TW".length));
  if (culturalSymbol) {
    const { traditionalCulturalSymbolMetadata } = await import("@/components/i18n/zh-TW/TraditionalCulturalSymbolPage");
    return traditionalCulturalSymbolMetadata(culturalSymbol);
  }
  if (path === "/zh-TW/tests/explore/career-match") {
    const { traditionalCareerMatchMetadata } = await import("@/components/i18n/zh-TW/TraditionalCareerMatchPage");
    return traditionalCareerMatchMetadata();
  }
  const likert = traditionalLikertRoute(path.slice("/zh-TW".length)) ?? traditionalDirectionalRoute(path.slice("/zh-TW".length)) ?? traditionalObservationRoute(path.slice("/zh-TW".length));
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
  return <nav aria-label="測評語言" className="mb-8 flex flex-wrap gap-5 text-sm"><span aria-current="page" className="min-h-11 py-2">繁體中文</span><Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link><Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link></nav>;
}
export default async function TraditionalPage(props: Props) {
  const path = await route(props);
  const landingSlug = /^\/zh-TW\/tests\/explore\/([^/]+)$/u.exec(path)?.[1];
  const category = catalog.find((quiz) => quiz.slug === landingSlug)?.category;
  const guide = /^\/zh-TW\/tests\/explore\/([^/]+)\/results\/([^/]+)$/u.exec(path);
  const landing = async (content: ReactNode, getQuiz?: () => Promise<import("@/lib/questionnaires/types").Questionnaire | null | undefined>) => {
    if (!landingSlug) return guide ? <>{content}<ArchiveGuideShare slug={guide[1]} id={guide[2]} locale="zh-TW" /></> : content;
    const quiz = hasPortfolioLanding(landingSlug) ? await getQuiz?.() : null;
    if (quiz && hasPortfolioFlagship(landingSlug)) return <PortfolioFlagshipLanding quiz={quiz} locale="zh-TW" />;
    return <ExploreTestShell slug={landingSlug} category={category} preview={quiz ? await preparePortfolioLanding(landingSlug, "zh-TW", quiz) : null}>{content}</ExploreTestShell>;
  };
  const mixed = traditionalMixedQuestionnaireRoute(path.slice("/zh-TW".length));
  if (mixed) {
    const { TraditionalMixedQuestionnairePage } = await import("@/components/i18n/zh-TW/TraditionalMixedQuestionnairePage");
    return landing(<TraditionalMixedQuestionnairePage {...mixed} />, async () => (await (await import("@/lib/i18n/zh-TW/mixedQuestionnaires")).loadTraditionalMixedQuestionnaire(mixed.slug))?.quiz);
  }
  const culturalSymbol = traditionalCulturalSymbolRoute(path.slice("/zh-TW".length));
  if (culturalSymbol) {
    const { TraditionalCulturalSymbolPage } = await import("@/components/i18n/zh-TW/TraditionalCulturalSymbolPage");
    return landing(<TraditionalCulturalSymbolPage {...culturalSymbol} />, async () => (await (await import("@/lib/i18n/zh-TW/culturalSymbolQuestionnaires")).loadTraditionalCulturalSymbol(culturalSymbol.slug))?.quiz);
  }
  if (path === "/zh-TW/tests/explore/career-match") {
    const { TraditionalCareerMatchPage } = await import("@/components/i18n/zh-TW/TraditionalCareerMatchPage");
    return landing(<TraditionalCareerMatchPage />);
  }
  const likert = traditionalLikertRoute(path.slice("/zh-TW".length)) ?? traditionalDirectionalRoute(path.slice("/zh-TW".length)) ?? traditionalObservationRoute(path.slice("/zh-TW".length));
  if (likert) {
    const { LikertQuestionnairePage, requireLikert } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return landing(<LikertQuestionnairePage {...likert} />, async () => (await requireLikert(likert.slug)).quiz);
  }
  const practice = traditionalPracticeRoute(path.slice("/zh-TW".length));
  if (practice) {
    const { PracticeQuestionnairePage } = await import("@/components/i18n/zh-TW/PracticeQuestionnairePage");
    return landing(<PracticeQuestionnairePage {...practice} />, async () => (await (await import("@/lib/i18n/zh-TW/practiceQuestionnaires")).loadTraditionalPractice(practice.slug))?.quiz);
  }
  const archetype = traditionalArchetypeRoute(path.slice("/zh-TW".length));
  if (archetype) {
    const { ArchetypeQuestionnairePage } = await import("@/components/i18n/zh-TW/ArchetypeQuestionnairePage");
    return landing(<ArchetypeQuestionnairePage {...archetype} />, async () => (await (await import("@/lib/i18n/zh-TW/archetypeQuestionnaires")).loadTraditionalArchetype(archetype.slug)));
  }
  const relationship = relationshipQuestionnaireRoute(path.slice("/zh-TW".length));
  if (relationship) {
    const { RelationshipQuestionnairePage } = await import("@/components/i18n/zh-TW/RelationshipQuestionnairePage");
    return landing(<RelationshipQuestionnairePage path={path} />, async () => (await (await import("@/lib/i18n/zh-TW/relationshipQuestionnaire")).loadTraditionalRelationshipQuestionnaire(relationship.slug)));
  }
  if (path.startsWith(`/zh-TW${TRADITIONAL_SEVEN_SINS_PATH}`)) {
    const { SevenSinsTraditionalPage } = await import("@/components/i18n/zh-TW/SevenSinsPage");
    return landing(<SevenSinsTraditionalPage path={path} />);
  }
  const { traditionalQuiz: quiz, traditionalUi: ui } = await import("@/lib/i18n/zh-TW/chiikawa");
  if (path.endsWith("/take")) return <ChiikawaTake />;
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  if (profile) return <Container as="main" className="space-y-6 py-10"><Languages path={path} /><p>{ui.public["zh-TW"]}</p><ChiikawaReading profile={profile} level={1} /><PublicGuideShare url={canonicalUrl(path)} locale="zh-TW" /><Link href={entry} className="inline-block min-h-11 py-2 underline">{ui.return["zh-TW"]}</Link><Link href={`${entry}/take`} className="ml-5 inline-block min-h-11 py-2 underline">{ui.start["zh-TW"]}</Link></Container>;
  if (path !== entry) return <Container as="main" className="py-10"><TraditionalPilotTests /></Container>;
  return landing(<CharacterQuizLanding quiz={quiz} slug="chiikawa" locale="zh-TW" />);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return traditionalSearchMetadata(await route(props), await readMetadata(props));
}
