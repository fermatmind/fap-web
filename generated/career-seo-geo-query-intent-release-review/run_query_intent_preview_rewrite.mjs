import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("generated/career-seo-geo-query-intent-release-review");
const CANDIDATE_JSONL = path.resolve("generated/career-query-intent-projection-candidates/search_projection_candidate.jsonl");
const COHORT_JSON = path.join(OUTPUT_DIR, "preview_50_slug_cohort.json");
const OUTPUT_JSONL = path.join(OUTPUT_DIR, "search_projection_candidate_preview_v1.jsonl");
const OUTPUT_CSV = path.join(OUTPUT_DIR, "search_projection_candidate_preview_v1.csv");

const FORBIDDEN_RUNTIME_PATTERN = /(?:canonical|noindex|sitemap|llms|robots|JSON-LD|schema\.org|source_id|evidence_id|row_hash|search_projection":)/i;
const OLD_TEMPLATE_PATTERN =
  /(?:页面已覆盖职业定义、工作内容、适配信号与风险变化|covers the occupation definition, work activities, fit signals, and AI-era risk context|What does a [A-Z][A-Za-z]+s do|职业诊断|适合谁)/i;
const UNSUPPORTED_CLAIM_PATTERN =
  /(?:guaranteed|officially endorsed|will get hired|will increase salary|best career|must choose|一定|保证|官方背书|必然|排名第一)/i;
const CJK_PATTERN = /[\u3400-\u9fff]/;

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, headers = null) {
  const finalHeaders = headers || (rows[0] ? Object.keys(rows[0]) : []);
  fs.writeFileSync(
    filePath,
    `${[finalHeaders.join(","), ...rows.map((row) => finalHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n")}\n`,
  );
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readCandidates() {
  return fs.readFileSync(CANDIDATE_JSONL, "utf8").trim().split("\n").map((line) => JSON.parse(line));
}

function normalizeTitleZh(title, fallback) {
  const cleaned = String(title || fallback || "")
    .replace(/职业诊断/g, "")
    .replace(/适合谁[？?]?/g, "")
    .replace(/[？?]\s*$/g, "")
    .replace(/\s+/g, "")
    .trim();
  return cleaned || fallback || "该职业";
}

function normalizeTitleEn(title, fallback) {
  return String(title || fallback || "")
    .replace(/\s+/g, " ")
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/\bFor\b/g, "for")
    .trim();
}

function familyFor(slug) {
  const lower = slug.toLowerCase();
  if (/nurse|physician|surgeon|medical|clinical|therap|dent|pharmac|health|care/.test(lower)) return "medical";
  if (/air-traffic|aircraft|pilot|flight|aviation/.test(lower)) return "aviation";
  if (/law|judge|legal|adjudicator|hearing/.test(lower)) return "legal";
  if (/teacher|education|instructor|school|literacy/.test(lower)) return "education";
  if (/actor|writer|designer|artist|choreographer|music|creative/.test(lower)) return "creative";
  if (/engineer|developer|architect|technician|technologist/.test(lower)) return "technical";
  if (/electrician|mechanic|operator|installer|repair|machine|tender/.test(lower)) return "trade";
  if (/manager|administrator|administrative|services/.test(lower)) return "management";
  if (/accountant|auditor|actuar|finance|budget|credit/.test(lower)) return "finance";
  if (/wildlife|zoolog|environment|forest|conservation|biolog|scientist/.test(lower)) return "science";
  return "general";
}

const zhFamilyFocus = {
  medical: "临床责任、记录判断和患者沟通边界",
  aviation: "运行安全、异常处置和责任交接",
  legal: "事实采信、程序边界和责任归属",
  education: "学习者差异、反馈关系和准备路径",
  creative: "作品风格、受众关系和职业路径",
  technical: "工具链、项目交付和问题排查",
  trade: "现场流程、设备安全和可验证技能",
  management: "组织协作、资源安排和风险边界",
  finance: "数据核对、判断边界和职业准备",
  science: "观察记录、方法边界和长期积累",
  general: "日常任务、能力要求和下一步准备",
};

