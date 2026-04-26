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
  "missing pair fallback",
  "fallback pair",
  "pair fallback",
  "通用 pair fallback",
  "缺失 pair",
  "缺少 pair",
];

type PreviewFixture = {
  filePath: string;
  fileName: string;
  pairKey: string;
  canonicalPairKey: string;
  typeA: string;
  typeB: string;
  top1Type: string;
  top2Type: string;
  reportV2: Record<string, unknown>;
  moduleCount: number;
  categories: string[];
  batches: string[];
  visibleEvidence: string[];
};

type FixtureResult = {
  fixture: string;
  pairKey: string;
  canonicalPairKey: string;
  topOrder: string;
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
  duplicateCloseCallPairVisibleCount: number;
  missingPairFallbackVisibleCount: number;
  closeCallPairBatchMismatch: boolean;
};

type ViewportSummary = {
  viewport: "desktop" | "mobile";
  width: number;
  height: number;
  results: FixtureResult[];
};

const viewportSummaries: ViewportSummary[] = [];

function canonicalizePairKey(raw: string): string {
  const trimmed = raw.trim();
  const match = /^([1-9])_([1-9])$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid pair_key: ${raw}`);
  }

  const left = Number(match[1]);
  const right = Number(match[2]);
  if (left === right) {
    throw new Error(`Self-pair is not allowed: ${raw}`);
  }

  return left < right ? `${left}_${right}` : `${right}_${left}`;
}

function readCloseCallPairModule(reportV2: Record<string, unknown>) {
  const modules = Array.isArray(reportV2.modules) ? reportV2.modules : [];
  const pairModules = modules.filter(
    (module) => (module as { content?: { category?: unknown } }).content?.category === "close_call_pair",
  );

  if (pairModules.length !== 1) {
    throw new Error(`Fixture must contain exactly one close_call_pair module. Received ${pairModules.length}.`);
  }

  return {
    modules,
    pairModule: pairModules[0] as { content?: Record<string, unknown> },
  };
}

function loadPreviewFixtures(): PreviewFixture[] {
  const previewDir = process.env.PHASE5A_PREVIEW_PAYLOAD_DIR?.trim();
  if (!previewDir) {
    throw new Error("PHASE5A_PREVIEW_PAYLOAD_DIR is required for Phase 5-B rendered QA.");
  }

  if (!fs.existsSync(previewDir)) {
    throw new Error(`Missing prerequisite: Phase 5-A preview payload directory does not exist: ${previewDir}`);
  }

  const files = fs
    .readdirSync(previewDir)
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (files.length !== 36) {
    throw new Error(`Expected 36 preview fixtures, received ${files.length} from ${previewDir}.`);
  }

  return files.map((fileName) => {
    const filePath = path.join(previewDir, fileName);
    let reportV2: Record<string, unknown>;

    try {
      reportV2 = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    } catch (error) {
      throw new Error(`Failed to parse Phase 5-A fixture ${fileName}: ${String(error)}`);
    }

    const previewContext = (reportV2.preview_context as Record<string, unknown> | undefined) ?? {};
    const pairKey = String(previewContext.pair_key ?? "");
    const top1Type = String(previewContext.top1_type ?? "");
    const top2Type = String(previewContext.top2_type ?? "");
    const { modules, pairModule } = readCloseCallPairModule(reportV2);
    const content = pairModule.content ?? {};
    const contentPairKey = String(content.pair_key ?? "");
    const canonicalPairKey = String(content.canonical_pair_key ?? "");
    const typeA = String(content.type_a ?? previewContext.type_a ?? "");
    const typeB = String(content.type_b ?? previewContext.type_b ?? "");
    const assetKey = String(content.asset_key ?? "");

    if (!pairKey) {
      throw new Error(`Phase 5-A fixture ${fileName} is missing preview_context.pair_key.`);
    }
    if (!top1Type || !top2Type) {
      throw new Error(`Phase 5-A fixture ${fileName} is missing preview_context.top1_type/top2_type.`);
    }
    if (!typeA || !typeB) {
      throw new Error(`Phase 5-A fixture ${fileName} is missing type_a/type_b.`);
    }
    if (!contentPairKey || !canonicalPairKey) {
      throw new Error(`Phase 5-A fixture ${fileName} is missing pair_key/canonical_pair_key in close_call_pair content.`);
    }
    if (!assetKey.includes("1R_F")) {
      throw new Error(`Phase 5-A fixture ${fileName} close_call_pair is not sourced from 1R-F.`);
    }

    const normalizedPreviewPair = canonicalizePairKey(pairKey);
    const normalizedContentPair = canonicalizePairKey(contentPairKey);
    const normalizedCanonicalPair = canonicalizePairKey(canonicalPairKey);

    if (normalizedPreviewPair !== normalizedContentPair || normalizedPreviewPair !== normalizedCanonicalPair) {
      throw new Error(`Phase 5-A fixture ${fileName} has inconsistent pair canonicalization.`);
    }

    return {
      filePath,
      fileName,
      pairKey,
      canonicalPairKey: normalizedCanonicalPair,
      typeA,
      typeB,
      top1Type,
      top2Type,
      reportV2,
      moduleCount: modules.length,
      categories: modules
        .map((module) => String((module as { content?: { category?: unknown } }).content?.category ?? ""))
        .filter(Boolean),
      batches: modules
        .map((module) => String((module as { content?: { asset_key?: unknown } }).content?.asset_key ?? ""))
        .map((itemAssetKey) =>
          itemAssetKey.includes("1R_A")
            ? "1R-A"
            : itemAssetKey.includes("1R_B")
              ? "1R-B"
              : itemAssetKey.includes("1R_C")
                ? "1R-C"
                : itemAssetKey.includes("1R_D")
                  ? "1R-D"
                  : itemAssetKey.includes("1R_E")
                    ? "1R-E"
                    : itemAssetKey.includes("1R_F")
                      ? "1R-F"
                      : "unknown",
        )
        .filter(Boolean),
      visibleEvidence: [
        String(content.title_zh ?? ""),
        String(content.commercial_summary ?? ""),
        String(content.page1_close_call_summary ?? ""),
        String(content.shared_surface_similarity ?? ""),
        String(content.core_motivation_difference ?? ""),
        String(content.fear_difference ?? ""),
        String(content.stress_reaction_difference ?? ""),
        String(content.work_difference ?? ""),
        String(content.relationship_difference ?? ""),
        String(content.seven_day_observation_question ?? ""),
        String(content.resonance_feedback_prompt ?? ""),
        String(content.micro_discrimination_prompt ?? ""),
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
      body: JSON.stringify({ ok: true, fm_token: "fm_phase5b_enneagram_preview" }),
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

function writePhase5BReports(summary: { outputDir: string; fixtureCount: number; desktop: ViewportSummary; mobile: ViewportSummary }) {
  const { outputDir, fixtureCount, desktop, mobile } = summary;
  const allResults = [...desktop.results, ...mobile.results];
  const metadataLeakCount = allResults.reduce((sum, item) => sum + item.metadataLeaks.length, 0);
  const pollutionCount = allResults.reduce((sum, item) => sum + item.pollutionHits.length, 0);
  const joiningCount = allResults.reduce((sum, item) => sum + item.joiningHits.length, 0);
  const fallbackCount = allResults.reduce((sum, item) => sum + item.fallbackHits.length, 0);
  const clippingCount = allResults.reduce((sum, item) => sum + item.clippingIssues.length, 0);
  const overflowCount = allResults.filter((item) => item.horizontalOverflow).length;
  const duplicateCloseCallPairVisibleCount = allResults.reduce((sum, item) => sum + item.duplicateCloseCallPairVisibleCount, 0);
  const missingPairFallbackVisibleCount = allResults.reduce((sum, item) => sum + item.missingPairFallbackVisibleCount, 0);
  const closeCallPairBatchMismatchCount = allResults.filter((item) => item.closeCallPairBatchMismatch).length;
  const uniquePairs = new Set(allResults.map((item) => item.canonicalPairKey));

  let verdict = "PASS_FOR_PHASE_5C_STAGING_SIGNOFF";
  if (metadataLeakCount > 0) {
    verdict = "BLOCKED_BY_METADATA_LEAK";
  } else if (pollutionCount > 0 || joiningCount > 0 || fallbackCount > 0 || missingPairFallbackVisibleCount > 0) {
    verdict = "BLOCKED_BY_COPY_POLLUTION";
  } else if (duplicateCloseCallPairVisibleCount > 0 || closeCallPairBatchMismatchCount > 0) {
    verdict = "BLOCKED_BY_DUPLICATE_CLOSE_CALL_PAIR";
  } else if (clippingCount > 0 || overflowCount > 0) {
    verdict = "BLOCKED_BY_RENDERED_LAYOUT";
  }

  const coverage = [
    "# Phase5B Rendered QA Coverage",
    "",
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_fixture_count: ${desktop.results.length}`,
    `- mobile_fixture_count: ${mobile.results.length}`,
    `- canonical_pair_coverage: ${uniquePairs.size}/36`,
    "",
    "| fixture | pair_key | top_order | module_count | batches | rendered |",
    "|---|---|---|---:|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.canonicalPairKey} | ${item.topOrder} | ${item.moduleCount} | ${item.batches.join(", ")} | ${item.rendered ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const desktopMd = [
    "# Phase5B Desktop Rendered QA",
    "",
    `- fixture_count: ${desktop.results.length}`,
    `- horizontal_overflow_count: ${desktop.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${desktop.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | pair_key | clipping_issues | overflow | duplicate_close_call_pair | batch_mismatch |",
    "|---|---|---|---|---:|---|",
    ...desktop.results.map(
      (item) =>
        `| ${item.fixture} | ${item.canonicalPairKey} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicateCloseCallPairVisibleCount} | ${item.closeCallPairBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const mobileMd = [
    "# Phase5B Mobile Rendered QA",
    "",
    `- fixture_count: ${mobile.results.length}`,
    `- horizontal_overflow_count: ${mobile.results.filter((item) => item.horizontalOverflow).length}`,
    `- clipping_issue_count: ${mobile.results.reduce((sum, item) => sum + item.clippingIssues.length, 0)}`,
    "",
    "| fixture | pair_key | clipping_issues | overflow | duplicate_close_call_pair | batch_mismatch |",
    "|---|---|---|---|---:|---|",
    ...mobile.results.map(
      (item) =>
        `| ${item.fixture} | ${item.canonicalPairKey} | ${item.clippingIssues.join(", ")} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.duplicateCloseCallPairVisibleCount} | ${item.closeCallPairBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const metadataMd = [
    "# Phase5B Metadata Leakage QA",
    "",
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    "",
    "| fixture | pair_key | leaks |",
    "|---|---|---|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.canonicalPairKey} | ${item.metadataLeaks.join(", ")} |`),
    "",
  ].join("\n");

  const copyMd = [
    "# Phase5B Copy Pollution QA",
    "",
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    "",
    "| fixture | pair_key | pollution_hits | joining_hits | fallback_hits |",
    "|---|---|---|---|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.canonicalPairKey} | ${item.pollutionHits.join(", ")} | ${item.joiningHits.join(", ")} | ${item.fallbackHits.join(", ")} |`,
    ),
    "",
  ].join("\n");

  const duplicateMd = [
    "# Phase5B Duplicate Close-call Pair QA",
    "",
    `- duplicate_close_call_pair_visible_count: ${duplicateCloseCallPairVisibleCount}`,
    `- close_call_pair_batch_mismatch_count: ${closeCallPairBatchMismatchCount}`,
    "",
    "| fixture | pair_key | duplicate_visible_count | batch_mismatch |",
    "|---|---|---:|---|",
    ...allResults.map(
      (item) => `| ${item.fixture} | ${item.canonicalPairKey} | ${item.duplicateCloseCallPairVisibleCount} | ${item.closeCallPairBatchMismatch ? "yes" : "no"} |`,
    ),
    "",
  ].join("\n");

  const fallbackMd = [
    "# Phase5B Fallback QA",
    "",
    `- missing_pair_fallback_visible_count: ${missingPairFallbackVisibleCount}`,
    "",
    "| fixture | pair_key | missing_pair_fallback_visible_count |",
    "|---|---|---:|",
    ...allResults.map((item) => `| ${item.fixture} | ${item.canonicalPairKey} | ${item.missingPairFallbackVisibleCount} |`),
    "",
  ].join("\n");

  const goNoGo = [
    "# Phase5B Go / No-Go",
    "",
    `- verdict: ${verdict}`,
    `- fixture_count_consumed: ${fixtureCount}`,
    `- desktop_rendered: ${desktop.results.length}/36`,
    `- mobile_rendered: ${mobile.results.length}/36`,
    `- metadata_leak_visible_count: ${metadataLeakCount}`,
    `- pollution_hit_count: ${pollutionCount}`,
    `- joining_hit_count: ${joiningCount}`,
    `- fallback_hit_count: ${fallbackCount}`,
    `- duplicate_close_call_pair_visible_count: ${duplicateCloseCallPairVisibleCount}`,
    `- missing_pair_fallback_visible_count: ${missingPairFallbackVisibleCount}`,
    `- layout_issue_count: ${clippingCount + overflowCount}`,
    `- canonical_pair_coverage: ${uniquePairs.size}/36`,
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
    duplicate_close_call_pair_visible_count: duplicateCloseCallPairVisibleCount,
    missing_pair_fallback_visible_count: missingPairFallbackVisibleCount,
    layout_issue_count: clippingCount + overflowCount,
    production_import_happened: "no",
    full_replacement_happened: "no",
  };

  fs.writeFileSync(path.join(outputDir, "Phase5B_RenderedQA_Coverage.md"), coverage);
  fs.writeFileSync(path.join(outputDir, "Phase5B_DesktopRenderedQA.md"), desktopMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_MobileRenderedQA.md"), mobileMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_MetadataLeakageQA.md"), metadataMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_CopyPollutionQA.md"), copyMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_DuplicateCloseCallPairQA.md"), duplicateMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_FallbackQA.md"), fallbackMd);
  fs.writeFileSync(path.join(outputDir, "Phase5B_GoNoGo.md"), goNoGo);
  fs.writeFileSync(path.join(outputDir, "phase5b_summary.json"), JSON.stringify(jsonSummary, null, 2));
}

