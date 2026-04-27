import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const CANDIDATE_DIR = process.env.PHASE8B_CANDIDATE_DIR;
const OUTPUT_DIR =
  process.env.PHASE8C1_OUTPUT_DIR ??
  `/tmp/fm_enneagram_phase8c1_${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_")}`;

const EXPECTED_MANIFEST_SHA256 =
  "87f7eb874eb162ff158b5d3ac5e4393218d045054b2f0e3e0eddc09c6c3ea556";
const EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256 =
  "ac5bdaab3c761b0d01a56f92679aa58341110d64de0f47a1fa0062b64f76f97f";
const EXPECTED_PAYLOAD_COUNT = 630;

const BRANCH_CATEGORIES = [
  "low_resonance_response",
  "partial_resonance_response",
  "diffuse_convergence_response",
  "close_call_pair",
  "scene_localization_response",
  "fc144_recommendation_response",
] as const;

const INTERNAL_METADATA = [
  "selection_guidance",
  "editor_note",
  "qa_note",
  "safety_note",
  "import_policy",
  "replacement_policy",
  "codex_policy",
  "qa_policy",
  "body_quality",
  "preflight_self_check",
  "schema_version",
  "registry",
  "composer",
  "frontend",
  "score_profile",
  "selection",
  "SHOULD_NOT_RENDER",
];

const POLLUTION_STRINGS = [
  "通过通过",
  "如果用户",
  "这条资产",
  "结果页应",
  "结果页里",
  "职业建议应",
  "适合放在",
  "可以作为入口",
  "模块",
  "后台",
  "Codex",
  "schema",
  "registry",
  "composer",
  "frontend",
  "内容资产",
  "selection",
  "score_profile",
];

const JOINING_ERRORS = [
  "能能",
  "这能能",
  "让能",
  "让能把",
  "被被",
  "把把",
  "把让",
  "。 可以",
  "。 请",
  "审判。，",
];

const FALLBACK_STRINGS = [
  "This module is using the generic renderer.",
  "当前模块使用通用渲染。",
  "Missing scene localization fallback",
  "missing_pair_fallback",
  "frontend fallback",
];

const FC144_BOUNDARY_STRINGS = [
  "FC144 更准确",
  "更准确",
  "最准确",
  "终极判型",
  "最终判型",
  "最终答案",
  "第二套结果页",
  "第二套产品",
  "重新判型",
  "确认最终类型",
  "E105 和 FC144 分数可比较",
  "分数可比较",
  "直接比较分数",
  "纠错",
  "修正结果",
  "覆盖 E105",
  "替代 E105",
];

type JsonRecord = Record<string, unknown>;

type CandidateManifest = {
  out_of_launch_scope?: unknown;
  payload_counts?: Record<string, number>;
  runtime_registry_manifest?: {
    path?: string;
    sha256?: string;
  };
  [key: string]: unknown;
};

type CandidateHashes = {
  candidate_manifest_sha256?: string;
  runtime_registry_manifest_sha256?: string;
  [key: string]: unknown;
};

type PreviewContent = {
  asset_key?: string;
  version?: string;
  body_zh?: string;
  short_body_zh?: string;
  cta_zh?: string;
  pair_key?: string;
  canonical_pair_key?: string;
  fc144_recommendation_context?: string;
  [key: string]: unknown;
};

type PreviewModule = {
  category?: string;
  module_key?: string;
  moduleKey?: string;
  content?: PreviewContent | PreviewContent[] | null;
  [key: string]: unknown;
};

type PreviewFixture = {
  preview_context?: Record<string, unknown>;
  modules?: PreviewModule[];
  pages?: Array<{
    modules?: PreviewModule[];
  }>;
  [key: string]: unknown;
};

type FixtureRecord = {
  attemptId: string;
  fileName: string;
  fixture: PreviewFixture;
  modules: PreviewModule[];
};

type CandidateContext = {
  candidateDir: string;
  manifestPath: string;
  hashesPath: string;
  rollbackPlanPath: string;
  manifest: CandidateManifest;
  hashes: CandidateHashes;
  manifestSha256Actual: string;
  payloadDir: string;
  payloadFiles: string[];
  fixtures: FixtureRecord[];
};

