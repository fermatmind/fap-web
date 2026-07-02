type CommercePayType = "qr" | "html" | "redirect" | null | undefined;

const FIRST_PARTY_HOSTS = new Set([
  "fermatmind.com",
  "www.fermatmind.com",
  "staging.fermatmind.com",
  "web.example.test",
  "example.test",
  "localhost",
  "127.0.0.1",
]);

const PAYMENT_REDIRECT_HOSTS_BY_PROVIDER: Record<string, readonly string[]> = {
  alipay: ["openapi.alipay.com"],
  lemonsqueezy: ["checkout.lemonsqueezy.com"],
  stripe: ["checkout.stripe.com"],
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeProvider(value: unknown): string | null {
  return normalizeText(value)?.toLowerCase() ?? null;
}

function normalizePayType(value: CommercePayType): "qr" | "html" | "redirect" | null {
  return value === "qr" || value === "html" || value === "redirect" ? value : null;
}

function hasExplicitScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isProtocolRelative(value: string): boolean {
  return value.startsWith("//");
}

function isFirstPartyHost(hostname: string): boolean {
  return FIRST_PARTY_HOSTS.has(hostname.toLowerCase());
}

function isLocalDevelopmentHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized.endsWith(".example.test");
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|zh)(?=\/|$)/, "") || "/";
}

function redactPrivateReportSearchParams(params: URLSearchParams): URLSearchParams {
  const safe = new URLSearchParams(params);
  for (const key of Array.from(safe.keys())) {
    const normalized = key.toLowerCase();
    if (
      normalized === "access_token"
      || normalized === "result_access_token"
      || normalized === "token"
      || normalized.endsWith("_token")
      || normalized.includes("private")
    ) {
      safe.delete(key);
    }
  }

  return safe;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value, "https://fermatmind.com");
  } catch {
    return null;
  }
}

function normalizeFirstPartyPath(value: unknown): string | null {
  const normalized = normalizeText(value);
  if (!normalized || normalized.includes("\\")) {
    return null;
  }

  const explicitScheme = hasExplicitScheme(normalized);
  if (explicitScheme && !/^https?:\/\//i.test(normalized)) {
    return null;
  }

  const parsed = parseUrl(normalized);
  if (!parsed) {
    return null;
  }

  const absolute = explicitScheme || isProtocolRelative(normalized);
  const allowedFirstPartyProtocol =
    parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalDevelopmentHost(parsed.hostname));
  if (absolute && (!allowedFirstPartyProtocol || !isFirstPartyHost(parsed.hostname))) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function isAllowedInternalPaymentPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/v0.3/orders/")
    || pathname.startsWith("/api/v0.2/orders/")
    || pathname.startsWith("/mock-pay/")
  );
}

function isAllowedProviderRedirectUrl(value: string, provider: string | null): boolean {
  const parsed = parseUrl(value);
  if (!parsed || parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (provider) {
    return Boolean(PAYMENT_REDIRECT_HOSTS_BY_PROVIDER[provider]?.includes(hostname));
  }

  return Object.values(PAYMENT_REDIRECT_HOSTS_BY_PROVIDER).some((hosts) => hosts.includes(hostname));
}

function normalizeQrPayValue(value: unknown, provider: string | null): string | null {
  const normalized = normalizeText(value);
  if (!normalized || provider !== "wechatpay") {
    return null;
  }

  return normalized.startsWith("weixin://wxpay/") ? normalized : null;
}

export function normalizeCommercePaymentRedirectUrl(value: unknown, provider?: unknown): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const firstPartyPath = normalizeFirstPartyPath(normalized);
  if (firstPartyPath) {
    const parsed = parseUrl(firstPartyPath);
    if (parsed && isAllowedInternalPaymentPath(parsed.pathname)) {
      return firstPartyPath;
    }
  }

  const normalizedProvider = normalizeProvider(provider);
  if (isAllowedProviderRedirectUrl(normalized, normalizedProvider)) {
    return parseUrl(normalized)?.toString() ?? null;
  }

  return null;
}

export function normalizeCommercePayValue({
  payType,
  value,
  provider,
}: {
  payType: CommercePayType;
  value: unknown;
  provider?: unknown;
}): string | null {
  const normalizedPayType = normalizePayType(payType);
  const normalizedProvider = normalizeProvider(provider);

  if (normalizedPayType === "qr") {
    return normalizeQrPayValue(value, normalizedProvider);
  }

  if (normalizedPayType === "html" || normalizedPayType === "redirect") {
    return normalizeCommercePaymentRedirectUrl(value, normalizedProvider);
  }

  return null;
}

export function normalizeCommerceWaitPath(value: unknown): string | null {
  const normalizedPath = normalizeFirstPartyPath(value);
  if (!normalizedPath) {
    return null;
  }

  const parsed = parseUrl(normalizedPath);
  if (!parsed || stripLocalePrefix(parsed.pathname) !== "/pay/wait") {
    return null;
  }

  const params = new URLSearchParams();
  const orderNo = normalizeText(parsed.searchParams.get("order_no") ?? parsed.searchParams.get("orderNo"));
  const paymentRecoveryToken = normalizeText(
    parsed.searchParams.get("payment_recovery_token") ?? parsed.searchParams.get("paymentRecoveryToken")
  );
  const payType = normalizePayType(parsed.searchParams.get("pay_type") as CommercePayType);
  const provider = normalizeProvider(parsed.searchParams.get("provider"));
  const payValue = normalizeCommercePayValue({
    payType,
    value: parsed.searchParams.get("pay_value"),
    provider,
  });

  if (orderNo) {
    params.set("order_no", orderNo);
  }
  if (payType && payValue) {
    params.set("pay_type", payType);
    params.set("pay_value", payValue);
  }
  if (provider) {
    params.set("provider", provider);
  }
  if (paymentRecoveryToken) {
    params.set("payment_recovery_token", paymentRecoveryToken);
  }

  return `/pay/wait${params.size > 0 ? `?${params.toString()}` : ""}`;
}

export function normalizeCommerceReportPath(value: unknown): string | null {
  const normalizedPath = normalizeFirstPartyPath(value);
  if (!normalizedPath) {
    return null;
  }

  const parsed = parseUrl(normalizedPath);
  if (!parsed) {
    return null;
  }

  const pathWithoutLocale = stripLocalePrefix(parsed.pathname);
  if (!pathWithoutLocale.startsWith("/result/") && !/^\/attempts\/[^/]+\/report(?:\/|$)/.test(pathWithoutLocale)) {
    return null;
  }

  const safeParams = redactPrivateReportSearchParams(parsed.searchParams);
  return `${parsed.pathname}${safeParams.size > 0 ? `?${safeParams.toString()}` : ""}${parsed.hash}`;
}
