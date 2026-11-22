import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { canonicalUrl } from "@/lib/site";
import { assessmentLandingPaths } from "@/lib/tests/localized-landings";
import type { LocalizedLandingKind, LocalizedLandingLocale, LocalizedLandingProfile } from "@/lib/tests/localized-landings/types";
import { landingUi } from "@/lib/tests/localized-landings/ui";

export function LocalizedAssessmentSchema({kind, locale, profile, hasEntry}: {
  kind: LocalizedLandingKind;
  locale: LocalizedLandingLocale;
  profile: LocalizedLandingProfile;
  hasEntry: boolean;
}) {
  const path = `/${locale}${assessmentLandingPaths[kind]}`;
  const url = canonicalUrl(path);
  const ui = landingUi[locale];
  const details = {name: profile.h1, description: profile.seoDescription, url, inLanguage: locale};
  return <>
    <JsonLd id="assessment-landing-page" data={buildWebPageJsonLd({path, locale, title: details.name, description: details.description})} />
    <JsonLd id="assessment-landing-breadcrumb" data={buildBreadcrumbJsonLd([
      {name: ui.home, path: `/${locale}`}, {name: kind === "career" ? (locale === "en" ? "Careers" : "職涯") : ui.tests, path: `/${locale}/${kind === "career" ? "career" : "tests"}`}, {name: profile.name, path},
    ])} />
    <JsonLd id="assessment-landing-faq" data={buildFAQPageJsonLd(profile.faq.map(([question, answer]) => ({question, answer})))} />
    {hasEntry && <>
      <JsonLd id="assessment-landing-quiz" data={{"@context": "https://schema.org", "@type": "Quiz", "@id": `${url}#quiz`,
        ...details, isAccessibleForFree: true, about: profile.name}} />
      <JsonLd id="assessment-landing-software" data={{"@context": "https://schema.org", "@type": "SoftwareApplication",
        "@id": `${url}#softwareapplication`, ...details, applicationCategory: "EducationalApplication", operatingSystem: "Web",
        isAccessibleForFree: true}} />
    </>}
  </>;
}
