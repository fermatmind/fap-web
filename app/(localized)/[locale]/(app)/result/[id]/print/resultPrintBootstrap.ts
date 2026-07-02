import { buildApiUrl } from "@/lib/api-base";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import type { AttemptReportAccessResponse, ReportResponse } from "@/lib/api/v0_3";
import {
  fetchPersonalityDesktopCloneSnapshotContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import {
  resolveMbtiSnapshotFullCodeFromReport,
  validateMbtiSnapshotDesktopCloneContent,
  type MbtiSnapshotContentStatus,
} from "@/lib/result/mbtiSnapshotContent";

export type ResultPrintBootstrap = {
  reportAccess: AttemptReportAccessResponse | null;
  report: ReportResponse | null;
  desktopCloneContent: PersonalityDesktopCloneContentPayload | null;
  snapshotContentStatus: MbtiSnapshotContentStatus | null;
  error: string | null;
};

export async function loadResultPrintBootstrap({
  attemptId,
  locale,
  accessToken,
}: {
  attemptId: string;
  locale: Locale;
  accessToken: string | null;
}): Promise<ResultPrintBootstrap> {
  if (!accessToken) {
    return {
      reportAccess: null,
      report: null,
      desktopCloneContent: null,
      snapshotContentStatus: null,
      error: "missing_result_access_token",
    };
  }

  try {
    const reportAccess = await fetchResultPrintJson<AttemptReportAccessResponse>({
      path: `/v0.3/attempts/${encodeURIComponent(attemptId)}/report-access`,
      locale,
      accessToken,
    });
    const report = await fetchResultPrintJson<ReportResponse>({
      path: `/v0.3/attempts/${encodeURIComponent(attemptId)}/report`,
      locale,
      accessToken,
    });
    const mbtiFullCode = resolveMbtiSnapshotFullCodeFromReport(report);
    const desktopCloneContent = mbtiFullCode
      ? await fetchPersonalityDesktopCloneSnapshotContent(mbtiFullCode, locale)
      : null;
    const snapshotContentStatus = mbtiFullCode
      ? validateMbtiSnapshotDesktopCloneContent({
          locale,
          fullCode: mbtiFullCode,
          payload: desktopCloneContent,
        })
      : null;

    return {
      reportAccess,
      report,
      desktopCloneContent,
      snapshotContentStatus,
      error: null,
    };
  } catch {
    return {
      reportAccess: null,
      report: null,
      desktopCloneContent: null,
      snapshotContentStatus: null,
      error: "result_print_bootstrap_failed",
    };
  }
}

async function fetchResultPrintJson<T>({
  path,
  locale,
  accessToken,
}: {
  path: string;
  locale: Locale;
  accessToken: string;
}): Promise<T> {
  const params = new URLSearchParams({
    locale,
  });
  const response = await fetch(buildApiUrl(`${path}?${params.toString()}`), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "X-FAP-Locale": toApiLocale(locale),
      "X-Result-Access-Token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`result print bootstrap failed: ${response.status}`);
  }

  const payload = (await response.json()) as T;
  if (isOkFalsePayload(payload)) {
    throw new Error("result print bootstrap returned ok=false");
  }

  return payload;
}

function isOkFalsePayload(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && (value as { ok?: unknown }).ok === false);
}
