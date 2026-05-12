import {
  fetchAttemptReport,
  fetchAttemptReportAccess,
  fetchAttemptResult,
  fetchScaleQuestions,
  getScaleLookup,
  startAttempt,
  submitAttempt,
  type SubmitAnswer,
} from "@/lib/api/v0_3";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  IQ_CANONICAL_SCALE_CODE,
  IQ_PUBLIC_SLUG,
  type IqScaleCode,
} from "@/lib/iq/constants";
import {
  assertIqContract,
  iqQuestionPayloadSchema,
  iqReportAccessPayloadSchema,
  iqReportPayloadSchema,
  iqResultPayloadSchema,
  iqScaleLookupSchema,
  iqStartAttemptResponseSchema,
  iqSubmitResponseSchema,
  normalizeIqScaleCodeForApi,
  type IqAttemptAnswer,
  type IqQuestionPayload,
  type IqReportAccessPayload,
  type IqReportPayload,
  type IqResultPayload,
  type IqScaleLookupResponse,
  type IqStartAttemptPayload,
  type IqStartAttemptResponse,
  type IqSubmitResponse,
} from "@/lib/iq/contracts";

type IqAttributionUtm = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
};

type IqAttemptAttributionPayload = {
  referrer?: string;
  share_id?: string;
  compare_invite_id?: string;
  invite_unlock_code?: string;
  share_click_id?: string;
  entrypoint?: string;
  landing_path?: string;
  utm?: IqAttributionUtm;
};

function resolveAnonId(anonId?: string): string | undefined {
  const normalized = String(anonId ?? "").trim();
  if (normalized) return normalized;
  if (typeof window === "undefined") return undefined;

  const browserAnonId = getOrCreateAnonId().trim();
  return browserAnonId || undefined;
}

async function withIqAuthRetry<T>({
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

export function normalizeIqSubmitAnswers(answers: IqAttemptAnswer[]): SubmitAnswer[] {
  return answers.map((answer) => ({
    question_id: answer.question_id ?? answer.item_id ?? "",
    option_code: answer.option_code,
    value: answer.value,
    ...(typeof answer.question_index === "number" ? { question_index: answer.question_index } : {}),
  }));
}

export async function lookupIqScale({ locale }: { locale?: string } = {}): Promise<IqScaleLookupResponse> {
  const response = await getScaleLookup({
    slug: IQ_PUBLIC_SLUG,
    locale,
  });

  return assertIqContract<IqScaleLookupResponse>("iqScaleLookup", iqScaleLookupSchema, response);
}

export async function getIqQuestions({
  locale,
  region,
  anonId,
  formCode,
}: {
  locale?: string;
  region?: string;
  anonId?: string;
  formCode?: string;
} = {}): Promise<IqQuestionPayload> {
  return getIqQuestionsByScaleCode(IQ_CANONICAL_SCALE_CODE, {
    locale,
    region,
    anonId,
    formCode,
  });
}

export async function getIqQuestionsByScaleCode(
  scaleCode: IqScaleCode,
  {
    locale,
    region,
    anonId,
    formCode,
  }: {
    locale?: string;
    region?: string;
    anonId?: string;
    formCode?: string;
  } = {}
): Promise<IqQuestionPayload> {
  const resolvedAnonId = resolveAnonId(anonId);
  const resolvedScaleCode = normalizeIqScaleCodeForApi(scaleCode);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchScaleQuestions({
        scaleCode: resolvedScaleCode,
        formCode,
        locale,
        region,
        anonId: resolvedAnonId,
      }),
  });

  return assertIqContract<IqQuestionPayload>("iqQuestionPayload", iqQuestionPayloadSchema, response);
}

export async function startIqAttempt({
  scale_code,
  anon_id,
  locale,
  region,
  source,
  meta,
  client_version,
  referrer,
  share_id,
  compare_invite_id,
  invite_unlock_code,
  share_click_id,
  entrypoint,
  landing_path,
  utm,
}: IqStartAttemptPayload & IqAttemptAttributionPayload): Promise<IqStartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anon_id);
  const resolvedScaleCode = normalizeIqScaleCodeForApi(scale_code);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      startAttempt({
        scaleCode: resolvedScaleCode,
        anonId: resolvedAnonId,
        locale,
        region,
        meta: {
          ...(meta ?? {}),
          ...(source ? { source } : {}),
        },
        clientPlatform: "web",
        clientVersion: client_version,
        channel: "web",
        referrer,
        share_id,
        compare_invite_id,
        invite_unlock_code,
        share_click_id,
        entrypoint,
        landing_path,
        utm,
      }),
  });

  return assertIqContract<IqStartAttemptResponse>("iqStartAttemptResponse", iqStartAttemptResponseSchema, response);
}

export async function submitIqAttempt({
  attempt_id,
  answers,
  duration_ms,
  anon_id,
  referrer,
  share_id,
  compare_invite_id,
  invite_unlock_code,
  share_click_id,
  entrypoint,
  landing_path,
  utm,
}: {
  attempt_id: string;
  answers: IqAttemptAnswer[];
  duration_ms: number;
  anon_id?: string;
} & IqAttemptAttributionPayload): Promise<IqSubmitResponse> {
  const resolvedAnonId = resolveAnonId(anon_id);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    run: () =>
      submitAttempt({
        attemptId: attempt_id,
        anonId: resolvedAnonId,
        answers: normalizeIqSubmitAnswers(answers),
        durationMs: duration_ms,
        referrer,
        share_id,
        compare_invite_id,
        invite_unlock_code,
        share_click_id,
        entrypoint,
        landing_path,
        utm,
      }),
  });

  return assertIqContract<IqSubmitResponse>("iqSubmitResponse", iqSubmitResponseSchema, response);
}

export async function getIqResult({
  attemptId,
  anonId,
  locale,
  accessToken,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  accessToken?: string | null;
}): Promise<IqResultPayload> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchAttemptResult({
        attemptId,
        anonId: resolvedAnonId ?? "",
        locale,
        accessToken,
      }),
  });

  return assertIqContract<IqResultPayload>("iqResultPayload", iqResultPayloadSchema, response);
}

export async function getIqReportAccess({
  attemptId,
  anonId,
  locale,
  accessToken,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  accessToken?: string | null;
}): Promise<IqReportAccessPayload> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchAttemptReportAccess({
        attemptId,
        anonId: resolvedAnonId,
        locale,
        accessToken,
      }),
  });

  return assertIqContract<IqReportAccessPayload>("iqReportAccessPayload", iqReportAccessPayloadSchema, response);
}

export async function getIqReport({
  attemptId,
  anonId,
  locale,
  accessToken,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  locale?: string;
  accessToken?: string | null;
  refresh?: boolean;
}): Promise<IqReportPayload> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await withIqAuthRetry({
    anonId: resolvedAnonId,
    locale,
    run: () =>
      fetchAttemptReport({
        attemptId,
        anonId: resolvedAnonId,
        locale,
        accessToken,
        refresh,
      }),
  });

  return assertIqContract<IqReportPayload>("iqReportPayload", iqReportPayloadSchema, response);
}

export { IQ_CANONICAL_SCALE_CODE, IQ_LEGACY_SCALE_CODE, IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
