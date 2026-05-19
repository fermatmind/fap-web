import fs from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";
import { buildReportOutputDir, writeReportFile } from "./helpers/report-output";

const PREVIEW_PAYLOAD_DIR = process.env.PHASE7A_PREVIEW_PAYLOAD_DIR;
const OUTPUT_DIR = buildReportOutputDir(process.env.PHASE7B_OUTPUT_DIR, "fm_enneagram_phase7b");

const EXPECTED_FIXTURE_COUNT = 90;
const MODULE_CATEGORY = "fc144_recommendation_response";
const MODULE_TEST_ID = `enneagram-asset-backed-${MODULE_CATEGORY}`;
const PROVENANCE_TEST_ID = "enneagram-asset-backed-provenance";
const RESULT_SHELL_TEST_ID = "enneagram-result-shell";

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

type PreviewFixture = {
  preview_context: {
    type_id: number | string;
    fc144_recommendation_context: string;
  } & Record<string, unknown>;
  modules?: PreviewModule[];
  pages?: Array<{
    modules?: PreviewModule[];
  }>;
  provenance?: Record<string, unknown>;
  [key: string]: unknown;
};

type PreviewModule = {
  category?: string;
  moduleKey?: string;
  module_key?: string;
  content?: PreviewContent | PreviewContent[] | null;
  [key: string]: unknown;
};

type PreviewContent = {
  asset_key?: string;
  version?: string;
  body_zh?: string;
  short_body_zh?: string;
  cta_zh?: string;
  fc144_recommendation_context?: string;
  recommendation_strategy?: string;
  [key: string]: unknown;
};

type FixtureRecord = {
  name: string;
  attemptId: string;
  fixture: PreviewFixture;
  fc144Module: PreviewModule;
  fc144Content: PreviewContent;
};

type FixtureRunResult = {
  attemptId: string;
  fixtureName: string;
  viewport: "desktop" | "mobile";
  typeId: string;
  fc144RecommendationContext: string;
  metadataLeaks: string[];
  pollutionHits: string[];
  joiningHits: string[];
  fallbackHits: string[];
  boundaryHits: string[];
  clippingIssues: string[];
  hasHorizontalOverflow: boolean;
  duplicateVisibleCount: number;
  provenanceVisible: string;
};

type Summary = {
  verdict: string;
  output_dir: string;
  fixture_count: number;
  desktop_rendered_count: number;
  mobile_rendered_count: number;
  metadata_leak_visible_count: number;
  pollution_hit_count: number;
  joining_hit_count: number;
  fallback_hit_count: number;
  fc144_boundary_violation_count: number;
  duplicate_fc144_recommendation_visible_count: number;
  layout_issue_count: number;
  production_import_happened: false;
  full_replacement_happened: false;
};

function assertPreviewDir(): string {
  if (!PREVIEW_PAYLOAD_DIR) {
    throw new Error("Missing required env var: PHASE7A_PREVIEW_PAYLOAD_DIR");
  }

  if (!fs.existsSync(PREVIEW_PAYLOAD_DIR)) {
    throw new Error(`Missing preview payload dir: ${PREVIEW_PAYLOAD_DIR}`);
  }

  return PREVIEW_PAYLOAD_DIR;
}

function getPreviewFiles(previewDir: string): string[] {
  return fs
    .readdirSync(previewDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, "en"));
}

function extractModules(fixture: PreviewFixture): PreviewModule[] {
  const topLevelModules = Array.isArray(fixture.modules) ? fixture.modules : [];
  const pageModules =
    Array.isArray(fixture.pages) && fixture.pages.length > 0
      ? fixture.pages.flatMap((page) => (Array.isArray(page.modules) ? page.modules : []))
      : [];

  return [...topLevelModules, ...pageModules];
}

