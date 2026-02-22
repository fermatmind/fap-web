import { getFmToken } from "@/lib/auth/fmToken";
import { getOrCreateAnonId } from "@/lib/anon";
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
  dimension?: string;
  facet_code?: string;
  options: ScaleQuestionOption[];
};

export type QuestionValidityItem = {
  item_id: string;
  text: string;
  required?: boolean;
};

export type QuestionsMeta = {
  validity_items?: QuestionValidityItem[];
  disclaimer_version?: string;
  disclaimer_hash?: string;
  disclaimer_text?: string;
  [key: string]: unknown;
};

export type QuestionsResponse = {
  ok: boolean;
  scale_code?: string;
  pack_id?: string;
  dir_version?: string;
  content_package_version?: string;
  locale?: string;
  region?: string;
  questions: {
    schema?: string;
    items: ScaleQuestionItem[];
  };
  meta?: QuestionsMeta;
};

export type StartAttemptResponse = {
  ok: boolean;
  attempt_id: string;
  pack_id?: string;
  dir_version?: string;
  resume_token?: string;
  resume_expires_at?: string | null;
  scale_code?: string;
  locale?: string;
  region?: string;
  question_count?: number;
};

export type SubmitAnswer = {
  question_id: string;
  code?: string | number;
  option_code?: string | number;
  value?: string | number;
  question_index?: number;
  question_type?: string;
  answer?: Record<string, unknown>;
};

export type SubmitResponse = {
  ok: boolean;
  attempt_id?: string;
  result?: Record<string, unknown>;
  report?: {
    locked?: boolean;
  };
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
  modules_included?: string[];
  modules_allowed?: string[];
  [key: string]: unknown;
};

export type Big5ReportBlock = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  metric_level?: string;
  metric_code?: string;
  bucket?: string;
  access_level?: string;
  [key: string]: unknown;
};

export type Big5ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: Big5ReportBlock[];
  [key: string]: unknown;
};

export type Big5NormsPayload = {
  status?: "CALIBRATED" | "PROVISIONAL" | "MISSING" | string;
  group_id?: string;
  group_label?: string;
  norms_version?: string;
  [key: string]: unknown;
};

export type Big5QualityPayload = {
  level?: string;
  tone?: "confident" | "cautious" | string;
  [key: string]: unknown;
};

export type ReportResponse = {
  ok?: boolean;
  locked?: boolean;
  generating?: boolean;
  retry_after?: number;
  access_level?: string;
  variant?: "free" | "full" | string;
  summary?: string;
  type_code?: string;
  dimensions?: Array<Record<string, unknown>>;
  offer?: OfferPayload;
  offers?: OfferPayload[] | Record<string, unknown>;
  modules_allowed?: string[];
  modules_offered?: string[];
  modules_preview?: string[];
  price?: number | string;
  currency?: string;
  checkout_url?: string;
  norms?: Big5NormsPayload;
  quality?: Big5QualityPayload;
  report?: {
    sections?: Big5ReportSection[];
    [key: string]: unknown;
  };
  view_policy?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CheckoutResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  checkout_url?: string;
  status?: string;
  message?: string;
  offer?: OfferPayload;
  price?: number | string;
  currency?: string;
  [key: string]: unknown;
};

