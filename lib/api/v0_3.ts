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
    summary?: string;
    dimensions?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
  meta?: {
    scale_code?: string;
    [key: string]: unknown;
  };
};

export type OfferPayload = {
  sku?: string;
  label?: string;
  currency?: string;
  amount_cents?: number;
  formatted_price?: string;
  checkout_url?: string;
  order_no?: string;
  [key: string]: unknown;
};

export type ReportResponse = {
  ok?: boolean;
  locked?: boolean;
  access_level?: string;
  summary?: string;
  type_code?: string;
  dimensions?: Array<Record<string, unknown>>;
  offer?: OfferPayload;
  offers?: OfferPayload[] | Record<string, unknown>;
  price?: number | string;
  currency?: string;
  checkout_url?: string;
  report?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CheckoutResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  checkout_url?: string;
  status?: string;
  offer?: OfferPayload;
  price?: number | string;
  currency?: string;
  [key: string]: unknown;
};

export type OrderStatusResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  status?: "pending" | "paid" | "failed" | string;
  message?: string;
  [key: string]: unknown;
};

export type ShareSummaryResponse = {
  ok?: boolean;
  id?: string;
  title?: string;
  summary?: string;
  typeCode?: string;
  dimensions?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type OrderLookupResponse = {
  ok?: boolean;
  order_no?: string;
  [key: string]: unknown;
};

export type OrderResendResponse = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
};

function anonHeader(anonId?: string) {
  if (!anonId) return {};
  return {
    headers: {
      "X-Anon-Id": anonId,
    },
  };
}

function assertApiOk<T extends { ok?: boolean }>(response: T, fallbackMessage: string): T {
  if (response.ok === false) {
    throw new Error(fallbackMessage);
  }
  return response;
}

function normalizeOrderStatus(status: string | undefined): "pending" | "paid" | "failed" {
  if (!status) return "pending";
  const lower = status.toLowerCase();
  if (lower === "paid" || lower === "success" || lower === "completed") {
    return "paid";
  }
  if (lower === "failed" || lower === "error" || lower === "canceled" || lower === "cancelled") {
    return "failed";
  }
  return "pending";
}

export async function startAttempt({
  scaleCode,
  anonId,
}: {
  scaleCode: string;
  anonId: string;
}): Promise<StartAttemptResponse> {
  const response = await apiClient.post<StartAttemptResponse>(
    "/v0.3/attempts/start",
    {
      scale_code: scaleCode,
      anon_id: anonId,
    },
    anonHeader(anonId)
  );

  return assertApiOk(response, "Failed to start attempt.");
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

  assertApiOk(response, "Failed to load questions.");

  const items = Array.isArray(response.questions?.items) ? response.questions.items : [];

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
  const response = await apiClient.post<SubmitResponse>(
    "/v0.3/attempts/submit",
    {
      attempt_id: attemptId,
      answers,
      duration_ms: durationMs,
    },
    anonHeader(anonId)
  );

  return assertApiOk(response, "Submit failed.");
}

export async function fetchAttemptResult({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId: string;
}): Promise<ResultResponse> {
  const response = await apiClient.get<ResultResponse>(
    `/v0.3/attempts/${attemptId}/result`,
    anonHeader(anonId)
  );

  return assertApiOk(response, "Failed to load result.");
}

export async function getAttemptReport({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId?: string;
}): Promise<ReportResponse> {
  const response = await apiClient.get<ReportResponse>(
    `/v0.3/attempts/${attemptId}/report`,
    anonHeader(anonId)
  );

  return assertApiOk(response, "Failed to load report.");
}

export async function fetchAttemptReport({
  attemptId,
  anonId,
}: {
  attemptId: string;
  anonId: string;
}): Promise<ReportResponse> {
  return getAttemptReport({ attemptId, anonId });
}

export async function createCheckoutOrOrder({
  attemptId,
  anonId,
  sku,
  orderNo,
}: {
  attemptId: string;
  anonId?: string;
  sku?: string;
  orderNo?: string;
}): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(
    "/v0.3/orders/checkout",
    {
      attempt_id: attemptId,
      sku,
      order_no: orderNo,
    },
    anonHeader(anonId)
  );

  return assertApiOk(response, "Failed to create checkout.");
}

export async function getOrderStatus({
  orderNo,
  anonId,
}: {
  orderNo: string;
  anonId?: string;
}): Promise<OrderStatusResponse> {
  const response = await apiClient.get<OrderStatusResponse>(
    `/v0.3/orders/${orderNo}`,
    anonHeader(anonId)
  );

  const normalized = assertApiOk(response, "Failed to load order status.");
  return {
    ...normalized,
    status: normalizeOrderStatus(normalized.status),
  };
}

export async function getShareSummary({
  shareId,
  anonId,
}: {
  shareId: string;
  anonId?: string;
}): Promise<ShareSummaryResponse> {
  const response = await apiClient.get<ShareSummaryResponse>(
    `/v0.3/shares/${shareId}`,
    anonHeader(anonId)
  );

  return assertApiOk(response, "Share not available.");
}

export async function lookupOrder({
  orderNo,
  email,
}: {
  orderNo: string;
  email: string;
}): Promise<OrderLookupResponse> {
  const response = await apiClient.post<OrderLookupResponse>("/v0.3/orders/lookup", {
    order_no: orderNo,
    email,
  });

  return assertApiOk(response, "Unable to find that order.");
}

export async function resendOrderDelivery({
  orderNo,
}: {
  orderNo: string;
}): Promise<OrderResendResponse> {
  const response = await apiClient.post<OrderResendResponse>(`/v0.3/orders/${orderNo}/resend`);
  return assertApiOk(response, "Unable to resend delivery link.");
}
