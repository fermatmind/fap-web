const DEFAULT_CONCURRENCY = 2;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_SOURCE_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_BAD_ROWS = 80;
const EXPECTED_HOST = "fermatmind.com";

const FORBIDDEN_PATH_PATTERNS = [
  /^\/api(?:\/|$)/i,
  /^\/result(?:\/|$)/i,
  /^\/orders(?:\/|$)/i,
  /^\/share(?:\/|$)/i,
  /^\/pay(?:\/|$)/i,
  /^\/payment(?:\/|$)/i,
  /^\/history(?:\/|$)/i,
  /^\/tests\/[^/]+\/take(?:\/|$)/i,
];

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const LIVE_CHECK_DEFAULTS = {
  concurrency: readPositiveInt(process.env.SEO_LIVE_CONCURRENCY, DEFAULT_CONCURRENCY),
  timeoutMs: readPositiveInt(process.env.SEO_LIVE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  sourceTimeoutMs: readPositiveInt(process.env.SEO_LIVE_SOURCE_TIMEOUT_MS, DEFAULT_SOURCE_TIMEOUT_MS),
  maxBadRows: readPositiveInt(process.env.SEO_LIVE_MAX_BAD_ROWS, DEFAULT_MAX_BAD_ROWS),
  expectedHost: EXPECTED_HOST,
};

export function normalizeUrlForCompare(value) {
  const url = new URL(value);
  url.hash = "";
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  url.pathname = pathname || "/";
  return url.toString().replace(/\/$/, "");
}

export function stripLocalePrefix(pathname) {
  const normalized = pathname || "/";
  const stripped = normalized.replace(/^\/(?:en|zh)(?=\/|$)/i, "");
  return stripped || "/";
}

export function isForbiddenPrivatePath(pathname) {
  const stripped = stripLocalePrefix(pathname);
  return FORBIDDEN_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function isNoindexHeader(headers) {
  const value = headers.get("x-robots-tag") || "";
  return value.toLowerCase().includes("noindex");
}

function readAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = tag.match(pattern);
  return match ? match[2] ?? match[3] ?? match[4] ?? "" : "";
}

function hasToken(value, token) {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .some((part) => part === token);
}

export function findMetaRobotsNoindex(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.some((tag) => {
    const name = readAttribute(tag, "name").toLowerCase();
    const content = readAttribute(tag, "content").toLowerCase();
    return name === "robots" && content.includes("noindex");
  });
}

export function findCanonicalHref(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = readAttribute(tag, "rel");
    if (hasToken(rel, "canonical")) {
      return readAttribute(tag, "href") || null;
    }
  }
  return null;
}

export function looksLikeHtml(contentType, body) {
  return contentType.toLowerCase().includes("text/html") || /^\s*<!doctype html|^\s*<html[\s>]/i.test(body);
}

