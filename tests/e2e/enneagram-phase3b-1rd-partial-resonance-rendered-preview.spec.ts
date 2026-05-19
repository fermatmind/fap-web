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
  partialAxis: string;
  reportV2: Record<string, unknown>;
  moduleCount: number;
  categories: string[];
  batches: string[];
};

type FixtureResult = {
  fixture: string;
  typeId: string;
  partialAxis: string;
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
  duplicatePartialResonanceVisibleCount: number;
  partialResonanceBatchMismatch: boolean;
};

type ViewportSummary = {
  viewport: "desktop" | "mobile";
  width: number;
  height: number;
  results: FixtureResult[];
};

const viewportSummaries: ViewportSummary[] = [];

function loadPreviewFixtures(): PreviewFixture[] {
  const previewDir = process.env.PHASE3A_PREVIEW_PAYLOAD_DIR?.trim();
  if (!previewDir) {
    throw new Error("PHASE3A_PREVIEW_PAYLOAD_DIR is required for Phase 3-B rendered QA.");
  }

  if (!fs.existsSync(previewDir)) {
    throw new Error(`Phase 3-A preview payload directory does not exist: ${previewDir}`);
  }

  const files = fs
    .readdirSync(previewDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (files.length !== 90) {
    throw new Error(`Expected 90 preview fixtures, received ${files.length} from ${previewDir}.`);
  }

  return files.map((fileName) => {
    const filePath = path.join(previewDir, fileName);
    const reportV2 = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    const previewContext = (reportV2.preview_context as Record<string, unknown> | undefined) ?? {};
    const modules = Array.isArray(reportV2.modules) ? reportV2.modules : [];

    return {
      filePath,
      fileName,
      typeId: String(previewContext.type_id ?? ""),
      partialAxis: String(previewContext.partial_axis ?? ""),
      reportV2,
      moduleCount: modules.length,
      categories: modules
        .map((module) => String((module as { content?: { category?: unknown } }).content?.category ?? ""))
        .filter(Boolean),
      batches: modules
        .map((module) => String((module as { content?: { asset_key?: unknown } }).content?.asset_key ?? ""))
        .map((assetKey) =>
          assetKey.includes("1R_A")
            ? "1R-A"
            : assetKey.includes("1R_B")
              ? "1R-B"
              : assetKey.includes("1R_C")
                ? "1R-C"
                : assetKey.includes("1R_D")
                  ? "1R-D"
                  : "unknown",
        )
        .filter(Boolean),
    };
  });
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
      body: JSON.stringify({ ok: true, fm_token: "fm_phase3b_enneagram_preview" }),
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

function writePhase3BReports(summary: { outputDir: string; fixtureCount: number; desktop: ViewportSummary; mobile: ViewportSummary }) {
  const { outputDir, fixtureCount, desktop, mobile } = summary;
  const allResults = [...desktop.results, ...mobile.results];
  const metadataLeakCount = allResults.reduce((sum, item) => sum + item.metadataLeaks.length, 0);
  const pollutionCount = allResults.reduce((sum, item) => sum + item.pollutionHits.length, 0);
  const joiningCount = allResults.reduce((sum, item) => sum + item.joiningHits.length, 0);
  const fallbackCount = allResults.reduce((sum, item) => sum + item.fallbackHits.length, 0);
  const clippingCount = allResults.reduce((sum, item) => sum + item.clippingIssues.length, 0);
  const overflowCount = allResults.filter((item) => item.horizontalOverflow).length;
  const duplicatePartialResonanceVisibleCount = allResults.reduce((sum, item) => sum + item.duplicatePartialResonanceVisibleCount, 0);
  const partialResonanceBatchMismatchCount = allResults.filter((item) => item.partialResonanceBatchMismatch).length;
  const uniqueTypes = new Set(allResults.map((item) => item.typeId));
  const uniqueAxes = new Set(allResults.map((item) => item.partialAxis));

  let verdict = "PASS_FOR_PHASE_3C_STAGING_SIGNOFF";
  if (metadataLeakCount > 0) {
    verdict = "BLOCKED_BY_METADATA_LEAK";
  } else if (pollutionCount > 0 || joiningCount > 0 || fallbackCount > 0) {
    verdict = "BLOCKED_BY_COPY_POLLUTION";
  } else if (duplicatePartialResonanceVisibleCount > 0 || partialResonanceBatchMismatchCount > 0) {
    verdict = "BLOCKED_BY_DUPLICATE_PARTIAL_RESONANCE";
  } else if (clippingCount > 0 || overflowCount > 0) {
    verdict = "BLOCKED_BY_RENDERED_LAYOUT";
  }

  const coverage = [
    "# Phase3B Rendered QA Coverage",
    "",
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_fixture_count: ${desktop.results.length}`,
    `- mobile_fixture_count: ${mobile.results.length}`,
    `- type_coverage: ${uniqueTypes.size}/9`,
    `- partial_axis_coverage: ${uniqueAxes.size}/10`,
    "",
    "| fixture | type_id | partial_axis | module_count | batches | rendered |",
    "|---|---|---|---:|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.typeId} | ${item.partialAxis} | ${item.moduleCount} | ${item.batches.join(", ")} | ${item.rendered ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const desktopMd = [
    "# Phase3B Desktop Rendered QA",
    "",
    `- fixture_count: ${desktop.results.length}`,
    `- horizontal_overflow_count: ${desktop.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${desktop.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | partial_axis | clipping_issues | overflow | duplicate_partial_resonance | batch_mismatch |",
    "|---|---|---|---|---:|---|",
    ...desktop.results.map(
      (item) =>
        `| ${item.fixture} | ${item.partialAxis} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicatePartialResonanceVisibleCount} | ${item.partialResonanceBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const mobileMd = [
    "# Phase3B Mobile Rendered QA",
    "",
    `- fixture_count: ${mobile.results.length}`,
    `- horizontal_overflow_count: ${mobile.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${mobile.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | partial_axis | clipping_issues | overflow | duplicate_partial_resonance | batch_mismatch |",
    "|---|---|---|---|---:|---|",
    ...mobile.results.map(
      (item) =>
        `| ${item.fixture} | ${item.partialAxis} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicatePartialResonanceVisibleCount} | ${item.partialResonanceBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const metadataMd = [
    "# Phase3B Metadata Leakage QA",
    "",
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    "",
    "| fixture | partial_axis | leaks |",
    "|---|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.partialAxis} | ${item.metadataLeaks.join(", ")} |`),
    "",
  ].join("\n");

  const copyMd = [
    "# Phase3B Copy Pollution QA",
    "",
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    "",
    "| fixture | partial_axis | pollution_hits | joining_hits | fallback_hits |",
    "|---|---|---|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.partialAxis} | ${item.pollutionHits.join(", ")} | ${item.joiningHits.join(", ")} | ${item.fallbackHits.join(", ")} |`,
    ),
    "",
  ].join("\n");

  const duplicateMd = [
    "# Phase3B Duplicate Partial Resonance QA",
    "",
    `- duplicate_partial_resonance_visible_count: ${duplicatePartialResonanceVisibleCount}`,
    `- partial_resonance_batch_mismatch_count: ${partialResonanceBatchMismatchCount}`,
    "",
    "| fixture | partial_axis | duplicate_visible_count | batch_mismatch |",
    "|---|---|---:|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.partialAxis} | ${item.duplicatePartialResonanceVisibleCount} | ${item.partialResonanceBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const goNoGo = [
    "# Phase3B Go / No-Go",
    "",
    `- verdict: ${verdict}`,
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_rendered: ${desktop.results.length}/90`,
    `- mobile_rendered: ${mobile.results.length}/90`,
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    `- duplicate_partial_resonance_visible_count: ${duplicatePartialResonanceVisibleCount}`,
    `- layout_issue_count: ${clippingCount + overflowCount}`,
    `- partial_axis_coverage: ${uniqueAxes.size}/10`,
    `- type_coverage: ${uniqueTypes.size}/9`,
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
    duplicate_partial_resonance_visible_count: duplicatePartialResonanceVisibleCount,
    layout_issue_count: clippingCount + overflowCount,
    production_import_happened: "no",
    full_replacement_happened: "no",
  };

  writeReportFile(outputDir, "Phase3B_RenderedQA_Coverage.md", coverage);
  writeReportFile(outputDir, "Phase3B_DesktopRenderedQA.md", desktopMd);
  writeReportFile(outputDir, "Phase3B_MobileRenderedQA.md", mobileMd);
  writeReportFile(outputDir, "Phase3B_MetadataLeakageQA.md", metadataMd);
  writeReportFile(outputDir, "Phase3B_CopyPollutionQA.md", copyMd);
  writeReportFile(outputDir, "Phase3B_DuplicatePartialResonanceQA.md", duplicateMd);
  writeReportFile(outputDir, "Phase3B_GoNoGo.md", goNoGo);
  writeReportFile(outputDir, "phase3b_summary.json", JSON.stringify(jsonSummary, null, 2));
}

test.describe("ENNEAGRAM Phase 3-B partial-resonance rendered QA", () => {
  const fixtures = loadPreviewFixtures();
  const outputDir = buildReportOutputDir(process.env.PHASE3B_OUTPUT_DIR, "fm_enneagram_phase3b");

  test.afterAll(() => {
    const desktop = viewportSummaries.find((item) => item.viewport === "desktop");
    const mobile = viewportSummaries.find((item) => item.viewport === "mobile");
    if (!desktop || !mobile) {
      throw new Error("Phase 3-B summaries are incomplete.");
    }
    fs.mkdirSync(outputDir, { recursive: true });
    writePhase3BReports({
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
    test(`${viewport.name}: renders all Phase 3-A partial-resonance fixtures without leaks, duplication, or layout regressions`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const results: FixtureResult[] = [];

      for (const fixture of fixtures) {
        const attemptId = `phase3b-${fixture.typeId}-${fixture.partialAxis}`;
        await installPreviewMocks(page, attemptId, fixture.reportV2);
        await page.goto(`/en/result/${attemptId}`);

        await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();
        await expect(page.getByTestId("enneagram-asset-backed-partial_resonance_response")).toBeVisible();

        const bodyText = await page.locator("body").innerText();
        const metadataLeaks = INTERNAL_METADATA.filter((token) => bodyText.includes(token) || bodyText.includes(`SHOULD_NOT_RENDER_${token.toUpperCase()}`));
        const pollutionHits = POLLUTION_STRINGS.filter((token) => bodyText.includes(token));
        const joiningHits = JOINING_ERRORS.filter((token) => bodyText.includes(token));
        const fallbackHits = ["This module is using the generic renderer.", "当前模块使用通用渲染。"].filter((token) => bodyText.includes(token));
        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const clippingIssues = await collectClippingIssues(page, viewport.width);
        const partialResonanceCards = page.getByTestId("enneagram-asset-backed-partial_resonance_response");
        const partialResonanceCardCount = await partialResonanceCards.count();
        const partialResonanceCardText = partialResonanceCardCount > 0 ? await partialResonanceCards.first().innerText() : "";
        const duplicatePartialResonanceVisibleCount = partialResonanceCardCount > 1 ? partialResonanceCardCount - 1 : 0;
        const partialResonanceBatchMismatch = !partialResonanceCardText.includes("1R_D");

        results.push({
          fixture: fixture.fileName,
          typeId: fixture.typeId,
          partialAxis: fixture.partialAxis,
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
          duplicatePartialResonanceVisibleCount,
          partialResonanceBatchMismatch,
        });

        expect(metadataLeaks).toEqual([]);
        expect(pollutionHits).toEqual([]);
        expect(joiningHits).toEqual([]);
        expect(fallbackHits).toEqual([]);
        expect(horizontalOverflow).toBe(false);
        expect(clippingIssues).toEqual([]);
        expect(partialResonanceCardCount).toBe(1);
        expect(partialResonanceBatchMismatch).toBe(false);

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
