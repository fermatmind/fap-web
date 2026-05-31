import { apiClient } from "@/lib/api-client";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";

export type DailyGivingRecord = {
  code: string;
  title: string;
  description: string;
  month: string;
  donatedOn: string | null;
  amountMinor: number | null;
  currency: string;
  recipientName: string;
  recipientUrl: string | null;
  evidenceUrl: string | null;
  status: string;
};

export type DailyGivingMonth = {
  yearMonth: string;
  recordCount: number;
  amountMinor: number | null;
  currency: string;
};

export type DailyGivingRecordList = {
  records: DailyGivingRecord[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};

type ApiObject = Record<string, unknown>;

type RecordListResponse = {
  ok?: boolean;
  items?: unknown;
  records?: unknown;
  data?: unknown;
  pagination?: unknown;
};

type MonthsResponse = {
  ok?: boolean;
  months?: unknown;
  items?: unknown;
  data?: unknown;
};

function asObject(value: unknown): ApiObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as ApiObject) : null;
}

function firstString(source: ApiObject, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function firstNumber(source: ApiObject, keys: string[], fallback: number | null = null): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function normalizeRecords(value: unknown): DailyGivingRecord[] {
  const rows = Array.isArray(value) ? value : [];

  return rows.flatMap((row, index) => {
    const source = asObject(row);
    if (!source) {
      return [];
    }

    const code = firstString(source, ["record_code", "recordCode", "code", "slug", "id"], `record-${index + 1}`);
    const title = firstString(source, ["title", "name", "recipient_name", "recipientName"], code);
    const month = firstString(source, ["year_month", "yearMonth", "month"], "");

    return [
      {
        code,
        title,
        description: firstString(source, ["description", "summary", "public_note", "publicNote"], ""),
        month,
        donatedOn: firstString(source, ["donated_on", "donatedOn", "date"], "") || null,
        amountMinor: firstNumber(source, ["amount_minor", "amountMinor", "amount_cents", "amountCents"]),
        currency: firstString(source, ["currency"], "USD").toUpperCase(),
        recipientName: firstString(source, ["recipient_name", "recipientName", "recipient", "organization"], ""),
        recipientUrl: firstString(source, ["recipient_url", "recipientUrl", "organization_url", "organizationUrl"], "") || null,
        evidenceUrl: firstString(source, ["evidence_url", "evidenceUrl", "receipt_url", "receiptUrl", "source_url", "sourceUrl"], "") || null,
        status: firstString(source, ["status", "state"], "published"),
      },
    ];
  });
}

function normalizeMonths(value: unknown): DailyGivingMonth[] {
  const rows = Array.isArray(value) ? value : [];

  return rows.flatMap((row) => {
    const source = asObject(row);
    if (!source) {
      return [];
    }

    const yearMonth = firstString(source, ["year_month", "yearMonth", "month"]);
    if (!yearMonth) {
      return [];
    }

    return [
      {
        yearMonth,
        recordCount: firstNumber(source, ["record_count", "recordCount", "count", "total"], 0) ?? 0,
        amountMinor: firstNumber(source, ["amount_minor", "amountMinor", "amount_cents", "amountCents", "total_amount_minor", "totalAmountMinor"]),
        currency: firstString(source, ["currency"], "USD").toUpperCase(),
      },
    ];
  });
}

function normalizePagination(value: unknown): DailyGivingRecordList["pagination"] {
  const source = asObject(value) ?? {};

  return {
    currentPage: firstNumber(source, ["current_page", "currentPage", "page"], 1) ?? 1,
    perPage: firstNumber(source, ["per_page", "perPage"], 20) ?? 20,
    total: firstNumber(source, ["total"], 0) ?? 0,
    lastPage: firstNumber(source, ["last_page", "lastPage"], 1) ?? 1,
  };
}

function buildLocaleQuery(locale: Locale | string): string {
  return new URLSearchParams({ locale: toApiLocale(locale) }).toString();
}

export function formatDailyGivingAmount(record: Pick<DailyGivingRecord, "amountMinor" | "currency">, locale: Locale): string {
  if (record.amountMinor === null) {
    return locale === "zh" ? "未公开金额" : "Amount not shown";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: record.currency || "USD",
  }).format(record.amountMinor / 100);
}

export function formatDailyGivingDate(value: string | null, locale: Locale): string {
  if (!value) {
    return locale === "zh" ? "日期待确认" : "Date pending";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function fetchDailyGivingRecords({
  locale,
  yearMonth,
}: {
  locale: Locale | string;
  yearMonth?: string;
}): Promise<DailyGivingRecordList> {
  const normalizedLocale = normalizeLocale(locale);
  const endpoint = yearMonth
    ? `/v0.5/foundation/giving-records/months/${encodeURIComponent(yearMonth)}?${buildLocaleQuery(normalizedLocale)}`
    : `/v0.5/foundation/giving-records?${buildLocaleQuery(normalizedLocale)}`;
  const response = await apiClient.get<RecordListResponse>(endpoint, {
    locale: normalizedLocale,
    skipAuth: true,
    ...PUBLIC_API_CACHE_OPTIONS,
  });

  return {
    records: normalizeRecords(response.items ?? response.records ?? response.data),
    pagination: normalizePagination(response.pagination),
  };
}

export async function fetchDailyGivingMonths(locale: Locale | string): Promise<DailyGivingMonth[]> {
  const normalizedLocale = normalizeLocale(locale);
  const response = await apiClient.get<MonthsResponse>(`/v0.5/foundation/giving-records/months?${buildLocaleQuery(normalizedLocale)}`, {
    locale: normalizedLocale,
    skipAuth: true,
    ...PUBLIC_API_CACHE_OPTIONS,
  });

  return normalizeMonths(response.months ?? response.items ?? response.data);
}
