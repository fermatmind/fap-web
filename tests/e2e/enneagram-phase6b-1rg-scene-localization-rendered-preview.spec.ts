import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

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

const FALLBACK_STRINGS = [
  "This module is using the generic renderer.",
  "当前模块使用通用渲染。",
  "Missing scene localization fallback",
  "missing_pair_fallback",
  "frontend fallback",
];

type PreviewFixture = {
  filePath: string;
  fileName: string;
  typeId: string;
  sceneAxis: string;
  reportV2: Record<string, unknown>;
  moduleCount: number;
  categories: string[];
  batches: string[];
  visibleEvidence: string[];
};

type FixtureResult = {
  fixture: string;
  typeId: string;
  sceneAxis: string;
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
  duplicateSceneLocalizationVisibleCount: number;
  sceneLocalizationBatchMismatch: boolean;
};

type ViewportSummary = {
  viewport: "desktop" | "mobile";
  width: number;
  height: number;
  results: FixtureResult[];
};

const viewportSummaries: ViewportSummary[] = [];

function loadPreviewFixtures(): PreviewFixture[] {
  const previewDir = process.env.PHASE6A_PREVIEW_PAYLOAD_DIR?.trim();
  if (!previewDir) {
    throw new Error("PHASE6A_PREVIEW_PAYLOAD_DIR is required for Phase 6-B rendered QA.");
  }

  if (!fs.existsSync(previewDir)) {
    throw new Error(`Missing prerequisite: Phase 6-A preview payload directory does not exist: ${previewDir}`);
  }

  const files = fs
    .readdirSync(previewDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (files.length !== 162) {
    throw new Error(`Expected 162 preview fixtures, received ${files.length} from ${previewDir}.`);
  }

  return files.map((fileName) => {
    const filePath = path.join(previewDir, fileName);
    let reportV2: Record<string, unknown>;

    try {
      reportV2 = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    } catch (error) {
      throw new Error(`Failed to parse Phase 6-A fixture ${fileName}: ${String(error)}`);
    }

    const previewContext = (reportV2.preview_context as Record<string, unknown> | undefined) ?? {};
    const typeId = String(previewContext.type_id ?? "");
    const sceneAxis = String(previewContext.scene_axis ?? "");
    const modules = Array.isArray(reportV2.modules) ? reportV2.modules : [];
    const sceneModules = modules.filter(
      (module) => (module as { content?: { category?: unknown } }).content?.category === "scene_localization_response",
    );
    const sceneContent =
      sceneModules.length === 1 ? ((sceneModules[0] as { content?: Record<string, unknown> }).content ?? {}) : {};
    const sceneAssetKey = String(sceneContent.asset_key ?? "");

    if (!typeId) {
      throw new Error(`Phase 6-A fixture ${fileName} is missing preview_context.type_id.`);
    }
    if (!sceneAxis) {
      throw new Error(`Phase 6-A fixture ${fileName} is missing preview_context.scene_axis.`);
    }
    if (sceneModules.length !== 1) {
      throw new Error(`Phase 6-A fixture ${fileName} must contain exactly one scene_localization_response module.`);
    }
    if (!sceneAssetKey.includes("1R_G")) {
      throw new Error(`Phase 6-A fixture ${fileName} scene_localization_response is not sourced from 1R-G.`);
    }

    return {
      filePath,
      fileName,
      typeId,
      sceneAxis,
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
                  : assetKey.includes("1R_E")
                    ? "1R-E"
                    : assetKey.includes("1R_F")
                      ? "1R-F"
                      : assetKey.includes("1R_G")
                        ? "1R-G"
                        : "unknown",
        )
        .filter(Boolean),
      visibleEvidence: [
        String(sceneContent.short_body_zh ?? ""),
        String(sceneContent.body_zh ?? ""),
        String(sceneContent.cta_zh ?? ""),
      ].filter(Boolean),
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
      body: JSON.stringify({ ok: true, fm_token: "fm_phase6b_enneagram_preview" }),
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

function writePhase6BReports(summary: { outputDir: string; fixtureCount: number; desktop: ViewportSummary; mobile: ViewportSummary }) {
  const { outputDir, fixtureCount, desktop, mobile } = summary;
  const allResults = [...desktop.results, ...mobile.results];
  const metadataLeakCount = allResults.reduce((sum, item) => sum + item.metadataLeaks.length, 0);
  const pollutionCount = allResults.reduce((sum, item) => sum + item.pollutionHits.length, 0);
  const joiningCount = allResults.reduce((sum, item) => sum + item.joiningHits.length, 0);
  const fallbackCount = allResults.reduce((sum, item) => sum + item.fallbackHits.length, 0);
  const clippingCount = allResults.reduce((sum, item) => sum + item.clippingIssues.length, 0);
  const overflowCount = allResults.filter((item) => item.horizontalOverflow).length;
  const duplicateSceneLocalizationVisibleCount = allResults.reduce(
    (sum, item) => sum + item.duplicateSceneLocalizationVisibleCount,
    0,
  );
  const sceneLocalizationBatchMismatchCount = allResults.filter((item) => item.sceneLocalizationBatchMismatch).length;
  const uniqueSceneAxes = new Set(allResults.map((item) => item.sceneAxis));
  const uniqueTypeScenePairs = new Set(allResults.map((item) => `${item.typeId}:${item.sceneAxis}`));

  let verdict = "PASS_FOR_PHASE_6C_STAGING_SIGNOFF";
  if (metadataLeakCount > 0) {
    verdict = "BLOCKED_BY_METADATA_LEAK";
  } else if (pollutionCount > 0 || joiningCount > 0 || fallbackCount > 0) {
    verdict = "BLOCKED_BY_COPY_POLLUTION";
  } else if (duplicateSceneLocalizationVisibleCount > 0 || sceneLocalizationBatchMismatchCount > 0) {
    verdict = "BLOCKED_BY_DUPLICATE_SCENE_LOCALIZATION";
  } else if (clippingCount > 0 || overflowCount > 0) {
    verdict = "BLOCKED_BY_RENDERED_LAYOUT";
  }

  const coverage = [
    "# Phase6B Rendered QA Coverage",
    "",
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_fixture_count: ${desktop.results.length}`,
    `- mobile_fixture_count: ${mobile.results.length}`,
    `- unique_scene_axis_coverage: ${uniqueSceneAxes.size}/18`,
    `- unique_type_scene_pairs: ${uniqueTypeScenePairs.size}/162`,
    "",
    "| fixture | type_id | scene_axis | module_count | batches | rendered |",
    "|---|---:|---|---:|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.moduleCount} | ${item.batches.join(", ")} | ${item.rendered ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const desktopMd = [
    "# Phase6B Desktop Rendered QA",
    "",
    `- fixture_count: ${desktop.results.length}`,
    `- horizontal_overflow_count: ${desktop.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${desktop.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | type_id | scene_axis | clipping_issues | overflow | duplicate_scene_localization | batch_mismatch |",
    "|---|---:|---|---|---|---:|---|",
    ...desktop.results.map(
      (item) =>
        `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicateSceneLocalizationVisibleCount} | ${item.sceneLocalizationBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const mobileMd = [
    "# Phase6B Mobile Rendered QA",
    "",
    `- fixture_count: ${mobile.results.length}`,
    `- horizontal_overflow_count: ${mobile.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${mobile.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | type_id | scene_axis | clipping_issues | overflow | duplicate_scene_localization | batch_mismatch |",
    "|---|---:|---|---|---|---:|---|",
    ...mobile.results.map(
      (item) =>
        `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicateSceneLocalizationVisibleCount} | ${item.sceneLocalizationBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const metadataMd = [
    "# Phase6B Metadata Leakage QA",
    "",
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    "",
    "| fixture | type_id | scene_axis | leaks |",
    "|---|---:|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.metadataLeaks.join(", ")} |`),
    "",
  ].join("\n");

  const copyMd = [
    "# Phase6B Copy Pollution QA",
    "",
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    "",
    "| fixture | type_id | scene_axis | pollution_hits | joining_hits | fallback_hits |",
    "|---|---:|---|---|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.pollutionHits.join(", ")} | ${item.joiningHits.join(", ")} | ${item.fallbackHits.join(", ")} |`,
    ),
    "",
  ].join("\n");

  const duplicateMd = [
    "# Phase6B Duplicate Scene Localization QA",
    "",
    `- duplicate_scene_localization_visible_count: ${duplicateSceneLocalizationVisibleCount}`,
    `- scene_localization_batch_mismatch_count: ${sceneLocalizationBatchMismatchCount}`,
    "",
    "| fixture | type_id | scene_axis | duplicate_visible_count | batch_mismatch |",
    "|---|---:|---|---:|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.duplicateSceneLocalizationVisibleCount} | ${item.sceneLocalizationBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const layoutMd = [
    "# Phase6B Layout QA",
    "",
    `- horizontal_overflow_count: ${overflowCount}`,
    `- clipping_issue_count: ${clippingCount}`,
    `- layout_issue_count: ${clippingCount + overflowCount}`,
    "",
    "| fixture | type_id | scene_axis | overflow | clipping_issues |",
    "|---|---:|---|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.typeId} | ${item.sceneAxis} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.clippingIssues.join(", ")} |`,
    ),
    "",
  ].join("\n");

  const goNoGo = [
    "# Phase6B Go / No-Go",
    "",
    `- verdict: ${verdict}`,
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_rendered: ${desktop.results.length}/162`,
    `- mobile_rendered: ${mobile.results.length}/162`,
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    `- duplicate_scene_localization_visible_count: ${duplicateSceneLocalizationVisibleCount}`,
    `- layout_issue_count: ${clippingCount + overflowCount}`,
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
    duplicate_scene_localization_visible_count: duplicateSceneLocalizationVisibleCount,
    layout_issue_count: clippingCount + overflowCount,
    production_import_happened: "no",
    full_replacement_happened: "no",
  };

  fs.writeFileSync(path.join(outputDir, "Phase6B_RenderedQA_Coverage.md"), coverage);
  fs.writeFileSync(path.join(outputDir, "Phase6B_DesktopRenderedQA.md"), desktopMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_MobileRenderedQA.md"), mobileMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_MetadataLeakageQA.md"), metadataMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_CopyPollutionQA.md"), copyMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_DuplicateSceneLocalizationQA.md"), duplicateMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_LayoutQA.md"), layoutMd);
  fs.writeFileSync(path.join(outputDir, "Phase6B_GoNoGo.md"), goNoGo);
  fs.writeFileSync(path.join(outputDir, "phase6b_summary.json"), JSON.stringify(jsonSummary, null, 2));
}

test.describe("ENNEAGRAM Phase 6-B scene localization rendered QA", () => {
  const fixtures = loadPreviewFixtures();
  const outputDir =
    process.env.PHASE6B_OUTPUT_DIR?.trim() ||
    `/tmp/fm_enneagram_phase6b_${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_")}`;

  test.afterAll(() => {
    const desktop = viewportSummaries.find((item) => item.viewport === "desktop");
    const mobile = viewportSummaries.find((item) => item.viewport === "mobile");
    if (!desktop || !mobile) {
      throw new Error("Phase 6-B summaries are incomplete.");
    }
    fs.mkdirSync(outputDir, { recursive: true });
    writePhase6BReports({
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
    test(`${viewport.name}: renders all Phase 6-A scene localization fixtures without leaks, duplication, fallback, or layout regressions`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const results: FixtureResult[] = [];

      for (const fixture of fixtures) {
        const attemptId = `phase6b-${fixture.typeId}-${fixture.sceneAxis}-${viewport.name}`;
        await installPreviewMocks(page, attemptId, fixture.reportV2);
        await page.goto(`/en/result/${attemptId}`);

        await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();
        await expect(page.getByTestId("enneagram-asset-backed-scene_localization_response")).toBeVisible();

        const bodyText = await page.locator("body").innerText();
        const metadataLeaks = INTERNAL_METADATA.filter(
          (token) => bodyText.includes(token) || bodyText.includes(`SHOULD_NOT_RENDER_${token.toUpperCase()}`),
        );
        const pollutionHits = POLLUTION_STRINGS.filter((token) => bodyText.includes(token));
        const joiningHits = JOINING_ERRORS.filter((token) => bodyText.includes(token));
        const fallbackHits = FALLBACK_STRINGS.filter((token) => bodyText.includes(token));
        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const clippingIssues = await collectClippingIssues(page, viewport.width);
        const sceneCards = page.getByTestId("enneagram-asset-backed-scene_localization_response");
        const sceneCardCount = await sceneCards.count();
        const sceneCardText = sceneCardCount > 0 ? await sceneCards.first().innerText() : "";
        const provenanceText =
          sceneCardCount > 0 ? await sceneCards.first().getByTestId("enneagram-asset-backed-provenance").innerText() : "";
        const duplicateSceneLocalizationVisibleCount = sceneCardCount > 1 ? sceneCardCount - 1 : 0;
        const sceneLocalizationBatchMismatch =
          !provenanceText.includes("1R_G") && !provenanceText.includes("1R-G") && !provenanceText.includes("batch_1r_g");
        const visibleEvidenceHit = fixture.visibleEvidence.some((snippet) => snippet && sceneCardText.includes(snippet));

        results.push({
          fixture: fixture.fileName,
          typeId: fixture.typeId,
          sceneAxis: fixture.sceneAxis,
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
          duplicateSceneLocalizationVisibleCount,
          sceneLocalizationBatchMismatch,
        });

        expect(metadataLeaks).toEqual([]);
        expect(pollutionHits).toEqual([]);
        expect(joiningHits).toEqual([]);
        expect(fallbackHits).toEqual([]);
        expect(horizontalOverflow).toBe(false);
        expect(clippingIssues).toEqual([]);
        expect(sceneCardCount).toBe(1);
        expect(sceneLocalizationBatchMismatch).toBe(false);
        expect(visibleEvidenceHit).toBe(true);

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
