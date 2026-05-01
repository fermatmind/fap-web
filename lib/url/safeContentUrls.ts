const INTERNAL_URL_BASE = "https://fermatmind.local";
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F-\u009F]/g;
const FIRST_PARTY_HOSTS = new Set(["fermatmind.com", "www.fermatmind.com"]);

function normalizeText(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).replace(CONTROL_CHARS_RE, "").trim();
}

function normalizeHostname(value: string): string {
  return value.toLowerCase().replace(/\.$/, "");
}

function parseAbsoluteUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function originFrom(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const parsed = parseAbsoluteUrl(normalized);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return null;
  }

  return parsed.origin;
}

function isUnsafeRawUrl(value: string): boolean {
  if (!value || /[<>]/.test(value) || value.includes("\\")) {
    return true;
  }

  const compact = value.replace(/\s+/g, "").toLowerCase();
  return compact.startsWith("//");
}

function isFirstPartyUrl(url: URL): boolean {
  const configuredSiteOrigin = originFrom(process.env.NEXT_PUBLIC_SITE_URL);
  const configuredSiteHost = configuredSiteOrigin ? normalizeHostname(new URL(configuredSiteOrigin).hostname) : null;
  const host = normalizeHostname(url.hostname);

  return FIRST_PARTY_HOSTS.has(host) || Boolean(configuredSiteHost && host === configuredSiteHost);
}

function toPath(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function normalizeInternalHref(value: unknown): string | null {
  const normalized = normalizeText(value);
  if (isUnsafeRawUrl(normalized)) {
    return null;
  }

  if (normalized.startsWith("#")) {
    return /^#[A-Za-z0-9][\w:.-]{0,127}$/.test(normalized) ? normalized : null;
  }

  try {
    const parsed = new URL(normalized, INTERNAL_URL_BASE);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    const isRelativeInput = normalized.startsWith("/");
    if (isRelativeInput) {
      return toPath(parsed);
    }

    return isFirstPartyUrl(parsed) ? toPath(parsed) : null;
  } catch {
    return null;
  }
}

export function normalizeMediaAssetUrl(
  value: unknown,
  {
    allowedOrigins = [],
    allowRelativePath = true,
  }: {
    allowedOrigins?: Array<string | null | undefined>;
    allowRelativePath?: boolean;
  } = {},
): string | null {
  const normalized = normalizeText(value);
  if (isUnsafeRawUrl(normalized)) {
    return null;
  }

  const allowed = new Set(allowedOrigins.map(originFrom).filter((item): item is string => Boolean(item)));

  if (allowRelativePath && !/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    const path = normalized.startsWith("/") ? normalized : `/${normalized.replace(/^\/+/, "")}`;
    try {
      return toPath(new URL(path, INTERNAL_URL_BASE));
    } catch {
      return null;
    }
  }

  const parsed = parseAbsoluteUrl(normalized);
  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return null;
  }

  if (isFirstPartyUrl(parsed) || allowed.has(parsed.origin)) {
    return parsed.href;
  }

  return null;
}
