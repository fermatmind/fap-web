import { LocalizedAssessmentLanding } from "@/components/tests/LocalizedAssessmentLanding";
import { getLocalizedLanding } from "@/lib/tests/localized-landings";
import { TrioLanding } from "@/components/tests/trio/TrioLanding";
import { trioProfiles } from "@/lib/tests/trioLanding";
import { Career94Landing } from "./Career94Landing";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { JUNG_FORMS, freeAssessmentCopy, jungLandingCopy } from "@/lib/tests/freeAssessmentLanding";
import { canonicalUrl } from "@/lib/site";

type Landing = "career" | "jung";

export function freeAssessmentMetadata(assessment: Landing, locale: DisplayLocale, indexable = true) {
  const copy = assessment === "jung" ? jungLandingCopy(locale) : freeAssessmentCopy("career", locale);
  const profile = locale === "zh" ? null : getLocalizedLanding(locale, assessment);
  const primary = locale === "zh-TW" ? "zh" : locale;
  const pathname = `/${locale}${copy.path}`;
  const metadata = buildPageMetadata({
    locale: primary,
    pathname,
    canonicalPathname: `/${primary}${copy.path}`,
    title: profile?.seoTitle ?? copy.searchTitle,
    description: profile?.seoDescription ?? copy.intro,
    noindex: !indexable,
    alternatesByLocale: { en: `/en${copy.path}`, zh: `/zh${copy.path}`, xDefault: `/en${copy.path}` },
  });
  if (assessment === "career" && locale === "zh") {
    return { ...metadata, title: { absolute: `${copy.searchTitle}｜FermatMind` } };
  }
  if (locale !== "zh-TW") return metadata;
  const localized = traditionalSearchMetadata(pathname, {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: pathname },
    openGraph: { ...metadata.openGraph, url: canonicalUrl(pathname), locale: "zh_TW" },
  });
  return { ...localized, robots: indexable ? localized.robots : metadata.robots };
}

export function FreeAssessmentLanding({ assessment, locale }: {
  assessment: Landing;
  locale: DisplayLocale;
}) {
  if (assessment === "career" && locale === "zh") return <Career94Landing locale={locale} />;
  const takeLocale = locale === "zh-TW" ? "zh" : locale;
  if (locale !== "zh") {
    const english = locale === "en";
    const career = assessment === "career";
    const formPath = career ? "/career/assessment" : freeAssessmentCopy("archetypes", locale).path;
    const label = career
      ? (english ? "Start the free career test" : "免費開始職涯測驗")
      : (english ? "Start the 48-question test" : "開始 48 題原型測驗");
    const entryNote = locale === "zh-TW" ? (career
      ? "目前作答頁與完整興趣報告範例使用簡體中文。"
      : "目前作答頁使用簡體中文，本站提供繁體中文報告範例。") : undefined;
    return <main><LocalizedAssessmentLanding kind={assessment} locale={locale} entryNote={entryNote}
      entries={[{href: `/${takeLocale}${formPath}/take`, label, testId: career ? "free-assessment-start" : "free-assessment-start-archetypes"}]}/>
    </main>;
  }

  const copy = jungLandingCopy(locale);
  const choices = JUNG_FORMS.map(key => ({
    label: "开始十二原型测试 · 48 题",
    href: `/${locale}${freeAssessmentCopy(key, locale).path}/take`,
    testId: `free-assessment-start-${key}`,
  }));
  const breadcrumb = [
    { name: "首页", path: "/" },
    { name: "测试", path: "/zh/tests" },
    { name: copy.title, path: `/zh${copy.path}` },
  ];
  const jungFaq = trioProfiles.jung.faq.map(([q,a]) => ({q,a}));
  return <main>
    <JsonLd id="free-assessment-page" data={{
      "@context":"https://schema.org", "@type":"WebPage", url:canonicalUrl(`/zh${copy.path}`),
      name:copy.title, description:copy.intro, inLanguage:"zh-CN", isAccessibleForFree:true,
    }} />
    <JsonLd id="free-assessment-breadcrumb" data={buildBreadcrumbJsonLd(breadcrumb)} />
    <JsonLd id="free-assessment-faq" data={buildFAQPageJsonLd(jungFaq.map(({q,a})=>({question:q,answer:a})))} />
    <TrioLanding kind="jung" title="荣格十二原型测试" entries={choices} faq={jungFaq} />
  </main>;
}
