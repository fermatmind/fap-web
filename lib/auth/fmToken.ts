const FM_TOKEN_KEY = "fm_auth_token";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getFmToken(): string | null {
  if (!canUseStorage()) return null;

  try {
    const token = window.localStorage.getItem(FM_TOKEN_KEY)?.trim() ?? "";
    if (token.startsWith("fm_") && token.length > 10) {
      return token;
    }
  } catch {
    // Ignore storage errors.
  }

  return null;
}

export function setFmToken(token: string | null | undefined): void {
  if (!canUseStorage()) return;

  try {
    const normalized = (token ?? "").trim();
    if (!normalized) {
      window.localStorage.removeItem(FM_TOKEN_KEY);
      return;
    }

    window.localStorage.setItem(FM_TOKEN_KEY, normalized);
  } catch {
    // Ignore storage errors.
  }
}

export function clearFmToken(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(FM_TOKEN_KEY);
  } catch {
    // Ignore storage errors.
  }
}