const enFamilyFocus = {
  medical: "clinical responsibility, documentation judgment, and patient-facing boundaries",
  aviation: "operational safety, exception handling, and handoff responsibility",
  legal: "fact review, procedural boundaries, and accountability",
  education: "learner differences, feedback work, and preparation paths",
  creative: "portfolio signals, audience context, and career direction",
  technical: "toolchains, project work, and troubleshooting evidence",
  trade: "field workflow, equipment safety, and demonstrable skill evidence",
  management: "coordination, resource decisions, and operating risk",
  finance: "record review, judgment boundaries, and preparation signals",
  science: "observation records, method boundaries, and long-term skill building",
  general: "daily work, skill requirements, and next-step preparation",
};

function rewriteCandidate(candidate, cohortRow) {
  const family = familyFor(candidate.slug);
  const isZh = candidate.locale === "zh-CN";
  const title = isZh
    ? normalizeTitleZh(cohortRow.title_zh, cohortRow.title_en)
    : normalizeTitleEn(cohortRow.title_en, cohortRow.slug);
  const secondary = Array.isArray(candidate.secondary_query_intents) ? candidate.secondary_query_intents : [];
  const common = {
    slug: candidate.slug,
    locale: candidate.locale,
    primary_query_intent: candidate.primary_query_intent,
    secondary_query_intents: secondary,
    source_page_signals: {
      ...candidate.source_page_signals,
      preview_rewrite_basis: "50_slug_release_review",
      family_focus: family,
    },
    candidate_only: true,
    runtime_approved: false,
    release_gate_required: "SEO_GEO_RELEASE_GATE_REQUIRED",
    preview_version: "v1",
  };

  if (isZh) {
    return {
      ...common,
      snippet_candidate: `如果你正在比较${title}，先看这页的工作内容、能力准备、匹配信号和 AI 影响，再判断是否值得继续深入。重点关注${zhFamilyFocus[family]}。`,
      faq_candidates: [
        `${title}的日常工作重点是什么？`,
        `准备${title}方向时，哪些技能和项目证据最值得先看？`,
        `${title}在 AI 时代更需要保留哪些人的判断？`,
      ],
      internal_link_anchor_candidates: [`${title}职业概览`, `${title}技能与准备`, `${title}匹配度和相邻职业`],
    };
  }

  return {
    ...common,
    snippet_candidate: `Use the ${title} career page to compare daily work, preparation signals, fit cues, adjacent options, and AI-era change before choosing a next step. The useful lens is ${enFamilyFocus[family]}.`,
    faq_candidates: [
      `What does ${title} work involve?`,
      `Which skills and project evidence matter most for ${title}?`,
      `How is AI changing the judgment needed in ${title} roles?`,
    ],
    internal_link_anchor_candidates: [`${title} career overview`, `${title} skills and preparation`, `${title} fit and adjacent careers`],
  };
}

function qualityFindings(row) {
  const serialized = JSON.stringify(row);
  const text = `${row.snippet_candidate}\n${row.faq_candidates.join("\n")}\n${row.internal_link_anchor_candidates.join("\n")}`;
  const findings = [];
  if (row.candidate_only !== true || row.runtime_approved !== false) findings.push("candidate_flags_invalid");
  if (FORBIDDEN_RUNTIME_PATTERN.test(serialized)) findings.push("runtime_or_internal_term_present");
  if (OLD_TEMPLATE_PATTERN.test(text)) findings.push("old_template_or_title_suffix_present");
  if (UNSUPPORTED_CLAIM_PATTERN.test(text)) findings.push("unsupported_claim_risk");
  if (row.locale === "en" && CJK_PATTERN.test(text)) findings.push("english_candidate_contains_chinese");
  if (!row.snippet_candidate || row.faq_candidates.length !== 3 || row.internal_link_anchor_candidates.length !== 3) {
    findings.push("candidate_shape_invalid");
  }
  return findings;
}

