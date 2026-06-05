import { fetchDailyGivingMonths, fetchDailyGivingRecords, type DailyGivingRecord } from "@/lib/foundation/dailyGiving";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

export type DailyGivingDiscoverabilityEntry = {
  locale: Locale;
  path: string;
  title: string;
  type: "foundation_daily_giving" | "foundation_daily_giving_month";
  summary: string;
  updatedAt: string;
};

export const DAILY_GIVING_INDEXABILITY_ENABLED = false;

function dailyGivingCopy(locale: Locale, yearMonth?: string) {
  const title = yearMonth
    ? locale === "zh"
      ? `日常公益记录 ${yearMonth}`
      : `Daily Giving Ledger ${yearMonth}`
    : locale === "zh"
      ? "日常公益记录"
      : "Daily Giving Ledger";
  const description = yearMonth
    ? locale === "zh"
      ? "通过后端公开 API 展示指定月份的费马测试日常公益投入记录。"
      : "Backend-authoritative monthly archive of FermatMind daily giving activity."
    : locale === "zh"
      ? "通过后端公开 API 展示费马测试日常公益投入记录。"
      : "Backend-authoritative public record of FermatMind daily giving activity.";

  return { title, description };
}

export function dailyGivingPath(locale: Locale, yearMonth?: string): string {
  return localizedPath(yearMonth ? `/foundation/daily-giving/${yearMonth}` : "/foundation/daily-giving", locale);
}

export async function hasDailyGivingPublicRecords(locale: Locale, yearMonth?: string): Promise<boolean> {
  try {
    const records = await fetchDailyGivingRecords({ locale, yearMonth });
    return records.records.length > 0;
  } catch {
    return false;
  }
}

export function buildDailyGivingJsonLd({
  locale,
  records,
  yearMonth,
}: {
  locale: Locale;
  records: DailyGivingRecord[];
  yearMonth?: string;
}) {
  const { title, description } = dailyGivingCopy(locale, yearMonth);
  const path = dailyGivingPath(locale, yearMonth);
  const homeLabel = locale === "zh" ? "首页" : "Home";
  const foundationLabel = locale === "zh" ? "公共利益" : "Public benefit";
  const dailyGivingLabel = locale === "zh" ? "日常公益记录" : "Daily Giving Ledger";

  return {
    webPage: buildWebPageJsonLd({ path, title, description, locale }),
    breadcrumb: buildBreadcrumbJsonLd([
      { name: homeLabel, path: localizedPath("/", locale) },
      { name: foundationLabel, path: localizedPath("/foundation", locale) },
      ...(yearMonth
        ? [
            { name: dailyGivingLabel, path: dailyGivingPath(locale) },
            { name: title, path },
          ]
        : [{ name: dailyGivingLabel, path }]),
    ]),
    itemList: records.length
      ? buildItemListJsonLd({
          path,
          title,
          description,
          locale,
          idSuffix: yearMonth ? `daily-giving-${yearMonth}` : "daily-giving",
          items: records.map((record) => ({
            name: record.title,
            description: record.description || record.recipientName || record.month,
          })),
        })
      : null,
  };
}

export async function listDailyGivingDiscoverabilityEntries(locale: Locale): Promise<DailyGivingDiscoverabilityEntry[]> {
  if (!DAILY_GIVING_INDEXABILITY_ENABLED) {
    return [];
  }

  try {
    const months = (await fetchDailyGivingMonths(locale)).filter((month) => month.recordCount > 0);
    if (months.length === 0) {
      return [];
    }

    const indexCopy = dailyGivingCopy(locale);
    return [
      {
        locale,
        path: dailyGivingPath(locale),
        title: indexCopy.title,
        type: "foundation_daily_giving",
        summary: indexCopy.description,
        updatedAt: "",
      },
      ...months.map((month) => {
        const monthCopy = dailyGivingCopy(locale, month.yearMonth);
        return {
          locale,
          path: dailyGivingPath(locale, month.yearMonth),
          title: monthCopy.title,
          type: "foundation_daily_giving_month" as const,
          summary: monthCopy.description,
          updatedAt: month.yearMonth,
        };
      }),
    ];
  } catch {
    return [];
  }
}
