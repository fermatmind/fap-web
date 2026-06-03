import type { Metadata } from "next";
import { SeoOperationsDashboard } from "@/components/ops/seo/SeoOperationsDashboard";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO Operations",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SeoOperationsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam) as Locale;

  return <SeoOperationsDashboard locale={locale} />;
}
