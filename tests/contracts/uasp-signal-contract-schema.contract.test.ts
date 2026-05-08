import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/uasp-signal-contract-schema.md");
const TRAIN_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1.yaml");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

const APPROVED_ENUMS = {
  signal_type: [
    "identity",
    "trait",
    "interest",
    "ability",
    "emotion",
    "relationship",
    "workstyle",
    "motivation",
    "state",
    "value",
    "learning",
  ],
  result_shape: [
    "type",
    "vector",
    "band",
    "score",
    "facet_vector",
    "profile",
    "hybrid",
    "state",
    "ability_estimate",
    "ranked_profile",
  ],
  stability: [
    "stable_trait",
    "semi_stable_preference",
    "temporary_state",
    "ability_estimate",
    "contextual_pattern",
    "developmental",
    "unknown",
  ],
  sensitivity: [
    "normal",
    "sensitive",
    "mental_health_sensitive",
    "ability_sensitive",
    "minor_sensitive",
    "workplace_sensitive",
    "relationship_sensitive",
  ],
  profile_contribution: ["none", "summary_only", "longitudinal", "sensitive_opt_in", "ephemeral", "blocked"],
  decision_domain: [
    "self_understanding",
    "career_decision",
    "workstyle_decision",
    "relationship_decision",
    "learning_growth",
    "emotional_state",
    "ability_growth",
    "team_communication",
    "leadership_growth",
    "life_direction",
  ],
  claim_level: ["descriptive", "interpretive", "directional", "decision_support", "recommendation_candidate", "forbidden"],
  recommendation_eligible: ["not_eligible", "explanation_only", "next_step_only", "candidate_signal", "eligible_with_guard"],
  seo_geo_eligible: ["not_eligible", "seo_only", "geo_candidate", "llms_eligible", "llms_full_eligible", "private_noindex"],
  freemium_status: ["not_monetized", "free_only", "backend_ready", "frontend_partial", "full_loop", "bundle_candidate", "blocked"],
} as const;

const REQUIRED_FIELDS = [
  "scale_code",
  "scale_slug",
  "form_code",
  "signal_type",
  "result_shape",
  "stability",
  "sensitivity",
  "decision_domains",
  "claim_level",
  "profile_contribution",
  "recommendation_eligible",
  "report_eligible",
  "seo_geo_eligible",
  "freemium_status",
  "evidence_required",
  "disclaimer_required",
  "runtime_authority_owner",
  "frontend_fallback_policy",
  "version",
  "locale_support",
  "source_authority",
  "rollback_policy",
] as const;

type UaspSignalContractSchema = {
  version: string;
  scope: string;
  trainName: string;
  manualDecisionVersion: string;
  runtimeBehaviorChanged: boolean;
  sourceFiles: string[];
  contractFields: string[];
  enums: Record<keyof typeof APPROVED_ENUMS, string[]>;
  defaultsForFutureScale: {
    recommendation_eligible: string;
    seo_geo_eligible: string;
    profile_contribution: string;
    freemium_status: string;
    claim_level: string;
    stability: string;
    report_eligible: boolean;
    evidence_required: boolean;
    disclaimer_required: boolean;
    frontend_fallback_policy: string;
  };
  hardRules: string[];
  mustNotChange: string[];
};

function readArtifact(): UaspSignalContractSchema {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as UaspSignalContractSchema;
}

describe("UASP signal contract schema", () => {
  it("registers the UASP v1 PR train without overwriting prior PRAC ledgers", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST_PATH, "utf8");
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      pr_namespace: string;
      allowed_first_batch_scales: string[];
      prs: Array<{ id: string; branch: string; status: string; depends_on: string[] }>;
    };

    expect(manifest).toContain("train_name: universal-assessment-signal-platform-v1-train");
    expect(manifest).toContain("pr_namespace: PR-UASP-*");
    expect(manifest).toContain("codex/pr-uasp-01-signal-contract-schema");
    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(state.pr_namespace).toBe("PR-UASP-*");
    expect(state.allowed_first_batch_scales).toEqual(["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM"]);
    expect(state.prs.map((pr) => pr.id)).toEqual([
      "PR-UASP-01",
      "PR-UASP-02",
      "PR-UASP-03",
      "PR-UASP-04",
      "PR-UASP-05",
      "PR-UASP-06",
    ]);
    expect(state.prs[0]).toMatchObject({
      branch: "codex/pr-uasp-01-signal-contract-schema",
      depends_on: [],
    });
    expect(["in_progress", "merged"]).toContain(state.prs[0]?.status);
  });

  it("defines every UASP v1 contract field", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("uasp.signal_contract_schema.v1");
    expect(artifact.scope).toBe("PR-UASP-01");
    expect(artifact.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(artifact.manualDecisionVersion).toBe("uasp.manual-decision.v1");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.contractFields).toEqual([...REQUIRED_FIELDS]);
  });

  it("encodes only the approved manual-decision enums", () => {
    const artifact = readArtifact();

    expect(Object.keys(artifact.enums).sort()).toEqual(Object.keys(APPROVED_ENUMS).sort());
    for (const [enumName, values] of Object.entries(APPROVED_ENUMS)) {
      expect(artifact.enums[enumName as keyof typeof APPROVED_ENUMS], enumName).toEqual([...values]);
    }

    const serialized = JSON.stringify(artifact.enums);
    expect(serialized).not.toContain("almost_ready");
    expect(serialized).not.toContain("probably_ok");
    expect(serialized).not.toContain("career_match_signal");
    expect(serialized).not.toContain("full_ai_ready");
  });

  it("locks conservative defaults for future and unknown scales", () => {
    const artifact = readArtifact();

    expect(artifact.defaultsForFutureScale).toMatchObject({
      recommendation_eligible: "not_eligible",
      seo_geo_eligible: "not_eligible",
      profile_contribution: "none",
      freemium_status: "blocked",
      claim_level: "descriptive",
      stability: "unknown",
      report_eligible: false,
      evidence_required: true,
      disclaimer_required: false,
      frontend_fallback_policy: "forbidden_for_new_surface",
    });
  });

  it("documents UASP safety rules and runtime no-change boundary", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "A scale cannot be public-catalog-ready without UASP signal contract.",
        "A scale cannot be recommendation-ready without claim + evidence + graph + runtime support.",
        "A scale cannot be SEO/GEO-ready without evidence + discoverability + claim boundary.",
        "A scale cannot be monetization-ready without freemium parity proof.",
        "Frontend fallback cannot become scale authority.",
      ])
    );
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "runtime",
        "scoring",
        "report entitlement",
        "checkout/payment",
        "profile runtime",
        "recommendation runtime",
        "SEO/GEO exposure",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Do not invent enums");
    expect(doc).toContain("Default Gates");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
