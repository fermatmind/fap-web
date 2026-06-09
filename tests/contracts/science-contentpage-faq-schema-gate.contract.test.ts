import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/science-contentpage-faq-schema-gate-01.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/science-contentpage-faq-schema-gate-01.md");

const ALLOWED_FILES = new Set([
  "components/layout/SiteFooter.tsx",
  "docs/claims/generated/science-contentpage-claim-gate-01.v1.json",
  "docs/claims/science-contentpage-claim-gate-01.md",
  "docs/seo/generated/science-contentpage-discoverability-gate-01.v1.json",
  "docs/seo/generated/science-contentpage-faq-schema-gate-01.v1.json",
  "docs/seo/science-contentpage-discoverability-gate-01.md",
  "docs/seo/science-contentpage-faq-schema-gate-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/navigation-dead-links.contract.test.ts",
  "tests/contracts/science-contentpage-claim-gate.contract.test.ts",
  "tests/contracts/science-contentpage-discoverability-gate.contract.test.ts",
  "tests/contracts/science-contentpage-faq-schema-gate.contract.test.ts",
  "tests/contracts/site-footer-routing.contract.test.tsx",
]);

type FaqSchemaGateArtifact = {
  version: string;
  id: string;
  mode: string;
  runtime_behavior_changed: boolean;
  publish_allowed: boolean;
  schema_enabled_default: boolean;
  eligible_route_candidates: string[];
  faq_schema_requirements: Array<{ id: string; status: string; rule: string }>;
  blocked_sources: string[];
  blocked_claim_categories: string[];
  forbidden_route_patterns: string[];
  review_fields: {
    Codex_QA_required: boolean;
    Operator_approval_required: boolean;
    claim_gate_required: boolean;
    visible_render_required: boolean;
    schema_enabled: boolean;
    publish_allowed: boolean;
    approved_at: string | null;
    published_at: string | null;
  };
  non_runtime_change_guarantees: Record<string, boolean>;
  next_gate: string;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
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

describe("SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01", () => {
  it("defines FAQ schema eligibility as a non-runtime gate", () => {
    const artifact = readJson<FaqSchemaGateArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("seo.science_contentpage_faq_schema_gate.v1");
    expect(artifact.id).toBe("SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01");
    expect(artifact.mode).toBe("approved_cms_visible_faq_schema_gate");
    expect(artifact.runtime_behavior_changed).toBe(false);
    expect(artifact.publish_allowed).toBe(true);
    expect(artifact.schema_enabled_default).toBe(true);
  });

  it("requires visible CMS/backend FAQ authority and claim-gate approval", () => {
    const artifact = readJson<FaqSchemaGateArtifact>(ARTIFACT_PATH);
    const rules = new Map(artifact.faq_schema_requirements.map((rule) => [rule.id, rule]));

    expect(rules.get("visible_faq_required")?.rule).toContain("visibly rendered");
    expect(rules.get("cms_backend_authority_required")?.rule).toContain("CMS/backend-authoritative");
    expect(rules.get("claim_gate_required")?.rule).toContain("SCIENCE-CONTENTPAGE-CLAIM-GATE-01");
    expect(rules.get("unknown_preserved_as_unknown")?.rule).toContain("Unknown");
  });

  it("blocks hidden FAQ schema stuffing and private-route FAQ sources", () => {
    const artifact = readJson<FaqSchemaGateArtifact>(ARTIFACT_PATH);

    expect(artifact.blocked_sources).toEqual(
      expect.arrayContaining([
        "hidden_metadata_only_faq",
        "draft_package_only_faq",
        "non_visible_import_field_faq",
        "frontend_fallback_faq",
        "competitor_imitation_faq",
        "unsupported_claim_faq",
        "private_or_tokenized_url_faq",
      ])
    );
    expect(artifact.forbidden_route_patterns).toEqual(
      expect.arrayContaining(["/result", "/results/", "/orders", "/pay", "/payment", "/share/", "/history", "token=", "orderNo="])
    );
  });

  it("inherits blocked science claim categories before schema eligibility", () => {
    const artifact = readJson<FaqSchemaGateArtifact>(ARTIFACT_PATH);

    expect(artifact.blocked_claim_categories).toEqual(
      expect.arrayContaining([
        "medical_diagnostic_blocked",
        "career_guarantee_blocked",
        "official_endorsement_blocked",
        "competitor_imitation_blocked",
        "unsupported_proof_blocked",
        "item_bank_leakage_blocked",
        "privacy_overclaim_blocked",
      ])
    );
    expect(artifact.review_fields).toMatchObject({
      Codex_QA_required: true,
      Operator_approval_required: false,
      claim_gate_required: true,
      visible_render_required: true,
      schema_enabled: true,
      publish_allowed: true,
      approved_at: "2026-06-09",
      published_at: "2026-06-09",
    });
  });

  it("keeps candidate routes public canonical and discoverability deferred", () => {
    const artifact = readJson<FaqSchemaGateArtifact>(ARTIFACT_PATH);

    expect(artifact.eligible_route_candidates).toEqual([
      "/science",
      "/item-design-notes",
      "/reliability-validity",
      "/data-privacy",
      "/common-misconceptions",
      "/method-boundaries",
    ]);
    expect(artifact.eligible_route_candidates.every((route) => route.startsWith("/") && !route.includes("?"))).toBe(true);
    expect(artifact.next_gate).toBe("SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01");
  });

  it("does not include frontend FAQ copy or private-route schema sources", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("FAQ text remains CMS/backend-authoritative.");
    expect(doc).toContain("Private, tokenized, payment, order, result, share, history, or user-specific routes.");
    expect(doc).not.toMatch(/sitemap_eligible:\s*true/i);
    expect(doc).not.toMatch(/llms_eligible:\s*true/i);
    expect(doc).not.toMatch(/footer_eligible:\s*true/i);
  });

  it("keeps the diff inside the authorized FAQ schema gate scope", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    for (const file of files) {
      expect(ALLOWED_FILES.has(file), `${file} is outside SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01 scope`).toBe(true);
      if (ALLOWED_FILES.has(file)) continue;
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });
});
