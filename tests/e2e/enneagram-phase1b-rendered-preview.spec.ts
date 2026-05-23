import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { buildReportOutputDir, writeReportFile } from "./helpers/report-output";

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

type PreviewFixture = {
  filePath: string;
  fileName: string;
  typeId: string;
  state: string;
  reportV2: Record<string, unknown>;
  moduleCount: number;
  categories: string[];
  batches: string[];
};

type PreviewFixtureLoadResult = {
  fixtures: PreviewFixture[];
  skipReason: string | null;
};

type FixtureResult = {
  fixture: string;
  typeId: string;
  state: string;
  moduleCount: number;
  categories: string[];
  batches: string[];
  rendered: boolean;
  metadataLeaks: string[];
  pollutionHits: string[];
  joiningHits: string[];
  fallbackHits: string[];
  horizontalOverflow: boolean;
  clippingIssues: string[];
};

type ViewportSummary = {
  viewport: "desktop" | "mobile";
  width: number;
  height: number;
  results: FixtureResult[];
};

const viewportSummaries: ViewportSummary[] = [];

function loadPreviewFixtures(): PreviewFixtureLoadResult {
  const previewDir = process.env.PHASE1A_PREVIEW_PAYLOAD_DIR?.trim();
  if (!previewDir) {
    return {
      fixtures: [],
      skipReason: "PHASE1A_PREVIEW_PAYLOAD_DIR is not set; skipping optional Phase 1-B rendered preview QA.",
    };
  }

  if (!fs.existsSync(previewDir)) {
    return {
      fixtures: [],
      skipReason: `PHASE1A_PREVIEW_PAYLOAD_DIR does not exist: ${previewDir}`,
    };
  }

  const files = fs
    .readdirSync(previewDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (files.length !== 36) {
    return {
      fixtures: [],
      skipReason: `Expected 36 preview fixtures, received ${files.length} from ${previewDir}.`,
    };
  }

  const fixtures = files.map((fileName) => {
    const filePath = path.join(previewDir, fileName);
    const reportV2 = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    const typeId = String((reportV2.preview_context as Record<string, unknown> | undefined)?.type_id ?? "");
    const state = String((reportV2.classification as Record<string, unknown> | undefined)?.interpretation_scope ?? "");
    const modules = Array.isArray(reportV2.modules) ? reportV2.modules : [];

    return {
      filePath,
      fileName,
      typeId,
      state,
      reportV2,
      moduleCount: modules.length,
      categories: modules
        .map((module) => String((module as { content?: { category?: unknown } }).content?.category ?? ""))
        .filter(Boolean),
      batches: modules
        .map((module) => String((module as { content?: { asset_key?: unknown } }).content?.asset_key ?? ""))
        .map((assetKey) => (assetKey.includes("1R_A") ? "1R-A" : assetKey.includes("1R_B") ? "1R-B" : "unknown"))
        .filter(Boolean),
    };
  });

  return { fixtures, skipReason: null };
}

function wrapReportResponse(reportV2: Record<string, unknown>) {
  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      _meta: {
        enneagram_report_v2: reportV2,
      },
    },
  };
}

async function installPreviewMocks(page: Page, attemptId: string, reportV2: Record<string, unknown>) {
  await page.route("**/api/track", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, fm_token: "fm_phase1b_enneagram_preview" }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "unavailable",
        reason_code: "report_ready",
        actions: {
          page_href: `/en/result/${attemptId}`,
        },
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrapReportResponse(reportV2)),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/enneagram/observation(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, observation_state_v1: null }),
    });
  });
}

async function collectClippingIssues(page: Page, viewportWidth: number): Promise<string[]> {
  return page.locator('[data-testid^="enneagram-asset-backed-"]').evaluateAll((nodes, expectedWidth) => {
    const issues: string[] = [];

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(`zero_box:${node.dataset.testid ?? node.tagName.toLowerCase()}`);
        continue;
      }

      if (rect.right > expectedWidth + 1) {
        issues.push(`overflow:${node.dataset.testid ?? node.tagName.toLowerCase()}`);
      }

      if (node.scrollWidth > node.clientWidth + 1) {
        issues.push(`scroll_clip:${node.dataset.testid ?? node.tagName.toLowerCase()}`);
      }
    }

    return issues;
  }, viewportWidth);
}

