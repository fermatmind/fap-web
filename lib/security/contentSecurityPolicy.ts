export type CspMode = "report-only" | "enforce";

export function createCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function resolveCspMode(env: NodeJS.ProcessEnv = process.env): CspMode {
  const configured = env.CSP_NONCE_MODE?.trim().toLowerCase();
  if (configured === "report-only" || configured === "enforce") {
    return configured;
  }

  return env.NODE_ENV === "production" ? "enforce" : "report-only";
}

export function buildNonceCsp(nonce: string): string {
  if (!/^[A-Za-z0-9+/=_-]{16,128}$/.test(nonce)) {
    throw new Error("CSP_NONCE_INVALID");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://hm.baidu.com`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function applyNonceCspHeaders(headers: Headers, nonce: string, mode: CspMode): void {
  const policy = buildNonceCsp(nonce);
  headers.set("Content-Security-Policy-Report-Only", policy);
  if (mode === "enforce") {
    headers.set("Content-Security-Policy", policy);
  } else {
    headers.delete("Content-Security-Policy");
  }
}