type BranchDuplicateCounts = Record<(typeof BRANCH_CATEGORIES)[number], number>;

type FixtureRunResult = {
  attemptId: string;
  fixtureName: string;
  viewport: "desktop" | "mobile";
  metadataLeaks: string[];
  pollutionHits: string[];
  joiningHits: string[];
  fallbackHits: string[];
  fc144BoundaryHits: string[];
  clippingIssues: string[];
  hasHorizontalOverflow: boolean;
  missingPairFallbackVisibleCount: number;
  duplicateBranchCardCounts: BranchDuplicateCounts;
};

type Summary = {
  verdict: string;
  output_dir: string;
  candidate_source_directory: string | null;
  candidate_manifest_hash_expected: string;
  candidate_manifest_hash_actual: string | null;
  runtime_registry_manifest_hash_expected: string;
  runtime_registry_manifest_hash_recorded: string | null;
  desktop_rendered_count: number;
  mobile_rendered_count: number;
  metadata_leak_visible_count: number;
  pollution_hit_count: number;
  joining_hit_count: number;
  fallback_hit_count: number;
  fc144_boundary_violation_count: number;
  layout_issue_count: number;
  duplicate_low_resonance_visible_count: number;
  duplicate_partial_resonance_visible_count: number;
  duplicate_diffuse_convergence_visible_count: number;
  duplicate_close_call_pair_visible_count: number;
  duplicate_scene_localization_visible_count: number;
  duplicate_fc144_recommendation_visible_count: number;
  missing_pair_fallback_visible_count: number;
  production_import_happened: false;
  full_replacement_happened: false;
};

class CandidateStructureGapError extends Error {}

function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function ensureOutputDir(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function writeMarkdownReport(filename: string, lines: string[]): void {
  ensureOutputDir();
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), `${lines.join("\n")}\n`, "utf8");
}

