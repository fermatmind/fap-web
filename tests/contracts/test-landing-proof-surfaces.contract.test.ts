import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/test-landing-proof-surfaces.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/test-landing-proof-surfaces.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type ProofField = {
  field: string;
  required: boolean;
  source_of_truth: string;
  fake_or_manual_value_allowed: boolean;
  missing_behavior?: string;
};

type Surface = {
  id: string;
  surface_kind: string;
  scale_code?: string;
  canonical_route: string;
  forms?: Array<{ form_code: string; question_count: number; estimated_minutes: number }>;
  proof_fields: Array<string | ProofField>;
  boundary_field?: string;
  faq_schema_source: string;
  internal_link_slots: string[];
  gpt55_cms_fields: string[];
  mobile_first_cta?: {
    required: boolean;
    href_source: string;
    label_source: string;
    private_flow_links_allowed: boolean;
  };
};

type Artifact = {
  version: string;
  task_id: string;
  title: string;
  run_mode: string;
  runtime_behavior_changed: boolean;
  cms_changes_included: boolean;
  publishable_copy_included: boolean;
  reviews_or_ratings_invented: boolean;
  deployment_allowed: boolean;
  authority_boundaries: {
    content_authority: string;
    proof_authority: string;
    schema_authority: string;
    codex_role: string;
    gpt55_role: string;
  };
  source_backing_rules: string[];
  first_viewport_explainer: {
    surface: string;
    required_explainer_slots: string[];
    publishable_copy_allowed: boolean;
  };
  common_required_page_fields: string[];
  blocked_claim_fields: Array<{ field: string; blocked_until: string }>;
  surfaces: Surface[];
  free_paid_boundary: {
    copy_generation_allowed_for_codex: boolean;
    required_fields: string[];
    price_source: string;
    entitlement_source: string;
    missing_offer_behavior: string;
  };
  faq_and_schema_rules: Record<string, boolean | string>;
  internal_link_rules: {
    private_flow_links_allowed: boolean;
    forbidden_route_fragments: string[];
    take_route_exception: string;
  };
  mobile_first_cta_rules: Record<string, boolean | string>;
  repository_rule_impact: string;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
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

function isAllowedFile(file: string): boolean {
  return [
    "docs/seo/test-landing-proof-surfaces.md",
    "docs/seo/generated/test-landing-proof-surfaces.v1.json",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
    "tests/contracts/test-landing-proof-surfaces.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
  ].includes(file);
}

describe("test landing proof surfaces contract", () => {
  it("keeps the task docs/contract/readiness only", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("test_landing_proof_surfaces.v1");
    expect(artifact.task_id).toBe("TEST-LANDING-PROOF-SURFACE-01");
    expect(artifact.title).toBe("docs(seo): define source-backed test landing proof surfaces");
    expect(artifact.run_mode).toBe("docs_contract_readiness");
    expect(artifact.runtime_behavior_changed).toBe(false);
    expect(artifact.cms_changes_included).toBe(false);
    expect(artifact.publishable_copy_included).toBe(false);
    expect(artifact.reviews_or_ratings_invented).toBe(false);
    expect(artifact.deployment_allowed).toBe(false);
  });

  it("locks Codex to QA and rendering contract responsibility", () => {
    const artifact = readArtifact();

    expect(artifact.authority_boundaries).toMatchObject({
      content_authority: "backend_cms_content_fields",
      proof_authority: "backend_or_analytics_read_models",
      schema_authority: "visible_page_content_or_backend_cms_fields",
      codex_role: "qa_and_rendering_contract_only",
      gpt55_role: "fill_approved_cms_content_fields_after_source_data_exists",
    });
    expect(artifact.free_paid_boundary.copy_generation_allowed_for_codex).toBe(false);
  });

  it("covers homepage first viewport explanation requirements", () => {
    const artifact = readArtifact();

    expect(artifact.first_viewport_explainer.surface).toBe("homepage");
    expect(artifact.first_viewport_explainer.publishable_copy_allowed).toBe(false);
    expect(artifact.first_viewport_explainer.required_explainer_slots).toEqual(
      expect.arrayContaining([
        "priority_test_selection",
        "user_outcome_preview",
        "method_boundary",
        "duration_and_forms",
        "free_paid_boundary",
        "proof_availability_state",
        "mobile_primary_cta",
      ])
    );
  });

  it("defines MBTI, RIASEC, and Big Five proof fields with canonical routes and form facts", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.surfaces.map((surface) => [surface.id, surface]));

    expect(byId.get("mbti_landing")).toMatchObject({
      scale_code: "MBTI",
      canonical_route: "/tests/mbti-personality-test-16-personality-types",
    });
    expect(byId.get("riasec_landing")).toMatchObject({
      scale_code: "RIASEC",
      canonical_route: "/tests/holland-career-interest-test-riasec",
    });
    expect(byId.get("big5_landing")).toMatchObject({
      scale_code: "BIG5_OCEAN",
      canonical_route: "/tests/big-five-personality-test-ocean-model",
    });

    expect(byId.get("mbti_landing")?.forms).toEqual(
      expect.arrayContaining([
        { form_code: "mbti_144", question_count: 144, estimated_minutes: 15 },
        { form_code: "mbti_93", question_count: 93, estimated_minutes: 10 },
      ])
    );
    expect(byId.get("riasec_landing")?.forms).toEqual(
      expect.arrayContaining([
        { form_code: "riasec_60", question_count: 60, estimated_minutes: 8 },
        { form_code: "riasec_140", question_count: 140, estimated_minutes: 18 },
      ])
    );
    expect(byId.get("big5_landing")?.forms).toEqual(
      expect.arrayContaining([
        { form_code: "big5_120", question_count: 120, estimated_minutes: 20 },
        { form_code: "big5_90", question_count: 90, estimated_minutes: 15 },
      ])
    );

    for (const id of ["mbti_landing", "riasec_landing", "big5_landing"]) {
      const proofFields = byId.get(id)?.proof_fields ?? [];
      expect(proofFields).toEqual(
        expect.arrayContaining([
          "form_inventory",
          "duration",
          "free_result_scope",
          "paid_report_scope",
          "faq_items",
          "schema_source",
          "internal_link_slots",
          "mobile_primary_cta",
        ])
      );
    }
  });

  it("keeps reviews, ratings, completions, and user counts blocked unless source-backed", () => {
    const artifact = readArtifact();
    const blockedFields = artifact.blocked_claim_fields.map((entry) => entry.field);

    expect(blockedFields).toEqual(
      expect.arrayContaining([
        "rating_value",
        "review_count",
        "aggregate_rating_schema",
        "completion_count",
        "user_count",
        "media_mention",
        "expert_review",
        "testimonial",
      ])
    );
    expect(artifact.source_backing_rules.join("\n")).toContain("Unknown proof values must stay Unknown");
    expect(artifact.source_backing_rules.join("\n")).toContain("must not be converted to 0");
  });

  it("defines free/paid boundary fields without writing copy or frontend offer truth", () => {
    const artifact = readArtifact();

    expect(artifact.free_paid_boundary.required_fields).toEqual(
      expect.arrayContaining([
        "free_result_scope",
        "paid_report_scope",
        "offer_source",
        "entitlement_source",
        "cta_label_source",
        "cta_href_source",
      ])
    );
    expect(artifact.free_paid_boundary.price_source).toBe("backend_commerce_offer_read_model");
    expect(artifact.free_paid_boundary.entitlement_source).toBe("backend_entitlement_truth");
    expect(artifact.free_paid_boundary.missing_offer_behavior).toBe("hide_price_and_paid_claims");
  });

  it("requires FAQ and schema to come from visible CMS/API fields", () => {
    const artifact = readArtifact();

    expect(artifact.faq_and_schema_rules.faq_source).toBe("visible_cms_or_public_api_faq");
    expect(artifact.faq_and_schema_rules.faq_page_schema_hidden_content_allowed).toBe(false);
    expect(artifact.faq_and_schema_rules.software_application_schema_allowed_from_visible_facts).toBe(true);
    expect(artifact.faq_and_schema_rules.review_schema_allowed).toBe(false);
    expect(artifact.faq_and_schema_rules.aggregate_rating_schema_allowed).toBe(false);
    expect(artifact.faq_and_schema_rules.product_schema_allowed).toBe(false);
    expect(artifact.faq_and_schema_rules.offer_schema_allowed_without_backend_offer).toBe(false);
  });

  it("guards internal links and mobile CTAs against private flow exposure", () => {
    const artifact = readArtifact();
    const homepage = artifact.surfaces.find((surface) => surface.id === "homepage_first_viewport");

    expect(homepage?.internal_link_slots).toEqual(
      expect.arrayContaining([
        "/tests/mbti-personality-test-16-personality-types",
        "/tests/holland-career-interest-test-riasec",
        "/tests/big-five-personality-test-ocean-model",
      ])
    );
    expect(homepage?.mobile_first_cta).toMatchObject({
      required: true,
      private_flow_links_allowed: false,
    });
    expect(artifact.internal_link_rules.private_flow_links_allowed).toBe(false);
    expect(artifact.internal_link_rules.forbidden_route_fragments).toEqual(
      expect.arrayContaining(["/result/", "/results/", "/orders/", "/share/", "/pay/", "/payment/", "/checkout/"])
    );
    expect(artifact.internal_link_rules.take_route_exception).toContain("public canonical take route");
    expect(artifact.mobile_first_cta_rules.one_primary_cta_required).toBe(true);
    expect(artifact.mobile_first_cta_rules.secondary_ctas_must_not_push_primary_below_first_viewport).toBe(true);
  });

  it("documents GPT-5.5 Pro CMS fields and repository rule impact", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    for (const field of [
      "hero_value_summary",
      "method_summary",
      "form_selector_summary",
      "free_result_scope",
      "paid_report_scope",
      "faq_items",
      "primary_cta_label",
      "internal_link_labels",
    ]) {
      expect(doc).toContain(field);
    }

    expect(doc).toContain("Repository rule impact: docs/contract/readiness only.");
    expect(artifact.repository_rule_impact).toContain("CMS/backend authority");
  });

  it("registers the train item and reconciles the merged control tower dependency", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{
        id: string;
        status: string;
        title: string;
        merged_at?: string | null;
        remote_branch_deleted?: boolean;
        local_cleanup_executed?: boolean;
      }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("COMMERCIAL-READINESS-CONTROL-TOWER-01")).toMatchObject({
      status: "merged",
      merged_at: "2026-06-04T08:25:30Z",
      remote_branch_deleted: true,
      local_cleanup_executed: true,
    });
    expect(byId.get("TEST-LANDING-PROOF-SURFACE-01")).toMatchObject({
      title: "docs(seo): define source-backed test landing proof surfaces",
    });
    expect(["in_progress", "pr_open", "merged"]).toContain(byId.get("TEST-LANDING-PROOF-SURFACE-01")?.status);
  });

  it("keeps the active diff inside the declared docs and contract scope", () => {
    const files = changedFiles();
    if (files.length === 0) return;

    expect(files.every((file) => isAllowedFile(file) || isCurrentRiasecPack12AllowedFile(file))).toBe(true);
  });
});
