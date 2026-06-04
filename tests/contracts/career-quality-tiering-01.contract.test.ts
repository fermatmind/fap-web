import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type TierRow = {
  slug: string;
  tier: string;
  risk_codes: string[];
};

type CareerQualityTieringArtifact = {
  schema_version: string;
  task: string;
  scope_guard: {
    no_career_body_generated: boolean;
    no_cms_mutation: boolean;
    no_backend_mutation: boolean;
    no_publish: boolean;
    no_deploy: boolean;
    search_channel_action_performed: boolean;
    url_submission_performed: boolean;
    external_search_api_call_performed: boolean;
    pseo_blast_performed: boolean;
    strong_claims_added: boolean;
  };
  tier_schema: Array<{ tier: string; promotion_allowed: string }>;
  inventory_summary: {
    career_index_en_count: number;
    career_index_zh_count: number;
    unique_career_slugs: number;
    sitemap_career_detail_urls: number;
    sitemap_unique_career_slugs: number;
    career_jobs_hub_in_sitemap: boolean;
    excluded_slug_safety: Array<{ slug: string; in_index: boolean; in_sitemap: boolean }>;
  };
  tier_counts: Record<string, number>;
  risk_categories: {
    claim_risk: {
      strong_claim_without_final_review: number;
      salary_claim_without_final_review: number;
    };
  };
  hub_suitability: {
    decision: string;
  };
  next_prs: Array<{
    proposed_pr_train_id: string;
    manifest_state_authorization_required: boolean;
  }>;
  go_no_go: {
    career_pseo_amplification: string;
    search_submission_allowed_by_this_artifact: boolean;
    career_body_generation_allowed_by_this_artifact: boolean;
  };
  rows: TierRow[];
};

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("CAREER-QUALITY-TIERING-01 artifact contract", () => {
  const artifact = readJson<CareerQualityTieringArtifact>("docs/seo/generated/career-quality-tiering-01.v1.json");

  it("locks the read-only 1046 inventory scope and pSEO no-go decision", () => {
    expect(artifact.schema_version).toBe("1.0");
    expect(artifact.task).toBe("CAREER-QUALITY-TIERING-01");
    expect(artifact.inventory_summary.career_index_en_count).toBe(1046);
    expect(artifact.inventory_summary.career_index_zh_count).toBe(1046);
    expect(artifact.inventory_summary.unique_career_slugs).toBe(1046);
    expect(artifact.inventory_summary.sitemap_career_detail_urls).toBe(2092);
    expect(artifact.inventory_summary.sitemap_unique_career_slugs).toBe(1046);
    expect(artifact.rows).toHaveLength(1046);

    expect(artifact.go_no_go.career_pseo_amplification).toBe("NO_GO");
    expect(artifact.go_no_go.search_submission_allowed_by_this_artifact).toBe(false);
    expect(artifact.go_no_go.career_body_generation_allowed_by_this_artifact).toBe(false);
  });

  it("keeps scope guards explicit for no CMS, backend, deploy, publish, or URL submission work", () => {
    expect(artifact.scope_guard).toMatchObject({
      no_career_body_generated: true,
      no_cms_mutation: true,
      no_backend_mutation: true,
      no_publish: true,
      no_deploy: true,
      search_channel_action_performed: false,
      url_submission_performed: false,
      external_search_api_call_performed: false,
      pseo_blast_performed: false,
      strong_claims_added: false,
    });
  });

  it("preserves conservative tier schema and hub no-go posture", () => {
    const tierNames = artifact.tier_schema.map((tier) => tier.tier);

    expect(tierNames).toEqual(
      expect.arrayContaining([
        "tier_a_controlled_search_entry_candidate",
        "tier_b_content_watchlist_schema_sample_required",
        "tier_c_internal_auxiliary_claim_review_required",
        "tier_c_internal_auxiliary_thin_shell_risk",
        "tier_d_hold_not_search_entry",
      ]),
    );
    expect(artifact.tier_counts.tier_a_controlled_search_entry_candidate).toBe(6);
    expect(artifact.hub_suitability.decision).toBe("no_go_as_sitemap_hub_now");
    expect(artifact.inventory_summary.career_jobs_hub_in_sitemap).toBe(false);
  });

  it("keeps held slugs out of index and sitemap and records claim risk", () => {
    expect(artifact.inventory_summary.excluded_slug_safety).toEqual(
      expect.arrayContaining([
        { slug: "software-developers", in_index: false, in_sitemap: false },
        { slug: "digital-forensics-analysts", in_index: false, in_sitemap: false },
        { slug: "computer-occupations-all-other", in_index: false, in_sitemap: false },
      ]),
    );
    expect(artifact.risk_categories.claim_risk.strong_claim_without_final_review).toBeGreaterThan(0);
    expect(artifact.risk_categories.claim_risk.salary_claim_without_final_review).toBeGreaterThan(0);
  });

  it("requires explicit manifest and state authorization for proposed follow-up PRs", () => {
    expect(artifact.next_prs.map((pr) => pr.proposed_pr_train_id)).toEqual(
      expect.arrayContaining([
        "CAREER-THIN-CONTENT-REPAIR-01",
        "CAREER-JOB-SCHEMA-FAQ-BREADCRUMB-01",
        "CAREER-INTERNAL-LINKS-CTA-GATE-01",
      ]),
    );
    expect(artifact.next_prs.every((pr) => pr.manifest_state_authorization_required === true)).toBe(true);
  });
});
