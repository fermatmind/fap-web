export function createCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function buildNonceCsp(nonce: string, googleLogin = false): string {
  if (!/^[A-Za-z0-9+/=_-]{16,128}$/.test(nonce)) {
    throw new Error("CSP_NONCE_INVALID");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://hm.baidu.com${googleLogin ? " https://accounts.google.com/gsi/client" : ""}`,
    `style-src 'self' 'nonce-${nonce}'${googleLogin ? " https://accounts.google.com/gsi/style" : ""}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    `frame-src 'self'${googleLogin ? " https://accounts.google.com/gsi/" : ""}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

export function applyNonceCspHeaders(headers: Headers, nonce: string, googleLogin = false): void {
  const policy = buildNonceCsp(nonce, googleLogin);
  headers.set("Content-Security-Policy-Report-Only", policy);
  headers.delete("Content-Security-Policy");
}
