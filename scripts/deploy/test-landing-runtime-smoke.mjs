#!/usr/bin/env node

import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const TEST_LANDING_SMOKE_SCHEMA_VERSION =
  "fermatmind.test-landing-runtime-smoke.v1";

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504]);
const REDIRECT_HTTP_STATUSES = new Set([301, 302, 303, 307, 308]);
const PUBLIC_API_V0_3_PREFIX = "/api/v0.3";

const MBTI_SLUG = "mbti-personality-test-16-personality-types";
const BIG5_SLUG = "big-five-personality-test-ocean-model";
const IQ_SLUG = "iq-test-intelligence-quotient-assessment";
const EQ_SLUG = "eq-test-emotional-intelligence-assessment";
const MBTI_FORM = "mbti_144";
const BIG5_FORM = "big5_120";

const CHECKS = [
  {
    kind: "landing",
    checkName: "zh_mbti_landing",
    path: `/zh/tests/${MBTI_SLUG}`,
    locale: "zh",
    apiLocale: "zh",
    slug: MBTI_SLUG,
    scaleCode: "MBTI",
    formCode: MBTI_FORM,
    ctaMarker: "mbti-landing-primary-cta",
  },
  {
    kind: "landing",
    checkName: "en_mbti_landing",
    path: `/en/tests/${MBTI_SLUG}`,
    locale: "en",
    apiLocale: "en",
    slug: MBTI_SLUG,
    scaleCode: "MBTI",
    formCode: MBTI_FORM,
    ctaMarker: "mbti-landing-primary-cta",
  },
  {
    kind: "landing",
    checkName: "zh_big5_landing",
    path: `/zh/tests/${BIG5_SLUG}`,
    locale: "zh",
    apiLocale: "zh",
    slug: BIG5_SLUG,
    scaleCode: "BIG5_OCEAN",
    formCode: BIG5_FORM,
    ctaMarker: `test-detail-landing-cta-${BIG5_FORM}`,
  },
  {
    kind: "landing",
    checkName: "zh_iq_landing",
    path: `/zh/tests/${IQ_SLUG}`,
    locale: "zh",
    apiLocale: "zh",
    slug: IQ_SLUG,
    scaleCode: "IQ_RAVEN",
    formCode: null,
    ctaMarker: "test-detail-landing-cta-owner_original_30",
  },
  {
    kind: "landing",
    checkName: "en_iq_landing",
    path: `/en/tests/${IQ_SLUG}`,
    locale: "en",
    apiLocale: "en",
    slug: IQ_SLUG,
    scaleCode: "IQ_RAVEN",
    formCode: null,
    ctaMarker: "test-detail-landing-cta-owner_original_30",
  },
  {
    kind: "landing",
    checkName: "zh_eq_landing",
    path: `/zh/tests/${EQ_SLUG}`,
    locale: "zh",
    apiLocale: "zh",
    slug: EQ_SLUG,
    scaleCode: "EQ_60",
    formCode: null,
    ctaMarker: "test-detail-landing-cta-eq-60",
  },
  {
    kind: "landing",
    checkName: "en_eq_landing",
    path: `/en/tests/${EQ_SLUG}`,
    locale: "en",
    apiLocale: "en",
    slug: EQ_SLUG,
    scaleCode: "EQ_60",
    formCode: null,
    ctaMarker: "test-detail-landing-cta-eq-60",
  },
  {
    kind: "take",
    checkName: "zh_mbti_take_route",
    path: `/zh/tests/${MBTI_SLUG}/take?form=${MBTI_FORM}`,
  },
  {
    kind: "question-pack",
    checkName: "mbti_144_question_pack",
    path: publicApiV0_3Path(`/scales/MBTI/questions?form_code=${MBTI_FORM}&locale=zh-CN`),
    lookupLocale: "zh",
    slug: MBTI_SLUG,
    scaleCode: "MBTI",
    formCode: MBTI_FORM,
  },
];

