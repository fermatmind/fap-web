import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ExploreTestShell } from "@/components/tests/ExploreTestShell";
import { CognitiveFunctionsPage, isCognitiveFunctionsPageAvailable } from "@/components/questionnaires/CognitiveFunctionsPage";

type Props = { params: Promise<{ locale: string }> };
async function entry(params: Props["params"]) {
  const locale = resolveLocale((await params).locale), quiz = await loadQuestionnaire("cognitive-functions-test");
  if (!quiz || !isCognitiveFunctionsPageAvailable(quiz)) notFound();
  return { locale, quiz };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, quiz } = await entry(params);
  return buildPageMetadata({ locale, pathname: questionnairePath(locale, quiz.slug), title: quiz.seoTitle[locale], description: quiz.description[locale], imagePath: `/og/fun/${quiz.slug}?locale=${locale}&v=${quiz.version}`, alternatesByLocale: { en: questionnairePath("en", quiz.slug), zh: questionnairePath("zh", quiz.slug), xDefault: questionnairePath("en", quiz.slug) } });
}
export default async function Page({ params }: Props) {
  const { locale, quiz } = await entry(params);
  return <ExploreTestShell slug={quiz.slug} category="framework"><CognitiveFunctionsPage quiz={quiz} locale={locale} /></ExploreTestShell>;
}