function refreshShaManifest() {
  const files = fs.readdirSync(OUTPUT_DIR).map((name) => path.join(OUTPUT_DIR, name)).filter((file) => fs.statSync(file).isFile()).sort();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "sha256_manifest.json"),
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        file_count: files.length,
        files: files.map((file) => ({
          path: path.relative(process.cwd(), file),
          sha256: sha256File(file),
          bytes: fs.statSync(file).size,
        })),
      },
      null,
      2,
    )}\n`,
  );
}

function main() {
  const cohort = JSON.parse(fs.readFileSync(COHORT_JSON, "utf8")).slugs;
  const candidates = readCandidates();
  const candidateByKey = new Map(candidates.map((candidate) => [`${candidate.slug}|${candidate.locale}`, candidate]));
  const outputRows = [];
  const diffRows = [];
  for (const cohortRow of cohort) {
    for (const locale of ["zh-CN", "en"]) {
      const original = candidateByKey.get(`${cohortRow.slug}|${locale}`);
      if (!original) throw new Error(`Missing candidate ${cohortRow.slug}|${locale}`);
      const rewritten = rewriteCandidate(original, cohortRow);
      outputRows.push(rewritten);
      diffRows.push({
        slug: cohortRow.slug,
        locale,
        primary_query_intent: rewritten.primary_query_intent,
        old_snippet: original.snippet_candidate,
        new_snippet: rewritten.snippet_candidate,
        old_faq_candidates: original.faq_candidates.join("|"),
        new_faq_candidates: rewritten.faq_candidates.join("|"),
        old_anchor_candidates: original.internal_link_anchor_candidates.join("|"),
        new_anchor_candidates: rewritten.internal_link_anchor_candidates.join("|"),
      });
    }
  }

  const gateRows = outputRows.map((row) => ({
    slug: row.slug,
    locale: row.locale,
    findings: qualityFindings(row).join("|"),
    ready_for_human_release_review: qualityFindings(row).length === 0,
  }));
  const failedRows = gateRows.filter((row) => row.findings);
  fs.writeFileSync(OUTPUT_JSONL, `${outputRows.map((row) => JSON.stringify(row)).join("\n")}\n`);
  writeCsv(
    OUTPUT_CSV,
    outputRows.map((row) => ({
      slug: row.slug,
      locale: row.locale,
      primary_query_intent: row.primary_query_intent,
      secondary_query_intents: row.secondary_query_intents.join("|"),
      snippet_candidate: row.snippet_candidate,
      faq_candidates: row.faq_candidates.join("|"),
      internal_link_anchor_candidates: row.internal_link_anchor_candidates.join("|"),
      candidate_only: row.candidate_only,
      runtime_approved: row.runtime_approved,
      preview_version: row.preview_version,
    })),
  );
  writeCsv(path.join(OUTPUT_DIR, "preview_rewrite_diff.csv"), diffRows);
  writeCsv(path.join(OUTPUT_DIR, "preview_rewrite_quality_gate.csv"), gateRows);
  const report = {
    generated_at: new Date().toISOString(),
    final_conclusion: failedRows.length === 0 ? "QUERY_INTENT_50_SLUG_PREVIEW_REWRITE_PASS" : "QUERY_INTENT_50_SLUG_PREVIEW_REWRITE_REPAIR_REQUIRED",
    input_slug_count: cohort.length,
    output_rows: outputRows.length,
    failed_rows: failedRows.length,
    candidate_only: true,
    runtime_approved_count: outputRows.filter((row) => row.runtime_approved === true).length,
    runtime_modified: false,
    seo_runtime_modified: false,
    cms_written: false,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "preview_rewrite_quality_gate.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "preview_rewrite_quality_gate.md"),
    `# Query Intent 50-Slug Preview Rewrite Gate\n\n- Final conclusion: \`${report.final_conclusion}\`\n- Input slugs: \`${report.input_slug_count}\`\n- Output rows: \`${report.output_rows}\`\n- Failed rows: \`${report.failed_rows}\`\n- Candidate only: \`true\`\n- Runtime approved count: \`0\`\n- Runtime modified: \`false\`\n- SEO runtime modified: \`false\`\n- CMS written: \`false\`\n\nThe generated \`search_projection_candidate_preview_v1.jsonl\` is a clean candidate preview package for human release review only. It is not approved for runtime use.\n`,
  );
  refreshShaManifest();
  console.log(JSON.stringify(report, null, 2));
}

main();