class SmokeFailure extends Error {
  constructor(code, {
    retryable = false,
    httpStatus = null,
    requestSurface = null,
    authorityIdentityResult = "not_applicable",
    questionPackSemanticResult = "not_applicable",
  } = {}) {
    super(code);
    this.name = "SmokeFailure";
    this.code = code;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
    this.requestSurface = requestSurface;
    this.authorityIdentityResult = authorityIdentityResult;
    this.questionPackSemanticResult = questionPackSemanticResult;
  }
}

function publicApiV0_3Path(pathname) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${PUBLIC_API_V0_3_PREFIX}${normalized}`;
}

function asSmokeFailure(error, defaults = {}) {
  if (error instanceof SmokeFailure) {
    if (!error.requestSurface && defaults.requestSurface) {
      error.requestSurface = defaults.requestSurface;
    }
    return error;
  }
  return new SmokeFailure("transport_error", {
    ...defaults,
    retryable: true,
  });
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizePathname(value) {
  const normalized = value.length > 1 ? value.replace(/\/+$/, "") : value;
  return normalized || "/";
}

function normalizedSearch(value) {
  return [...value.searchParams.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => (
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue)
    ))
    .map(([key, entryValue]) => `${encodeURIComponent(key)}=${encodeURIComponent(entryValue)}`)
    .join("&");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingContainsText(value) {
  let insideTag = false;
  let text = "";

  for (const character of value) {
    if (character === "<") {
      insideTag = true;
      continue;
    }

    if (character === ">" && insideTag) {
      insideTag = false;
      continue;
    }

    if (!insideTag) {
      text += character;
    }
  }

  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#160;", " ")
    .trim().length > 0;
}

function validateBaseUrl(value, name, { requireHttps = false } = {}) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }
  if (requireHttps && parsed.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${name} must not contain credentials, query, or fragment`);
  }
  return new URL(`${parsed.origin}/`);
}

function validateSameOrigin(current, allowedOrigin) {
  if (current.origin !== allowedOrigin) {
    throw new SmokeFailure("cross_host_redirect", { httpStatus: null });
  }
}

async function fetchWithRedirectGuard(url, {
  allowedOrigin,
  expectedPath,
  accept,
  fetchImpl,
  timeoutMs,
  requestSurface,
}) {
  let current = new URL(url);
  const expectedUrl = new URL(expectedPath, allowedOrigin);
  const expectedPathname = normalizePathname(expectedUrl.pathname);
  const expectedSearch = normalizedSearch(expectedUrl);

  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    validateSameOrigin(current, allowedOrigin);
    let response;
    try {
      response = await fetchImpl(current, {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: accept,
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw asSmokeFailure(error, { requestSurface });
    }

    if (REDIRECT_HTTP_STATUSES.has(response.status)) {
      if (redirectCount === 5) {
        throw new SmokeFailure("redirect_limit_exceeded", {
          httpStatus: response.status,
        });
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new SmokeFailure("redirect_missing_location", {
          httpStatus: response.status,
        });
      }
      current = new URL(location, current);
      validateSameOrigin(current, allowedOrigin);
      continue;
    }

    if (RETRYABLE_HTTP_STATUSES.has(response.status)) {
      throw new SmokeFailure(`http_${response.status}`, {
        retryable: true,
        httpStatus: response.status,
        requestSurface,
      });
    }
    if (response.status !== 200) {
      throw new SmokeFailure(`http_${response.status}`, {
        httpStatus: response.status,
        requestSurface,
      });
    }
    if (normalizePathname(current.pathname) !== expectedPathname) {
      throw new SmokeFailure("unexpected_final_path", {
        httpStatus: response.status,
      });
    }
    if (expectedSearch && normalizedSearch(current) !== expectedSearch) {
      throw new SmokeFailure("unexpected_final_query", {
        httpStatus: response.status,
      });
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      throw new SmokeFailure("response_too_large", {
        httpStatus: response.status,
      });
    }

    const body = await response.text();
    if (Buffer.byteLength(body, "utf8") > MAX_RESPONSE_BYTES) {
      throw new SmokeFailure("response_too_large", {
        httpStatus: response.status,
      });
    }
    return { body, status: response.status };
  }

  throw new SmokeFailure("redirect_limit_exceeded");
}

function parseJson(body, httpStatus, resultDefaults) {
  try {
    const value = JSON.parse(body);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("JSON root must be an object");
    }
    return value;
  } catch {
    throw new SmokeFailure("malformed_json", {
      ...resultDefaults,
      httpStatus,
    });
  }
}

