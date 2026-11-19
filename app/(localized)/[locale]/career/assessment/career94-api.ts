import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { ApiError } from "@/lib/api-client";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { getFmToken } from "@/lib/auth/fmToken";
import type { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";

export type Career94Market = "CN_MAINLAND" | "INTERNATIONAL";
export type Career94Offer = { provider: "alipay" | "waffo"; sku: string; currency: "CNY" | "USD"; amount_cents: number };
type ReportRow = { label: string; score: number; detail: string };

export type Career94Premium = {
  dimensions: ReportRow[];
  preferences: ReportRow[];
  condition_note: string;
  actions: string[];
  ai_prompt: string;
};

export type Career94Result = {
  attempt_id: string;
  market: Career94Market;
  result: Parameters<typeof assembleRiasecResultViewModel>[0];
  unlocked: boolean;
  order_no: string | null;
  payment_state: string | null;
  offers: Career94Offer[];
  premium?: Career94Premium;
};

export const careerAssessmentEndpoint = `${process.env.NODE_ENV === "development" ? "/api" : resolveApiBaseUrl()}/v0.5/career-assessment`;

export async function requestCareer94Result(path: string, body?: object, signal?: AbortSignal): Promise<Career94Result> {
  await ensureFmTokenReady({ locale: typeof document !== "undefined" ? document.documentElement.lang : "en" });
  return runWithGuestTokenRetry({ runner: async () => {
    const token = getFmToken();
    if (!token) throw new Error("ACCOUNT_REQUIRED");

    const response = await fetch(`${careerAssessmentEndpoint}/results${path}`, {
      cache: "no-store",
      credentials: "omit",
      method: body ? "POST" : "GET",
      headers: { ...careerGuestHeaders(Boolean(body)), Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal ?? AbortSignal.timeout(15000),
    });
    if (response.status === 401) throw new ApiError({ status: 401, errorCode: "UNAUTHORIZED", message: "ACCOUNT_REQUIRED" });
    if (response.status === 403) throw new Error("ACCOUNT_REQUIRED");
    if (!response.ok) throw new Error("RESULT_UNAVAILABLE");
    return response.json() as Promise<Career94Result>;
  } });
}
