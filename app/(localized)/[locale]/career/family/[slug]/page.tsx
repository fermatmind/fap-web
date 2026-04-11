import { notFound } from "next/navigation";
import { CareerFamilyHubPage } from "@/components/career/CareerFamilyHubPage";
import { Container } from "@/components/layout/Container";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { resolveLocale } from "@/lib/i18n/getDict";

export const dynamic = "force-dynamic";

export default async function CareerFamilyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const payload = await fetchCareerFamilyHub({ locale, slug });
  const hub = adaptCareerFamilyHub({ locale, payload });

  if (!hub) {
    notFound();
  }

  return (
    <Container as="main" className="py-10">
      <CareerFamilyHubPage locale={locale} hub={hub} />
    </Container>
  );
}