async function readJson(url, options, resultDefaults) {
  const response = await fetchWithRedirectGuard(url, {
    ...options,
    accept: "application/json",
  });
  return {
    payload: parseJson(response.body, response.status, {
      ...resultDefaults,
      requestSurface: options.requestSurface,
    }),
    status: response.status,
  };
}

function assertLookup(payload, {
  slug,
  scaleCode,
  formCode,
  locale,
  httpStatus,
}) {
  const primarySlug = nonEmptyString(payload.primary_slug)
    ? payload.primary_slug.trim()
    : nonEmptyString(payload.slug)
      ? payload.slug.trim()
      : "";
  const forms = Array.isArray(payload.forms) ? payload.forms : [];
  const form = nonEmptyString(formCode) ? forms.find((candidate) => (
    candidate
    && typeof candidate === "object"
    && candidate.form_code === formCode
  )) : null;
  const defaultCatalogForm = formCode === null && forms.length === 1
    && forms[0]
    && typeof forms[0] === "object"
    && nonEmptyString(forms[0].form_code)
    && forms[0].is_default === true
    && forms[0].is_public !== false
    ? forms[0]
    : null;
  const localizedContent = payload.content_i18n_json?.[locale === "zh" ? "zh" : locale];
  const catalog = localizedContent?.catalog;
  const catalogQuestionCount = Number(catalog?.questions_count);
  const defaultFormQuestionCount = Number(defaultCatalogForm?.question_count);
  const supportsCatalogAuthority = formCode === null
    && (scaleCode === "IQ_RAVEN" || scaleCode === "EQ_60")
    && (forms.length === 0 || (
      defaultCatalogForm
      && Number.isInteger(defaultFormQuestionCount)
      && defaultFormQuestionCount > 0
      && defaultFormQuestionCount === catalogQuestionCount
    ))
    && payload.capabilities?.questions === true
    && Number.isInteger(catalogQuestionCount)
    && catalogQuestionCount > 0
    && Number.isInteger(Number(catalog?.time_minutes))
    && Number(catalog?.time_minutes) > 0
    && nonEmptyString(payload.landing_surface_v1?.start_test_target);
  const responseLocale = nonEmptyString(payload.locale) ? payload.locale.trim() : "";
  const localeMatches = locale === "zh"
    ? responseLocale === "zh" || responseLocale.toLowerCase() === "zh-cn"
    : responseLocale.toLowerCase() === "en";

  if (
    payload.ok !== true
    || payload.is_public !== true
    || primarySlug !== slug
    || payload.scale_code !== scaleCode
    || !localeMatches
    || (!supportsCatalogAuthority && (!form || form.is_public === false))
  ) {
    throw new SmokeFailure("lookup_authority_mismatch", {
      httpStatus,
      authorityIdentityResult: "fail",
    });
  }

  const questionCount = Number(form?.question_count ?? defaultCatalogForm?.question_count ?? catalog?.questions_count);
  return {
    formCode,
    questionCount: Number.isInteger(questionCount) && questionCount > 0
      ? questionCount
      : null,
  };
}

