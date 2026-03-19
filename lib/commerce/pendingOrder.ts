"use client";

export type PendingOrderContext = {
  orderNo: string;
  attemptId: string | null;
  sku: string | null;
  provider: string | null;
  waitUrl: string | null;
  paymentRecoveryToken: string | null;
  resultUrl: string | null;
  updatedAt: string;
};

const PENDING_ORDER_STORAGE_KEY = "fm_pending_order_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

type PendingOrderWriteInput = {
  orderNo: string;
  attemptId?: string | null;
  sku?: string | null;
  provider?: string | null;
  waitUrl?: string | null;
  paymentRecoveryToken?: string | null;
  resultUrl?: string | null;
};

export function writePendingOrder(
  orderNoOrInput: string | PendingOrderWriteInput,
  attemptId?: string,
  sku?: string
): void {
  if (!isBrowser()) return;

  const payloadInput: PendingOrderWriteInput =
    typeof orderNoOrInput === "string"
      ? {
          orderNo: orderNoOrInput,
          attemptId: attemptId ?? "",
          sku: sku ?? "",
        }
      : orderNoOrInput;

  const normalizedOrderNo = normalizeText(payloadInput.orderNo);
  const normalizedAttemptId = normalizeNullableText(payloadInput.attemptId);
  const normalizedSku = normalizeNullableText(payloadInput.sku);

  if (!normalizedOrderNo) {
    throw new Error("Pending order context requires orderNo.");
  }

  const payload: PendingOrderContext = {
    orderNo: normalizedOrderNo,
    attemptId: normalizedAttemptId,
    sku: normalizedSku,
    provider: normalizeNullableText(payloadInput.provider),
    waitUrl: normalizeNullableText(payloadInput.waitUrl),
    paymentRecoveryToken: normalizeNullableText(payloadInput.paymentRecoveryToken),
    resultUrl: normalizeNullableText(payloadInput.resultUrl),
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingOrder(): PendingOrderContext | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingOrderContext>;
    const orderNo = normalizeText(parsed.orderNo);
    const attemptId = normalizeNullableText(parsed.attemptId);
    const sku = normalizeNullableText(parsed.sku);
    const provider = normalizeNullableText(parsed.provider);
    const waitUrl = normalizeNullableText(parsed.waitUrl);
    const paymentRecoveryToken = normalizeNullableText(parsed.paymentRecoveryToken);
    const resultUrl = normalizeNullableText(parsed.resultUrl);
    const updatedAt = normalizeText(parsed.updatedAt);

    if (!orderNo) {
      window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      return null;
    }

    return {
      orderNo,
      attemptId,
      sku,
      provider,
      waitUrl,
      paymentRecoveryToken,
      resultUrl,
      updatedAt,
    };
  } catch {
    window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    return null;
  }
}

export function clearPendingOrder(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
}
