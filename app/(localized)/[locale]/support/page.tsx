import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { SupportCenter } from "@/components/support/SupportCenter";
import { getContentPage } from "@/lib/cms/content-pages";
import { getHelpGatewaySurface } from "@/lib/publicGateway";
import { buildInterpretationGuidePath, buildSupportArticlePath, listInterpretationGuides, listSupportArticles } from "@/lib/cms/supportTrust";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { helpQuestionsFromCms, helpTopicFor, type HelpEntry } from "@/lib/support/helpCenter";

function labels(locale: Locale) {
  return locale === "zh" ? {
    headingFallback: "支持与信任中心",
    summaryFallback: "查找已保存的结果、查询订单，了解测评与数据的使用说明。",
    resultTitle: "找回已保存的结果",
    resultSummary: "使用保存结果时填写的邮箱查找结果。",
    methodTitle: "测评方法与使用边界",
    methodSummary: "了解测评能够提供的参考与结果的使用边界。",
  } : {
    headingFallback: "Support & Trust Center",
    summaryFallback: "Find saved results, look up an order, and learn about assessments and your data.",
    resultTitle: "Find saved results",
    resultSummary: "Use the email you entered when saving your results.",
    methodTitle: "Assessment methods & boundaries",
    methodSummary: "Understand what assessments can help with and where their limits apply.",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const gateway = await getHelpGatewaySurface(locale);
  const copy = labels(locale);
  const hero = gateway?.landingSurface?.summaryBlocks[0];

  return buildPageMetadata({
    locale,
    pathname: localizedPath("/support", locale),
    title: hero?.title || copy.headingFallback,
    description: hero?.body || copy.summaryFallback,
    alternatesByLocale: { en: "/en/support", zh: "/zh/support", xDefault: "/zh/support" },
  });
}

const SUPPORT_CONTACT_SOURCE_SLUGS = ["help-contact", "help-payment-refund", "help-unlock-failure", "help-result-recovery"] as const;

async function getSupportContact(locale: Locale): Promise<string | null> {
  for (const slug of SUPPORT_CONTACT_SOURCE_SLUGS) {
    const page = await getContentPage(slug, locale).catch(() => null);
    if (page?.supportContact) return page.supportContact;
  }
  return null;
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const copy = labels(locale);
  const [gateway, supportArticles, guides, supportContact, faqPage] = await Promise.all([
    getHelpGatewaySurface(locale),
    listSupportArticles(locale).catch(() => []),
    listInterpretationGuides(locale).catch(() => []),
    getSupportContact(locale),
    getContentPage("help-faq", locale).catch(() => null),
  ]);

  if (!gateway?.landingSurface) notFound();

  const landing = gateway.landingSurface;
  const hero = landing.summaryBlocks[0];
  const contact = landing.discoverabilityItems.find((item) => item.key === "contact");
  const entries: HelpEntry[] = [
    { key: "result_lookup", title: copy.resultTitle, summary: copy.resultSummary, href: localizedPath("/results/lookup", locale), topic: "results", kind: "tool" },
    ...landing.ctaBundle.map((item): HelpEntry => ({ key: item.key, title: item.label, summary: "", href: item.href, topic: helpTopicFor(`${item.key} ${item.label}`), kind: "tool" })),
    ...landing.discoverabilityItems.map((item): HelpEntry => ({ key: item.key, title: item.title, summary: item.summary, href: item.href, topic: helpTopicFor(item.key), kind: "article" })),
    { key: "method_boundaries", title: copy.methodTitle, summary: copy.methodSummary, href: localizedPath("/method-boundaries", locale), topic: "assessments", kind: "article" },
    ...supportArticles.map((item): HelpEntry => ({ key: `article-${item.slug}`, title: item.title, summary: item.summary, href: buildSupportArticlePath(item.slug, locale), topic: helpTopicFor(`${item.supportCategory} ${item.supportIntent} ${item.title}`), kind: "article" })),
    ...guides.map((item): HelpEntry => ({ key: `guide-${item.slug}`, title: item.title, summary: item.summary, href: buildInterpretationGuidePath(item.slug, locale), topic: "assessments", kind: "guide" })),
  ];

  return <SupportCenter
    locale={locale}
    title={hero?.title || copy.headingFallback}
    entries={entries}
    questions={helpQuestionsFromCms(faqPage, gateway.answerSurface?.faqBlocks)}
    tools={landing.ctaBundle}
    contactHref={contact?.href ?? null}
    contactLabel={contact?.title ?? null}
    contactLink={supportContact ? <a href={`mailto:${supportContact}`} className="inline-flex items-center gap-4 rounded-md bg-white px-5 py-3.5 text-sm font-semibold text-[#203c66] transition hover:bg-[#edf2fa]">{supportContact}<ArrowUpRight size={17} aria-hidden /></a> : null}
  />;
}
