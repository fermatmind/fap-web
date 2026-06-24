import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("generated/career-seo-geo-query-intent-release-review");
const CANDIDATE_JSONL = path.resolve("generated/career-query-intent-projection-candidates/search_projection_candidate.jsonl");
const INTENT_MATRIX = path.resolve("generated/career-seo-geo-query-intent-audit/per_slug_intent_matrix.csv");
const RELEASE_GATE = path.resolve("generated/career-seo-geo-release-gate/release_gate_report.json");

const HIGH_RISK_PATTERNS = [
  "nurse",
  "physician",
  "surgeon",
  "air-traffic",
  "pilot",
  "aircraft",
  "law",
  "judge",
  "military",
  "teacher",
  "counselor",
  "engineer",
  "electrician",
  "technician",
  "writer",
  "actor",
  "designer",
  "manager",
];
const INTENTS = ["what-is", "salary", "career-path", "skills", "AI-impact", "fit", "adjacent", "education", "certification"];

function parseCsv(text) {
  const lines = text.trimEnd().split("\n");
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

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

function titleFor(candidate) {
  return candidate.source_page_signals?.h1 || candidate.slug;
}

function qualityFindings(candidate) {
  const findings = [];
  const text = `${candidate.snippet_candidate}\n${candidate.faq_candidates.join("\n")}\n${candidate.internal_link_anchor_candidates.join("\n")}`;
  const title = titleFor(candidate);
  if (/^(Actors|Actuaries|Accountants|Managers|Teachers|Nurses|Engineers|Lawyers|Writers|Designers)\s+covers\b/.test(candidate.snippet_candidate)) {
    findings.push("en_missing_article_or_plural_awkwardness");
  }
  if (/What does a\s+[A-Z][A-Za-z]+s\b/.test(text) || /What does a\s+[A-Z][A-Za-z ]+ and [A-Z][A-Za-z ]+s\b/.test(text)) {
    findings.push("en_question_article_plural_awkwardness");
  }
  if (/职业诊断|适合谁/.test(title) || /职业诊断/.test(text)) {
    findings.push("zh_title_or_candidate_contains_diagnostic_suffix");
  }
  if (/页面已覆盖职业定义、工作内容、适配信号与风险变化/.test(text) || /covers the occupation definition, work activities, fit signals, and AI-era risk context/.test(text)) {
    findings.push("generic_template_phrase");
  }
  if (/AI 影响与职业匹配/.test(text) || /AI impact and fit/.test(text)) {
    findings.push("generic_anchor_template");
  }
  if (candidate.validation_findings?.length) findings.push(...candidate.validation_findings);
  return [...new Set(findings)];
}

function slugSignals(slug) {
  const lower = slug.toLowerCase();
  return HIGH_RISK_PATTERNS.filter((pattern) => lower.includes(pattern)).join("|") || "general";
}

function selectCohort(candidates, matrixRows) {
  const bySlug = new Map();
  for (const row of matrixRows) {
    if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
  }
  const candidateBySlugLocale = new Map(candidates.map((candidate) => [`${candidate.slug}|${candidate.locale}`, candidate]));
  const rows = [...bySlug.values()].map((row) => {
    const zh = candidateBySlugLocale.get(`${row.slug}|zh-CN`);
    const en = candidateBySlugLocale.get(`${row.slug}|en`);
    const findings = [...qualityFindings(zh), ...qualityFindings(en)];
    const missingCount = INTENTS.filter((intent) => row[intent] !== "true").length;
    const highRisk = slugSignals(row.slug);
    let score = 0;
    if (highRisk !== "general") score += 40;
    score += findings.length * 8;
    score += missingCount * 2;
    if (Number(row.seed_ordinal) <= 50) score += 10;
    if (Number(row.seed_ordinal) > 996) score += 10;
    return {
      seed_ordinal: Number(row.seed_ordinal),
      slug: row.slug,
      title_en: row.title_en,
      title_zh: row.title_zh,
      cohort_score: score,
      high_risk_signal: highRisk,
      missing_intent_count: missingCount,
      candidate_quality_findings: findings.join("|"),
      include_reason: "",
    };
  });

  const required = [
    "accountants-and-auditors",
    "actuaries",
    "actors",
    "air-traffic-controllers",
    "registered-nurses",
    "software-developers",
    "lawyers",
    "elementary-school-teachers-except-special-education",
    "electricians",
    "zoologists-and-wildlife-biologists",
  ];
  const selected = new Map();
  for (const slug of required) {
    const row = rows.find((item) => item.slug === slug);
    if (row) selected.set(slug, { ...row, include_reason: "required_regression_or_high_value_sample" });
  }
  for (const row of rows.sort((a, b) => b.cohort_score - a.cohort_score || a.seed_ordinal - b.seed_ordinal)) {
    if (selected.size >= 50) break;
    if (!selected.has(row.slug)) selected.set(row.slug, { ...row, include_reason: row.high_risk_signal !== "general" ? "high_risk_or_quality_review" : "intent_gap_or_template_review" });
  }
  return [...selected.values()].sort((a, b) => a.seed_ordinal - b.seed_ordinal);
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const releaseGate = JSON.parse(fs.readFileSync(RELEASE_GATE, "utf8"));
  const candidates = readCandidates();
  const matrixRows = parseCsv(fs.readFileSync(INTENT_MATRIX, "utf8"));
  const qualityRows = candidates.map((candidate) => ({
    slug: candidate.slug,
    locale: candidate.locale,
    primary_query_intent: candidate.primary_query_intent,
    secondary_query_intents: candidate.secondary_query_intents.join("|"),
    candidate_quality_findings: qualityFindings(candidate).join("|"),
    release_recommendation: qualityFindings(candidate).length ? "rewrite_before_runtime_preview" : "eligible_for_human_review",
    candidate_only: candidate.candidate_only,
    runtime_approved: candidate.runtime_approved,
  }));
  const cohort = selectCohort(candidates, matrixRows);
  const blocked = qualityRows.filter((row) => row.candidate_quality_findings);
  const report = {
    generated_at: new Date().toISOString(),
    final_conclusion: "SEO_GEO_RELEASE_REVIEW_PREVIEW_COHORT_READY",
    source_release_gate_conclusion: releaseGate.final_conclusion,
    candidate_rows: candidates.length,
    quality_review_rows: qualityRows.length,
    candidate_quality_rewrite_required_rows: blocked.length,
    preview_cohort_slug_count: cohort.length,
    runtime_approved_count: 0,
    candidate_only: true,
    runtime_modified: false,
    seo_runtime_modified: false,
    cms_written: false,
    required_next_step: "rewrite_or_approve_50_slug_candidate_preview_before_any_CMS_or_API_runtime_release",
  };

  writeCsv(path.join(OUTPUT_DIR, "candidate_quality_review.csv"), qualityRows);
  writeCsv(path.join(OUTPUT_DIR, "preview_50_slug_cohort.csv"), cohort);
  fs.writeFileSync(path.join(OUTPUT_DIR, "preview_50_slug_cohort.json"), `${JSON.stringify({ row_count: cohort.length, slugs: cohort }, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, "release_review_report.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "release_review_report.md"),
    `# Career SEO/GEO Query Intent Release Review\n\n- Final conclusion: \`${report.final_conclusion}\`\n- Candidate rows: \`${report.candidate_rows}\`\n- Runtime approved rows: \`0\`\n- Candidate quality rewrite required rows: \`${report.candidate_quality_rewrite_required_rows}\`\n- Preview cohort slugs: \`${report.preview_cohort_slug_count}\`\n- Runtime modified: \`false\`\n- SEO runtime modified: \`false\`\n- CMS written: \`false\`\n\nThe candidate layer is complete and quarantined, but release review should not push these rows directly into CMS/API runtime. The first release-review cohort should rewrite or approve the selected 50 slugs before any preview API or CMS ingest work.\n`,
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "next_goal_recommendation.md"),
    `# Next Goal Recommendation\n\nRun a 50-slug query intent candidate editorial rewrite/release-review pass.\n\nInputs:\n- \`generated/career-seo-geo-query-intent-release-review/preview_50_slug_cohort.csv\`\n- \`generated/career-query-intent-projection-candidates/search_projection_candidate.jsonl\`\n\nHard boundaries:\n- do not write CMS\n- do not modify runtime APIs\n- do not modify title/meta/schema/sitemap/llms/canonical/noindex/JSON-LD\n- keep \`runtime_approved=false\` until a separate release PR\n\nGoal:\n- fix generic template phrasing\n- fix English article/plural grammar\n- remove zh diagnostic title suffixes from candidates\n- produce a clean 50-slug \`search_projection_candidate_preview_v1.jsonl\`\n`,
  );
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
  console.log(JSON.stringify(report, null, 2));
}

main();