export async function fetchNoRedirect(
  url,
  { timeoutMs = LIVE_CHECK_DEFAULTS.timeoutMs, accept = "*/*", expectedHost = LIVE_CHECK_DEFAULTS.expectedHost } = {}
) {
  const unsafeFetchIssue = getUnsafeLiveFetchIssue(url, { expectedHost });
  if (unsafeFetchIssue) {
    throw new Error(`unsafe-live-fetch:${JSON.stringify(unsafeFetchIssue)}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: accept,
        "User-Agent": "FermatMind SEO live validator",
      },
    });
    const body = await response.text().catch(() => "");
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, runWorker);
  await Promise.all(workers);
  return results;
}

export function makeIssue(url, reason, detail = "") {
  return { url, reason, detail };
}

export function getUnsafeLiveFetchIssue(rawUrl, options = {}) {
  const expectedHost = options.expectedHost || LIVE_CHECK_DEFAULTS.expectedHost;
  const reasons = [];
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return makeIssue(rawUrl, "invalid-url");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return makeIssue(rawUrl, "invalid-protocol", parsed.protocol);
  }

  if (parsed.hostname !== expectedHost) {
    reasons.push({ reason: "non-apex-host", detail: parsed.hostname });
  }

  if (parsed.hostname === "www.fermatmind.com") {
    reasons.push({ reason: "www-host", detail: "" });
  }

  if (isForbiddenPrivatePath(parsed.pathname)) {
    reasons.push({ reason: "forbidden-private-path", detail: parsed.pathname });
  }

  if (options.forbiddenFinalPaths?.has(parsed.pathname.replace(/\/+$/, "") || "/")) {
    reasons.push({ reason: "forbidden-final-path", detail: parsed.pathname });
  }

  return reasons.length > 0 ? { url: rawUrl, reasons } : null;
}

export async function checkLiveUrl(rawUrl, options = {}) {
  const unsafeFetchIssue = getUnsafeLiveFetchIssue(rawUrl, options);
  if (unsafeFetchIssue) {
    return unsafeFetchIssue;
  }

  const reasons = [];
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return makeIssue(rawUrl, "invalid-url");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return makeIssue(rawUrl, "invalid-protocol", parsed.protocol);
  }

  let fetched;
  try {
    fetched = await fetchNoRedirect(rawUrl, {
      timeoutMs: options.timeoutMs,
      expectedHost: options.expectedHost,
      accept: "text/html,application/xhtml+xml,application/xml,text/plain,*/*",
    });
  } catch (error) {
    return makeIssue(rawUrl, "request-failed", error instanceof Error ? error.message : String(error));
  }

  const { response, body } = fetched;
  const location = response.headers.get("location") || "";

  if (response.status >= 300 && response.status < 400) {
    reasons.push({ reason: "redirect", detail: `status=${response.status} location=${location}` });
    return { url: rawUrl, reasons };
  }

  if (response.status < 200 || response.status >= 300) {
    reasons.push({ reason: "bad-status", detail: `status=${response.status}` });
    return { url: rawUrl, reasons };
  }

  if (isNoindexHeader(response.headers)) {
    reasons.push({ reason: "x-robots-noindex", detail: response.headers.get("x-robots-tag") || "" });
  }

  const contentType = response.headers.get("content-type") || "";
  if (!looksLikeHtml(contentType, body)) {
    return reasons.length > 0 ? { url: rawUrl, reasons } : null;
  }

  if (findMetaRobotsNoindex(body)) {
    reasons.push({ reason: "meta-robots-noindex", detail: "" });
  }

  const canonicalHref = findCanonicalHref(body);
  if (!canonicalHref) {
    reasons.push({ reason: "missing-canonical", detail: "" });
  } else {
    let canonical;
    try {
      canonical = new URL(canonicalHref, rawUrl).toString();
      const normalizedCurrent = normalizeUrlForCompare(rawUrl);
      const normalizedCanonical = normalizeUrlForCompare(canonical);
      if (normalizedCanonical !== normalizedCurrent) {
        reasons.push({ reason: "non-canonical", detail: canonical });
      }
    } catch {
      reasons.push({ reason: "invalid-canonical", detail: canonicalHref });
    }
  }

  return reasons.length > 0 ? { url: rawUrl, reasons } : null;
}

export function printSummary({ label, sourceUrl, totalUrls, checkedUrls, badRows, maxBadRows = LIVE_CHECK_DEFAULTS.maxBadRows }) {
  console.log(
    `[seo-live] kind=${label} source=${sourceUrl} total_urls=${totalUrls} checked_urls=${checkedUrls} bad_count=${badRows.length}`
  );

  for (const row of badRows.slice(0, maxBadRows)) {
    console.log(`[seo-live:bad] ${JSON.stringify(row)}`);
  }

  if (badRows.length > maxBadRows) {
    console.log(`[seo-live] omitted_bad_rows=${badRows.length - maxBadRows}`);
  }
}

export function dedupeUrls(urls) {
  return [...new Set(urls)];
}

export function decodeXmlEntities(value) {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return String(value).replace(/&(amp|lt|gt|quot|#39);/g, (entity) => entities[entity] ?? entity);
}

export function stripTrailingUrlPunctuation(value) {
  let output = String(value || "").trim();
  while (/[.,;:]+$/.test(output)) {
    output = output.slice(0, -1);
  }
  while (output.endsWith(")") && (output.match(/\(/g) || []).length < (output.match(/\)/g) || []).length) {
    output = output.slice(0, -1);
  }
  return output;
}
