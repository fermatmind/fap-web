import {
  fetchScaleQuestions,
  getAttemptReport,
  startAttempt,
  submitAttempt,
  type QuestionsResponse,
  type ReportResponse,
  type StartAttemptResponse,
  type SubmitAnswer,
  type SubmitResponse,
} from "@/lib/api/v0_3";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  clinicalQuestionsResponseSchema,
  clinicalReportResponseSchema,
  clinicalScaleCodeSchema,
  clinicalStartAttemptResponseSchema,
  clinicalSubmitResponseSchema,
} from "@/lib/clinical/contracts/schemas";

export type ClinicalScaleCode = "SDS_20" | "CLINICAL_COMBO_68";

function resolveAnonId(anonId?: string): string | undefined {
  const normalized = String(anonId ?? "").trim();
  if (normalized) return normalized;
  if (typeof window === "undefined") return undefined;

  const browserAnonId = getOrCreateAnonId().trim();
  return browserAnonId || undefined;
}

async function withClinicalAuthRetry<T>({
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

function assertClinicalContract<T>(
  schemaName: string,
  validator: { safeParse: (value: unknown) => { success: boolean; data?: unknown } },
  payload: unknown
): T {
  const parsed = validator.safeParse(payload);
  if (!parsed.success || parsed.data === undefined) {
    throw new Error(`Contract validation failed: ${schemaName}`);
  }
  return parsed.data as T;
}

function assertClinicalScaleCode(scaleCode: string): ClinicalScaleCode {
  const parsed = clinicalScaleCodeSchema.safeParse(scaleCode);
  if (!parsed.success) {
    throw new Error(`Unsupported clinical scale code: ${scaleCode}`);
  }
  return parsed.data;
}

export async function fetchClinicalQuestions({
  scaleCode,
  locale,
  region,
  anonId,
}: {
  scaleCode: ClinicalScaleCode;
  locale?: string;
  region?: string;
  anonId?: string;
}): Promise<QuestionsResponse> {
  const response = await fetchScaleQuestions({
    scaleCode,
    locale,
    region,
    anonId,
  });

  return assertClinicalContract<QuestionsResponse>(
    "clinicalQuestionsResponse",
    clinicalQuestionsResponseSchema,
    response
  );
}

export async function startClinicalAttempt({
  scaleCode,
  anonId,
  locale,
  region,
  consent,
  meta,
  clientVersion,
}: {
  scaleCode: ClinicalScaleCode;
  anonId?: string;
  locale?: string;
  region?: string;
  consent: {
    accepted: boolean;
    version: string;
    locale?: string;
  };
  meta?: Record<string, unknown>;
  clientVersion?: string;
}): Promise<StartAttemptResponse> {
  assertClinicalScaleCode(scaleCode);
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withClinicalAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      startAttempt({
        scaleCode,
        anonId: resolvedAnonId,
        locale,
        region,
        consent,
        meta,
        clientPlatform: "web",
        clientVersion,
        channel: "web",
      }),
  });

  return assertClinicalContract<StartAttemptResponse>(
    "clinicalStartAttemptResponse",
    clinicalStartAttemptResponseSchema,
    response
  );
}

export async function submitClinicalAttempt({
  attemptId,
  answers,
  durationMs,
  anonId,
  consent,
}: {
  attemptId: string;
  answers: SubmitAnswer[];
  durationMs: number;
  anonId?: string;
  consent?: {
    accepted: boolean;
    version: string;
    locale?: string;
  };
}): Promise<SubmitResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withClinicalAuthRetry({
    anonId: resolvedAnonId,
    locale: consent?.locale,
    run: () =>
      submitAttempt({
        attemptId,
        answers,
        durationMs,
        anonId: resolvedAnonId,
        consent,
      }),
  });

  return assertClinicalContract<SubmitResponse>(
    "clinicalSubmitResponse",
    clinicalSubmitResponseSchema,
    response
  );
}

export async function fetchClinicalReport({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withClinicalAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      getAttemptReport({
        attemptId,
        anonId: resolvedAnonId,
        refresh,
      }),
  });

  return assertClinicalContract<ReportResponse>(
    "clinicalReportResponse",
    clinicalReportResponseSchema,
    response
  );
}

export async function fetchAttemptReportForRichResult({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);

  return withClinicalAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      getAttemptReport({
        attemptId,
        anonId: resolvedAnonId,
        refresh,
      }),
  });
}
