"use client";

export type PendingOrderContext = {
  orderNo: string;
  attemptId: string;
  sku: string;
  provider: string | null;
  waitUrl: string | null;
  paymentRecoveryToken: string | null;
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
  attemptId: string;
  sku: string;
  provider?: string | null;
  waitUrl?: string | null;
  paymentRecoveryToken?: string | null;
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
  const normalizedAttemptId = normalizeText(payloadInput.attemptId);
  const normalizedSku = normalizeText(payloadInput.sku);

  if (!normalizedOrderNo || !normalizedAttemptId || !normalizedSku) {
    throw new Error("Pending order context requires orderNo, attemptId, and sku.");
  }

  const payload: PendingOrderContext = {
    orderNo: normalizedOrderNo,
    attemptId: normalizedAttemptId,
    sku: normalizedSku,
    provider: normalizeNullableText(payloadInput.provider),
    waitUrl: normalizeNullableText(payloadInput.waitUrl),
    paymentRecoveryToken: normalizeNullableText(payloadInput.paymentRecoveryToken),
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
    const attemptId = normalizeText(parsed.attemptId);
    const sku = normalizeText(parsed.sku);
    const provider = normalizeNullableText(parsed.provider);
    const waitUrl = normalizeNullableText(parsed.waitUrl);
    const paymentRecoveryToken = normalizeNullableText(parsed.paymentRecoveryToken);
    const updatedAt = normalizeText(parsed.updatedAt);

    if (!orderNo || !attemptId || !sku) {
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
