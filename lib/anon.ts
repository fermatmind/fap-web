const ANON_ID_KEY = "fap_anonymous_id_v1";
const COOKIE_MAX_AGE_SECONDS = 31536000;

export const ANON_ID_STORAGE_KEY = ANON_ID_KEY;
export const ANON_ID_COOKIE_NAME = ANON_ID_KEY;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const buildFallbackId = () => `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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
