const ANON_ID_KEY = "fap_anonymous_id_v1";
const ANON_ATTEMPT_LINK_QUEUE_KEY = "fap_anon_link_attempt_queue_v1";
const COOKIE_MAX_AGE_SECONDS = 31536000;
const MAX_LINK_QUEUE_SIZE = 80;

export const ANON_ID_STORAGE_KEY = ANON_ID_KEY;
export const ANON_ID_COOKIE_NAME = ANON_ID_KEY;
export const ANON_ATTEMPT_LINK_QUEUE_STORAGE_KEY = ANON_ATTEMPT_LINK_QUEUE_KEY;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

function buildFallbackId(): string {
  const randomBytes = new Uint8Array(8);
  globalThis.crypto?.getRandomValues(randomBytes);
  const randomSuffix = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `anon_${Date.now()}_${randomSuffix}`;
}

const generateAnonymousId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return buildFallbackId();
};

function readLocalStorage(): string | null {
  if (!isBrowser()) return null;
  try {
    const value = window.localStorage.getItem(ANON_ID_STORAGE_KEY);
    return value && value.trim().length > 0 ? value.trim() : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(value: string): void {
  if (!isBrowser() || !value) return;
  try {
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures.
  }
}

function readCookie(): string | null {
  if (!isBrowser()) return null;
  const encodedPrefix = `${encodeURIComponent(ANON_ID_COOKIE_NAME)}=`;
  const plainPrefix = `${ANON_ID_COOKIE_NAME}=`;
  const segments = document.cookie ? document.cookie.split("; ") : [];

  for (const segment of segments) {
    if (segment.startsWith(encodedPrefix)) {
      const rawValue = segment.slice(encodedPrefix.length);
      const value = decodeURIComponent(rawValue);
      return value && value.trim().length > 0 ? value.trim() : null;
    }

    if (segment.startsWith(plainPrefix)) {
      const rawValue = segment.slice(plainPrefix.length);
      const value = decodeURIComponent(rawValue);
      return value && value.trim().length > 0 ? value.trim() : null;
    }
  }

  return null;
}

function shouldUseSecureCookie(): boolean {
  if (!isBrowser()) return false;
  return process.env.NODE_ENV === "production" || window.location.protocol === "https:";
}

function writeCookie(value: string): void {
  if (!isBrowser() || !value) return;

  const parts = [
    `${ANON_ID_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  if (shouldUseSecureCookie()) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function getOrCreateAnonId(): string {
  if (!isBrowser()) return "";

  const localStorageAnonId = readLocalStorage();
  if (localStorageAnonId) {
    const cookieAnonId = readCookie();
    if (cookieAnonId !== localStorageAnonId) {
      writeCookie(localStorageAnonId);
    }
    return localStorageAnonId;
  }

  const cookieAnonId = readCookie();
  if (cookieAnonId) {
    writeLocalStorage(cookieAnonId);
    return cookieAnonId;
  }

  const generatedAnonId = generateAnonymousId();
  writeLocalStorage(generatedAnonId);
  writeCookie(generatedAnonId);
  return generatedAnonId;
}

export function readPendingAnonLinkAttempts(): string[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(ANON_ATTEMPT_LINK_QUEUE_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

export function queuePendingAnonLinkAttempt(attemptId: string): void {
  if (!isBrowser()) return;
  const normalized = attemptId.trim();
  if (!normalized) return;

  try {
    const current = readPendingAnonLinkAttempts();
    if (current.includes(normalized)) return;

    const next = [...current, normalized].slice(-MAX_LINK_QUEUE_SIZE);
    window.localStorage.setItem(ANON_ATTEMPT_LINK_QUEUE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
}

export function removePendingAnonLinkAttempts(attemptIds: string[]): void {
  if (!isBrowser()) return;
  if (attemptIds.length === 0) return;

  try {
    const normalizedRemove = new Set(
      attemptIds.map((item) => item.trim()).filter((item) => item.length > 0)
    );
    if (normalizedRemove.size === 0) return;

    const next = readPendingAnonLinkAttempts().filter((item) => !normalizedRemove.has(item));
    window.localStorage.setItem(ANON_ATTEMPT_LINK_QUEUE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
}
