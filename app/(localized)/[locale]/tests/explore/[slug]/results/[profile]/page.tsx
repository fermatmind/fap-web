import { notFound } from "next/navigation";
import Page, { generateMetadata as buildMetadata } from "@/components/questionnaires/QuestionnaireGuide";
import catalog from "@/lib/questionnaires/catalog.json";

type Props = { params: Promise<{ locale: string; slug: string; profile: string }> };
const isExplore = (slug: string) => catalog.some(quiz => quiz.slug === slug && quiz.collection === "explore");
export async function generateMetadata(props: Props) {
  if (!isExplore((await props.params).slug)) return { robots: { index: false, follow: false } };
  return buildMetadata(props);
}
export default async function ExplorePage(props: Props) {
  if (!isExplore((await props.params).slug)) notFound();
  return Page(props);
}
