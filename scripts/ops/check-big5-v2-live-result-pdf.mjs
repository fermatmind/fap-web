#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_LOCALE = "zh-CN";
const DEFAULT_REPORT_TIMEOUT_MS = 90000;
const DEFAULT_REPORT_POLL_MS = 5000;
const BIG5_SCALE = {
  label: "Big Five",
  scaleCode: "BIG5_OCEAN",
  formCode: "big5_90",
  minQuestions: 90,
  defaultCode: "3",
};

const PDF_FORBIDDEN_TEXT = [
  "Big Five Report Engine",
  "PR3B",
  "AttemptReadController",
  "payload",
  "registry",
  "dict.header.tests",
  "dict.header.articles",
  "footerGroupTitles",
  "研究与方法",
];

function parseArgs(argv) {
  const options = {
    apiOrigin: process.env.BIG5_V2_SMOKE_API_ORIGIN || DEFAULT_API_ORIGIN,
    locale: process.env.BIG5_V2_SMOKE_LOCALE || DEFAULT_LOCALE,
    execute: false,
    json: false,
    reportTimeoutMs: Number.parseInt(process.env.BIG5_V2_SMOKE_REPORT_TIMEOUT_MS || "", 10) || DEFAULT_REPORT_TIMEOUT_MS,
    reportPollMs: Number.parseInt(process.env.BIG5_V2_SMOKE_REPORT_POLL_MS || "", 10) || DEFAULT_REPORT_POLL_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--execute") {
      options.execute = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--api-origin") {
      options.apiOrigin = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--locale") {
      options.locale = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--report-timeout-ms") {
      options.reportTimeoutMs = Number.parseInt(argv[index + 1] || "", 10);
      index += 1;
    } else if (arg === "--report-poll-ms") {
      options.reportPollMs = Number.parseInt(argv[index + 1] || "", 10);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.apiOrigin = normalizeOrigin(options.apiOrigin);
  if (!options.apiOrigin) throw new Error("--api-origin must be an http(s) origin");
  if (!Number.isFinite(options.reportTimeoutMs) || options.reportTimeoutMs < 1000) {
    throw new Error("--report-timeout-ms must be >= 1000");
  }
  if (!Number.isFinite(options.reportPollMs) || options.reportPollMs < 500) {
    throw new Error("--report-poll-ms must be >= 500");
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  pnpm ops:big5-v2-post-deploy-smoke -- --execute

Options:
  --execute                 Create a fresh anonymous Big Five attempt, submit neutral answers, then fetch report and PDF.
  --api-origin <origin>      Defaults to ${DEFAULT_API_ORIGIN}.
  --locale <locale>          Defaults to ${DEFAULT_LOCALE}.
  --report-timeout-ms <ms>   Defaults to ${DEFAULT_REPORT_TIMEOUT_MS}.
  --report-poll-ms <ms>      Defaults to ${DEFAULT_REPORT_POLL_MS}.
  --json                     Print redacted machine-readable JSON.

Without --execute, the script validates the Big Five question endpoint only and does not submit an attempt.`);
}

function normalizeOrigin(value) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized || !/^https?:\/\//i.test(normalized)) return "";
  return normalized;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(apiOrigin, pathValue) {
  return `${apiOrigin}/api/v0.3${pathValue.startsWith("/") ? pathValue : `/${pathValue}`}`;
}

function hashId(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

async function requestJson({ apiOrigin, path: requestPath, method = "GET", body, token, anonId }) {
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;
  if (anonId) headers["x-fm-anon-id"] = anonId;

  const response = await fetch(buildUrl(apiOrigin, requestPath), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    ok: response.ok,
    status: response.status,
    payload: await response.json().catch(() => null),
  };
}

async function requestPdf({ apiOrigin, attemptId, token, anonId }) {
  const headers = { accept: "application/pdf" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (anonId) headers["x-fm-anon-id"] = anonId;

  const response = await fetch(buildUrl(apiOrigin, `/attempts/${encodeURIComponent(attemptId)}/report.pdf`), {
    headers,
  });

  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    bytes: Buffer.from(await response.arrayBuffer()),
  };
}

async function createGuestSession(apiOrigin) {
  const response = await requestJson({
    apiOrigin,
    path: "/auth/guest",
    method: "POST",
    body: {},
  });

  if (!response.ok || !response.payload?.token || !response.payload?.anon_id) {
    throw new Error(`guest auth failed: ${response.status} ${response.payload?.error_code || ""}`.trim());
  }

  return {
    token: response.payload.token,
    anonId: response.payload.anon_id,
  };
}

function readQuestionId(question) {
  return String(question?.question_id ?? question?.id ?? "").trim();
}

async function fetchQuestions({ apiOrigin, token, anonId, locale }) {
  const query = new URLSearchParams({ locale, form_code: BIG5_SCALE.formCode });
  const response = await requestJson({
    apiOrigin,
    path: `/scales/${encodeURIComponent(BIG5_SCALE.scaleCode)}/questions?${query.toString()}`,
    token,
    anonId,
  });

  const questions = Array.isArray(response.payload?.questions?.items) ? response.payload.questions.items : [];
  if (!response.ok || questions.length < BIG5_SCALE.minQuestions) {
    throw new Error(`${BIG5_SCALE.label} questions failed: ${response.status}, count=${questions.length}`);
  }

  return questions;
}

async function startAttempt({ apiOrigin, token, anonId, locale }) {
  const response = await requestJson({
    apiOrigin,
    path: "/attempts/start",
    method: "POST",
    token,
    anonId,
    body: {
      scale_code: BIG5_SCALE.scaleCode,
      form_code: BIG5_SCALE.formCode,
      anon_id: anonId,
      locale,
    },
  });

  const attemptId = String(response.payload?.attempt_id ?? "").trim();
  if (!response.ok || !attemptId) {
    throw new Error(`${BIG5_SCALE.label} start failed: ${response.status} ${response.payload?.error_code || ""}`.trim());
  }

  return attemptId;
}

async function submitAttempt({ apiOrigin, token, anonId, attemptId, questions }) {
  const answers = questions.map((question) => ({
    question_id: readQuestionId(question),
    code: BIG5_SCALE.defaultCode,
  }));

  const response = await requestJson({
    apiOrigin,
    path: "/attempts/submit",
    method: "POST",
    token,
    anonId,
    body: {
      attempt_id: attemptId,
      answers,
      duration_ms: 60000,
    },
  });

  if (!response.ok) {
    throw new Error(`${BIG5_SCALE.label} submit failed: ${response.status} ${response.payload?.error_code || ""}`.trim());
  }
}

async function waitForReport({ apiOrigin, token, anonId, attemptId, reportTimeoutMs, reportPollMs }) {
  const startedAt = Date.now();
  let lastReport = null;

  while (Date.now() - startedAt <= reportTimeoutMs) {
    const report = await requestJson({ apiOrigin, path: `/attempts/${attemptId}/report`, token, anonId });
    lastReport = report;
    if (report.status === 200) return report.payload;
    await sleep(reportPollMs);
  }

  throw new Error(`${BIG5_SCALE.label} report not ready: report=${lastReport?.status ?? "unknown"}`);
}

function extractPdfText(pdfBytes) {
  const dir = mkdtempSync(path.join(tmpdir(), "big5-v2-pdf-"));
  const pdfPath = path.join(dir, "report.pdf");
  try {
    writeFileSync(pdfPath, pdfBytes);
    try {
      return execFileSync("pdftotext", [pdfPath, "-"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch {
      return pdfBytes.toString("latin1");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function auditPdfText(text) {
  const failures = [];
  if (/https?:\/\/(?:www\.)?fermatmind\.com\/(?:zh|en)?\/?result\/[A-Za-z0-9_-]+/i.test(text)) {
    failures.push("private_result_url");
  }
  for (const token of PDF_FORBIDDEN_TEXT) {
    if (text.includes(token)) failures.push(`token:${token}`);
  }
  return failures;
}

function summarizeReport(report) {
  return {
    has_big5_result_page_v2: Boolean(report?.big5_result_page_v2),
    has_legacy_big5_report_engine_v2: Boolean(report?.big5_report_engine_v2),
    has_report_sections: Array.isArray(report?.report?.sections),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const session = await createGuestSession(options.apiOrigin);
  const questions = await fetchQuestions({
    apiOrigin: options.apiOrigin,
    token: session.token,
    anonId: session.anonId,
    locale: options.locale,
  });

  const result = {
    ok: true,
    api_origin: options.apiOrigin,
    locale: options.locale,
    executed: options.execute,
    questions: questions.length,
    attempt_hash: null,
    report: null,
    pdf: null,
  };

  if (options.execute) {
    const attemptId = await startAttempt({
      apiOrigin: options.apiOrigin,
      token: session.token,
      anonId: session.anonId,
      locale: options.locale,
    });
    result.attempt_hash = hashId(attemptId);
    await submitAttempt({
      apiOrigin: options.apiOrigin,
      token: session.token,
      anonId: session.anonId,
      attemptId,
      questions,
    });

    const report = await waitForReport({
      apiOrigin: options.apiOrigin,
      token: session.token,
      anonId: session.anonId,
      attemptId,
      reportTimeoutMs: options.reportTimeoutMs,
      reportPollMs: options.reportPollMs,
    });
    result.report = summarizeReport(report);

    const pdf = await requestPdf({
      apiOrigin: options.apiOrigin,
      attemptId,
      token: session.token,
      anonId: session.anonId,
    });
    const pdfText = pdf.ok ? extractPdfText(pdf.bytes) : "";
    const failures = pdf.ok ? auditPdfText(pdfText) : [`pdf_http_${pdf.status}`];
    result.pdf = {
      status: pdf.status,
      content_type: pdf.contentType,
      text_extract_available: pdf.ok && pdfText.length > 0,
      forbidden_hits: failures,
    };
    result.ok = Boolean(result.report?.has_big5_result_page_v2) && failures.length === 0;
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (options.execute) {
    console.log(
      `[big5-v2-post-deploy] attempt_hash=${result.attempt_hash} v2=${result.report?.has_big5_result_page_v2 ? "yes" : "no"} legacy=${result.report?.has_legacy_big5_report_engine_v2 ? "yes" : "no"} pdf_status=${result.pdf?.status ?? "n/a"} forbidden_hits=${result.pdf?.forbidden_hits?.length ?? 0}`
    );
  } else {
    console.log(`[big5-v2-post-deploy] dry-run questions=${result.questions}; add --execute to create a fresh anonymous sample.`);
  }

  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(`[big5-v2-post-deploy] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
