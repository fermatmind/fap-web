"use client";

export type PendingOrderContext = {
  orderNo: string;
  attemptId: string;
  sku: string;
  updatedAt: string;
};

const PENDING_ORDER_STORAGE_KEY = "fm_pending_order_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function writePendingOrder(orderNo: string, attemptId: string, sku: string): void {
  if (!isBrowser()) return;

  const normalizedOrderNo = normalizeText(orderNo);
  const normalizedAttemptId = normalizeText(attemptId);
  const normalizedSku = normalizeText(sku);

  if (!normalizedOrderNo || !normalizedAttemptId || !normalizedSku) {
    throw new Error("Pending order context requires orderNo, attemptId, and sku.");
  }

  const payload: PendingOrderContext = {
    orderNo: normalizedOrderNo,
    attemptId: normalizedAttemptId,
    sku: normalizedSku,
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
    const updatedAt = normalizeText(parsed.updatedAt);

    if (!orderNo || !attemptId || !sku) {
      window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      return null;
    }

    return {
      orderNo,
      attemptId,
      sku,
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