export type OrderStatusResponse = {
  ok?: boolean;
  order_no?: string;
  attempt_id?: string;
  ownership_verified?: boolean;
  status?: "pending" | "paid" | "failed" | "canceled" | "refunded" | string;
  message?: string;
  amount?: number | string;
  amount_cents?: number;
  currency?: string;
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

export type ScaleLookupResponse = {
  ok?: boolean;
  slug?: string;
  scale_code?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  is_indexable?: boolean;
  content_i18n_json?: Record<string, unknown> | null;
  report_summary_i18n_json?: Record<string, unknown> | null;
  capabilities?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type ScaleSitemapItem = {
  slug: string;
  lastmod?: string;
  is_indexable?: boolean;
};

export type ScaleSitemapSourceResponse = {
  ok?: boolean;
  locale?: string;
  items?: ScaleSitemapItem[];
  [key: string]: unknown;
};

export type BootResponse = {
  ok?: boolean;
  org_id?: number;
  anon_id?: string;
  flags?: Record<string, unknown>;
  experiments?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type MeAttemptItem = {
  attempt_id: string;
  scale_code?: string;
  submitted_at?: string | null;
  type_code?: string;
  result_summary?: {
    domains_mean?: Record<string, number>;
  };
  [key: string]: unknown;
};

export type MeAttemptsHistoryCompare = {
  scale_code?: string;
  current_attempt_id?: string;
  previous_attempt_id?: string;
  current_domains_mean?: Record<string, number>;
  previous_domains_mean?: Record<string, number>;
  domains_delta?: Record<
    string,
    {
      delta?: number;
      direction?: "up" | "down" | "flat" | string;
    }
  >;
  [key: string]: unknown;
};

export type MeAttemptsResponse = {
  ok?: boolean;
  user_id?: string;
  anon_id?: string;
  scale_code?: string | null;
  items?: MeAttemptItem[];
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
  history_compare?: MeAttemptsHistoryCompare | null;
  [key: string]: unknown;
};

function anonHeader(anonId?: string, extraHeaders?: Record<string, string>) {
  const resolvedAnonId = resolveAnonId(anonId);
  const headers: Record<string, string> = {
    ...(extraHeaders ?? {}),
  };

  if (resolvedAnonId) {
    headers["X-Anon-Id"] = resolvedAnonId;
  }

  if (Object.keys(headers).length === 0) {
    return {};
  }

  return { headers };
}

function resolveAnonId(anonId?: string): string | undefined {
  if (anonId && anonId.trim().length > 0) {
    return anonId.trim();
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  const resolved = getOrCreateAnonId();
  return resolved.trim().length > 0 ? resolved : undefined;
}

function assertApiOk<T extends { ok?: boolean }>(response: T, fallbackMessage: string): T {
  if (response.ok === false) {
    throw new Error(fallbackMessage);
  }
  return response;
}

function normalizeOrderStatus(
  status: string | undefined
): "pending" | "paid" | "failed" | "canceled" | "refunded" {
  if (!status) return "pending";
  const lower = status.toLowerCase();
  if (lower === "paid" || lower === "success" || lower === "completed" || lower === "fulfilled") {
    return "paid";
  }
  if (lower === "failed" || lower === "error") {
    return "failed";
  }
  if (lower === "canceled" || lower === "cancelled") return "canceled";
  if (lower === "refunded") return "refunded";
  return "pending";
}

function normalizeSubmitAnswers(answers: SubmitAnswer[]): SubmitAnswer[] {
  return answers.map((answer) => {
    const codeCandidate = answer.code ?? answer.option_code ?? answer.value ?? "";
    const normalizedCode = typeof codeCandidate === "number" ? String(codeCandidate) : String(codeCandidate ?? "");

    return {
      question_id: answer.question_id,
      code: normalizedCode,
      ...(typeof answer.question_index === "number" ? { question_index: answer.question_index } : {}),
      ...(answer.question_type ? { question_type: answer.question_type } : {}),
      ...(answer.answer && typeof answer.answer === "object" ? { answer: answer.answer } : {}),
    };
  });
}

export async function startAttempt({
  scaleCode,
  anonId,
  region,
  locale,
  meta,
  clientPlatform,
  clientVersion,
  channel,
  referrer,
}: {
  scaleCode: string;
  anonId?: string;
  region?: string;
  locale?: string;
  meta?: Record<string, unknown>;
  clientPlatform?: string;
  clientVersion?: string;
  channel?: string;
  referrer?: string;
}): Promise<StartAttemptResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<StartAttemptResponse>(
    "/v0.3/attempts/start",
    {
      scale_code: scaleCode,
      anon_id: resolvedAnonId,
      ...(region ? { region } : {}),
      ...(locale ? { locale } : {}),
      ...(clientPlatform ? { client_platform: clientPlatform } : {}),
      ...(clientVersion ? { client_version: clientVersion } : {}),
      ...(channel ? { channel } : {}),
      ...(referrer ? { referrer } : {}),
      ...(meta ? { meta } : {}),
    },
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to start attempt.");
}

export async function fetchScaleQuestions({
  scaleCode,
  anonId,
  locale,
  region,
}: {
  scaleCode: string;
  anonId?: string;
  locale?: string;
  region?: string;
}): Promise<QuestionsResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const query = new URLSearchParams();
  if (locale) query.set("locale", locale);
  if (region) query.set("region", region);

  const suffix = query.toString();
  const response = await apiClient.get<QuestionsResponse>(
    `/v0.3/scales/${scaleCode}/questions${suffix ? `?${suffix}` : ""}`,
    anonHeader(resolvedAnonId)
  );

  assertApiOk(response, "Failed to load questions.");

  const items = Array.isArray(response.questions?.items) ? response.questions.items : [];

  return {
    ...response,
    questions: {
      schema: response.questions?.schema,
      items,
    },
    meta: response.meta && typeof response.meta === "object" ? response.meta : undefined,
  };
}

export async function submitAttempt({
  attemptId,
  anonId,
  answers,
  durationMs,
}: {
  attemptId: string;
  anonId?: string;
  answers: SubmitAnswer[];
  durationMs: number;
}): Promise<SubmitResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.post<SubmitResponse>(
    "/v0.3/attempts/submit",
    {
      attempt_id: attemptId,
      answers: normalizeSubmitAnswers(answers),
      duration_ms: durationMs,
    },
    anonHeader(resolvedAnonId)
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
  const response = await apiClient.get<ResultResponse>(`/v0.3/attempts/${attemptId}/result`, anonHeader(anonId));

  return assertApiOk(response, "Failed to load result.");
}

export async function getAttemptReport({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const suffix = refresh ? "?refresh=1" : "";
  const response = await apiClient.get<ReportResponse>(
    `/v0.3/attempts/${attemptId}/report${suffix}`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load report.");
}

export async function fetchAttemptReport({
  attemptId,
  anonId,
  refresh,
}: {
  attemptId: string;
  anonId?: string;
  refresh?: boolean;
}): Promise<ReportResponse> {
  return getAttemptReport({ attemptId, anonId, refresh });
}

export function getAttemptReportPdfUrl({
  attemptId,
  inline,
}: {
  attemptId: string;
  inline?: boolean;
}): string {
  return `/api/v0.3/attempts/${attemptId}/report.pdf${inline ? "?inline=1" : ""}`;
}

export async function fetchAttemptReportPdf({
  attemptId,
  anonId,
  inline,
}: {
  attemptId: string;
  anonId?: string;
  inline?: boolean;
}): Promise<Blob> {
  const resolvedAnonId = resolveAnonId(anonId);
  const authToken = getFmToken();

  const headers = new Headers({
    Accept: "application/pdf",
  });

  if (resolvedAnonId) {
    headers.set("X-Anon-Id", resolvedAnonId);
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(getAttemptReportPdfUrl({ attemptId, inline }), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch report pdf: ${response.status}`);
  }

  return response.blob();
}

export async function getScaleLookup({
  slug,
  locale,
}: {
  slug: string;
  locale?: string;
}): Promise<ScaleLookupResponse> {
  const response = await apiClient.get<ScaleLookupResponse>(
    `/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}${locale ? `&locale=${encodeURIComponent(locale)}` : ""}`,
    locale ? { locale } : undefined
  );

  return assertApiOk(response, "Failed to load scale lookup.");
}

export async function getScaleSitemapSource({
  locale,
}: {
  locale: "en" | "zh";
}): Promise<ScaleSitemapSourceResponse> {
  const response = await apiClient.get<ScaleSitemapSourceResponse>(`/v0.3/scales/sitemap-source?locale=${locale}`, {
    locale,
  });

  return assertApiOk(response, "Failed to load sitemap source.");
}

export async function getBootPayload({ anonId }: { anonId?: string } = {}): Promise<BootResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<BootResponse>("/v0.3/boot", anonHeader(resolvedAnonId));
  return assertApiOk(response, "Failed to load boot payload.");
}

export async function getFeatureFlags({ anonId }: { anonId?: string } = {}): Promise<BootResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<BootResponse>("/v0.3/flags", anonHeader(resolvedAnonId));
  return assertApiOk(response, "Failed to load feature flags.");
}

export async function createCheckoutOrOrder({
  attemptId,
  anonId,
  sku,
  orderNo,
  idempotencyKey,
  provider,
}: {
  attemptId: string;
  anonId?: string;
  sku?: string;
  orderNo?: string;
  idempotencyKey?: string;
  provider?: string;
}): Promise<CheckoutResponse> {
  const resolvedAnonId = resolveAnonId(anonId);
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await apiClient.post<CheckoutResponse>(
    "/v0.3/orders/checkout",
    {
      attempt_id: attemptId,
      sku,
      order_no: orderNo,
      ...(provider ? { provider } : {}),
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    },
    anonHeader(resolvedAnonId, headers)
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
  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<OrderStatusResponse>(`/v0.3/orders/${orderNo}`, anonHeader(resolvedAnonId));

  const normalized = assertApiOk(response, "Failed to load order status.");
  return {
    ...normalized,
    status: normalizeOrderStatus(normalized.status),
  };
}

export async function getMyAttempts({
  scaleCode,
  page,
  pageSize,
  anonId,
}: {
  scaleCode?: string;
  page?: number;
  pageSize?: number;
  anonId?: string;
} = {}): Promise<MeAttemptsResponse> {
  const query = new URLSearchParams();
  if (scaleCode) query.set("scale", scaleCode);
  if (typeof page === "number" && Number.isFinite(page) && page > 0) query.set("page", String(page));
  if (typeof pageSize === "number" && Number.isFinite(pageSize) && pageSize > 0) {
    query.set("page_size", String(pageSize));
  }

  const resolvedAnonId = resolveAnonId(anonId);
  const response = await apiClient.get<MeAttemptsResponse>(
    `/v0.3/me/attempts${query.size > 0 ? `?${query.toString()}` : ""}`,
    anonHeader(resolvedAnonId)
  );

  return assertApiOk(response, "Failed to load history attempts.");
}

export async function getShareSummary({
  shareId,
  anonId,
}: {
  shareId: string;
  anonId?: string;
}): Promise<ShareSummaryResponse> {
  const response = await apiClient.get<ShareSummaryResponse>(`/v0.3/shares/${shareId}`, anonHeader(anonId));

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
