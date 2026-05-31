import type { Metadata } from "next";
import { DailyGivingLedgerPage } from "@/components/foundation/DailyGivingLedgerPage";
import { fetchDailyGivingMonths, fetchDailyGivingRecords } from "@/lib/foundation/dailyGiving";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/foundation/daily-giving" : "/en/foundation/daily-giving",
    title: locale === "zh" ? "日常公益记录" : "Daily Giving Ledger",
    description:
      locale === "zh"
        ? "通过后端公开 API 展示费马测试日常公益投入记录。"
        : "Backend-authoritative public record of FermatMind daily giving activity.",
    noindex: true,
    alternatesByLocale: {
      en: "/en/foundation/daily-giving",
      zh: "/zh/foundation/daily-giving",
      xDefault: "/zh/foundation/daily-giving",
    },
  });
}

export default async function DailyGivingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const [records, months] = await Promise.all([fetchDailyGivingRecords({ locale }), fetchDailyGivingMonths(locale)]);

  return <DailyGivingLedgerPage locale={locale} records={records.records} months={months} />;
}
