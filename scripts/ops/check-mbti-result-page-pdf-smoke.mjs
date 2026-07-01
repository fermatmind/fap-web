#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const DEFAULT_API_ORIGIN = "https://api.fermatmind.com";
const DEFAULT_LOCALE = "zh-CN";
const DEFAULT_MIN_PDF_BYTES = 20000;
const SNAPSHOT_SURFACE_VERSION = "mbti.result_page_snapshot.v4";
const SNAPSHOT_SURFACE_KEY = "mbti_result_page_snapshot";
const SNAPSHOT_ENGINE = "gotenberg_chromium";

const REQUIRED_HEADERS = [
  ["x-report-pdf-engine", SNAPSHOT_ENGINE],
  ["x-pdf-surface", SNAPSHOT_SURFACE_KEY],
  ["x-pdf-surface-version", SNAPSHOT_SURFACE_VERSION],
  ["x-legacy-mpdf-fallback", "false"],
];

const FORBIDDEN_TEXT_PATTERNS = [
  ["site_chrome_on_this_page", /\bON THIS PAGE\b/i],
  ["site_chrome_tools", /\bTOOLS\b/i],
  ["cookie_banner", /\bCookie\b|CookieBanner|data-cookie-banner/i],
  ["placeholder_trait_slot", /Placeholder trait slot/i],
  ["zh_placeholder_slot", /占位槽位/],
  ["zh_workbench_title", /完整结果工作台/],
  ["zh_download_pdf", /下载 PDF/],
  ["zh_my_mbti_report", /我的 MBTI 报告/],
  ["zh_order_lookup", /订单找回/],
  ["zh_workspace", /工作台/],
  ["zh_share_result", /分享结果/],
  ["zh_retest", /重新测试/],
  ["zh_history", /查看历史/],
  ["internal_controller", /AttemptReadController/],
  ["internal_payload", /\bpayload\b/i],
  ["internal_registry", /\bregistry\b/i],
  ["ready_marker_leak", /PDF_READY/],
  ["pdf_dom_marker_leak", /data-pdf/i],
  ["engine_marker_leak", /Gotenberg/i],
  ["surface_marker_leak", /mbti\.result_page_snapshot/i],
  ["summary_shell_title", /FERMATMIND MBTI RESULT/i],
  ["summary_shell_footer_zh", /PDF 保留当前结果页的核心阅读内容/],
  ["summary_shell_footer_zh_action", /职业推荐、历史结果与订单入口请回到结果页继续使用/],
  ["core_reading_summary", /Core Reading|core reading|核心阅读|summary shell/i],
];

const REQUIRED_SECTION_TEXT_BY_LOCALE = {
  "zh-CN": [
    ["personality_traits", /人格特质/],
    ["career_path", /职业路径/],
    ["personal_growth", /个人成长/],
    ["relationships", /关系模式/],
  ],
  zh: [
    ["personality_traits", /人格特质/],
    ["career_path", /职业路径/],
    ["personal_growth", /个人成长/],
    ["relationships", /关系模式/],
  ],
  en: [
    ["personality_traits", /Personality Traits/i],
    ["career_path", /Career Path/i],
    ["personal_growth", /Personal Growth/i],
    ["relationships", /Relationships/i],
  ],
  "en-US": [
    ["personality_traits", /Personality Traits/i],
    ["career_path", /Career Path/i],
    ["personal_growth", /Personal Growth/i],
    ["relationships", /Relationships/i],
  ],
};

