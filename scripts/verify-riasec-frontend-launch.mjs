#!/usr/bin/env node

const DEFAULT_WEB_ORIGIN = "https://www.fermatmind.com";
const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_TIMEOUT_MS = 8000;
const CANONICAL_SLUG = "holland-career-interest-test-riasec";
const CANONICAL_TEST_PATH = `/tests/${CANONICAL_SLUG}`;
const FORM_CODES = ["riasec_60", "riasec_140"];
const LEGACY_ROUTE_SEGMENT = ["career", "tests", "riasec"].join("/");
const LEGACY_STORAGE_KEY = ["fm", "career", "riasec", "v1"].join("_");
const LEGACY_EN_LABEL = ["36", "questions"].join(" ");
const LEGACY_ZH_LABEL = ["36", "\u9898"].join(" ");

function readOrigin(envKey, fallback) {
  const rawValue = String(process.env[envKey] || "").trim().replace(/\/$/, "");
  if (!rawValue) return fallback;
  if (!/^https?:\/\//i.test(rawValue)) {
    throw new Error(`${envKey} must be an http(s) origin`);
  }
  return rawValue;
}

function readTimeoutMs() {
  const rawValue = Number.parseInt(String(process.env.RIASEC_LAUNCH_TIMEOUT_MS || ""), 10);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_TIMEOUT_MS;
}

function buildUrl(origin, path) {
  return new URL(path, origin).toString();
}

async function fetchText(url, { timeoutMs, allowStatuses = [200] } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    const body = await response.text();
    if (!allowStatuses.includes(response.status)) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, { timeoutMs } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}: ${body.slice(0, 240)}`);
    }
    return JSON.parse(body);
  } finally {
    clearTimeout(timer);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoLegacyMarkers(label, body) {
  const forbidden = [
    `/${LEGACY_ROUTE_SEGMENT}`,
    LEGACY_ROUTE_SEGMENT,
    LEGACY_STORAGE_KEY,
    LEGACY_EN_LABEL,
    LEGACY_ZH_LABEL,
  ];

  for (const marker of forbidden) {
    assert(!body.includes(marker), `${label} still contains legacy RIASEC marker: ${marker}`);
  }
}

function assertCanonicalSurface(label, body) {
  assert(body.includes(CANONICAL_TEST_PATH), `${label} is missing canonical RIASEC test path`);
  for (const formCode of FORM_CODES) {
    assert(body.includes(formCode), `${label} is missing ${formCode}`);
  }
  assertNoLegacyMarkers(label, body);
}

function extractSitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);
}

async function readSitemapCorpus(webOrigin, timeoutMs) {
  const indexUrl = buildUrl(webOrigin, "/sitemap.xml");
  const indexBody = await fetchText(indexUrl, { timeoutMs });
  const childUrls = extractSitemapUrls(indexBody).filter((url) => /\/sitemap[^/]*\.xml$/i.test(url));

  if (childUrls.length === 0) {
    return indexBody;
  }

  const childBodies = await Promise.all(childUrls.map((url) => fetchText(url, { timeoutMs })));
  return [indexBody, ...childBodies].join("\n");
}

async function verifyWebSurface(webOrigin, timeoutMs) {
  const detailBodies = await Promise.all(
    ["en", "zh"].map((locale) =>
      fetchText(buildUrl(webOrigin, `/${locale}${CANONICAL_TEST_PATH}`), { timeoutMs })
    )
  );

  detailBodies.forEach((body, index) => {
    const locale = index === 0 ? "en" : "zh";
    assertCanonicalSurface(`${locale} RIASEC detail page`, body);
  });

  for (const formCode of FORM_CODES) {
    const body = await fetchText(
      buildUrl(webOrigin, `/en${CANONICAL_TEST_PATH}/take?form=${encodeURIComponent(formCode)}`),
      { timeoutMs }
    );
    assertNoLegacyMarkers(`en RIASEC take page ${formCode}`, body);
    assert(body.includes(formCode) || body.includes("RIASEC"), `take page did not expose ${formCode} context`);
  }

  const historyBody = await fetchText(buildUrl(webOrigin, "/en/history/riasec"), {
    timeoutMs,
    allowStatuses: [200, 401, 403],
  });
  assertNoLegacyMarkers("en RIASEC history page", historyBody);
}

async function verifyStaticDiscovery(webOrigin, timeoutMs) {
  const sitemapCorpus = await readSitemapCorpus(webOrigin, timeoutMs);
  assert(sitemapCorpus.includes(CANONICAL_TEST_PATH), "sitemap does not include canonical RIASEC path");
  assertNoLegacyMarkers("sitemap", sitemapCorpus);

  for (const pathname of ["/llms.txt", "/llms-full.txt"]) {
    const body = await fetchText(buildUrl(webOrigin, pathname), { timeoutMs });
    assert(body.includes(CANONICAL_TEST_PATH), `${pathname} does not include canonical RIASEC path`);
    assertNoLegacyMarkers(pathname, body);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function verifyApiContracts(apiOrigin, timeoutMs) {
  const lookupUrl = new URL("/api/v0.3/scales/lookup", apiOrigin);
  lookupUrl.searchParams.set("slug", CANONICAL_SLUG);
  lookupUrl.searchParams.set("locale", "zh-CN");
  const lookup = await fetchJson(lookupUrl.toString(), { timeoutMs });

  assert(String(lookup.scale_code || "").toUpperCase() === "RIASEC", "scale lookup did not return RIASEC");
  const lookupForms = asArray(lookup.forms).map((form) => String(form?.form_code || form?.formCode || ""));
  for (const formCode of FORM_CODES) {
    assert(lookupForms.includes(formCode), `scale lookup missing ${formCode}`);
  }

  for (const formCode of FORM_CODES) {
    const questionsUrl = new URL("/api/v0.3/scales/RIASEC/questions", apiOrigin);
    questionsUrl.searchParams.set("locale", "zh-CN");
    questionsUrl.searchParams.set("form_code", formCode);
    const questions = await fetchJson(questionsUrl.toString(), { timeoutMs });
    const questionContainer = questions.questions && typeof questions.questions === "object"
      ? questions.questions
      : null;
    const items = asArray(questionContainer?.items ?? questions.questions ?? questions.items);
    const minExpected = formCode === "riasec_60" ? 60 : 140;
    assert(items.length >= minExpected, `${formCode} returned ${items.length} questions, expected at least ${minExpected}`);
  }
}

async function main() {
  const webOrigin = readOrigin("RIASEC_WEB_BASE_URL", readOrigin("WEB_BASE_URL", DEFAULT_WEB_ORIGIN));
  const apiOrigin = readOrigin("RIASEC_API_BASE_URL", readOrigin("NEXT_PUBLIC_API_URL", DEFAULT_API_ORIGIN));
  const timeoutMs = readTimeoutMs();

  await verifyWebSurface(webOrigin, timeoutMs);
  await verifyStaticDiscovery(webOrigin, timeoutMs);
  await verifyApiContracts(apiOrigin, timeoutMs);

  console.log("RIASEC frontend launch smoke passed");
  console.log(JSON.stringify({ webOrigin, apiOrigin, canonicalPath: CANONICAL_TEST_PATH, forms: FORM_CODES }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
