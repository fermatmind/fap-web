import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyGivingLedgerPage } from "@/components/foundation/DailyGivingLedgerPage";
import { fetchDailyGivingMonths, fetchDailyGivingRecords } from "@/lib/foundation/dailyGiving";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function normalizeYearMonth(value: string): string | null {
  const normalized = String(value ?? "").trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(normalized) ? normalized : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; yearMonth: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, yearMonth: rawYearMonth } = await params;
  const locale = resolveLocale(localeParam);
  const yearMonth = normalizeYearMonth(rawYearMonth) ?? rawYearMonth;

  return buildPageMetadata({
    locale,
    pathname:
      locale === "zh"
        ? `/zh/foundation/daily-giving/${yearMonth}`
        : `/en/foundation/daily-giving/${yearMonth}`,
    title: locale === "zh" ? `日常公益记录 ${yearMonth}` : `Daily Giving Ledger ${yearMonth}`,
    description:
      locale === "zh"
        ? "通过后端公开 API 展示指定月份的费马测试日常公益投入记录。"
        : "Backend-authoritative monthly archive of FermatMind daily giving activity.",
    noindex: true,
    alternatesByLocale: {
      en: `/en/foundation/daily-giving/${yearMonth}`,
      zh: `/zh/foundation/daily-giving/${yearMonth}`,
      xDefault: `/zh/foundation/daily-giving/${yearMonth}`,
    },
  });
}

export default async function DailyGivingMonthPage({
  params,
}: {
  params: Promise<{ locale: string; yearMonth: string }>;
}) {
  const { locale: localeParam, yearMonth: rawYearMonth } = await params;
  const locale = resolveLocale(localeParam);
  const yearMonth = normalizeYearMonth(rawYearMonth);

  if (!yearMonth) {
    notFound();
  }

  const [records, months] = await Promise.all([
    fetchDailyGivingRecords({ locale, yearMonth }),
    fetchDailyGivingMonths(locale),
  ]);

  return <DailyGivingLedgerPage locale={locale} records={records.records} months={months} selectedMonth={yearMonth} />;
}
