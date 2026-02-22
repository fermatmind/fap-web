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
import {
  clinicalQuestionsResponseSchema,
  clinicalReportResponseSchema,
  clinicalScaleCodeSchema,
  clinicalStartAttemptResponseSchema,
  clinicalSubmitResponseSchema,
} from "@/lib/clinical/contracts/schemas";

export type ClinicalScaleCode = "SDS_20" | "CLINICAL_COMBO_68";

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

  const response = await startAttempt({
    scaleCode,
    anonId,
    locale,
    region,
    consent,
    meta,
    clientPlatform: "web",
    clientVersion,
    channel: "web",
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
  const response = await getAttemptReport({
    attemptId,
    anonId,
    refresh,
  });

  return assertClinicalContract<ReportResponse>(
    "clinicalReportResponse",
    clinicalReportResponseSchema,
    response
  );
}
