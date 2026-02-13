import { apiClient } from "@/lib/api-client";

export type ScaleQuestionOption = {
  code: string;
  text: string;
  score?: number;
};

export type ScaleQuestionItem = {
  question_id: string;
  text: string;
  order?: number;
  options: ScaleQuestionOption[];
};

export type QuestionsResponse = {
  ok: boolean;
  scale_code?: string;
  pack_id?: string;
  dir_version?: string;
  content_package_version?: string;
  questions: {
    schema?: string;
    items: ScaleQuestionItem[];
  };
};

export type StartAttemptResponse = {
  ok: boolean;
  attempt_id: string;
  pack_id?: string;
  dir_version?: string;
  resume_token?: string;
  scale_code?: string;
};

export type SubmitAnswer = {
  question_id: string;
  option_code: string;
};

export type SubmitResponse = {
  ok: boolean;
  attempt_id?: string;
  result?: Record<string, unknown>;
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
  idempotent?: boolean;
};

export type ResultResponse = {
  ok: boolean;
  attempt_id?: string;
  result?: {
    type_code?: string;
    [key: string]: unknown;
  };
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
};

export type ReportResponse = {
  ok?: boolean;
  locked?: boolean;
  access_level?: string;
  offers?: unknown;
  report?: unknown;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

function anonHeader(anonId: string) {
  return {
    headers: {
      "X-Anon-Id": anonId,
    },
  };
}

export async function startAttempt({
  scaleCode,
  anonId,
}: {
  scaleCode: string;
  anonId: string;
}): Promise<StartAttemptResponse> {
  return apiClient.post<StartAttemptResponse>(
    "/v0.3/attempts/start",
    {
      scale_code: scaleCode,
      anon_id: anonId,
    },
    anonHeader(anonId)
  );
}

export async function fetchScaleQuestions({
  scaleCode,
  anonId,
}: {
  scaleCode: string;
  anonId: string;
}): Promise<QuestionsResponse> {
  const response = await apiClient.get<QuestionsResponse>(
    `/v0.3/scales/${scaleCode}/questions`,
    anonHeader(anonId)
  );

  const items = Array.isArray(response.questions?.items)
    ? response.questions.items
    : [];

  return {
    ...response,
    questions: {
      schema: response.questions?.schema,
      items,
    },
  };
}

export async function submitAttempt({
  attemptId,
  anonId,
  answers,
  durationMs,
}: {
  attemptId: string;
  anonId: string;
  answers: SubmitAnswer[];
  durationMs: number;
}): Promise<SubmitResponse> {
  return apiClient.post<SubmitResponse>(
    "/v0.3/attempts/submit",
    {
      attempt_id: attemptId,
      answers,
      duration_ms: durationMs,
    },
    anonHeader(anonId)
  );
}

export async function fetchAttemptResult({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId: string;
}): Promise<ResultResponse> {
  return apiClient.get<ResultResponse>(
    `/v0.3/attempts/${attemptId}/result`,
    anonHeader(anonId)
  );
}

export async function fetchAttemptReport({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId: string;
}): Promise<ReportResponse> {
  return apiClient.get<ReportResponse>(
    `/v0.3/attempts/${attemptId}/report`,
    anonHeader(anonId)
  );
}
