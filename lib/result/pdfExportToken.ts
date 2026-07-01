import { RESULT_PAGE_SNAPSHOT_SURFACE } from "@/lib/result/pdfSurface";

type PdfTokenPayload = {
  v?: number;
  typ?: string;
  attempt_id?: string;
  locale?: string;
  surface?: string;
  exp?: number;
};

function base64UrlDecode(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function normalizeTokenPart(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function signingSecret(): string {
  return (
    normalizeTokenPart(process.env.GOTENBERG_RESULT_PRINT_TOKEN_SECRET)
    || normalizeTokenPart(process.env.NEXT_RESULT_PRINT_TOKEN_SECRET)
    || "fap-result-page-pdf-local-key"
  );
}

async function hmacSha256Hex(payload: string, secret: string): Promise<string> {
  const crypto = await import("node:crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function verifyResultPagePdfToken({
  token,
  attemptId,
  locale,
  expectedSurface = RESULT_PAGE_SNAPSHOT_SURFACE,
}: {
  token: string | string[] | null | undefined;
  attemptId: string;
  locale: string;
  expectedSurface?: string;
}): Promise<boolean> {
  const rawToken = Array.isArray(token) ? token[0] : token;
  const normalized = normalizeTokenPart(rawToken);
  if (!normalized || normalized.split(".").length !== 2) {
    return false;
  }

  const [encodedPayload, signature] = normalized.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await hmacSha256Hex(encodedPayload, signingSecret());
  if (expectedSignature !== signature) {
    return false;
  }

  const decoded = base64UrlDecode(encodedPayload);
  if (!decoded) {
    return false;
  }

  let payload: PdfTokenPayload;
  try {
    payload = JSON.parse(decoded) as PdfTokenPayload;
  } catch {
    return false;
  }

  const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;
  return (
    payload.v === 1
    && payload.typ === "mbti_result_page_pdf"
    && payload.attempt_id === attemptId
    && payload.locale === locale
    && payload.surface === expectedSurface
    && expiresAt > Math.floor(Date.now() / 1000)
  );
}
