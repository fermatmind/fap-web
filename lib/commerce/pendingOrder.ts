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
  expiresAt: string;
};

const PENDING_ORDER_STORAGE_KEY = "fm_pending_order_v1";
const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;

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

function parseTimestamp(value: unknown): number | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function removeStoredPendingOrder(): void {
  try {
    window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }

  try {
    window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
}

function readStorageValue(storage: Storage): string | null {
  try {
    return storage.getItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorageValue(storage: Storage, payload: PendingOrderContext): boolean {
  try {
    storage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function parsePendingOrder(raw: string | null): PendingOrderContext | null {
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
    const updatedAtMs = parseTimestamp(updatedAt);
    const explicitExpiresAtMs = parseTimestamp(parsed.expiresAt);
    const expiresAtMs = explicitExpiresAtMs ?? (updatedAtMs === null ? null : updatedAtMs + PENDING_ORDER_TTL_MS);

    if (!orderNo || !updatedAt || expiresAtMs === null || Date.now() >= expiresAtMs) {
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
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  } catch {
    return null;
  }
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

  const now = Date.now();
  const payload: PendingOrderContext = {
    orderNo: normalizedOrderNo,
    attemptId: normalizedAttemptId,
    sku: normalizedSku,
    provider: normalizeNullableText(payloadInput.provider),
    waitUrl: normalizeNullableText(payloadInput.waitUrl),
    paymentRecoveryToken: normalizeNullableText(payloadInput.paymentRecoveryToken),
    resultUrl: normalizeNullableText(payloadInput.resultUrl),
    updatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PENDING_ORDER_TTL_MS).toISOString(),
  };

  writeStorageValue(window.sessionStorage, payload);
  try {
    window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
}

export function readPendingOrder(): PendingOrderContext | null {
  if (!isBrowser()) return null;

  const sessionPendingOrder = parsePendingOrder(readStorageValue(window.sessionStorage));
  if (sessionPendingOrder) {
    return sessionPendingOrder;
  }

  const legacyPendingOrder = parsePendingOrder(readStorageValue(window.localStorage));
  removeStoredPendingOrder();
  if (!legacyPendingOrder) {
    return null;
  }

  writeStorageValue(window.sessionStorage, legacyPendingOrder);
  return legacyPendingOrder;
}

export function clearPendingOrder(): void {
  if (!isBrowser()) return;
  removeStoredPendingOrder();
}