function getSingleFc144Module(fixture: PreviewFixture, fixtureName: string): PreviewModule {
  const modules = extractModules(fixture);
  const fc144Modules = modules.filter((module) => {
    const category =
      typeof module.category === "string"
        ? module.category
        : module.content && !Array.isArray(module.content) && typeof module.content.category === "string"
          ? module.content.category
          : "";
    const moduleKey =
      typeof module.module_key === "string"
        ? module.module_key
        : typeof module.moduleKey === "string"
          ? module.moduleKey
          : "";

    return (
      category === MODULE_CATEGORY ||
      moduleKey === "fc144_recommendation" ||
      moduleKey === "asset_preview_fc144_recommendation_response"
    );
  });
  const dedupedFc144Modules = Array.from(
    new Map(
      fc144Modules.map((module) => {
        const content =
          module.content && !Array.isArray(module.content) && typeof module.content === "object"
            ? module.content
            : {};
        const identity = [
          module.module_key ?? module.moduleKey ?? "",
          content.asset_key ?? "",
          content.version ?? "",
        ].join("::");
        return [identity, module] as const;
      }),
    ).values(),
  );

  if (dedupedFc144Modules.length !== 1) {
    throw new Error(
      `[${fixtureName}] expected exactly one ${MODULE_CATEGORY} module, received ${dedupedFc144Modules.length}`,
    );
  }

  return dedupedFc144Modules[0];
}

function getSingleContent(module: PreviewModule, fixtureName: string): PreviewContent {
  const content = module.content;
  if (Array.isArray(content)) {
    if (content.length !== 1) {
      throw new Error(`[${fixtureName}] expected exactly one content item, received ${content.length}`);
    }

    return (content[0] ?? {}) as PreviewContent;
  }

  if (!content || typeof content !== "object") {
    throw new Error(`[${fixtureName}] missing content object for ${MODULE_CATEGORY}`);
  }

  return content as PreviewContent;
}

function assertFixtureStructure(fixtureName: string, fixture: PreviewFixture): FixtureRecord {
  const previewContext = fixture.preview_context;
  if (!previewContext || typeof previewContext !== "object") {
    throw new Error(`[${fixtureName}] missing preview_context`);
  }

  const typeId = String(previewContext.type_id ?? "").trim();
  const recommendationContext = String(previewContext.fc144_recommendation_context ?? "").trim();

  if (!typeId) {
    throw new Error(`[${fixtureName}] missing preview_context.type_id`);
  }

  if (!recommendationContext) {
    throw new Error(`[${fixtureName}] missing preview_context.fc144_recommendation_context`);
  }

  const fc144Module = getSingleFc144Module(fixture, fixtureName);
  const fc144Content = getSingleContent(fc144Module, fixtureName);
  const assetKey = String(fc144Content.asset_key ?? "").trim();
  const version = String(fc144Content.version ?? "").trim();
  const contentContext = String(fc144Content.fc144_recommendation_context ?? "").trim();
  const provenanceText = `${assetKey} ${version}`.toLowerCase();

  if (!contentContext) {
    throw new Error(`[${fixtureName}] missing fc144_recommendation_context on module content`);
  }

  if (contentContext !== recommendationContext) {
    throw new Error(
      `[${fixtureName}] preview_context.fc144_recommendation_context=${recommendationContext} does not match content=${contentContext}`,
    );
  }

  const has1rhProvenance =
    assetKey.includes("1R_H") ||
    assetKey.includes("1R-H") ||
    provenanceText.includes("batch_1r_h") ||
    provenanceText.includes("batch_1r-h");

  if (!has1rhProvenance) {
    throw new Error(`[${fixtureName}] expected 1R-H provenance, got asset_key=${assetKey} version=${version}`);
  }

  const attemptId = path.basename(fixtureName, ".json");

  return {
    name: fixtureName,
    attemptId,
    fixture,
    fc144Module,
    fc144Content,
  };
}

