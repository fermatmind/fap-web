#!/usr/bin/env node

const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_LOCALE = "zh-CN";
const DEFAULT_REPORT_TIMEOUT_MS = 90000;
const DEFAULT_REPORT_POLL_MS = 5000;

const SMOKE_SCALES = [
  {
    label: "Big Five",
    scaleCode: "BIG5_OCEAN",
    formCode: "big5_90",
    minQuestions: 90,
    defaultCode: "3",
    includeQuestionIndex: false,
  },
  {
    label: "Enneagram",
    scaleCode: "ENNEAGRAM",
    formCode: "enneagram_likert_105",
    minQuestions: 105,
    preferredOptionCodes: ["0"],
    defaultCode: null,
    includeQuestionIndex: true,
  },
  {
    label: "RIASEC",
    scaleCode: "RIASEC",
    formCode: "riasec_60",
    minQuestions: 60,
    defaultCode: "3",
    includeQuestionIndex: true,
  },
  {
    label: "IQ",
    scaleCode: "IQ_RAVEN",
    formCode: null,
    minQuestions: 30,
    defaultCode: null,
    includeQuestionIndex: false,
  },
  {
    label: "EQ",
    scaleCode: "EQ_60",
    formCode: null,
    minQuestions: 60,
    defaultCode: "3",
    includeQuestionIndex: false,
  },
];