function assertHealthyHtml(body, {
  httpStatus,
  requireLandingMarker = false,
  ctaMarker = null,
}) {
  if (!nonEmptyString(body)) {
    throw new SmokeFailure("empty_body", { httpStatus });
  }
  if (/Internal Server Error/i.test(body)) {
    throw new SmokeFailure("internal_server_error_body", { httpStatus });
  }
  if (/test-landing-error-shell/i.test(body)) {
    throw new SmokeFailure("test_landing_error_shell", { httpStatus });
  }
  if (!requireLandingMarker) {
    return;
  }
  if (!/data-test-landing-read-source=(?:"|')(?:fresh|last-known-good)(?:"|')/i.test(body)) {
    throw new SmokeFailure("landing_authority_marker_missing", {
      httpStatus,
      authorityIdentityResult: "fail",
    });
  }
  const heading = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!heading || !headingContainsText(heading[1])) {
    throw new SmokeFailure("landing_title_structure_missing", {
      httpStatus,
      authorityIdentityResult: "fail",
    });
  }
  const ctaPattern = new RegExp(
    `data-testid=(?:"|')${escapeRegExp(ctaMarker)}(?:"|')`,
    "i",
  );
  if (!ctaMarker || !ctaPattern.test(body)) {
    throw new SmokeFailure("landing_cta_structure_missing", {
      httpStatus,
      authorityIdentityResult: "fail",
    });
  }
}

function firstQuestionHasText(question) {
  return [
    question.text,
    question.text_zh,
    question.text_en,
    question.stem?.prompt_zh,
    question.stem?.prompt_en,
  ].some(nonEmptyString);
}

function optionHasAuthorityContent(option) {
  return nonEmptyString(option?.code)
    && [option.text, option.text_zh, option.text_en, option.label].some(nonEmptyString);
}

function assertQuestionPack(payload, {
  expectedQuestionCount,
  httpStatus,
  scaleCode,
  formCode,
}) {
  const items = Array.isArray(payload.questions?.items)
    ? payload.questions.items
    : null;
  const first = items?.[0];
  const itemOptionsValid = Array.isArray(first?.options)
    && first.options.length > 0
    && first.options.every(optionHasAuthorityContent);
  const formatOptionsValid = Array.isArray(payload.options?.format)
    && payload.options.format.length > 0
    && payload.options.format.every(nonEmptyString);

  if (
    payload.ok !== true
    || payload.scale_code !== scaleCode
    || payload.form_code !== formCode
    || !items
    || items.length === 0
    || (expectedQuestionCount !== null && items.length !== expectedQuestionCount)
    || !nonEmptyString(first?.question_id)
    || !firstQuestionHasText(first)
    || (!itemOptionsValid && !formatOptionsValid)
  ) {
    throw new SmokeFailure("question_pack_semantic_mismatch", {
      httpStatus,
      authorityIdentityResult: "pass",
      questionPackSemanticResult: "fail",
    });
  }
}

function lookupPath(slug, locale) {
  return publicApiV0_3Path(
    `/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`,
  );
}

async function runLandingAttempt(check, context) {
  const pageUrl = new URL(check.path, context.baseUrl);
  const lookupRequestPath = lookupPath(check.slug, check.apiLocale);
  const lookupUrl = new URL(lookupRequestPath, context.apiBaseUrl);
  const [page, lookup] = await Promise.all([
    fetchWithRedirectGuard(pageUrl, {
      allowedOrigin: context.baseUrl.origin,
      expectedPath: check.path,
      accept: "text/html",
      fetchImpl: context.fetchImpl,
      timeoutMs: context.timeoutMs,
      requestSurface: "landing_html",
    }),
    readJson(lookupUrl, {
      allowedOrigin: context.apiBaseUrl.origin,
      expectedPath: lookupRequestPath,
      fetchImpl: context.fetchImpl,
      timeoutMs: context.timeoutMs,
      requestSurface: "lookup_api",
    }, {
      authorityIdentityResult: "fail",
    }),
  ]);

  try {
    assertHealthyHtml(page.body, {
      httpStatus: page.status,
      requireLandingMarker: true,
      ctaMarker: check.ctaMarker,
    });
  } catch (error) {
    throw asSmokeFailure(error, { requestSurface: "landing_html" });
  }
  try {
    assertLookup(lookup.payload, {
      slug: check.slug,
      scaleCode: check.scaleCode,
      formCode: check.formCode,
      locale: check.apiLocale,
      httpStatus: lookup.status,
    });
  } catch (error) {
    throw asSmokeFailure(error, { requestSurface: "lookup_api" });
  }
  return {
    httpStatus: page.status,
    authorityIdentityResult: "pass",
    questionPackSemanticResult: "not_applicable",
    requestSurface: "landing_html+lookup_api",
  };
}