function loadFixtures(): FixtureRecord[] {
  const previewDir = assertPreviewDir();
  const previewFiles = getPreviewFiles(previewDir);

  if (previewFiles.length !== EXPECTED_FIXTURE_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_FIXTURE_COUNT} preview payload fixtures in ${previewDir}, received ${previewFiles.length}`,
    );
  }

  return previewFiles.map((file) => {
    const raw = fs.readFileSync(path.join(previewDir, file), "utf8");
    const fixture = JSON.parse(raw) as PreviewFixture;
    return assertFixtureStructure(file, fixture);
  });
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
          token: "phase7b-guest-token",
          user_id: "phase7b-guest-user",
        },
      }),
    });
  });

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/report-access(?:\\?.*)?$`),
    async (route) => {
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
    },
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/report(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(reportEnvelope),
      });
    },
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/result(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          meta: {
            scale_code: "ENNEAGRAM",
          },
          result: {
            _meta: {
              enneagram_report_v2: fixtureRecord.fixture,
            },
          },
        }),
      });
    },
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${fixtureRecord.attemptId}/submission(?:\\?.*)?$`),
    async (route) => {
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
    },
  );

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

function collectHits(haystack: string, needles: string[]): string[] {
  return needles.filter((needle) => haystack.includes(needle));
}

function collectBoundaryHits(haystack: string): string[] {
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

function extractEvidenceSnippets(content: PreviewContent): string[] {
  const candidates = [content.short_body_zh, content.body_zh, content.cta_zh]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return candidates
    .map((value) => (value.length > 18 ? value.slice(0, 18) : value))
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 3);
}

async function runFixture(
  page: Page,
  fixtureRecord: FixtureRecord,
  viewport: { name: "desktop" | "mobile"; width: number; height: number },
): Promise<FixtureRunResult> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await installRouteMocks(page, fixtureRecord);

  await page.goto(`/en/result/${fixtureRecord.attemptId}`);

  await expect(page.getByTestId(RESULT_SHELL_TEST_ID)).toBeVisible();
  const fc144Cards = page.getByTestId(MODULE_TEST_ID);
  await expect(fc144Cards).toHaveCount(1);
  await expect(fc144Cards.first()).toBeVisible();
  const fc144CardText = ((await fc144Cards.first().innerText()) ?? "").trim();

  const provenance = page.getByTestId(PROVENANCE_TEST_ID).first();
  await expect(provenance).toBeVisible();
  const provenanceVisible = ((await provenance.textContent()) ?? "").trim();
  expect(
    /1R-H|1R_H|batch_1r_h/i.test(provenanceVisible) ||
      /1R-H|1R_H|batch_1r_h/i.test(String(fixtureRecord.fc144Content.asset_key ?? "")),
  ).toBeTruthy();

  const bodyText = await page.locator("body").innerText();
  const metadataLeaks = collectHits(bodyText, INTERNAL_METADATA);
  const pollutionHits = collectHits(bodyText, POLLUTION_STRINGS);
  const joiningHits = collectHits(bodyText, JOINING_ERRORS);
  const fallbackHits = collectHits(bodyText, FALLBACK_STRINGS);
  const boundaryHits = collectBoundaryHits(fc144CardText);

  const snippets = extractEvidenceSnippets(fixtureRecord.fc144Content);
  for (const snippet of snippets) {
    await expect(fc144Cards.first()).toContainText(snippet);
  }

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });

  const clippingIssues = await collectClippingIssues(page, viewport.width);

  await page.unrouteAll({ behavior: "ignoreErrors" });

  return {
    attemptId: fixtureRecord.attemptId,
    fixtureName: fixtureRecord.name,
    viewport: viewport.name,
    typeId: String(fixtureRecord.fixture.preview_context.type_id),
    fc144RecommendationContext: String(
      fixtureRecord.fixture.preview_context.fc144_recommendation_context,
    ),
    metadataLeaks,
    pollutionHits,
    joiningHits,
    fallbackHits,
    boundaryHits,
    clippingIssues,
    hasHorizontalOverflow,
    duplicateVisibleCount: Math.max(0, (await fc144Cards.count()) - 1),
    provenanceVisible,
  };
}

function verdictForSummary(summary: Summary): string {
  if (summary.desktop_rendered_count !== EXPECTED_FIXTURE_COUNT) {
    return "BLOCKED_BY_DESKTOP_RENDER_FAILURE";
  }
  if (summary.mobile_rendered_count !== EXPECTED_FIXTURE_COUNT) {
    return "BLOCKED_BY_MOBILE_RENDER_FAILURE";
  }
  if (summary.metadata_leak_visible_count > 0) {
    return "BLOCKED_BY_METADATA_LEAK";
  }
  if (summary.pollution_hit_count > 0) {
    return "BLOCKED_BY_COPY_POLLUTION";
  }
  if (summary.joining_hit_count > 0) {
    return "BLOCKED_BY_COPY_JOINING";
  }
  if (summary.fallback_hit_count > 0) {
    return "BLOCKED_BY_FALLBACK_PROSE";
  }
  if (summary.fc144_boundary_violation_count > 0) {
    return "BLOCKED_BY_FC144_BOUNDARY_VIOLATION";
  }
  if (summary.duplicate_fc144_recommendation_visible_count > 0) {
    return "BLOCKED_BY_DUPLICATE_FC144_RECOMMENDATION";
  }
  if (summary.layout_issue_count > 0) {
    return "BLOCKED_BY_LAYOUT_FAILURE";
  }

  return "PASS_FOR_PHASE_7C_STAGING_SIGNOFF";
}

function ensureOutputDir(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function writeMarkdownReport(filename: string, lines: string[]): void {
  writeReportFile(OUTPUT_DIR, filename, `${lines.join("\n")}\n`, "utf8");
}

function writePhase7BReports(results: FixtureRunResult[], fixtures: FixtureRecord[]): Summary {
  ensureOutputDir();

  const desktopResults = results.filter((result) => result.viewport === "desktop");
  const mobileResults = results.filter((result) => result.viewport === "mobile");
  const metadataLeakCount = results.reduce((sum, result) => sum + result.metadataLeaks.length, 0);
  const pollutionCount = results.reduce((sum, result) => sum + result.pollutionHits.length, 0);
  const joiningCount = results.reduce((sum, result) => sum + result.joiningHits.length, 0);
  const fallbackCount = results.reduce((sum, result) => sum + result.fallbackHits.length, 0);
  const boundaryCount = results.reduce((sum, result) => sum + result.boundaryHits.length, 0);
  const duplicateCount = results.reduce((sum, result) => sum + result.duplicateVisibleCount, 0);
  const layoutIssueCount = results.reduce(
    (sum, result) => sum + result.clippingIssues.length + (result.hasHorizontalOverflow ? 1 : 0),
    0,
  );

  const summary: Summary = {
    verdict: "PENDING",
    output_dir: OUTPUT_DIR,
    fixture_count: fixtures.length,
    desktop_rendered_count: desktopResults.length,
    mobile_rendered_count: mobileResults.length,
    metadata_leak_visible_count: metadataLeakCount,
    pollution_hit_count: pollutionCount,
    joining_hit_count: joiningCount,
    fallback_hit_count: fallbackCount,
    fc144_boundary_violation_count: boundaryCount,
    duplicate_fc144_recommendation_visible_count: duplicateCount,
    layout_issue_count: layoutIssueCount,
    production_import_happened: false,
    full_replacement_happened: false,
  };

  summary.verdict = verdictForSummary(summary);

  writeMarkdownReport("Phase7B_RenderedQA_Coverage.md", [
    "# Phase 7-B Rendered QA Coverage",
    `- fixture_count: ${summary.fixture_count}`,
    `- desktop_rendered_count: ${summary.desktop_rendered_count}`,
    `- mobile_rendered_count: ${summary.mobile_rendered_count}`,
    "",
    "## Preview contexts",
    ...fixtures.map(
      (fixture) =>
        `- ${fixture.attemptId}: type=${fixture.fixture.preview_context.type_id}, fc144_recommendation_context=${fixture.fixture.preview_context.fc144_recommendation_context}`,
    ),
  ]);

  writeMarkdownReport("Phase7B_DesktopRenderedQA.md", [
    "# Phase 7-B Desktop Rendered QA",
    `- rendered_count: ${desktopResults.length}/${EXPECTED_FIXTURE_COUNT}`,
    ...desktopResults.map(
      (result) =>
        `- ${result.attemptId}: type=${result.typeId}, context=${result.fc144RecommendationContext}, provenance=${result.provenanceVisible}`,
    ),
  ]);

  writeMarkdownReport("Phase7B_MobileRenderedQA.md", [
    "# Phase 7-B Mobile Rendered QA",
    `- rendered_count: ${mobileResults.length}/${EXPECTED_FIXTURE_COUNT}`,
    ...mobileResults.map(
      (result) =>
        `- ${result.attemptId}: type=${result.typeId}, context=${result.fc144RecommendationContext}, provenance=${result.provenanceVisible}`,
    ),
  ]);

  writeMarkdownReport("Phase7B_MetadataLeakageQA.md", [
    "# Phase 7-B Metadata Leakage QA",
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    ...results
      .filter((result) => result.metadataLeaks.length > 0)
      .map((result) => `- ${result.attemptId}/${result.viewport}: ${result.metadataLeaks.join(", ")}`),
  ]);

  writeMarkdownReport("Phase7B_CopyPollutionQA.md", [
    "# Phase 7-B Copy Pollution QA",
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    ...results
      .filter(
        (result) =>
          result.pollutionHits.length > 0 ||
          result.joiningHits.length > 0 ||
          result.fallbackHits.length > 0,
      )
      .map(
        (result) =>
          `- ${result.attemptId}/${result.viewport}: pollution=[${result.pollutionHits.join(", ")}] joining=[${result.joiningHits.join(", ")}] fallback=[${result.fallbackHits.join(", ")}]`,
      ),
  ]);

  writeMarkdownReport("Phase7B_FC144BoundaryQA.md", [
    "# Phase 7-B FC144 Boundary QA",
    `- fc144_boundary_violation_count: ${boundaryCount}`,
    ...results
      .filter((result) => result.boundaryHits.length > 0)
      .map((result) => `- ${result.attemptId}/${result.viewport}: ${result.boundaryHits.join(", ")}`),
  ]);

  writeMarkdownReport("Phase7B_DuplicateFC144RecommendationQA.md", [
    "# Phase 7-B Duplicate FC144 Recommendation QA",
    `- duplicate_fc144_recommendation_visible_count: ${duplicateCount}`,
    ...results
      .filter((result) => result.duplicateVisibleCount > 0)
      .map((result) => `- ${result.attemptId}/${result.viewport}: duplicateVisibleCount=${result.duplicateVisibleCount}`),
  ]);

  writeMarkdownReport("Phase7B_LayoutQA.md", [
    "# Phase 7-B Layout QA",
    `- layout_issue_count: ${layoutIssueCount}`,
    ...results
      .filter((result) => result.hasHorizontalOverflow || result.clippingIssues.length > 0)
      .map(
        (result) =>
          `- ${result.attemptId}/${result.viewport}: horizontalOverflow=${result.hasHorizontalOverflow} clipping=[${result.clippingIssues.join(", ")}]`,
      ),
  ]);

  writeMarkdownReport("Phase7B_GoNoGo.md", [
    "# Phase 7-B Go / No-Go",
    `- verdict: ${summary.verdict}`,
    `- fixture_count: ${summary.fixture_count}`,
    `- desktop_rendered_count: ${summary.desktop_rendered_count}`,
    `- mobile_rendered_count: ${summary.mobile_rendered_count}`,
    `- metadata_leak_visible_count: ${summary.metadata_leak_visible_count}`,
    `- pollution_hit_count: ${summary.pollution_hit_count}`,
    `- joining_hit_count: ${summary.joining_hit_count}`,
    `- fallback_hit_count: ${summary.fallback_hit_count}`,
    `- fc144_boundary_violation_count: ${summary.fc144_boundary_violation_count}`,
    `- duplicate_fc144_recommendation_visible_count: ${summary.duplicate_fc144_recommendation_visible_count}`,
    `- layout_issue_count: ${summary.layout_issue_count}`,
    "- production_import_happened: false",
    "- full_replacement_happened: false",
  ]);
  writeReportFile(OUTPUT_DIR, "phase7b_summary.json", `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  return summary;
}

