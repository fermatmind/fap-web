import { GlobalHistoryLanding } from "@/components/entertainment/GlobalHistoryLanding";
import { globalHistoryDescription, globalHistoryImagePath, globalHistoryPath, globalHistoryTitle } from "@/lib/entertainment/global-history/config";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { isConfiguredStagingSiteUrl, SITE_URL } from "@/lib/site";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};
const coverId = "mansa-musa";

export async function generateMetadata({ params }: Props) {
  const input = (await params).locale;
  if (input === "zh-TW") {
    const copy = await loadTraditionalAssessmentText();
    const pathname = globalHistoryPath("zh-TW");
    const title = copy(globalHistoryTitle.zh), description = copy(globalHistoryDescription.zh);
    return { title, description, alternates: { canonical: `${SITE_URL}${pathname}`, languages: {
      "zh-CN": SITE_URL + globalHistoryPath("zh"), "zh-TW": SITE_URL + globalHistoryPath("zh-TW"),
      en: SITE_URL + globalHistoryPath("en"), "x-default": SITE_URL + globalHistoryPath("en"),
    } }, robots: { index: !isConfiguredStagingSiteUrl(), follow: true },
      openGraph: { title, description, locale: "zh_TW", url: pathname, images: [globalHistoryImagePath("zh-TW", coverId)] } };
  }
  const locale = resolveLocale(input);
  const metadata = buildPageMetadata({
    locale, pathname: globalHistoryPath(locale), title: globalHistoryTitle[locale], description: globalHistoryDescription[locale],
    imagePath: globalHistoryImagePath(locale, coverId),
    alternatesByLocale: { zh: globalHistoryPath("zh"), en: globalHistoryPath("en"), xDefault: globalHistoryPath("en") },
  });
  return {
    ...metadata,
    alternates: { ...metadata.alternates, languages: {
      ...metadata.alternates?.languages, "zh-TW": SITE_URL + globalHistoryPath("zh-TW"),
    } },
  };
}

export default async function Page({ params }: Props) {
  const input = (await params).locale;
  return <GlobalHistoryLanding locale={input === "zh-TW" ? input : resolveLocale(input)} />;
}
