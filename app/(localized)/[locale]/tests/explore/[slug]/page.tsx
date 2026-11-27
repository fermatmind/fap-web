import { PortfolioFlagshipLanding, hasPortfolioFlagship } from "@/components/tests/PortfolioFlagshipLanding";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { resolveLocale } from "@/lib/i18n/getDict";
import { preparePortfolioLanding } from "@/components/tests/PortfolioLandingPreview";
import { ExploreTestShell } from "@/components/tests/ExploreTestShell";
import { notFound } from "next/navigation";
import Page, {
  generateMetadata as buildMetadata,
} from "@/components/questionnaires/QuestionnairePage";
import catalog from "@/lib/questionnaires/catalog.json";

type Props = { params: Promise<{ locale: string; slug: string }> };
const isExplore = (slug: string) =>
  catalog.some((quiz) => quiz.slug === slug && quiz.collection === "explore");
export async function generateMetadata(props: Props) {
  const { locale, slug } = await props.params;
  if (!isExplore(slug)) return { robots: { index: false, follow: false } };
  const metadata = await buildMetadata(props);
  if (locale !== "en" || slug !== "tsundere-dere-type" || !metadata.alternates?.canonical) return metadata;
  return {
    ...metadata,
    title: { absolute: "Free Dere Type Test: Are You Tsundere? (16 Questions)" },
    description: "See how you show you care in 16 everyday situations. Compare tsundere, kuudere, dandere and deredere. Free results, no sign-up.",
  };
}
export default async function ExplorePage(props: Props) {
  if (!isExplore((await props.params).slug)) notFound();
  const { slug, locale } = await props.params;
  if (slug === "seven-sins-virtues-test") return Page(props);
  if (hasPortfolioFlagship(slug)) {
    const quiz = await loadQuestionnaire(slug);
    if (!quiz || !isQuestionnaireConfigurationValid(quiz)) notFound();
    return <PortfolioFlagshipLanding quiz={quiz} locale={resolveLocale(locale)} />;
  }
  return (
    <ExploreTestShell
      slug={slug}
      preview={await preparePortfolioLanding(slug, resolveLocale(locale))}
      category={catalog.find((quiz) => quiz.slug === slug)?.category}
    >
      {await Page(props)}
    </ExploreTestShell>
  );
}
