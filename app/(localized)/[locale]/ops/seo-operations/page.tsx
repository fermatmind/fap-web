import type { Metadata } from "next";
import { SeoOperationsDashboard } from "@/components/ops/seo/SeoOperationsDashboard";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";
import { requireOpsRouteAccess } from "@/lib/ops/opsRouteAccess";
import { loadSeoOperationsReadModel } from "@/lib/ops/seoOperationsReadModel";

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
  await requireOpsRouteAccess();
  const readModel = await loadSeoOperationsReadModel();

  return <SeoOperationsDashboard locale={locale} readModel={readModel} />;
}
