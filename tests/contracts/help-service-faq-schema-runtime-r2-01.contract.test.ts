import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = "docs/seo/generated/help-service-faq-schema-runtime-r2-01.v1.json";
const REPORT_PATH = "docs/seo/help-service-faq-schema-runtime-r2-01.md";

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function changedFiles(): string[] {
  const head = process.env.GITHUB_SHA ? "origin/main" : "origin/main...HEAD";
  try {
    return execFileSync("git", ["diff", "--name-only", head], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((file: string) => file.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe("HELP-SERVICE-FAQ-SCHEMA-RUNTIME-R2-01", () => {
  it("records the schema runtime blocker as backend/CMS authority, not frontend fallback work", () => {
    const artifact = JSON.parse(read(ARTIFACT_PATH));

    expect(artifact.task.id).toBe("HELP-SERVICE-FAQ-SCHEMA-RUNTIME-R2-01");
    expect(artifact.decision.status).toBe("BLOCKED_BY_CMS_SCHEMA_DISABLED_AND_VISIBLE_PARITY");
    expect(artifact.decision.frontend_runtime_repair_applied).toBe(false);
    expect(artifact.decision.next_task_recommendation).toBe("HELP-CONTENT-DRAFT-SCHEMA-CMS-SYNC-01");
    expect(artifact.authority.frontend_must_not_override_schema_enabled).toBe(true);
    expect(artifact.authority.faqpage_requires_visible_faq_text).toBe(true);
    expect(artifact.authority.frontend_editorial_fallback_added).toBe(false);
  });

  it("captures the production evidence that all 12 Help pages have FAQ items but schema remains disabled", () => {
    const artifact = JSON.parse(read(ARTIFACT_PATH));
    const evidence = artifact.production_public_api_evidence;

    expect(evidence.checked_pages).toBe(12);
    expect(evidence.http_200_count).toBe(12);
    expect(evidence.schema_enabled_true_count).toBe(0);
    expect(evidence.schema_enabled_false_count).toBe(12);
    expect(evidence.faq_items_count_per_page).toBe(4);
    expect(evidence.faq_items_total).toBe(48);
    expect(evidence.visible_parity_count_total).toBe(0);
    expect(evidence.private_tokenized_pattern_hits).toBe(0);
    expect(evidence.routes).toHaveLength(12);
    expect(evidence.routes.every((row: { schema_enabled: boolean }) => row.schema_enabled === false)).toBe(true);
  });

  it("keeps Help FAQPage rendering gated on backend schemaEnabled and visible parity", () => {
    const source = read("app/(localized)/[locale]/help/[slug]/page.tsx");

    expect(source).toContain("getContentPage(contentSlug(slug), locale)");
    expect(source).toContain("!page.schemaEnabled");
    expect(source).toContain("page.faqItems.length === 0");
    expect(source).toContain("visibleText.includes(question)");
    expect(source).toContain("visibleText.includes(answer)");
    expect(source).toContain("buildVisibleHelpFaqJsonLd");
    expect(source).not.toContain("getContentPageWithLastKnownGood");
  });

  it("documents the blocked outcome and keeps scope free of runtime/content fallback edits", () => {
    const report = read(REPORT_PATH);
    const artifact = JSON.parse(read(ARTIFACT_PATH));

    expect(report).toContain("Decision: `BLOCKED_BY_CMS_SCHEMA_DISABLED_AND_VISIBLE_PARITY`");
    expect(report).toContain("does not change runtime rendering");
    expect(report).toContain("Recommended next task: `HELP-CONTENT-DRAFT-SCHEMA-CMS-SYNC-01`");
    expect(artifact.scope_validation.cms_mutation_performed).toBe(false);
    expect(artifact.scope_validation.publish_performed).toBe(false);
    expect(artifact.scope_validation.deploy_performed).toBe(false);
    expect(artifact.scope_validation.private_url_access_performed).toBe(false);
  });

  it("keeps the current branch changes inside the R2 evidence scope", () => {
    const allowed = new Set([
      ARTIFACT_PATH,
      REPORT_PATH,
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/help-service-faq-schema-runtime-r2-01.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ]);
    const files = changedFiles();

    expect(
      files.every((file) => allowed.has(file) || isCurrentRiasecPack12AllowedFile(file)),
      files.join("\n")
    ).toBe(true);
  });
});