function parseArgs(argv) {
  const options = {
    apiOrigin: process.env.RESULT_SMOKE_API_ORIGIN || DEFAULT_API_ORIGIN,
    locale: process.env.RESULT_SMOKE_LOCALE || DEFAULT_LOCALE,
    execute: false,
    json: false,
    reportTimeoutMs: Number.parseInt(process.env.RESULT_SMOKE_REPORT_TIMEOUT_MS || "", 10) || DEFAULT_REPORT_TIMEOUT_MS,
    reportPollMs: Number.parseInt(process.env.RESULT_SMOKE_REPORT_POLL_MS || "", 10) || DEFAULT_REPORT_POLL_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    } else if (arg === "--execute") {
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
  if (!options.apiOrigin) {
    throw new Error("--api-origin must be an http(s) origin");
  }
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
  pnpm ops:result-smoke -- --execute

Options:
  --execute                 Create anonymous attempts and submit smoke answers.
  --api-origin <origin>      Defaults to ${DEFAULT_API_ORIGIN}.
  --locale <locale>          Defaults to ${DEFAULT_LOCALE}.
  --report-timeout-ms <ms>   Defaults to ${DEFAULT_REPORT_TIMEOUT_MS}.
  --report-poll-ms <ms>      Defaults to ${DEFAULT_REPORT_POLL_MS}.
  --json                     Print machine-readable JSON.

Without --execute, the script validates question endpoints only and does not submit attempts.`);
}

function normalizeOrigin(value) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized) return "";
  if (!/^https?:\/\//i.test(normalized)) return "";
  return normalized;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(apiOrigin, path) {
  return `${apiOrigin}/api/v0.3${path.startsWith("/") ? path : `/${path}`}`;
}

async function requestJson({ apiOrigin, path, method = "GET", body, token, anonId }) {
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  if (anonId) {
    headers["x-fm-anon-id"] = anonId;
  }

  const response = await fetch(buildUrl(apiOrigin, path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    payload,
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

function readOptionCode(question, options, scale, meta) {
  const questionOptions = Array.isArray(question?.options) ? question.options : [];
  const sharedOptions = Array.isArray(options?.format) ? options.format : [];
  const anchorOptions = Array.isArray(meta?.option_anchors) ? meta.option_anchors : [];
  const candidates = [...questionOptions, ...sharedOptions, ...anchorOptions];
  const codes = candidates
    .filter((item) => item && typeof item === "object")
    .map((item) => String(item.code ?? item.id ?? item.value ?? "").trim())
    .filter(Boolean);

  for (const preferredCode of scale.preferredOptionCodes || []) {
    if (codes.includes(preferredCode)) {
      return preferredCode;
    }
  }

  if (scale.defaultCode && codes.includes(scale.defaultCode)) {
    return scale.defaultCode;
  }

  const code = codes[0] || "";

  if (!code) {
    throw new Error(`cannot infer answer code for question ${readQuestionId(question) || "(unknown)"}`);
  }

  return code;
}

async function fetchQuestions({ apiOrigin, token, anonId, locale, scale }) {
  const query = new URLSearchParams({ locale });
  if (scale.formCode) query.set("form_code", scale.formCode);

  const response = await requestJson({
    apiOrigin,
    path: `/scales/${encodeURIComponent(scale.scaleCode)}/questions?${query.toString()}`,
    token,
    anonId,
  });

  const questions = Array.isArray(response.payload?.questions?.items) ? response.payload.questions.items : [];
  if (!response.ok || questions.length < scale.minQuestions) {
    throw new Error(`${scale.label} questions failed: ${response.status}, count=${questions.length}`);
  }

  return {
    questions,
    options: response.payload?.options,
    meta: response.payload?.meta,
  };
}

async function startAttempt({ apiOrigin, token, anonId, locale, scale }) {
  const response = await requestJson({
    apiOrigin,
    path: "/attempts/start",
    method: "POST",
    token,
    anonId,
    body: {
      scale_code: scale.scaleCode,
      ...(scale.formCode ? { form_code: scale.formCode } : {}),
      anon_id: anonId,
      locale,
    },
  });

  const attemptId = String(response.payload?.attempt_id ?? "").trim();
  if (!response.ok || !attemptId) {
    throw new Error(`${scale.label} start failed: ${response.status} ${response.payload?.error_code || ""}`.trim());
  }

  return attemptId;
}

async function submitAttempt({ apiOrigin, token, anonId, attemptId, questions, options, meta, scale }) {
  const answers = questions.map((question, index) => ({
    question_id: readQuestionId(question),
    code: readOptionCode(question, options, scale, meta),
    ...(scale.includeQuestionIndex ? { question_index: index } : {}),
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
    throw new Error(`${scale.label} submit failed: ${response.status} ${response.payload?.error_code || ""}`.trim());
  }
}

async function waitForResult({ apiOrigin, token, anonId, attemptId, scale, reportTimeoutMs, reportPollMs }) {
  const startedAt = Date.now();
  let lastResult = null;
  let lastReport = null;

  while (Date.now() - startedAt <= reportTimeoutMs) {
    const [result, report] = await Promise.all([
      requestJson({ apiOrigin, path: `/attempts/${attemptId}/result`, token, anonId }),
      requestJson({ apiOrigin, path: `/attempts/${attemptId}/report`, token, anonId }),
    ]);

    lastResult = result;
    lastReport = report;

    if (result.status === 200 && report.status === 200) {
      return {
        resultStatus: result.status,
        reportStatus: report.status,
      };
    }

    await sleep(reportPollMs);
  }

  throw new Error(
    `${scale.label} result/report not ready: result=${lastResult?.status ?? "unknown"}, report=${lastReport?.status ?? "unknown"}`
  );
}

async function runScale(options, scale) {
  const session = await createGuestSession(options.apiOrigin);
  const questionPayload = await fetchQuestions({
    apiOrigin: options.apiOrigin,
    token: session.token,
    anonId: session.anonId,
    locale: options.locale,
    scale,
  });

  const result = {
    label: scale.label,
    scale_code: scale.scaleCode,
    questions: questionPayload.questions.length,
    executed: options.execute,
    attempt_id: null,
    result_status: null,
    report_status: null,
  };

  if (!options.execute) {
    return result;
  }

  const attemptId = await startAttempt({
    apiOrigin: options.apiOrigin,
    token: session.token,
    anonId: session.anonId,
    locale: options.locale,
    scale,
  });
  result.attempt_id = attemptId;

  await submitAttempt({
    apiOrigin: options.apiOrigin,
    token: session.token,
    anonId: session.anonId,
    attemptId,
    questions: questionPayload.questions,
    options: questionPayload.options,
    meta: questionPayload.meta,
    scale,
  });

  const ready = await waitForResult({
    apiOrigin: options.apiOrigin,
    token: session.token,
    anonId: session.anonId,
    attemptId,
    scale,
    reportTimeoutMs: options.reportTimeoutMs,
    reportPollMs: options.reportPollMs,
  });

  result.result_status = ready.resultStatus;
  result.report_status = ready.reportStatus;
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const results = [];

  for (const scale of SMOKE_SCALES) {
    const result = await runScale(options, scale);
    results.push(result);

    if (!options.json) {
      const suffix = options.execute
        ? `attempt=${result.attempt_id} result=${result.result_status} report=${result.report_status}`
        : "dry-run questions-only";
      console.log(`[result-smoke] ${result.label}: questions=${result.questions} ${suffix}`);
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ ok: true, api_origin: options.apiOrigin, locale: options.locale, results }, null, 2));
  }
}

main().catch((error) => {
  console.error(`[result-smoke] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
