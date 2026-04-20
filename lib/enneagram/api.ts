import {
  fetchAttemptReportAccess,
  fetchScaleQuestions,
  getAttemptReport,
  getMyAttempts,
  startAttempt,
  submitAttempt,
  type AttemptReportAccessResponse,
  type MeAttemptsResponse,
  type QuestionsResponse,
  type ReportResponse,
  type StartAttemptResponse,
  type SubmitAnswer,
  type SubmitResponse,
} from "@/lib/api/v0_3";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  enneagramQuestionsResponseSchema,
  enneagramMeAttemptsResponseSchema,
  enneagramReportAccessResponseSchema,
  enneagramReportResponseSchema,
  enneagramStartAttemptResponseSchema,
  enneagramSubmitResponseSchema,
} from "@/lib/enneagram/contracts/schemas";
import {
  ENNEAGRAM_SCALE_CODE,
  normalizeEnneagramFormCode,
  resolveEnneagramFormMeta,
  type EnneagramFormCode,
} from "@/lib/enneagram/forms";

function resolveAnonId(anonId?: string): string | undefined {
  const normalized = String(anonId ?? "").trim();
  if (normalized) return normalized;
  if (typeof window === "undefined") return undefined;

  const browserAnonId = getOrCreateAnonId().trim();
  return browserAnonId || undefined;
}

async function withEnneagramAuthRetry<T>({
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
  validator: { safeParse: (value: unknown) => { success: boolean; data?: unknown } },
  payload: unknown
): T {
  const parsed = validator.safeParse(payload);
  if (!parsed.success || parsed.data === undefined) {
    throw new Error(`Contract validation failed: ${schemaName}`);
  }
  return parsed.data as T;
}

export async function fetchEnneagramQuestions({
  locale,
  region,
  anonId,
  formCode,
}: {
  locale?: string;
  region?: string;
  anonId?: string;
  formCode?: string | null;
}): Promise<QuestionsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const resolvedFormCode = normalizeEnneagramFormCode(formCode);
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchScaleQuestions({
        scaleCode: ENNEAGRAM_SCALE_CODE,
        formCode: resolvedFormCode,
        locale,
        region,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<QuestionsResponse>("enneagramQuestionsResponse", enneagramQuestionsResponseSchema, response);
}

export async function startEnneagramAttempt({
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
  formCode?: string | null;
  meta?: Record<string, unknown>;
  clientVersion?: string;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const resolvedFormCode = normalizeEnneagramFormCode(formCode);
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      startAttempt({
        scaleCode: ENNEAGRAM_SCALE_CODE,
        formCode: resolvedFormCode,
        anonId: resolvedAnonId,
        locale,
        region,
        meta,
        clientPlatform: "web",
        clientVersion,
        channel: "web",
      }),
  });

  return assertContract<StartAttemptResponse>(
    "enneagramStartAttemptResponse",
    enneagramStartAttemptResponseSchema,
    response
  );
}

export function buildEnneagramSubmitAnswers({
  questionIds,
  answers,
}: {
  questionIds: string[];
  answers: Record<string, string>;
  formCode?: EnneagramFormCode | string | null;
}): SubmitAnswer[] {
  return questionIds.map((questionId, index) => ({
    question_id: questionId,
    code: answers[questionId] ?? "",
    question_index: index,
  }));
}

export async function submitEnneagramAttempt({
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
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      submitAttempt({
        attemptId,
        answers,
        durationMs,
        anonId: resolvedAnonId,
      }),
  });

  return assertContract<SubmitResponse>("enneagramSubmitResponse", enneagramSubmitResponseSchema, response);
}

export async function fetchEnneagramReport({
  attemptId,
  refresh,
  anonId,
  locale,
}: {
  attemptId: string;
  refresh?: boolean;
  anonId?: string;
  locale?: string;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      getAttemptReport({
        attemptId,
        refresh,
        anonId: resolvedAnonId,
        locale,
      }),
  });

  return assertContract<ReportResponse>("enneagramReportResponse", enneagramReportResponseSchema, response);
}

export async function fetchEnneagramReportAccess({
  attemptId,
  anonId,
  locale,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
}): Promise<AttemptReportAccessResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchAttemptReportAccess({
        attemptId,
        anonId: resolvedAnonId,
        locale,
      }),
  });

  return assertContract<AttemptReportAccessResponse>(
    "enneagramReportAccessResponse",
    enneagramReportAccessResponseSchema,
    response
  );
}

export async function fetchEnneagramHistory({
  page,
  pageSize,
  anonId,
  locale,
}: {
  page?: number;
  pageSize?: number;
  anonId?: string;
  locale?: string;
} = {}): Promise<MeAttemptsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withEnneagramAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      getMyAttempts({
        scaleCode: ENNEAGRAM_SCALE_CODE,
        page,
        pageSize,
        anonId: resolvedAnonId,
        locale,
      }),
  });

  return assertContract<MeAttemptsResponse>("enneagramMeAttemptsResponse", enneagramMeAttemptsResponseSchema, response);
}

export function isEnneagramForcedChoiceForm(formCode: string | null | undefined): boolean {
  return resolveEnneagramFormMeta(formCode).questionMode === "forced_choice_144";
}
