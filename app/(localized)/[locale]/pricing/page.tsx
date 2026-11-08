import { Container } from "@/components/layout/Container";
import { MbtiPricingDetails, mbtiPricingCopy } from "@/components/commerce/MbtiPricing";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const copy = mbtiPricingCopy(locale);
  return buildPageMetadata({ locale, pathname: localizedPath("/pricing", locale), title: copy.title, description: copy.description, noindex: true, alternatesByLocale: { en: "/en/pricing", zh: "/zh/pricing", xDefault: "/zh/pricing" } });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return <Container as="main" className="max-w-4xl py-12 text-slate-700"><MbtiPricingDetails locale={locale} /></Container>;
}
