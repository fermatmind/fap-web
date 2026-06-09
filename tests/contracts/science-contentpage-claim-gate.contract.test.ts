import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/science-contentpage-claim-gate-01.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/science-contentpage-claim-gate-01.md");

type ClaimGateArtifact = {
  version: string;
  id: string;
  mode: string;
  runtime_behavior_changed: boolean;
  publish_allowed: boolean;
  source_assets: string[];
  canonical_route_candidates: string[];
  forbidden_route_patterns: string[];
  blocked_claim_categories: Array<{
    id: string;
    status: string;
    priority: string;
    examples: string[];
  }>;
  allowed_boundary_classes: string[];
  review_fields: {
    GPT_owner: string;
    Codex_QA_required: boolean;
    Operator_approval_required: boolean;
    publish_allowed: boolean;
    approved_at: string | null;
    published_at: string | null;
  };
  next_gates: string[];
  non_runtime_change_guarantees: Record<string, boolean>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("SCIENCE-CONTENTPAGE-CLAIM-GATE-01", () => {
  it("defines a non-runtime claim gate for science content pages", () => {
    const artifact = readJson<ClaimGateArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.science_contentpage_claim_gate.v1");
    expect(artifact.id).toBe("SCIENCE-CONTENTPAGE-CLAIM-GATE-01");
    expect(artifact.mode).toBe("approved_claim_gate");
    expect(artifact.runtime_behavior_changed).toBe(false);
    expect(artifact.publish_allowed).toBe(true);
  });

  it("limits route references to public canonical science content routes", () => {
    const artifact = readJson<ClaimGateArtifact>(ARTIFACT_PATH);

    expect(artifact.canonical_route_candidates).toEqual([
      "/science",
      "/item-design-notes",
      "/reliability-validity",
      "/data-privacy",
      "/common-misconceptions",
      "/method-boundaries",
    ]);
    expect(artifact.canonical_route_candidates.every((route) => route.startsWith("/") && !route.includes("?"))).toBe(true);
    expect(artifact.forbidden_route_patterns).toEqual(
      expect.arrayContaining(["/result", "/results/", "/orders", "/pay", "/payment", "/share/", "/history", "token=", "orderNo="])
    );
  });

  it("blocks diagnostic, guarantee, endorsement, imitation, proof, item leakage, and privacy overclaims", () => {
    const artifact = readJson<ClaimGateArtifact>(ARTIFACT_PATH);
    const byId = new Map(artifact.blocked_claim_categories.map((category) => [category.id, category]));

    for (const id of [
      "medical_diagnostic_blocked",
      "career_guarantee_blocked",
      "official_endorsement_blocked",
      "competitor_imitation_blocked",
      "unsupported_proof_blocked",
      "item_bank_leakage_blocked",
      "privacy_overclaim_blocked",
    ]) {
      expect(byId.get(id), id).toMatchObject({ status: "forbidden", priority: "P0" });
      expect(byId.get(id)?.examples.length, id).toBeGreaterThan(1);
    }
  });

  it("keeps Unknown and approved review gates explicit before schema or discoverability", () => {
    const artifact = readJson<ClaimGateArtifact>(ARTIFACT_PATH);

    expect(artifact.allowed_boundary_classes).toEqual(
      expect.arrayContaining(["unknown_preserved_as_unknown", "approved_review_state", "visible_source_alignment", "public_canonical_route_only"])
    );
    expect(artifact.review_fields).toMatchObject({
      GPT_owner: "required_for_request_card_inputs_only",
      Codex_QA_required: true,
      Operator_approval_required: false,
      publish_allowed: true,
      approved_at: "2026-06-09",
      published_at: "2026-06-09",
    });
    expect(artifact.next_gates).toEqual(["SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01", "SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01"]);
  });

  it("does not include frontend page copy or private-route exposure instructions", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Public body copy remains CMS/backend-authoritative.");
    expect(doc).toContain("private-route references remain blocked");
    expect(doc).not.toMatch(/sitemap_eligible:\s*true/i);
    expect(doc).not.toMatch(/llms_eligible:\s*true/i);
    expect(doc).not.toMatch(/footer_eligible:\s*true/i);
  });
});