const REQUIRED_DETAIL_TEXT_BY_LOCALE = {
  "zh-CN": [
    ["career_influential_traits", /影响因素/],
    ["career_advantages", /职业优势/],
    ["career_weaknesses", /职业短板/],
    ["preferred_roles", /你可能会喜欢的职业选择/],
    ["work_style", /适合你的工作方式/],
    ["growth_strengths", /成长优势/],
    ["growth_weaknesses", /成长短板/],
    ["relationship_strengths", /关系优势/],
    ["relationship_weaknesses", /关系短板/],
  ],
  zh: [
    ["career_influential_traits", /影响因素/],
    ["career_advantages", /职业优势/],
    ["career_weaknesses", /职业短板/],
    ["preferred_roles", /你可能会喜欢的职业选择/],
    ["work_style", /适合你的工作方式/],
    ["growth_strengths", /成长优势/],
    ["growth_weaknesses", /成长短板/],
    ["relationship_strengths", /关系优势/],
    ["relationship_weaknesses", /关系短板/],
  ],
  en: [
    ["career_influential_traits", /Influential Traits/i],
    ["career_advantages", /Career advantages/i],
    ["career_weaknesses", /Career weaknesses/i],
    ["preferred_roles", /Preferred roles/i],
    ["growth_strengths", /Growth strengths/i],
    ["growth_weaknesses", /Growth weaknesses/i],
    ["relationship_strengths", /Relationship strengths/i],
    ["relationship_weaknesses", /Relationship weaknesses/i],
  ],
  "en-US": [
    ["career_influential_traits", /Influential Traits/i],
    ["career_advantages", /Career advantages/i],
    ["career_weaknesses", /Career weaknesses/i],
    ["preferred_roles", /Preferred roles/i],
    ["growth_strengths", /Growth strengths/i],
    ["growth_weaknesses", /Growth weaknesses/i],
    ["relationship_strengths", /Relationship strengths/i],
    ["relationship_weaknesses", /Relationship weaknesses/i],
  ],
};