async function runTakeAttempt(check, context) {
  const response = await fetchWithRedirectGuard(
    new URL(check.path, context.baseUrl),
    {
      allowedOrigin: context.baseUrl.origin,
      expectedPath: check.path,
      accept: "text/html",
      fetchImpl: context.fetchImpl,
      timeoutMs: context.timeoutMs,
      requestSurface: "landing_html",
    },
  );
  try {
    assertHealthyHtml(response.body, { httpStatus: response.status });
  } catch (error) {
    throw asSmokeFailure(error, { requestSurface: "landing_html" });
  }
  return {
    httpStatus: response.status,
    authorityIdentityResult: "not_applicable",
    questionPackSemanticResult: "not_applicable",
    requestSurface: "landing_html",
  };
}

async function runQuestionPackAttempt(check, context) {
  const lookupRequestPath = lookupPath(check.slug, check.lookupLocale);
  const [lookup, questions] = await Promise.all([
    readJson(new URL(lookupRequestPath, context.apiBaseUrl), {
      allowedOrigin: context.apiBaseUrl.origin,
      expectedPath: lookupRequestPath,
      fetchImpl: context.fetchImpl,
      timeoutMs: context.timeoutMs,
      requestSurface: "lookup_api",
    }, {
      authorityIdentityResult: "fail",
      questionPackSemanticResult: "fail",
    }),
    readJson(new URL(check.path, context.apiBaseUrl), {
      allowedOrigin: context.apiBaseUrl.origin,
      expectedPath: check.path,
      fetchImpl: context.fetchImpl,
      timeoutMs: context.timeoutMs,
      requestSurface: "question_pack_api",
    }, {
      authorityIdentityResult: "fail",
      questionPackSemanticResult: "fail",
    }),
  ]);
  let lookupForm;
  try {
    lookupForm = assertLookup(lookup.payload, {
      slug: check.slug,
      scaleCode: check.scaleCode,
      formCode: check.formCode,
      locale: check.lookupLocale,
      httpStatus: lookup.status,
    });
  } catch (error) {
    throw asSmokeFailure(error, { requestSurface: "lookup_api" });
  }
  try {
    assertQuestionPack(questions.payload, {
      expectedQuestionCount: lookupForm.questionCount,
      httpStatus: questions.status,
      scaleCode: check.scaleCode,
      formCode: check.formCode,
    });
  } catch (error) {
    throw asSmokeFailure(error, { requestSurface: "question_pack_api" });
  }
  return {
    httpStatus: questions.status,
    authorityIdentityResult: "pass",
    questionPackSemanticResult: "pass",
    requestSurface: "lookup_api+question_pack_api",
  };
}

async function runAttempt(check, context) {
  if (check.kind === "landing") {
    return runLandingAttempt(check, context);
  }
  if (check.kind === "take") {
    return runTakeAttempt(check, context);
  }
  return runQuestionPackAttempt(check, context);
}

function failureDefaults(check) {
  if (check.kind === "landing") {
    return {
      authorityIdentityResult: "fail",
      questionPackSemanticResult: "not_applicable",
      requestSurface: "landing_html+lookup_api",
    };
  }
  if (check.kind === "question-pack") {
    return {
      authorityIdentityResult: "fail",
      questionPackSemanticResult: "fail",
      requestSurface: "lookup_api+question_pack_api",
    };
  }
  return {
    authorityIdentityResult: "not_applicable",
    questionPackSemanticResult: "not_applicable",
    requestSurface: "landing_html",
  };
}