test.describe("ENNEAGRAM Phase 5-B close-call pair rendered QA", () => {
  const fixtures = loadPreviewFixtures();
  const outputDir =
    process.env.PHASE5B_OUTPUT_DIR?.trim() ||
    `/tmp/fm_enneagram_phase5b_${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_")}`;

  test.afterAll(() => {
    const desktop = viewportSummaries.find((item) => item.viewport === "desktop");
    const mobile = viewportSummaries.find((item) => item.viewport === "mobile");
    if (!desktop || !mobile) {
      throw new Error("Phase 5-B summaries are incomplete.");
    }
    fs.mkdirSync(outputDir, { recursive: true });
    writePhase5BReports({
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
    test(`${viewport.name}: renders all Phase 5-A close-call pair fixtures without leaks, duplication, fallback, or layout regressions`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const results: FixtureResult[] = [];

      for (const fixture of fixtures) {
        const attemptId = `phase5b-${fixture.canonicalPairKey.replace("_", "-")}-${viewport.name}`;
        await installPreviewMocks(page, attemptId, fixture.reportV2);
        await page.goto(`/en/result/${attemptId}`);

        await expect(page.getByTestId("enneagram-result-shell")).toBeVisible();
        await expect(page.getByTestId("enneagram-asset-backed-close_call_pair")).toBeVisible();

        const bodyText = await page.locator("body").innerText();
        const metadataLeaks = INTERNAL_METADATA.filter((token) => bodyText.includes(token) || bodyText.includes(`SHOULD_NOT_RENDER_${token.toUpperCase()}`));
        const pollutionHits = POLLUTION_STRINGS.filter((token) => bodyText.includes(token));
        const joiningHits = JOINING_ERRORS.filter((token) => bodyText.includes(token));
        const fallbackHits = FALLBACK_STRINGS.filter((token) => bodyText.includes(token));
        const missingPairFallbackVisibleCount = FALLBACK_STRINGS.filter((token) => bodyText.includes(token)).length;
        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const clippingIssues = await collectClippingIssues(page, viewport.width);
        const closeCallPairCards = page.getByTestId("enneagram-asset-backed-close_call_pair");
        const closeCallPairCardCount = await closeCallPairCards.count();
        const closeCallPairCardText = closeCallPairCardCount > 0 ? await closeCallPairCards.first().innerText() : "";
        const provenanceText =
          closeCallPairCardCount > 0
            ? await closeCallPairCards.first().getByTestId("enneagram-asset-backed-provenance").innerText()
            : "";
        const duplicateCloseCallPairVisibleCount = closeCallPairCardCount > 1 ? closeCallPairCardCount - 1 : 0;
        const closeCallPairBatchMismatch = !provenanceText.includes("1R_F");
        const visibleEvidenceHit = fixture.visibleEvidence.some((snippet) => snippet && closeCallPairCardText.includes(snippet));

        results.push({
          fixture: fixture.fileName,
          pairKey: fixture.pairKey,
          canonicalPairKey: fixture.canonicalPairKey,
          topOrder: `${fixture.top1Type}_${fixture.top2Type}`,
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
          duplicateCloseCallPairVisibleCount,
          missingPairFallbackVisibleCount,
          closeCallPairBatchMismatch,
        });

        expect(metadataLeaks).toEqual([]);
        expect(pollutionHits).toEqual([]);
        expect(joiningHits).toEqual([]);
        expect(fallbackHits).toEqual([]);
        expect(missingPairFallbackVisibleCount).toBe(0);
        expect(horizontalOverflow).toBe(false);
        expect(clippingIssues).toEqual([]);
        expect(closeCallPairCardCount).toBe(1);
        expect(closeCallPairBatchMismatch).toBe(false);
        expect(canonicalizePairKey(fixture.pairKey)).toBe(fixture.canonicalPairKey);
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
