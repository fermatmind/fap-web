import { ArchiveGuideShare } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { resolveLocale } from "@/lib/i18n/getDict";
import { ExploreTestShell } from "@/components/tests/ExploreTestShell";
import { notFound } from "next/navigation";
import Page, {
  generateMetadata as buildMetadata,
} from "@/components/questionnaires/QuestionnaireGuide";
import catalog from "@/lib/questionnaires/catalog.json";

type Props = {
  params: Promise<{ locale: string; slug: string; profile: string }>;
};
const isExplore = (slug: string) =>
  catalog.some((quiz) => quiz.slug === slug && quiz.collection === "explore");
export async function generateMetadata(props: Props) {
  if (!isExplore((await props.params).slug))
    return { robots: { index: false, follow: false } };
  return buildMetadata(props);
}
export default async function ExplorePage(props: Props) {
  if (!isExplore((await props.params).slug)) notFound();
  const { slug, profile, locale } = await props.params;
  return <ExploreTestShell guide>{await Page(props)}<ArchiveGuideShare slug={slug} id={profile} locale={resolveLocale(locale)} /></ExploreTestShell>;
}
