import {
  fetchAttemptReportAccess,
  fetchScaleQuestions,
  getAttemptReport,
  getFeatureFlags,
  getMyAttempts,
  getScaleLookup,
  startAttempt,
  submitAttempt,
  type AttemptReportAccessResponse,
  type MeAttemptsResponse,
  type QuestionsResponse,
  type ReportResponse,
  type ScaleLookupResponse,
  type StartAttemptResponse,
  type SubmitAnswer,
  type SubmitResponse,
} from "@/lib/api/v0_3";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  big5MeAttemptsResponseSchema,
  big5QuestionsResponseSchema,
  big5ReportResponseSchema,
  big5StartAttemptResponseSchema,
  big5SubmitResponseSchema,
} from "@/lib/big5/contracts/schemas";

const BIG5_SCALE_CODE = "BIG5_OCEAN";

function resolveAnonId(anonId?: string): string | undefined {
  const normalized = String(anonId ?? "").trim();
  if (normalized) return normalized;
  if (typeof window === "undefined") return undefined;

  const browserAnonId = getOrCreateAnonId().trim();
  return browserAnonId || undefined;
}

async function withBig5AuthRetry<T>({
  anonId,
  locale,
  run,
}: {
  anonId?: string;
  locale?: string;
  run: () => Promise<T>;
}): Promise<T> {
  return runWithGuestTokenRetry({
    runner: run,
    anonId: resolveAnonId(anonId),
    locale,
  });
}

function assertContract<T>(
  schemaName: string,
  validator: { safeParse: (value: unknown) => { success: boolean; data?: unknown; error?: unknown } },
  payload: unknown
): T {
  const parsed = validator.safeParse(payload);
  if (!parsed.success || parsed.data === undefined) {
    throw new Error(`Contract validation failed: ${schemaName}`);
  }
  return parsed.data as T;
}

export async function fetchBig5Questions({
  locale,
  region,
  anonId,
  formCode,
}: {
  locale?: string;
  region?: string;
  anonId?: string;
  formCode?: string;
}): Promise<QuestionsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withBig5AuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchScaleQuestions({
        scaleCode: BIG5_SCALE_CODE,
        formCode,
        locale,
        region,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<QuestionsResponse>("big5QuestionsResponse", big5QuestionsResponseSchema, response);
}

export async function startBig5Attempt({
  anonId,
  locale,
  region,
  formCode,
  meta,
  clientVersion,
}: {
  anonId?: string;
  locale?: string;
  region?: string;
  formCode?: string;
  meta?: Record<string, unknown>;
  clientVersion?: string;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withBig5AuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      startAttempt({
        scaleCode: BIG5_SCALE_CODE,
        formCode,
        anonId: resolvedAnonId,
        locale,
        region,
        meta,
        clientPlatform: "web",
        clientVersion,
        channel: "web",
      }),
  });

  return assertContract<StartAttemptResponse>("big5StartAttemptResponse", big5StartAttemptResponseSchema, response);
}

export async function submitBig5Attempt({
  attemptId,
  answers,
  durationMs,
  anonId,
}: {
  attemptId: string;
  answers: SubmitAnswer[];
  durationMs: number;
  anonId?: string;
}): Promise<SubmitResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withBig5AuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      submitAttempt({
        attemptId,
        answers,
        durationMs,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<SubmitResponse>("big5SubmitResponse", big5SubmitResponseSchema, response);
}

export async function fetchBig5Report({
  attemptId,
  refresh,
  anonId,
}: {
  attemptId: string;
  refresh?: boolean;
  anonId?: string;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withBig5AuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      getAttemptReport({
        attemptId,
        refresh,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<ReportResponse>("big5ReportResponse", big5ReportResponseSchema, response);
}

export async function fetchBig5ReportAccess({
  attemptId,
  anonId,
  locale,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
}): Promise<AttemptReportAccessResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  return withBig5AuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchAttemptReportAccess({
        attemptId,
        anonId: resolvedAnonId,
      }),
  });
}

export async function fetchBig5History({
  page,
  pageSize,
  anonId,
}: {
  page?: number;
  pageSize?: number;
  anonId?: string;
} = {}): Promise<MeAttemptsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withBig5AuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      getMyAttempts({
        scaleCode: BIG5_SCALE_CODE,
        page,
        pageSize,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<MeAttemptsResponse>("big5MeAttemptsResponse", big5MeAttemptsResponseSchema, response);
}

export async function fetchBig5Lookup({
  slug,
  locale,
}: {
  slug: string;
  locale?: string;
}): Promise<ScaleLookupResponse> {
  return getScaleLookup({ slug, locale });
}

export async function fetchBig5Flags({ anonId }: { anonId?: string } = {}) {
  return getFeatureFlags({ anonId });
}

export function resolveBig5RolloutState(capabilities?: Record<string, unknown> | null): {
  enabledInProd: boolean;
  paywallMode: "off" | "free_only" | "full";
} {
  const caps = capabilities && typeof capabilities === "object" ? capabilities : {};

  const enabledRaw =
    (caps as { enabled_in_prod?: unknown }).enabled_in_prod ??
    ((caps as { rollout?: { enabled_in_prod?: unknown } }).rollout?.enabled_in_prod ?? true);

  const paywallRaw =
    (caps as { paywall_mode?: unknown }).paywall_mode ??
    ((caps as { rollout?: { paywall_mode?: unknown } }).rollout?.paywall_mode ?? "full");

  const enabledInProd =
    enabledRaw === false || String(enabledRaw).toLowerCase() === "false" || String(enabledRaw) === "0"
      ? false
      : true;

  const paywallMode = String(paywallRaw).toLowerCase();
  if (paywallMode === "off" || paywallMode === "free_only" || paywallMode === "full") {
    return {
      enabledInProd,
      paywallMode,
    };
  }

  return {
    enabledInProd,
    paywallMode: "full",
  };
}
