import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { isSharedDiscoverabilityDeniedPath } = require(
  "../../lib/seo/discoverabilityExposurePolicy.cjs",
);
const script = "scripts/seo/build-mbti-index-52-full-55-release-gate.mjs";
const reportPath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.json";
const runOnePath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-1.json";
const runTwoPath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-2.json";
const exactNewTargets = ["enfp-vs-entp", "estj-vs-entj", "isfp-vs-infp"];

describe("MBTI-INDEX-52 full 55 URL release gate", () => {
  it("requires explicit read-only network and independent run flags", () => {
    expect(() => execFileSync("node", [script], { encoding: "utf8", stdio: "pipe" })).toThrow();
    expect(() => execFileSync("node", [script, "--allow-network"], { encoding: "utf8", stdio: "pipe" })).toThrow();
  });

  it.each(["duplicate", "missing", "extra"])("rejects %s target inventory drift", (probe) => {
    expect(() => execFileSync("node", [script, `--contract-probe=${probe}`], {
      encoding: "utf8",
      stdio: "pipe",
    })).toThrow();
  });

  it.each(["section", "fingerprint", "revision", "membership"])("rejects %s evidence failure", (probe) => {
    expect(() => execFileSync("node", [script, `--contract-probe=${probe}`], {
      encoding: "utf8",
      stdio: "pipe",
    })).toThrow();
  });

  it.each([
    "jsonld-node-identity",
    "jsonld-conflicting-identity",
    "jsonld-breadcrumb-terminal",
    "projection-visibility",
    "comparison-summary-runtime-selection",
    "profile-reader-section-membership",
    "profile-promoted-sections",
    "structured-section-payload",
    "robots-header-indexability",
    "css-hidden-visibility",
    "frontend-revision-sequence",
    "profile-hero-visibility",
    "comparison-robots-authority",
    "profile-robots-authority",
    "profile-metadata-precedence",
    "disabled-runtime-sections",
    "profile-hero-completeness",
    "feed-exact-url-membership",
    "validator-revision-sequence",
    "run2-sequence-decision",
  ])(
    "enforces %s runtime evidence",
    (probe) => {
      expect(() => execFileSync("node", [script, `--contract-probe=${probe}`], {
        encoding: "utf8",
        stdio: "pipe",
      })).not.toThrow();
    },
  );

  it("keeps checked-in evidence in a consistent release-gate state", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const runOne = JSON.parse(fs.readFileSync(runOnePath, "utf8"));
    const runTwo = JSON.parse(fs.readFileSync(runTwoPath, "utf8"));

    expect(report.target_count).toBe(55);
    expect(report.exact_new_targets).toEqual(exactNewTargets);
    expect(runOne.run_decision).toBe("PASS_MBTI_55_RUN");
    expect(runOne.started_at < runOne.completed_at).toBe(true);
    expect(runOne.completed_at < runTwo.started_at).toBe(true);
    expect(runOne.sequence_state).toBe("consumed");
    expect(runOne.consumed_by_run_2_at).toBe(runTwo.started_at);
    expect(runOne.validation_session_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(runTwo.validation_session_id).toBe(runOne.validation_session_id);
    expect(report.validation_session_id).toBe(runOne.validation_session_id);

    if (report.final_decision === "ALLOW_MBTI_55_COMPLETE") {
      expect(report.gsc_dependency_unblocked).toBe(true);
      expect(report.completed_consecutive_runs).toBe(2);
      expect(runTwo.run_decision).toBe("PASS_MBTI_55_RUN");
      expect(runTwo.sequence_state).toBe("completed");
      expect(runTwo.records).toHaveLength(55);
      expect(report.records).toHaveLength(55);
    } else {
      expect(report.final_decision).toBe("HOLD_MBTI_55_INCOMPLETE");
      expect(report.gsc_dependency_unblocked).toBe(false);
      expect(report.completed_consecutive_runs).toBe(0);
      expect(runTwo.run_decision).toBe("HOLD_MBTI_55_INCOMPLETE");
      expect(runTwo.sequence_state).toBe("failed");
      expect(report.records).toEqual(runTwo.records);
    }
  });

  it("preserves backend authority and the read-only search hold", () => {
    const source = fs.readFileSync(script, "utf8");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(source).toContain('comparison.authority_source === "database"');
    expect(source).toContain('comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"');
    expect(source).toContain("comparison.is_indexable === true");
    expect(source).toContain("PROFILE_SECTION_COUNT_OVERRIDES");
    expect(source).toContain("?? 35");
    expect(source).toContain("expectedSectionCount: 9");
    expect(source).toContain("const EXPECTED_CROSS_SECTION_COUNT");
    expect(source).toContain("feedUrls(body).size < 55");
    expect(source).toContain("new URL(presentationTrimmed).href");
    expect(source).toContain("const FEED_URLS = Object.freeze");
    expect(source).toContain("const PUBLIC_CONTEXT_QUERY");
    expect(source).toContain('"--http1.1"');
    expect(source).toContain('target.slug === "intp-a-vs-intp-t"');
    expect(source).toContain('? "mbti-comp-runtime-46-intp-revision"');
    expect(source).toContain(': "mbti_cms_import_40_at_comparison_draft_v1"');
    expect(source).toContain("visibleBodyComplete");
    expect(source).toContain("profileSectionVisible");
    expect(source).toContain("missingCandidates.length === 0");
    expect(source).toContain("const MAX_CONCURRENCY = 1");
    expect(source).toContain("markdownContentBlocks");
    expect(source).toContain("normalizeComparableText");
    expect(source).toContain("--diagnose-visible-only");
    expect(source).toContain("fetchPage(canonical)");
    expect(source).toContain('REQUEST_TIMEOUT_MS, {}, "manual"');
    expect(source).toContain("facts.visibleAnchors");
    expect(source).toContain('response.headers.get("x-robots-tag")');
    expect(source).toContain("facts.xRobotsTag");
    expect(source).toContain("(?:noindex|nofollow|none)");
    expect(source).toContain('[class~="hidden"]');
    expect(source).toContain('[class~="invisible"]');
    expect(source).toContain('[class~="sr-only"]');
    expect(source).toContain("sectionKey === \"letters_intro\"");
    expect(source).toContain("sectionKey === \"trait_overview\"");
    expect(source).toContain("sectionKey === \"v8_5_module_10_faq_boundary\"");
    expect(source).toContain("profileReaderVisibleSections");
    expect(source).toContain("profileReaderSectionMembershipValid(readerVisibleSections)");
    expect(source).toContain("MBTI64_PROMOTED_DETAIL_SECTION_KEYS");
    expect(source).toContain('sectionKey === "related_content"');
    expect(source).toContain('sectionKey === "faq"');
    expect(source).toContain("faqCandidates(payload?.items)");
    expect(source).toContain("profileHeroVisible(payload?.mbti_public_projection_v1, visibleText)");
    expect(source).toContain("requiredScalars.some((value) => !value)");
    expect(source).toContain("keywords.length === 0");
    expect(source).toContain("PROFILE_V85_VISIBLE_SECTION_KEYS");
    expect(source).toContain("PROFILE_LEADING_PROJECTION_SECTION_KEYS");
    expect(source).toContain("comparisonSectionVisible");
    expect(source).toContain("answerSurfaceVisible");
    expect(source).toContain("answerSurfaceBlockCandidates");
    expect(source).toContain("selectedSummaryBody");
    expect(source).toContain("comparisonSectionEvidence");
    expect(source).toContain("readerExperienceCandidates");
    expect(source).toContain("runtimeLinksVisible");
    expect(source).toContain("requiredAnswerSurfaceCollectionsPresent");
    expect(source).toContain("answerSurfaceLinksVisible");
    expect(source).toContain("normalizePublicHref(anchor?.href) === href");
    expect(source).toMatch(/sections\.length > 0\s+&& sections\.every/);
    expect(source).not.toContain("visibleText.length >= 1_500");
    expect(source).toContain("authority.revisionPresent === true");
    expect(source).toContain("RELEASED_CROSS_SOURCE_SHA256");
    expect(source).toContain("comparison_public_projection_v1 ?? payload?.comparison");
    expect(source).toContain("projection: comparison");
    expect(source).toContain("projection.canonical_type_code === expectedTypeCode");
    expect(source).toContain("projection.variant_code === expectedVariantCode");
    expect(source).toContain("projection.runtime_type_code === expectedRuntimeTypeCode");
    expect(source).toContain("projection?._meta?.authority_source === \"personality_cms_v2\"");
    expect(source).toContain("answer_surface: payload?.answer_surface_v1");
    expect(source).toContain("requiredPageNodesMatch");
    expect(source).toContain("nodes.every(identityMatchesCanonical)");
    expect(source).toContain("(!idPresent || id === canonical || id === `${canonical}#webpage`)");
    expect(source).toContain("(!urlPresent || url === canonical)");
    expect(source).toContain("structured.breadcrumbTrails.every");
    expect(source).toContain("trail.at(-1) === canonical");
    expect(source).toContain("comparisonProjectionVisible");
    expect(source).toContain("comparisonVariantVisible");
    expect(source).toContain("comparisonBlockVisible");
    expect(source).toContain("comparisonInternalLinksVisible");
    expect(source).toContain("RELEASED_CROSS_TYPE.includes(target.slug) ? 7 : 5");
    expect(source).toContain("links.length === expectedLinkCount");
    expect(source).toContain("normalizePublicHref(anchor?.href) === href");
    expect(source).toContain("runtimeComparisonSections(payload)");
    expect(source).toContain("payload.sections.filter((section) => section?.is_enabled !== false)");
    expect(source).toContain("requiredRuntimeSectionsPresent");
    expect(source).toContain('=== "mbti64_comparison_a_vs_t"');
    expect(source).toContain("runtimeSectionFaq(payload, kind)");
    expect(source).toContain('sectionKey === "mbti64_comparison_a_vs_t"');
    expect(source).toContain("seo_meta: payload?.seo_meta");
    expect(source).toContain("seo_surface: payload?.seo_surface_v1");
    expect(source).toContain("jsonld: payload?.jsonld");
    expect(source).toContain("profileSeoAuthorityPresent");
    expect(source).toContain("profileRobotsAuthorityPresent(seoPayload, detailPayload, pageFacts)");
    expect(source).toContain("additionalRobotsSources.every(robotsSourceAllowsIndex)");
    expect(source).toContain("(?:noindex|nofollow|none)");
    expect(source).toContain("const execFileAsync = promisify(execFile)");
    expect(source).toContain("signal: FEED_ABORT_CONTROLLER.signal");
    expect(source).not.toContain("execFileSync(\"curl\"");
    expect(source).toContain("pageFacts?.title === expectedTitle");
    expect(source).toContain("pageFacts?.description === expectedDescription");
    expect(source).toContain('link[rel~="alternate"][hreflang]');
    expect(source).toContain("comparisonIdentityPresent(comparison, target)");
    expect(source).toContain('comparison?.locale !== "zh-CN"');
    expect(source).toContain("comparison?.variants?.a?.runtime_type_code === `${baseType}-A`");
    expect(source).toContain("comparison?.left_type === leftType");
    expect(source).toContain("comparisonRenderedMetadataPresent(payload, pageFacts, canonical)");
    expect(source).toContain("comparisonRobotsAuthorityPresent(payload, pageFacts)");
    expect(source).toContain("robotsPolicies.every");
    expect(source).toContain("pageFacts?.title === documentTitle");
    expect(source).toContain("pageFacts?.description === description");
    expect(source).toContain('comparison?.alternates?.["zh-CN"] === canonical');
    expect(source).toContain("comparison?.alternates?.en === expectedEnglishCanonical");
    expect(source).toContain("const claimBoundary = normalizeText(projection?.claim_boundary)");
    expect(source).toContain("visibleCandidates([claimBoundary], visibleText)");
    expect(source).toContain("/seo?locale=zh-CN&org_id=0&scale_code=MBTI");
    expect(source).toContain("writeFinalValidationHold(runStartedAt);");
    expect(source).toContain("writePreflightValidationFailure(runStartedAt, validationSessionId, error)");
    expect(source).toContain('sequence_state: "failed"');
    expect(source.indexOf("writeFinalValidationHold(runStartedAt);"))
      .toBeLessThan(source.indexOf("frontendRevisionAtStart = await fetchFrontendRevision()"));
    expect(source).toContain("isSharedDiscoverabilityDeniedPath");
    expect(source).not.toContain("PRIVATE_PATH_PATTERN");
    expect(isSharedDiscoverabilityDeniedPath("/zh/results/lookup")).toBe(true);
    expect(isSharedDiscoverabilityDeniedPath("/zh/pay/wait")).toBe(true);
    expect(isSharedDiscoverabilityDeniedPath("/zh/tests/mbti-personality-test-16-personality-types/take")).toBe(true);
    expect(isSharedDiscoverabilityDeniedPath("/zh/personality/big-five/facets/order")).toBe(false);
    expect(source).toContain('sequence_state: "consumed"');
    expect(source).toContain('fs.openSync(ARTIFACT_PATHS.run1, "r+")');
    expect(source).toContain('fs.openSync(ARTIFACT_PATHS.runTwoLock, "wx", 0o600)');
    expect(source).toContain("fs.unlinkSync(ARTIFACT_PATHS.runTwoLock)");
    expect(source).toContain('process.once("exit", releaseRunTwoLock)');
    expect(source).toContain('process.once("SIGINT"');
    expect(source).toContain('process.once("SIGTERM"');
    expect(source).toContain('process.once("SIGHUP"');
    expect(source).toContain("reclaimStaleRunTwoLock()");
    expect(source).toContain("fs.linkSync(ARTIFACT_PATHS.runTwoLock, ARTIFACT_PATHS.runTwoReclaim)");
    expect(source).toContain("sameFileIdentity(identity, reclaimIdentity)");
    expect(source).toContain("processIsAlive(ownerPid)");
    expect(source).toContain("sameFileIdentity(identity, currentIdentity)");
    expect(source).toContain("if (RUN !== null)");
    expect(source).toContain("terminateValidationRun");
    expect(source).toContain("validation_interrupted:");
    expect(source).toContain("fs.ftruncateSync(runOneDescriptor, 0)");
    expect(source).toContain("fs.writeSync(runOneDescriptor, consumedRun, 0");
    expect(source).not.toContain("fs.existsSync(ARTIFACT_PATHS.run1)");
    expect(source).toContain('previousRun?.sequence_state === "awaiting_run_2"');
    expect(source).toContain("previousRun?.validation_session_id === validationSessionId");
    expect(source).toContain("fetchFrontendRevision()");
    expect(source).toContain("sameFrontendRevisionAcrossSequence(");
    expect(source).toContain("previousRun?.frontend_revision === revisionAtStart");
    expect(source).toContain("VALIDATOR_SOURCE_SHA256");
    expect(source).toContain("sameValidatorRevisionAcrossSequence(previousRun, VALIDATOR_SOURCE_SHA256)");
    expect(source).toContain("validationRunPassed(RUN, aggregatePassed, consecutivePass)");
    expect(source).toContain('"script"');
    expect(source).toContain('"template"');
    expect(source).toContain('"[hidden]"');
    expect(source).toContain('\'[aria-hidden="true"]\'');
    expect(source).toContain('\'input[type="hidden"]\'');
    expect(source).toContain("authorityFingerprintSha256");
    expect(source).toContain("sourceRevisionSha256");
    expect(source).toContain("const ARTIFACT_PATHS = Object.freeze");
    expect(source).not.toContain("process.cwd()");
    expect(source).not.toMatch(/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);
    expect(report.safety_boundary).toMatchObject({
      read_only_network: true,
      cms_write_attempted: false,
      database_write_attempted: false,
      publication_mutation_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      sitemap_submission_attempted: false,
      gsc_mutation_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
      frontend_editorial_fallback_added: false,
    });
  });
});
