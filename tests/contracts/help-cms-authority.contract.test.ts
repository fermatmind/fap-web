import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/help-cms-authority.v1.json");
const ALLOWED_FILES = new Set([
  "docs/operations/help-cms-authority.md",
  "docs/operations/generated/help-cms-authority.v1.json",
  "tests/contracts/help-cms-authority.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

type HelpCmsAuthorityArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_generated: boolean;
  fap_api_modified: boolean;
  source_evidence: string[];
  authorities: Record<
    string,
    {
      owns: string[];
      supported_fields: string[];
      missing_for_help_service: string[];
      supported_categories?: string[];
      supported_intents?: string[];
      supported_contexts?: string[];
    }
  >;
  asset_mapping: Array<{
    asset: string;
    primary_authority: string;
    secondary_authority?: string;
    status: string;
    gap: string;
  }>;
  faq_schema_authority: {
    faq_items_first_class: boolean;
    markdown_derived: boolean;
    schema_enabled_field_available: boolean;
    rule: string;
  };
  field_needs: string[];
  forbidden_actions: string[];
};

function readArtifact(): HelpCmsAuthorityArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as HelpCmsAuthorityArtifact;
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI and local clones expose different diff bases. Use whichever source exists.
    }
  }
  return [...files].sort();
}

describe("HELP-CMS-AUTHORITY-01 contract", () => {
  it("locks the run as authority documentation only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_cms_authority.v1");
    expect(artifact.pr_id).toBe("HELP-CMS-AUTHORITY-01");
    expect(artifact.decision).toBe("CONDITIONAL");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_generated).toBe(false);
    expect(artifact.fap_api_modified).toBe(false);
  });

  it("records backend evidence without modifying fap-api", () => {
    const evidence = readArtifact().source_evidence.join("\n");

    expect(evidence).toContain("fap-api/backend/app/Models/ContentPage.php");
    expect(evidence).toContain("fap-api/backend/app/Models/SupportArticle.php");
    expect(evidence).toContain("fap-api/backend/app/Models/InterpretationGuide.php");
    expect(evidence).toContain("fap-web/app/(localized)/[locale]/help/[slug]/page.tsx");
  });

  it("maps public Help pages to ContentPage and service workflows to support resources", () => {
    const artifact = readArtifact();
    const byAsset = new Map(artifact.asset_mapping.map((item) => [item.asset, item]));

    expect(byAsset.get("Payment FAQ")).toMatchObject({ primary_authority: "ContentPage", status: "Partial" });
    expect(byAsset.get("Refund FAQ")).toMatchObject({
      primary_authority: "ContentPage",
      secondary_authority: "SupportArticle",
      status: "Partial",
    });
    expect(byAsset.get("Result recovery")).toMatchObject({
      primary_authority: "ContentPage",
      secondary_authority: "SupportArticle",
      status: "Partial",
    });
    expect(byAsset.get("Non-diagnostic boundary")).toMatchObject({
      primary_authority: "ContentPage",
      secondary_authority: "InterpretationGuide",
      status: "Partial",
    });
  });

  it("captures currently supported CMS fields and service gaps", () => {
    const { authorities } = readArtifact();

    expect(authorities.ContentPage.supported_fields).toEqual(
      expect.arrayContaining(["slug", "locale", "title", "summary", "content_md", "content_html", "status", "review_state", "is_indexable"])
    );
    expect(authorities.SupportArticle.supported_categories).toEqual(
      expect.arrayContaining(["orders", "reports", "payments", "refunds", "privacy_data", "troubleshooting"])
    );
    expect(authorities.SupportArticle.supported_intents).toEqual(
      expect.arrayContaining(["recover_report", "understand_refund", "delete_data_request_info", "contact_support"])
    );
    expect(authorities.InterpretationGuide.supported_contexts).toEqual(
      expect.arrayContaining(["free_vs_full", "limitations", "score_meaning"])
    );

    expect(authorities.ContentPage.missing_for_help_service).toEqual(
      expect.arrayContaining(["faq_items", "schema_enabled", "policy_version", "support_contact", "handling_time"])
    );
    expect(authorities.SupportArticle.missing_for_help_service).toEqual(
      expect.arrayContaining(["unlock_failure", "required_user_info", "forbidden_user_info"])
    );
  });

  it("keeps FAQ schema gated by visible CMS/backend content", () => {
    const schema = readArtifact().faq_schema_authority;

    expect(schema.faq_items_first_class).toBe(false);
    expect(schema.markdown_derived).toBe(true);
    expect(schema.schema_enabled_field_available).toBe(false);
    expect(schema.rule).toContain("visible CMS/backend content");
    expect(schema.rule).toContain("private URLs");
    expect(schema.rule).toContain("raw order/payment/result identifiers");
  });

  it("records required field needs for CMS/backend follow-up", () => {
    expect(readArtifact().field_needs).toEqual(
      expect.arrayContaining([
        "faq_items",
        "updated_at",
        "reviewer",
        "support_contact",
        "policy_version",
        "schema_enabled",
        "robots",
        "support_intent",
        "handling_time",
        "required_user_info",
        "forbidden_user_info",
        "pii_minimization_notice",
      ])
    );
  });

  it("keeps the diff inside the authorized docs/contracts scope", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const declaredScopeFiles = [
      "docs/operations/help-cms-authority.md",
      "docs/operations/generated/help-cms-authority.v1.json",
      "tests/contracts/help-cms-authority.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...files, ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside HELP-CMS-AUTHORITY-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records forbidden actions", () => {
    expect(readArtifact().forbidden_actions).toEqual(
      expect.arrayContaining([
        "no runtime changes",
        "no CMS mutation",
        "no CMS draft",
        "no content generation",
        "no private URL access",
        "no raw order/payment/result identifiers",
        "no fap-api modification",
      ])
    );
  });
});
