const FM_TOKEN_KEY = "fm_auth_token";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

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

function resolveApiLocale(locale?: string): "en" | "zh-CN" {
  const normalized = String(locale ?? "").trim().toLowerCase();
  if (normalized.startsWith("zh")) return "zh-CN";
  return "en";
}

function resolveGuestToken(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "";
  }

  const node = payload as Record<string, unknown>;
  const topTokenCandidates = [node.fm_token, node.token, node.auth_token];
  for (const candidate of topTokenCandidates) {
    if (typeof candidate === "string" && candidate.trim().startsWith("fm_")) {
      return candidate.trim();
    }
  }

  const data = node.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "";
  }

  const dataNode = data as Record<string, unknown>;
  const dataTokenCandidates = [dataNode.fm_token, dataNode.token, dataNode.auth_token];
  for (const candidate of dataTokenCandidates) {
    if (typeof candidate === "string" && candidate.trim().startsWith("fm_")) {
      return candidate.trim();
    }
  }

  return "";
}

export async function requestGuestToken({
  anonId,
  locale,
}: {
  anonId?: string;
  locale?: string;
} = {}): Promise<string> {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-FAP-Locale": resolveApiLocale(locale),
  });
  const normalizedAnonId = String(anonId ?? "").trim();
  if (normalizedAnonId) {
    headers.set("X-Anon-Id", normalizedAnonId);
  }

  const response = await fetch(`${API_BASE}/v0.3/auth/guest`, {
    method: "POST",
    headers,
    body: JSON.stringify(normalizedAnonId ? { anon_id: normalizedAnonId } : {}),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Failed to request guest token (${response.status}).`);
  }

  const token = resolveGuestToken(payload);
  if (!token) {
    throw new Error("Guest token missing in /auth/guest response.");
  }

  setFmToken(token);
  return token;
}
