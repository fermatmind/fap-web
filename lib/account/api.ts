import { apiClient } from "@/lib/api-client";
import { buildApiUrl } from "@/lib/api-base";
import { getFmToken } from "@/lib/auth/fmToken";
import {
  readOwnershipProofs,
  removeOwnershipProofs,
  saveAccountSession,
} from "./storage";

export type Account = {
  id: string;
  name: string;
  email: string;
  google_connected: boolean;
  locale: "zh" | "en";
};
export type AccountSession = {
  status: "authenticated" | "verification_required";
  fm_token?: string;
  account?: Account;
  verification_ticket?: string;
};
export type LoginChallenge = {
  configured: boolean;
  client_id?: string;
  challenge_id?: string;
  nonce?: string;
};
export type AccountMembership = {
  active: boolean;
  plan_id: string;
  expires_at: string | null;
};
export type AccountOrder = {
  order_no: string;
  status: string;
  payment_state: string;
  grant_state: string;
  amount_cents: number;
  currency: string;
  created_at: string;
};

export const getAccount = () =>
  apiClient.get<{ account: Account | null; preview: boolean }>(
    "/v0.3/me/account",
    { cache: "no-store" },
  );
export const getLoginChallenge = () =>
  apiClient.post<LoginChallenge>("/v0.3/auth/google/challenge", {});
export const requestEmailLogin = (email: string, locale: string) =>
  apiClient.post<{ verification_email_sent: boolean; verification_email_captured?: boolean }>("/v0.3/auth/account/email", { email, locale });
export const googleLogin = (
  credential: string,
  challenge_id: string,
  locale: string,
) =>
  apiClient.post<AccountSession>("/v0.3/auth/google", {
    credential,
    challenge_id,
    locale,
  });
export const updateAccount = (name: string, locale: string) =>
  apiClient.patch<{ account: Account }>("/v0.3/me/account", { name, locale });
export const logoutAccount = () =>
  apiClient.post("/v0.3/me/account/logout", {});
export const getAccountOrders = (page = 1) =>
  apiClient.get<{
    items: AccountOrder[];
    meta: { current_page: number; last_page: number };
    membership?: AccountMembership;
  }>(`/v0.3/me/account/orders?page=${page}`, { cache: "no-store" });
export const requestAccountRecovery = (email: string, locale: string) =>
  apiClient.post("/v0.3/me/account/recover-email", { email, locale });
export const requestGoogleAccountLink = (
  verification_ticket: string,
  locale: string,
) =>
  apiClient.post("/v0.3/auth/google/link-email", {
    verification_ticket,
    locale,
  });
export const confirmAccountEmail = (token: string) =>
  apiClient.post<AccountSession & { linked_attempt_ids?: string[] }>(
    "/v0.3/auth/account/confirm-email",
    { token },
  );

export async function acceptAccountSession(session: AccountSession) {
  if (!session.fm_token || !session.account)
    throw new Error("Account session missing.");
  saveAccountSession(session.fm_token);
  // Keep valid unclaimed proofs for an explicit retry if any proof has expired.
  const proofs = readOwnershipProofs();
  if (proofs.length) {
    const result = await apiClient.post<{ linked_attempt_ids: string[] }>(
      "/v0.3/me/attempts/link-anon",
      { proofs },
    );
    removeOwnershipProofs(result.linked_attempt_ids);
  }
}

export async function downloadAccountPdf(attemptId: string, path: string) {
  if (path !== `/api/v0.3/attempts/${encodeURIComponent(attemptId)}/report.pdf`)
    throw new Error("Invalid PDF action.");
  const token = getFmToken();
  if (!token) throw new Error("Sign in again.");
  const response = await fetch(buildApiUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/pdf")
  )
    throw new Error("PDF unavailable. Please try again.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `FermatMind-${attemptId}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