function writeSummary(summary: Summary): void {
  ensureOutputDir();
  fs.writeFileSync(path.join(OUTPUT_DIR, "phase8c1_summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function emptyBranchCounts(): BranchDuplicateCounts {
  return {
    low_resonance_response: 0,
    partial_resonance_response: 0,
    diffuse_convergence_response: 0,
    close_call_pair: 0,
    scene_localization_response: 0,
    fc144_recommendation_response: 0,
  };
}

function baseSummary(): Summary {
  return {
    verdict: "BLOCKED_BY_CANDIDATE_STRUCTURE_GAP",
    output_dir: OUTPUT_DIR,
    candidate_source_directory: CANDIDATE_DIR ?? null,
    candidate_manifest_hash_expected: EXPECTED_MANIFEST_SHA256,
    candidate_manifest_hash_actual: null,
    runtime_registry_manifest_hash_expected: EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256,
    runtime_registry_manifest_hash_recorded: null,
    desktop_rendered_count: 0,
    mobile_rendered_count: 0,
    metadata_leak_visible_count: 0,
    pollution_hit_count: 0,
    joining_hit_count: 0,
    fallback_hit_count: 0,
    fc144_boundary_violation_count: 0,
    layout_issue_count: 0,
    duplicate_low_resonance_visible_count: 0,
    duplicate_partial_resonance_visible_count: 0,
    duplicate_diffuse_convergence_visible_count: 0,
    duplicate_close_call_pair_visible_count: 0,
    duplicate_scene_localization_visible_count: 0,
    duplicate_fc144_recommendation_visible_count: 0,
    missing_pair_fallback_visible_count: 0,
    production_import_happened: false,
    full_replacement_happened: false,
  };
}

function extractModules(fixture: PreviewFixture): PreviewModule[] {
  const topLevelModules = Array.isArray(fixture.modules) ? fixture.modules : [];
  const pageModules =
    Array.isArray(fixture.pages) && fixture.pages.length > 0
      ? fixture.pages.flatMap((page) => (Array.isArray(page.modules) ? page.modules : []))
      : [];

  return [...topLevelModules, ...pageModules];
}

function moduleCategory(module: PreviewModule): string {
  if (typeof module.category === "string") {
    return module.category;
  }

  const content = module.content;
  if (content && !Array.isArray(content) && typeof content === "object" && typeof content.category === "string") {
    return content.category;
  }

  const moduleKey =
    typeof module.module_key === "string"
      ? module.module_key
      : typeof module.moduleKey === "string"
        ? module.moduleKey
        : "";

  if (moduleKey.startsWith("asset_preview_")) {
    return moduleKey.replace(/^asset_preview_/, "");
  }

  return "";
}

function collectHits(haystack: string, needles: string[]): string[] {
  return needles.filter((needle) => haystack.includes(needle));
}

function collectFc144BoundaryHits(haystack: string): string[] {
  return FC144_BOUNDARY_STRINGS.filter((needle) => {
    if (!haystack.includes(needle)) {
      return false;
    }

    if (needle === "纠错" || needle === "修正结果") {
      if (/(不建议|先别|别|不)[\s\S]{0,8}纠错/.test(haystack) || /(不建议|先别|别|不)[\s\S]{0,8}修正结果/.test(haystack)) {
        return false;
      }
    }

    return true;
  });
}

function discoverPayloadDir(candidateDir: string, manifest: CandidateManifest): string {
  const directManifestPathCandidates = [
    manifest.payload_dir,
    manifest.payload_path,
    (manifest as JsonRecord).candidate_payload_dir,
    (manifest as JsonRecord).candidate_payload_path,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => (path.isAbsolute(value) ? value : path.join(candidateDir, value)));

  for (const possibleDir of directManifestPathCandidates) {
    if (fs.existsSync(possibleDir) && fs.statSync(possibleDir).isDirectory()) {
      return possibleDir;
    }
  }

  const preferredDirNames = [
    "candidate_payloads",
    "payloads",
    "preview_payloads",
    "report_payloads",
    "production_equivalent_payloads",
  ];

  for (const dirName of preferredDirNames) {
    const possibleDir = path.join(candidateDir, dirName);
    if (fs.existsSync(possibleDir) && fs.statSync(possibleDir).isDirectory()) {
      return possibleDir;
    }
  }

  throw new CandidateStructureGapError(
    `Candidate payload source cannot be found under ${candidateDir}. Expected a payload directory such as candidate_payloads/, payloads/, preview_payloads/, report_payloads/, or a manifest-declared payload path.`,
  );
}

function getPayloadFiles(payloadDir: string): string[] {
  return fs
    .readdirSync(payloadDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, "en"));
}

function buildFixtureRecord(payloadDir: string, fileName: string): FixtureRecord {
  const fixture = JSON.parse(fs.readFileSync(path.join(payloadDir, fileName), "utf8")) as PreviewFixture;
  const previewContext = fixture.preview_context ?? {};
  if (typeof previewContext !== "object") {
    throw new CandidateStructureGapError(`[${fileName}] missing preview_context`);
  }

  const typeId = String(previewContext.type_id ?? "").trim();
  if (!typeId) {
    throw new CandidateStructureGapError(`[${fileName}] missing preview_context.type_id`);
  }

  const modules = extractModules(fixture);
  if (modules.length === 0) {
    throw new CandidateStructureGapError(`[${fileName}] fixture contains no modules`);
  }

  return {
    attemptId: path.basename(fileName, ".json"),
    fileName,
    fixture,
    modules,
  };
}

function inspectCandidateBase(): CandidateContext {
  if (!CANDIDATE_DIR) {
    throw new CandidateStructureGapError("Missing required env var: PHASE8B_CANDIDATE_DIR");
  }

  if (!fs.existsSync(CANDIDATE_DIR)) {
    throw new CandidateStructureGapError(`Missing candidate directory: ${CANDIDATE_DIR}`);
  }

  const manifestPath = path.join(CANDIDATE_DIR, "candidate_manifest.json");
  const hashesPath = path.join(CANDIDATE_DIR, "candidate_hashes.json");
  const rollbackPlanPath = path.join(CANDIDATE_DIR, "rollback_plan.md");

  if (!fs.existsSync(manifestPath)) {
    throw new CandidateStructureGapError(`Missing candidate manifest: ${manifestPath}`);
  }
  if (!fs.existsSync(hashesPath)) {
    throw new CandidateStructureGapError(`Missing candidate hashes: ${hashesPath}`);
  }
  if (!fs.existsSync(rollbackPlanPath)) {
    throw new CandidateStructureGapError(`Missing rollback plan: ${rollbackPlanPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as CandidateManifest;
  const hashes = JSON.parse(fs.readFileSync(hashesPath, "utf8")) as CandidateHashes;

  const manifestSha256Actual = sha256File(manifestPath);
  if (manifestSha256Actual !== EXPECTED_MANIFEST_SHA256) {
    throw new Error(
      `Candidate manifest hash mismatch. expected=${EXPECTED_MANIFEST_SHA256} actual=${manifestSha256Actual}`,
    );
  }

  if (String(hashes.candidate_manifest_sha256 ?? "") !== EXPECTED_MANIFEST_SHA256) {
    throw new Error(
      `candidate_hashes.json recorded candidate manifest hash does not match expected value ${EXPECTED_MANIFEST_SHA256}`,
    );
  }

  if (String(hashes.runtime_registry_manifest_sha256 ?? "") !== EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256) {
    throw new Error(
      `candidate_hashes.json recorded runtime registry hash does not match expected value ${EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256}`,
    );
  }

  const manifestRuntimeSha = String(manifest.runtime_registry_manifest?.sha256 ?? "");
  if (manifestRuntimeSha && manifestRuntimeSha !== EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256) {
    throw new Error(
      `candidate_manifest.json recorded runtime registry hash does not match expected value ${EXPECTED_RUNTIME_REGISTRY_MANIFEST_SHA256}`,
    );
  }

  const outOfLaunchScope = Array.isArray(manifest.out_of_launch_scope) ? manifest.out_of_launch_scope : [];
  if (!outOfLaunchScope.includes("1R-I") || !outOfLaunchScope.includes("1R-J")) {
    throw new CandidateStructureGapError("Candidate manifest does not explicitly mark 1R-I / 1R-J as out_of_launch_scope");
  }

  return {
    candidateDir: CANDIDATE_DIR,
    manifestPath,
    hashesPath,
    rollbackPlanPath,
    manifest,
    hashes,
    manifestSha256Actual,
    payloadDir: "",
    payloadFiles: [],
    fixtures: [],
  };
}

function loadCandidateContext(): CandidateContext {
  const candidate = inspectCandidateBase();
  const payloadDir = discoverPayloadDir(candidate.candidateDir, candidate.manifest);
  const payloadFiles = getPayloadFiles(payloadDir);
  if (payloadFiles.length !== EXPECTED_PAYLOAD_COUNT) {
    throw new CandidateStructureGapError(
      `Expected ${EXPECTED_PAYLOAD_COUNT} candidate payload fixtures in ${payloadDir}, received ${payloadFiles.length}`,
    );
  }

  candidate.payloadDir = payloadDir;
  candidate.payloadFiles = payloadFiles;
  candidate.fixtures = payloadFiles.map((fileName) => buildFixtureRecord(payloadDir, fileName));

  return candidate;
}

async function installRouteMocks(page: Page, fixtureRecord: FixtureRecord): Promise<void> {
  const reportEnvelope = {
    ok: true,
    scale_code: "ENNEAGRAM",
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      _meta: {
        enneagram_report_v2: fixtureRecord.fixture,
      },
    },
  };

  await page.route("**/api/track", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          token: "phase8c1-guest-token",
          user_id: "phase8c1-guest-user",
        },
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/report-access(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: fixtureRecord.attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "unavailable",
        reason_code: "report_ready",
        actions: {
          page_href: `/en/result/${fixtureRecord.attemptId}`,
        },
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(reportEnvelope),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/result(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        meta: { scale_code: "ENNEAGRAM" },
        result: {
          _meta: {
            enneagram_report_v2: fixtureRecord.fixture,
          },
        },
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/submission(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "ATTEMPT_NOT_FOUND",
        },
      }),
    });
  });

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/enneagram/observation(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          observation_state_v1: null,
        }),
      });
    },
  );
}

async function collectClippingIssues(page: Page, viewportWidth: number): Promise<string[]> {
  return page.locator('[data-testid^="enneagram-asset-backed-"]').evaluateAll((elements, width) => {
    return elements.flatMap((element, index) => {
      const rect = element.getBoundingClientRect();
      const issues: string[] = [];
      const testId = element.getAttribute("data-testid") ?? `asset-backed-${index}`;

      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(`${testId}:zero-box`);
      }
      if (element.scrollWidth > element.clientWidth + 1) {
        issues.push(`${testId}:scroll-overflow`);
      }
      if (rect.left < -1 || rect.right > width + 1) {
        issues.push(`${testId}:viewport-clipping`);
      }

      return issues;
    });
  }, viewportWidth);
}

async function runFixture(
  page: Page,
  fixtureRecord: FixtureRecord,
  viewport: { name: "desktop" | "mobile"; width: number; height: number },
): Promise<FixtureRunResult> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await installRouteMocks(page, fixtureRecord);
  await page.goto(`/en/result/${fixtureRecord.attemptId}`);

  await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();

  const duplicateBranchCardCounts = emptyBranchCounts();

  for (const category of BRANCH_CATEGORIES) {
    const expectedInFixture = fixtureRecord.modules.filter((module) => moduleCategory(module) === category).length;
    const cards = page.getByTestId(`enneagram-asset-backed-${category}`);
    const visibleCount = await cards.count();
    if (expectedInFixture > 0) {
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toBeVisible();
    }
    duplicateBranchCardCounts[category] = Math.max(0, visibleCount - 1);
  }

  const bodyText = await page.locator("body").innerText();
  const metadataLeaks = collectHits(bodyText, INTERNAL_METADATA);
  const pollutionHits = collectHits(bodyText, POLLUTION_STRINGS);
  const joiningHits = collectHits(bodyText, JOINING_ERRORS);
  const fallbackHits = collectHits(bodyText, FALLBACK_STRINGS);
  const fc144BoundaryHits = collectFc144BoundaryHits(bodyText);
  const missingPairFallbackVisibleCount = bodyText.includes("missing_pair_fallback") ? 1 : 0;

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });

  const clippingIssues = await collectClippingIssues(page, viewport.width);
  await page.unrouteAll({ behavior: "ignoreErrors" });

  return {
    attemptId: fixtureRecord.attemptId,
    fixtureName: fixtureRecord.fileName,
    viewport: viewport.name,
    metadataLeaks,
    pollutionHits,
    joiningHits,
    fallbackHits,
    fc144BoundaryHits,
    clippingIssues,
    hasHorizontalOverflow,
    missingPairFallbackVisibleCount,
    duplicateBranchCardCounts,
  };
}

function verdictForSummary(summary: Summary): string {
  if (summary.candidate_manifest_hash_actual !== EXPECTED_MANIFEST_SHA256) {
    return "BLOCKED_BY_CANDIDATE_HASH_MISMATCH";
  }
  if (summary.metadata_leak_visible_count > 0) {
    return "BLOCKED_BY_METADATA_LEAK";
  }
  if (summary.pollution_hit_count > 0 || summary.joining_hit_count > 0 || summary.fallback_hit_count > 0) {
    return "BLOCKED_BY_COPY_POLLUTION";
  }
  if (
    summary.duplicate_low_resonance_visible_count > 0 ||
    summary.duplicate_partial_resonance_visible_count > 0 ||
    summary.duplicate_diffuse_convergence_visible_count > 0 ||
    summary.duplicate_close_call_pair_visible_count > 0 ||
    summary.duplicate_scene_localization_visible_count > 0 ||
    summary.duplicate_fc144_recommendation_visible_count > 0
  ) {
    return "BLOCKED_BY_DUPLICATE_SELECTION";
  }
  if (summary.fc144_boundary_violation_count > 0) {
    return "BLOCKED_BY_FC144_BOUNDARY";
  }
  if (summary.layout_issue_count > 0) {
    return "BLOCKED_BY_RENDERED_LAYOUT";
  }
  return "PASS_FOR_PHASE_8C_RETRY";
}

function writeReports(candidate: CandidateContext | null, summary: Summary, results: FixtureRunResult[], notes: string[]): void {
  ensureOutputDir();

  writeMarkdownReport("Phase8C1_ProductionEquivalentTooling.md", [
    "# Phase8C1 Production-equivalent Candidate E2E Tooling",
    "## Verdict",
    `- verdict: ${summary.verdict}`,
    `- candidate_source_directory: ${summary.candidate_source_directory ?? "missing"}`,
    `- candidate_manifest_hash_actual: ${summary.candidate_manifest_hash_actual ?? "missing"}`,
    `- candidate_manifest_hash_expected: ${summary.candidate_manifest_hash_expected}`,
    `- runtime_registry_manifest_hash_recorded: ${summary.runtime_registry_manifest_hash_recorded ?? "missing"}`,
    `- runtime_registry_manifest_hash_expected: ${summary.runtime_registry_manifest_hash_expected}`,
    `- desktop_rendered_count: ${summary.desktop_rendered_count}`,
    `- mobile_rendered_count: ${summary.mobile_rendered_count}`,
    `- metadata_leak_visible_count: ${summary.metadata_leak_visible_count}`,
    `- pollution_hit_count: ${summary.pollution_hit_count}`,
    `- joining_hit_count: ${summary.joining_hit_count}`,
    `- fallback_hit_count: ${summary.fallback_hit_count}`,
    `- fc144_boundary_violation_count: ${summary.fc144_boundary_violation_count}`,
    `- duplicate_low_resonance_visible_count: ${summary.duplicate_low_resonance_visible_count}`,
    `- duplicate_partial_resonance_visible_count: ${summary.duplicate_partial_resonance_visible_count}`,
    `- duplicate_diffuse_convergence_visible_count: ${summary.duplicate_diffuse_convergence_visible_count}`,
    `- duplicate_close_call_pair_visible_count: ${summary.duplicate_close_call_pair_visible_count}`,
    `- duplicate_scene_localization_visible_count: ${summary.duplicate_scene_localization_visible_count}`,
    `- duplicate_fc144_recommendation_visible_count: ${summary.duplicate_fc144_recommendation_visible_count}`,
    `- missing_pair_fallback_visible_count: ${summary.missing_pair_fallback_visible_count}`,
    `- layout_issue_count: ${summary.layout_issue_count}`,
    "## Candidate inspection",
    `- manifest: ${candidate?.manifestPath ?? "missing"}`,
    `- hashes: ${candidate?.hashesPath ?? "missing"}`,
    `- rollback_plan: ${candidate?.rollbackPlanPath ?? "missing"}`,
    `- payload_dir: ${candidate?.payloadDir ?? "missing"}`,
    `- payload_fixture_count: ${candidate?.payloadFiles.length ?? 0}`,
    "## Notes",
    ...notes.map((note) => `- ${note}`),
  ]);

  writeMarkdownReport("Phase8C1_DesktopRenderedQA.md", [
    "# Phase8C1 Desktop Rendered QA",
    "| fixture | metadata_leaks | pollution_hits | joining_hits | fallback_hits | fc144_boundary_hits | clipping_issues | overflow |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...results
      .filter((result) => result.viewport === "desktop")
      .map(
        (result) =>
          `| ${result.fixtureName} | ${result.metadataLeaks.length} | ${result.pollutionHits.length} | ${result.joiningHits.length} | ${result.fallbackHits.length} | ${result.fc144BoundaryHits.length} | ${result.clippingIssues.length} | ${result.hasHorizontalOverflow ? "yes" : "no"} |`,
      ),
  ]);

  writeMarkdownReport("Phase8C1_MobileRenderedQA.md", [
    "# Phase8C1 Mobile Rendered QA",
    "| fixture | metadata_leaks | pollution_hits | joining_hits | fallback_hits | fc144_boundary_hits | clipping_issues | overflow |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...results
      .filter((result) => result.viewport === "mobile")
      .map(
        (result) =>
          `| ${result.fixtureName} | ${result.metadataLeaks.length} | ${result.pollutionHits.length} | ${result.joiningHits.length} | ${result.fallbackHits.length} | ${result.fc144BoundaryHits.length} | ${result.clippingIssues.length} | ${result.hasHorizontalOverflow ? "yes" : "no"} |`,
      ),
  ]);

  writeSummary(summary);
}

test.describe("ENNEAGRAM Phase 8-C-1 production-equivalent candidate E2E tooling", () => {
  test("validates candidate directory and renders candidate-backed report fixtures when available", async ({ page }) => {
    const summary = baseSummary();
    let candidate: CandidateContext | null = null;
    const results: FixtureRunResult[] = [];
    const notes: string[] = [];

    try {
      candidate = inspectCandidateBase();
      summary.candidate_manifest_hash_actual = candidate.manifestSha256Actual;
      summary.runtime_registry_manifest_hash_recorded = String(
        candidate.hashes.runtime_registry_manifest_sha256 ?? candidate.manifest.runtime_registry_manifest?.sha256 ?? "",
      );

      candidate = loadCandidateContext();

      for (const fixtureRecord of candidate.fixtures) {
        results.push(
          await runFixture(page, fixtureRecord, { name: "desktop", width: 1280, height: 900 }),
        );
        results.push(
          await runFixture(page, fixtureRecord, { name: "mobile", width: 390, height: 844 }),
        );
      }

      summary.desktop_rendered_count = results.filter((result) => result.viewport === "desktop").length;
      summary.mobile_rendered_count = results.filter((result) => result.viewport === "mobile").length;
      summary.metadata_leak_visible_count = results.reduce((sum, result) => sum + result.metadataLeaks.length, 0);
      summary.pollution_hit_count = results.reduce((sum, result) => sum + result.pollutionHits.length, 0);
      summary.joining_hit_count = results.reduce((sum, result) => sum + result.joiningHits.length, 0);
      summary.fallback_hit_count = results.reduce((sum, result) => sum + result.fallbackHits.length, 0);
      summary.fc144_boundary_violation_count = results.reduce((sum, result) => sum + result.fc144BoundaryHits.length, 0);
      summary.layout_issue_count = results.reduce(
        (sum, result) => sum + result.clippingIssues.length + (result.hasHorizontalOverflow ? 1 : 0),
        0,
      );
      summary.missing_pair_fallback_visible_count = results.reduce(
        (sum, result) => sum + result.missingPairFallbackVisibleCount,
        0,
      );
      summary.duplicate_low_resonance_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.low_resonance_response,
        0,
      );
      summary.duplicate_partial_resonance_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.partial_resonance_response,
        0,
      );
      summary.duplicate_diffuse_convergence_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.diffuse_convergence_response,
        0,
      );
      summary.duplicate_close_call_pair_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.close_call_pair,
        0,
      );
      summary.duplicate_scene_localization_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.scene_localization_response,
        0,
      );
      summary.duplicate_fc144_recommendation_visible_count = results.reduce(
        (sum, result) => sum + result.duplicateBranchCardCounts.fc144_recommendation_response,
        0,
      );
      summary.verdict = verdictForSummary(summary);

      notes.push("Candidate payload source discovered and consumed through real /en/result route.");
    } catch (error) {
      if (error instanceof Error) {
        notes.push(error.message);
        if (error.message.includes("hash mismatch")) {
          summary.verdict = "BLOCKED_BY_CANDIDATE_HASH_MISMATCH";
        } else if (error instanceof CandidateStructureGapError) {
          summary.verdict = "BLOCKED_BY_CANDIDATE_STRUCTURE_GAP";
        } else {
          summary.verdict = "BLOCKED_BY_FRONTEND_REGRESSION";
        }
      } else {
        notes.push("Unknown failure while preparing production-equivalent candidate tooling.");
        summary.verdict = "BLOCKED_BY_FRONTEND_REGRESSION";
      }

      writeReports(candidate, summary, results, notes);
      throw error;
    }

    writeReports(candidate, summary, results, notes);
    expect(summary.verdict).toBe("PASS_FOR_PHASE_8C_RETRY");
  });
});