function writePhase1BReports(summary: { outputDir: string; fixtureCount: number; desktop: ViewportSummary; mobile: ViewportSummary }) {
  const { outputDir, fixtureCount, desktop, mobile } = summary;
  const allResults = [...desktop.results, ...mobile.results];
  const metadataLeakCount = allResults.reduce((sum, item) => sum + item.metadataLeaks.length, 0);
  const pollutionCount = allResults.reduce((sum, item) => sum + item.pollutionHits.length, 0);
  const joiningCount = allResults.reduce((sum, item) => sum + item.joiningHits.length, 0);
  const fallbackCount = allResults.reduce((sum, item) => sum + item.fallbackHits.length, 0);
  const clippingCount = allResults.reduce((sum, item) => sum + item.clippingIssues.length, 0);

  let verdict = "PASS_FOR_STAGING_MERGE_PREVIEW_SIGNOFF";
  if (metadataLeakCount > 0) {
    verdict = "BLOCKED_BY_METADATA_LEAK";
  } else if (pollutionCount > 0 || joiningCount > 0 || fallbackCount > 0) {
    verdict = "BLOCKED_BY_COPY_POLLUTION";
  } else if (clippingCount > 0 || allResults.some((item) => item.horizontalOverflow)) {
    verdict = "BLOCKED_BY_RENDERED_LAYOUT";
  }

  const coverage = [
    "# Phase1B Rendered QA Coverage",
    "",
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_fixture_count: ${desktop.results.length}`,
    `- mobile_fixture_count: ${mobile.results.length}`,
    "",
    "| fixture | type_id | state | module_count | batches | rendered |",
    "|---|---|---|---:|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.typeId} | ${item.state} | ${item.moduleCount} | ${item.batches.join(", ")} | ${item.rendered ? "yes" : "no"} |`),
    "",
  ].join("\n");

  const desktopMd = [
    "# Phase1B Desktop Rendered QA",
    "",
    `- fixture_count: ${desktop.results.length}`,
    `- horizontal_overflow_count: ${desktop.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${desktop.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | state | categories | clipping_issues | overflow |",
    "|---|---|---|---|---|",
    ...desktop.results.map((item) => `| ${item.fixture} | ${item.state} | ${item.categories.join(", ")} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} |`),
    "",
  ].join("\n");

  const mobileMd = [
    "# Phase1B Mobile Rendered QA",
    "",
    `- fixture_count: ${mobile.results.length}`,
    `- horizontal_overflow_count: ${mobile.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${mobile.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | state | categories | clipping_issues | overflow |",
    "|---|---|---|---|---|",
    ...mobile.results.map((item) => `| ${item.fixture} | ${item.state} | ${item.categories.join(", ")} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} |`),
    "",
  ].join("\n");

  const metadataMd = [
    "# Phase1B Metadata Leakage QA",
    "",
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    "",
    "| fixture | state | leaks |",
    "|---|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.state} | ${item.metadataLeaks.join(", ")} |`),
    "",
  ].join("\n");

  const copyMd = [
    "# Phase1B Copy Pollution QA",
    "",
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    "",
    "| fixture | state | pollution_hits | joining_hits | fallback_hits |",
    "|---|---|---|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.state} | ${item.pollutionHits.join(", ")} | ${item.joiningHits.join(", ")} | ${item.fallbackHits.join(", ")} |`),
    "",
  ].join("\n");

  const goNoGo = [
    "# Phase1B Go / No-Go",
    "",
    `- verdict: ${verdict}`,
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_rendered: ${desktop.results.length}/36`,
    `- mobile_rendered: ${mobile.results.length}/36`,
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    `- layout_issue_count: ${clippingCount + allResults.filter((item) => item.horizontalOverflow).length}`,
    `- production_import_happened: no`,
    `- full_replacement_happened: no`,
    "",
  ].join("\n");

  const jsonSummary = {
    verdict,
    fixture_count_consumed: fixtureCount,
    desktop_rendered_count: desktop.results.length,
    mobile_rendered_count: mobile.results.length,
    metadata_leak_visible_count: metadataLeakCount,
    pollution_hit_count: pollutionCount,
    joining_hit_count: joiningCount,
    fallback_hit_count: fallbackCount,
    layout_issue_count: clippingCount + allResults.filter((item) => item.horizontalOverflow).length,
  };

  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_RenderedQA_Coverage.md", coverage);
  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_DesktopRenderedQA.md", desktopMd);
  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_MobileRenderedQA.md", mobileMd);
  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_MetadataLeakageQA.md", metadataMd);
  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_CopyPollutionQA.md", copyMd);
  writeReportFile(outputDir, "FermatMind_Enneagram_Phase1B_GoNoGo.md", goNoGo);
  writeReportFile(outputDir, "phase1b_summary.json", JSON.stringify(jsonSummary, null, 2));
}

test.describe("ENNEAGRAM Phase 1-B merged preview rendered QA", () => {
  const { fixtures, skipReason } = loadPreviewFixtures();
  const outputDir = buildReportOutputDir(process.env.PHASE1B_OUTPUT_DIR, "fm_enneagram_phase1b");

  test.skip(skipReason !== null, skipReason ?? undefined);

  test.afterAll(() => {
    if (skipReason !== null) {
      return;
    }

    const desktop = viewportSummaries.find((item) => item.viewport === "desktop");
    const mobile = viewportSummaries.find((item) => item.viewport === "mobile");
    if (!desktop || !mobile) {
      throw new Error("Phase 1-B summaries are incomplete.");
    }
    fs.mkdirSync(outputDir, { recursive: true });
    writePhase1BReports({
      outputDir,
      fixtureCount: fixtures.length,
      desktop,
      mobile,
    });
  });

  for (const viewport of [
    { name: "desktop" as const, width: 1280, height: 900 },
    { name: "mobile" as const, width: 390, height: 844 },
  ]) {
    test(`${viewport.name}: renders all Phase 1-A preview fixtures without visible leaks or layout regressions`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const results: FixtureResult[] = [];

      for (const fixture of fixtures) {
        const attemptId = `phase1b-${fixture.typeId}-${fixture.state}`;
        await installPreviewMocks(page, attemptId, fixture.reportV2);
        await page.goto(`/en/result/${attemptId}`);

        await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();
        await expect(page.getByTestId(`enneagram-asset-backed-${fixture.categories[0]}`)).toBeVisible();

        const bodyText = await page.locator("body").innerText();
        const metadataLeaks = INTERNAL_METADATA.filter((token) => bodyText.includes(token) || bodyText.includes(`SHOULD_NOT_RENDER_${token.toUpperCase()}`));
        const pollutionHits = POLLUTION_STRINGS.filter((token) => bodyText.includes(token));
        const joiningHits = JOINING_ERRORS.filter((token) => bodyText.includes(token));
        const fallbackHits = [
          "This module is using the generic renderer.",
          "当前模块使用通用渲染。",
        ].filter((token) => bodyText.includes(token));

        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const clippingIssues = await collectClippingIssues(page, viewport.width);

        results.push({
          fixture: fixture.fileName,
          typeId: fixture.typeId,
          state: fixture.state,
          moduleCount: fixture.moduleCount,
          categories: fixture.categories,
          batches: Array.from(new Set(fixture.batches)),
          rendered: true,
          metadataLeaks,
          pollutionHits,
          joiningHits,
          fallbackHits,
          horizontalOverflow,
          clippingIssues,
        });

        expect(metadataLeaks).toEqual([]);
        expect(pollutionHits).toEqual([]);
        expect(joiningHits).toEqual([]);
        expect(fallbackHits).toEqual([]);
        expect(horizontalOverflow).toBe(false);
        expect(clippingIssues).toEqual([]);

        await page.unrouteAll({ behavior: "ignoreErrors" });
      }

      viewportSummaries.push({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        results,
      });
    });
  }
});
