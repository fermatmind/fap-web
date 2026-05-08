import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveTestDetailAuthority,
  TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS,
} from "@/lib/seo/testDetailAuthority";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/runtime/generated/test-detail-authority-convergence.v1.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/test-detail-authority-convergence.md");
const PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/tests/[slug]/page.tsx");
const HELPER_PATH = path.join(ROOT, "lib/seo/testDetailAuthority.ts");
const PHASE_1B_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b-state.json");

type TestDetailAuthorityArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  runtimeBehaviorChangeScope: string;
  approvedCompatibilityFallbackSlugs: string[];
  newTestGuard: {
    status: string;
    priority: string;
    rule: string;
    implementation: string;
    runtimeConsumer: string;
    blocksUniversalAssessmentSignalPlatform: boolean;
  };
  rows: Array<{
    id: string;
    surface: string;
    fallbackId: string;
    classification: string;
    status: string;
    priority: string;
    runtimeGuard: string;
    compatibilityAllowance: string;
    failsClosedWhen: string;
    runtimeEvidence: string[];
  }>;
  mustNotTouch: string[];
};

function readArtifact(): TestDetailAuthorityArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as TestDetailAuthorityArtifact;
}

describe("test detail authority convergence", () => {
  it("records PR-PRA1B-02 after merged PR-PRA1B-01 in the Phase 1B ledger", () => {
    const state = JSON.parse(fs.readFileSync(PHASE_1B_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(byId.get("PR-PRA1B-01")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-PRA1B-02")).toMatchObject({
      branch: "codex/pr-pra1b-02-test-detail-authority-convergence",
      depends_on: ["PR-PRA1B-01"],
      status: "merged",
    });
  });

  it("keeps the approved compatibility fallback slug ledger in sync with runtime helper", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("runtime.test_detail_authority_convergence.v1");
    expect(artifact.scope).toBe("PR-PRA1B-02");
    expect(artifact.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(artifact.runtimeBehaviorChanged).toBe(true);
    expect(artifact.approvedCompatibilityFallbackSlugs).toEqual([...TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS]);
    expect(new Set(artifact.approvedCompatibilityFallbackSlugs).size).toBe(
      artifact.approvedCompatibilityFallbackSlugs.length
    );
  });

  it("fails closed for future unapproved test detail pages without backend/CMS authority", () => {
    const resolved = resolveTestDetailAuthority({
      slug: "future-universal-assessment-test",
      hasSeoTitle: false,
      hasSeoDescription: false,
      hasOgImage: false,
      hasVisibleFaq: false,
      hasLandingSurface: false,
      hasStartTestTarget: false,
      hasCtaBundle: false,
    });

    expect(resolved.compatibilityFallbackApproved).toBe(false);
    expect(resolved.shouldNoindexMissingMetadataAuthority).toBe(true);
    expect(resolved.metadata).toMatchObject({ source: "blocked", allowed: false });
    expect(resolved.faq).toMatchObject({ source: "blocked", allowed: false });
    expect(resolved.cta).toMatchObject({ source: "blocked", allowed: false });
  });

  it("allows backend/CMS authority for unapproved pages without requiring compatibility fallback", () => {
    const resolved = resolveTestDetailAuthority({
      slug: "future-backend-owned-test",
      hasSeoTitle: true,
      hasSeoDescription: true,
      hasOgImage: true,
      hasVisibleFaq: true,
      hasLandingSurface: true,
      hasStartTestTarget: true,
      hasCtaBundle: true,
    });

    expect(resolved.compatibilityFallbackApproved).toBe(false);
    expect(resolved.shouldNoindexMissingMetadataAuthority).toBe(false);
    expect(resolved.metadata).toMatchObject({ source: "backend_authority", allowed: true });
    expect(resolved.faq).toMatchObject({ source: "backend_authority", allowed: true });
    expect(resolved.cta).toMatchObject({ source: "backend_authority", allowed: true });
  });

  it("retains compatibility wrappers only for approved existing test detail pages", () => {
    for (const slug of TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS) {
      const resolved = resolveTestDetailAuthority({
        slug,
        hasSeoTitle: false,
        hasSeoDescription: false,
        hasOgImage: false,
        hasVisibleFaq: false,
        hasLandingSurface: false,
        hasStartTestTarget: false,
        hasCtaBundle: false,
      });

      expect(resolved.compatibilityFallbackApproved, slug).toBe(true);
      expect(resolved.shouldNoindexMissingMetadataAuthority, slug).toBe(false);
      expect(resolved.metadata.source, slug).toBe("compatibility_wrapper");
      expect(resolved.faq.source, slug).toBe("compatibility_wrapper");
      expect(resolved.cta.source, slug).toBe("compatibility_wrapper");
    }
  });

  it("anchors metadata, FAQ, FAQPage JSON-LD, and CTA runtime guards in the test detail renderer", () => {
    const page = fs.readFileSync(PAGE_PATH, "utf8");
    const helper = fs.readFileSync(HELPER_PATH, "utf8");

    expect(page).toContain("resolveTestDetailAuthority");
    expect(page).toContain("metadataAuthority.shouldNoindexMissingMetadataAuthority");
    expect(page).toContain("testDetailAuthority.faq.allowed");
    expect(page).toContain("faqJsonLd ?");
    expect(page).toContain("mergedFaq.length > 0 ? (");
    expect(page).toContain("canRenderStartCta ? (");
    expect(page).toContain("testDetailAuthority.cta.allowed ? (");
    expect(helper).toContain("TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS");
    expect(helper).toContain("new test detail metadata requires backend SEO authority");
    expect(helper).toContain("new test detail FAQ requires visible backend/CMS FAQ authority");
    expect(helper).toContain("new test detail CTA requires landing_surface_v1 or CMS authority");
  });

  it("documents authority rows and forbidden scope boundaries", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.newTestGuard).toMatchObject({
      status: "complete",
      priority: "P0",
      implementation: "lib/seo/testDetailAuthority.ts",
      runtimeConsumer: "app/(localized)/[locale]/tests/[slug]/page.tsx",
      blocksUniversalAssessmentSignalPlatform: true,
    });
    expect(byId.get("test_detail_metadata_authority")).toMatchObject({
      fallbackId: "test_metadata_faq_cta_fallback",
      classification: "migration_required",
      priority: "P0",
    });
    expect(byId.get("test_detail_faqpage_jsonld_authority")).toMatchObject({
      status: "complete",
      runtimeGuard: "faqJsonLd is null when mergedFaq is empty",
    });
    expect(artifact.mustNotTouch).toEqual(
      expect.arrayContaining(["scoring", "test take flow", "result/report", "checkout", "payment", "hidden schema"])
    );
    expect(doc).toContain("Runtime behavior changed: yes, scoped to future unapproved test detail surfaces.");
    expect(doc).toContain("FAQPage JSON-LD is not emitted unless visible FAQ exists.");
    expect(doc).toContain("This PR does not add tests");
  });
});