async function runCheck(check, context) {
  const startedAt = Date.now();
  const diagnostics = [];
  let attemptCount = 0;

  for (let attempt = 1; attempt <= context.maxAttempts; attempt += 1) {
    attemptCount = attempt;
    try {
      const result = await runAttempt(check, context);
      diagnostics.push({
        attempt,
        result: "pass",
        category: "semantic_assertions_passed",
        http_status: result.httpStatus,
        request_surface: result.requestSurface,
      });
      return {
        check_name: check.checkName,
        path: check.path,
        result: "pass",
        http_status: result.httpStatus,
        request_surface: result.requestSurface,
        duration_ms: Date.now() - startedAt,
        attempt_count: attemptCount,
        authority_identity_result: result.authorityIdentityResult,
        question_pack_semantic_result: result.questionPackSemanticResult,
        diagnostic_summary: diagnostics,
      };
    } catch (error) {
      const failure = asSmokeFailure(error, failureDefaults(check));
      diagnostics.push({
        attempt,
        result: "fail",
        category: failure.code,
        http_status: failure.httpStatus,
        retryable: failure.retryable,
        request_surface: failure.requestSurface ?? failureDefaults(check).requestSurface,
      });
      if (failure.retryable && attempt < context.maxAttempts) {
        await context.sleep(context.retryDelayMs);
        continue;
      }
      return {
        check_name: check.checkName,
        path: check.path,
        result: "fail",
        http_status: failure.httpStatus,
        request_surface: failure.requestSurface ?? failureDefaults(check).requestSurface,
        duration_ms: Date.now() - startedAt,
        attempt_count: attemptCount,
        authority_identity_result:
          failure.authorityIdentityResult ?? failureDefaults(check).authorityIdentityResult,
        question_pack_semantic_result:
          failure.questionPackSemanticResult
          ?? failureDefaults(check).questionPackSemanticResult,
        diagnostic_summary: diagnostics,
      };
    }
  }

  throw new Error("unreachable");
}

function validateRunOptions(options) {
  const environment = String(options.environment ?? "");
  if (!["staging", "production"].includes(environment)) {
    throw new Error("environment must be staging or production");
  }
  const exactSha = String(options.exactSha ?? "");
  if (!/^[0-9a-f]{40}$/.test(exactSha)) {
    throw new Error("exactSha must be a 40-character lowercase SHA");
  }
  for (const [name, value] of [
    ["workflowRunId", options.workflowRunId],
    ["workflowRunAttempt", options.workflowRunAttempt],
  ]) {
    if (!/^[1-9][0-9]*$/.test(String(value ?? ""))) {
      throw new Error(`${name} must be a positive integer string`);
    }
  }
}

export async function runTestLandingSmoke(options) {
  validateRunOptions(options);
  const baseUrl = validateBaseUrl(options.baseUrl, "baseUrl");
  const apiBaseUrl = validateBaseUrl(options.apiBaseUrl, "apiBaseUrl");
  const context = {
    baseUrl,
    apiBaseUrl,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    maxAttempts: options.maxAttempts ?? DEFAULT_ATTEMPTS,
    retryDelayMs: options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    sleep: options.sleep ?? ((milliseconds) => new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    })),
  };
  if (typeof context.fetchImpl !== "function") {
    throw new Error("fetch implementation is required");
  }
  if (!Number.isInteger(context.maxAttempts) || context.maxAttempts < 1 || context.maxAttempts > 3) {
    throw new Error("maxAttempts must be an integer between 1 and 3");
  }

  const checks = [];
  for (const check of CHECKS) {
    checks.push(await runCheck(check, context));
  }
  const result = checks.every((check) => check.result === "pass") ? "pass" : "fail";

  return {
    schema_version: TEST_LANDING_SMOKE_SCHEMA_VERSION,
    environment: options.environment,
    exact_sha: options.exactSha,
    workflow_run_id: String(options.workflowRunId),
    workflow_run_attempt: String(options.workflowRunAttempt),
    base_url_hostname: baseUrl.hostname,
    result,
    generated_at: new Date().toISOString(),
    checks,
  };
}

