import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function ExploreLandingSchema({ id, title, description, path, locale, faq, freeAccessDescription }: {
  id: string;
  title: string;
  description: string;
  path: string;
  locale: DisplayLocale;
  faq: readonly (readonly [string, string])[];
  freeAccessDescription?: string;
}) {
  const url = new URL(path, SITE_URL).href;
  const directory = new URL(`/${locale}/tests`, SITE_URL).href;
  const directoryName = { zh: "测评目录", "zh-TW": "測驗目錄", en: "Tests" }[locale];
  return <JsonLd id={id} data={{ "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: title, url, description, applicationCategory: "EntertainmentApplication", inLanguage: locale === "zh" ? "zh-CN" : locale,
      operatingSystem: "Any", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: freeAccessDescription } },
    { "@type": "FAQPage", mainEntity: faq.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: directoryName, item: directory },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ] },
  ] }} />;
}
