const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const API_PUBLIC_PREFIX = "/api";

function normalizeOrigin(value: string): string {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized) {
    return "";
  }

  return /^https?:\/\//i.test(normalized) ? normalized : "";
}

function normalizePath(path: string): string {
  const normalized = String(path ?? "").trim();
  if (!normalized) {
    return API_PUBLIC_PREFIX;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function resolveApiOrigin(): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_API_URL ?? "") || DEFAULT_API_ORIGIN;
}

export function resolveApiBaseUrl(): string {
  return `${resolveApiOrigin()}${API_PUBLIC_PREFIX}`;
}

function buildClientApiUrl(normalizedPath: string): string {
  if (normalizedPath === API_PUBLIC_PREFIX || normalizedPath.startsWith(`${API_PUBLIC_PREFIX}/`)) {
    return normalizedPath;
  }

  return `${API_PUBLIC_PREFIX}${normalizedPath}`;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (typeof window !== "undefined") {
    return buildClientApiUrl(normalizedPath);
  }

  if (normalizedPath === API_PUBLIC_PREFIX || normalizedPath.startsWith(`${API_PUBLIC_PREFIX}/`)) {
    return `${resolveApiOrigin()}${normalizedPath}`;
  }

  return `${resolveApiBaseUrl()}${normalizedPath}`;
}