test.describe("ENNEAGRAM Phase 7-B FC144 recommendation rendered QA", () => {
  const fixtures = loadFixtures();
  const runResults: FixtureRunResult[] = [];

  test.afterAll(() => {
    writePhase7BReports(runResults, fixtures);
  });

  for (const viewport of [
    { name: "desktop" as const, width: 1280, height: 900 },
    { name: "mobile" as const, width: 390, height: 844 },
  ]) {
    test(`${viewport.name} renders all Phase 7-A FC144 preview fixtures`, async ({ page }) => {
      for (const fixtureRecord of fixtures) {
        const result = await runFixture(page, fixtureRecord, viewport);
        runResults.push(result);

        expect(result.metadataLeaks, `${fixtureRecord.attemptId}/${viewport.name} metadata leaks`).toEqual([]);
        expect(result.pollutionHits, `${fixtureRecord.attemptId}/${viewport.name} pollution hits`).toEqual([]);
        expect(result.joiningHits, `${fixtureRecord.attemptId}/${viewport.name} joining hits`).toEqual([]);
        expect(result.fallbackHits, `${fixtureRecord.attemptId}/${viewport.name} fallback hits`).toEqual([]);
        expect(result.boundaryHits, `${fixtureRecord.attemptId}/${viewport.name} boundary hits`).toEqual([]);
        expect(result.duplicateVisibleCount, `${fixtureRecord.attemptId}/${viewport.name} duplicate cards`).toBe(0);
        expect(result.hasHorizontalOverflow, `${fixtureRecord.attemptId}/${viewport.name} horizontal overflow`).toBe(
          false,
        );
        expect(result.clippingIssues, `${fixtureRecord.attemptId}/${viewport.name} clipping issues`).toEqual([]);
      }
    });
  }
});