function parseArgs(argv) {
  const options = {
    apiOrigin: process.env.MBTI_RESULT_PAGE_PDF_SMOKE_API_ORIGIN || DEFAULT_API_ORIGIN,
    locale: process.env.MBTI_RESULT_PAGE_PDF_SMOKE_LOCALE || DEFAULT_LOCALE,
    attemptId: process.env.MBTI_RESULT_PAGE_PDF_SMOKE_ATTEMPT_ID || "",
    accessToken: process.env.MBTI_RESULT_PAGE_PDF_SMOKE_ACCESS_TOKEN || "",
    execute: false,
    json: false,
    minPdfBytes: Number.parseInt(process.env.MBTI_RESULT_PAGE_PDF_SMOKE_MIN_PDF_BYTES || "", 10) || DEFAULT_MIN_PDF_BYTES,
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
    } else if (arg === "--attempt-id") {
      options.attemptId = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--access-token") {
      options.accessToken = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--min-pdf-bytes") {
      options.minPdfBytes = Number.parseInt(argv[index + 1] || "", 10);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.apiOrigin = normalizeOrigin(options.apiOrigin);
  options.locale = String(options.locale || "").trim();
  options.attemptId = String(options.attemptId || "").trim();
  options.accessToken = String(options.accessToken || "").trim();

  if (!options.apiOrigin) throw new Error("--api-origin must be an http(s) origin");
  if (!options.locale) throw new Error("--locale is required");
  if (!Number.isFinite(options.minPdfBytes) || options.minPdfBytes < 1000) {
    throw new Error("--min-pdf-bytes must be >= 1000");
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  pnpm ops:mbti-result-page-pdf-smoke -- --json
  pnpm ops:mbti-result-page-pdf-smoke -- --execute --attempt-id <id> --access-token <token> --json

Options:
  --execute                 Download and audit an operator-provided unlocked MBTI result-page PDF fixture.
  --api-origin <origin>      Defaults to ${DEFAULT_API_ORIGIN}.
  --locale <locale>          Defaults to ${DEFAULT_LOCALE}.
  --attempt-id <id>          Required with --execute. May also be set via MBTI_RESULT_PAGE_PDF_SMOKE_ATTEMPT_ID.
  --access-token <token>     Required with --execute. May also be set via MBTI_RESULT_PAGE_PDF_SMOKE_ACCESS_TOKEN.
  --min-pdf-bytes <bytes>    Defaults to ${DEFAULT_MIN_PDF_BYTES}.
  --json                     Print redacted machine-readable JSON.

Without --execute, the script performs a dry-run configuration check only and does not call production.`);
}

function normalizeOrigin(value) {
  const normalized = String(value ?? "").trim().replace(/\/$/, "");
  if (!normalized || !/^https?:\/\//i.test(normalized)) return "";

  return normalized;
}

function buildApiUrl(apiOrigin, pathValue) {
  return `${apiOrigin}/api/v0.3${pathValue.startsWith("/") ? pathValue : `/${pathValue}`}`;
}

function hashId(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;

  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

async function requestResultPagePdf({ apiOrigin, attemptId, accessToken }) {
  const response = await fetch(buildApiUrl(apiOrigin, `/attempts/${encodeURIComponent(attemptId)}/result-page.pdf`), {
    method: "GET",
    headers: {
      accept: "application/pdf",
      authorization: `Bearer ${accessToken}`,
      "x-result-access-token": accessToken,
    },
  });

  const bytes = Buffer.from(await response.arrayBuffer());

  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    headers: Object.fromEntries(REQUIRED_HEADERS.map(([header]) => [header, response.headers.get(header) || ""])),
    bytes,
  };
}

function extractPdfText(pdfBytes) {
  try {
    return execFileSync("pdftotext", ["-", "-"], {
      input: pdfBytes,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return pdfBytes.toString("latin1");
  }
}

function auditPdf({ pdf, text, locale, minPdfBytes }) {
  const failures = [];

  if (!pdf.ok) failures.push(`pdf_http_${pdf.status}`);
  if (!/^application\/pdf\b/i.test(pdf.contentType)) failures.push("pdf_content_type");
  if (!pdf.bytes.subarray(0, 4).equals(Buffer.from("%PDF"))) failures.push("pdf_magic_missing");
  if (pdf.bytes.length < minPdfBytes) failures.push("pdf_too_small");

  for (const [header, expected] of REQUIRED_HEADERS) {
    if (String(pdf.headers[header] || "").trim() !== expected) {
      failures.push(`header:${header}`);
    }
  }

  for (const [code, pattern] of FORBIDDEN_TEXT_PATTERNS) {
    if (pattern.test(text)) failures.push(`pollutant:${code}`);
  }

  const requiredSections = REQUIRED_SECTION_TEXT_BY_LOCALE[locale] || REQUIRED_SECTION_TEXT_BY_LOCALE[locale.slice(0, 2)] || [];
  for (const [code, pattern] of requiredSections) {
    if (!pattern.test(text)) failures.push(`missing_section:${code}`);
  }

  const requiredDetails = REQUIRED_DETAIL_TEXT_BY_LOCALE[locale] || REQUIRED_DETAIL_TEXT_BY_LOCALE[locale.slice(0, 2)] || [];
  for (const [code, pattern] of requiredDetails) {
    if (!pattern.test(text)) failures.push(`missing_detail:${code}`);
  }

  return failures;
}

function buildDryRunResult(options) {
  return {
    ok: true,
    executed: false,
    api_origin: options.apiOrigin,
    locale: options.locale,
    surface_version: SNAPSHOT_SURFACE_VERSION,
    required_operator_inputs: ["attempt_id", "result_access_token"],
    fixture: {
      attempt_hash: hashId(options.attemptId),
      access_token_present: Boolean(options.accessToken),
    },
    pdf: null,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = buildDryRunResult(options);

  if (options.execute) {
    if (!options.attemptId || !options.accessToken) {
      throw new Error("--execute requires --attempt-id and --access-token, or matching MBTI_RESULT_PAGE_PDF_SMOKE_* env values");
    }

    const pdf = await requestResultPagePdf({
      apiOrigin: options.apiOrigin,
      attemptId: options.attemptId,
      accessToken: options.accessToken,
    });
    const text = extractPdfText(pdf.bytes);
    const failures = auditPdf({
      pdf,
      text,
      locale: options.locale,
      minPdfBytes: options.minPdfBytes,
    });

    result.executed = true;
    result.ok = failures.length === 0;
    result.pdf = {
      status: pdf.status,
      content_type: pdf.contentType,
      bytes: pdf.bytes.length,
      text_extract_available: text.length > 0,
      headers: pdf.headers,
      forbidden_hits: failures,
    };
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (options.execute) {
    console.log(
      `[mbti-result-page-pdf-smoke] attempt_hash=${result.fixture.attempt_hash} pdf_status=${result.pdf?.status ?? "n/a"} forbidden_hits=${result.pdf?.forbidden_hits?.length ?? 0}`
    );
  } else {
    console.log("[mbti-result-page-pdf-smoke] dry-run ok; add --execute with an operator fixture to audit a rendered PDF.");
  }

  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(`[mbti-result-page-pdf-smoke] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