function markdownSummary(receipt) {
  const lines = [
    "## Test landing post-deploy smoke",
    "",
    `Environment: \`${receipt.environment}\``,
    "",
    "| Check | Status | HTTP | Duration | Attempts | Authority | Question pack |",
    "| --- | --- | ---: | ---: | ---: | --- | --- |",
  ];
  for (const check of receipt.checks) {
    lines.push(
      `| ${check.check_name} | ${check.result} | ${check.http_status ?? "n/a"} | ${check.duration_ms} ms | ${check.attempt_count} | ${check.authority_identity_result} | ${check.question_pack_semantic_result} |`,
    );
  }
  lines.push("", `Overall result: **${receipt.result}**`, "");
  return `${lines.join("\n")}\n`;
}

async function writeReceipt(output, receipt) {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`unexpected argument: ${argument}`);
    }
    const name = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for --${name}`);
    }
    if (values.has(name)) {
      throw new Error(`duplicate argument: --${name}`);
    }
    values.set(name, value);
    index += 1;
  }
  const allowed = new Set([
    "base-url",
    "api-base-url",
    "environment",
    "exact-sha",
    "workflow-run-id",
    "workflow-run-attempt",
    "output",
    "summary",
  ]);
  for (const name of values.keys()) {
    if (!allowed.has(name)) {
      throw new Error(`unknown argument: --${name}`);
    }
  }
  for (const required of allowed) {
    if (!values.has(required)) {
      throw new Error(`missing required argument: --${required}`);
    }
  }
  return Object.fromEntries(values.entries());
}

export async function main(argv = process.argv.slice(2)) {
  let parsed;
  let receipt;
  try {
    parsed = parseArgs(argv);
    validateBaseUrl(parsed["base-url"], "--base-url", { requireHttps: true });
    validateBaseUrl(parsed["api-base-url"], "--api-base-url", { requireHttps: true });
    receipt = await runTestLandingSmoke({
      baseUrl: parsed["base-url"],
      apiBaseUrl: parsed["api-base-url"],
      environment: parsed.environment,
      exactSha: parsed["exact-sha"],
      workflowRunId: parsed["workflow-run-id"],
      workflowRunAttempt: parsed["workflow-run-attempt"],
    });
  } catch {
    if (!parsed) {
      throw new Error("test landing smoke configuration is invalid");
    }
    const baseUrl = validateBaseUrl(parsed["base-url"], "--base-url", { requireHttps: true });
    receipt = {
      schema_version: TEST_LANDING_SMOKE_SCHEMA_VERSION,
      environment: parsed.environment,
      exact_sha: parsed["exact-sha"],
      workflow_run_id: parsed["workflow-run-id"],
      workflow_run_attempt: parsed["workflow-run-attempt"],
      base_url_hostname: baseUrl.hostname,
      result: "fail",
      generated_at: new Date().toISOString(),
      checks: [{
        check_name: "smoke_configuration",
        path: "/",
        result: "fail",
        http_status: null,
        duration_ms: 0,
        attempt_count: 0,
        authority_identity_result: "not_applicable",
        question_pack_semantic_result: "not_applicable",
        diagnostic_summary: [{
          attempt: 0,
          result: "fail",
          category: "configuration_error",
          http_status: null,
          retryable: false,
        }],
      }],
    };
  }

  await writeReceipt(parsed.output, receipt);
  await appendFile(parsed.summary, markdownSummary(receipt), "utf8");
  process.stdout.write(
    `test-landing-smoke result=${receipt.result} checks=${receipt.checks.length}\n`,
  );
  if (receipt.result !== "pass") {
    process.exitCode = 1;
  }
  return receipt;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  await main();
}
