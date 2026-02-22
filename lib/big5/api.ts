import {
  fetchScaleQuestions,
  getAttemptReport,
  getFeatureFlags,
  getMyAttempts,
  getScaleLookup,
  startAttempt,
  submitAttempt,
  type MeAttemptsResponse,
  type QuestionsResponse,
  type ReportResponse,
  type ScaleLookupResponse,
  type StartAttemptResponse,
  type SubmitAnswer,
  type SubmitResponse,
} from "@/lib/api/v0_3";
import {
  big5MeAttemptsResponseSchema,
  big5QuestionsResponseSchema,
  big5ReportResponseSchema,
  big5StartAttemptResponseSchema,
  big5SubmitResponseSchema,
} from "@/lib/big5/contracts/schemas";

const BIG5_SCALE_CODE = "BIG5_OCEAN";

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
}: {
  locale?: string;
  region?: string;
  anonId?: string;
}): Promise<QuestionsResponse> {
  const response = await fetchScaleQuestions({
    scaleCode: BIG5_SCALE_CODE,
    locale,
    region,
    anonId,
  });

  return assertContract<QuestionsResponse>("big5QuestionsResponse", big5QuestionsResponseSchema, response);
}

export async function startBig5Attempt({
  anonId,
  locale,
  region,
  meta,
  clientVersion,
}: {
  anonId?: string;
  locale?: string;
  region?: string;
  meta?: Record<string, unknown>;
  clientVersion?: string;
}): Promise<StartAttemptResponse> {
  const response = await startAttempt({
    scaleCode: BIG5_SCALE_CODE,
    anonId,
    locale,
    region,
    meta,
    clientPlatform: "web",
    clientVersion,
    channel: "web",
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
  const response = await submitAttempt({
    attemptId,
    answers,
    durationMs,
    anonId,
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
  const response = await getAttemptReport({
    attemptId,
    refresh,
    anonId,
  });

  return assertContract<ReportResponse>("big5ReportResponse", big5ReportResponseSchema, response);
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
  const response = await getMyAttempts({
    scaleCode: BIG5_SCALE_CODE,
    page,
    pageSize,
    anonId,
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
