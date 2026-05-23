import {
  fetchScaleQuestions,
  getAttemptReport,
  getMyAttempts,
  startAttempt,
  submitAttempt,
  type MeAttemptsResponse,
  type AttemptAttributionPayload,
  type QuestionsResponse,
  type ReportResponse,
  type StartAttemptResponse,
  type SubmitAnswer,
  type SubmitResponse,
} from "@/lib/api/v0_3";
import { getOrCreateAnonId } from "@/lib/anon";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { normalizeRiasecFormCode, RIASEC_SCALE_CODE } from "@/lib/riasec/forms";

function resolveAnonId(anonId?: string): string | undefined {
  const normalized = String(anonId ?? "").trim();
  if (normalized) return normalized;
  if (typeof window === "undefined") return undefined;

  const browserAnonId = getOrCreateAnonId().trim();
  return browserAnonId || undefined;
}

async function withRiasecAuthRetry<T>({
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

export async function ensureRiasecGuestTokenReady({
  anonId,
  locale,
  forceRefresh = false,
}: {
  anonId?: string;
  locale?: string;
  forceRefresh?: boolean;
} = {}): Promise<"existing" | "issued"> {
  return ensureFmTokenReady({
    anonId: resolveAnonId(anonId),
    locale,
    forceRefresh,
  });
}

export async function fetchRiasecQuestions({
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
  const resolvedFormCode = normalizeRiasecFormCode(formCode);

  return withRiasecAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchScaleQuestions({
        scaleCode: RIASEC_SCALE_CODE,
        formCode: resolvedFormCode,
        locale,
        region,
        anonId: resolvedAnonId,
      }),
  });
}

export async function startRiasecAttempt({
  anonId,
  locale,
  region,
  formCode,
  meta,
  attribution,
  clientVersion,
}: {
  anonId?: string;
  locale?: string;
  region?: string;
  formCode?: string | null;
  meta?: Record<string, unknown>;
  attribution?: AttemptAttributionPayload;
  clientVersion?: string;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const resolvedFormCode = normalizeRiasecFormCode(formCode);

  await ensureRiasecGuestTokenReady({
    anonId: resolvedAnonId,
    locale,
  });

  return withRiasecAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      startAttempt({
        scaleCode: RIASEC_SCALE_CODE,
        formCode: resolvedFormCode,
        anonId: resolvedAnonId,
        locale,
        region,
        meta,
        ...attribution,
        clientPlatform: "web",
        clientVersion,
        channel: "web",
      }),
  });
}

export function buildRiasecSubmitAnswers({
  questionIds,
  answers,
}: {
  questionIds: string[];
  answers: Record<string, string>;
}): SubmitAnswer[] {
  return questionIds.map((questionId, index) => ({
    question_id: questionId,
    code: answers[questionId] ?? "",
    question_index: index,
  }));
}

export async function submitRiasecAttempt({
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

  return withRiasecAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      submitAttempt({
        attemptId,
        answers,
        durationMs,
        anonId: resolvedAnonId,
    }),
  });
}

export async function fetchRiasecReport({
  attemptId,
  refresh,
  anonId,
}: {
  attemptId: string;
  refresh?: boolean;
  anonId?: string;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);

  return withRiasecAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      getAttemptReport({
        attemptId,
        refresh,
        anonId: resolvedAnonId,
      }),
  });
}

export async function fetchRiasecHistory({
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

  return withRiasecAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      getMyAttempts({
        scaleCode: RIASEC_SCALE_CODE,
        page,
        pageSize,
        anonId: resolvedAnonId,
        locale,
      }),
  });
}
