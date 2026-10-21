import { clearFmToken, getFmToken, setFmToken } from "@/lib/auth/fmToken";

const SESSION = "fm_account_session_v1";
const PROOFS = "fm_result_ownership_proofs_v1";
export type OwnershipProof = { attempt_id: string; resume_token: string };

export function isAccountSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(SESSION) === getFmToken() &&
      Boolean(getFmToken())
    );
  } catch {
    return false;
  }
}

export function saveAccountSession(token: string) {
  setFmToken(token);
  window.localStorage.setItem(SESSION, token);
  window.dispatchEvent(new Event("fm-account-changed"));
}

export function readOwnershipProofs(): OwnershipProof[] {
  if (typeof window === "undefined") return [];
  try {
    const items: unknown = JSON.parse(
      window.localStorage.getItem(PROOFS) ?? "[]",
    );
    return Array.isArray(items)
      ? items
          .filter((v): v is OwnershipProof =>
            Boolean(
              v &&
                typeof v.attempt_id === "string" &&
                typeof v.resume_token === "string",
            ),
          )
          .slice(-50)
      : [];
  } catch {
    return [];
  }
}

export function saveOwnershipProof(attempt_id: string, resume_token?: string) {
  if (typeof window === "undefined" || !resume_token) return;
  try {
    window.localStorage.setItem(
      PROOFS,
      JSON.stringify(
        [
          ...readOwnershipProofs().filter((p) => p.attempt_id !== attempt_id),
          { attempt_id, resume_token },
        ].slice(-50),
      ),
    );
  } catch {
    /* Existing result access still works when browser storage is unavailable. */
  }
}

export function removeOwnershipProofs(ids: string[]) {
  try {
    window.localStorage.setItem(
      PROOFS,
      JSON.stringify(
        readOwnershipProofs().filter((p) => !ids.includes(p.attempt_id)),
      ),
    );
  } catch {
    /* The server makes a repeated ownership request idempotent. */
  }
}

export function clearAccountSession() {
  clearFmToken();
  if (typeof window === "undefined") return;
  // Remove only private Fermat result/session state, preserving language and consent.
  const privateKeys =
    /^(fm_account_session_v1|fm_result_ownership_proofs_v1|fap_anonymous_id_v1|fap_anon_link_attempt_queue_v1|fm_big5_(attempt|last_report|last_order)|fm_pending_order|fm_clinical_attempt|fm\.result_access_token\.|fm_link_anon_|fm_attempt|fm_quiz)/;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(storage))
      if (privateKeys.test(key)) storage.removeItem(key);
  }
  document.cookie = "fap_anonymous_id_v1=; Path=/; Max-Age=0; SameSite=Lax";
  window.dispatchEvent(new Event("fm-account-changed"));
}
