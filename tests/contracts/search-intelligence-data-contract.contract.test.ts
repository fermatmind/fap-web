import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/search-intelligence-data-contract.v1.json");

type Artifact = {
  version: string;
  source_documents: string[];
  source_of_truth_hierarchy: Array<{ rank: number; source: string }>;
  truth_rules: {
    purchase_truth: string;
    purchase_truth_not_ga4: boolean;
    api_track_role: string;
    api_track_final_source_of_truth: boolean;
  };
  key_model: {
    seo_url_key: string[];
    private_flows_excluded_from_seo_url_entities: boolean;
    excluded_private_flows: string[];
  };
  funnel_event_taxonomy: {
    canonical_events: string[];
    legacy_aliases: Record<string, string>;
  };
  attribution_model: {
    first_touch_window_days: number;
    last_touch_window_days: number;
    cta_touch_window: string;
    keyword_direct_purchase_attribution_allowed: boolean;
  };
  search_channel_model: {
    first_class_channels: string[];
    reserved_planned_channels: string[];
    china_search_engines_are_channel_adapters: boolean;
    domestic_search_alternate_truth_allowed: boolean;
  };
  pii_rules: {
    forbidden_in_seo_intel_detail: string[];
    raw_order_no_allowed_for_normal_dashboards: boolean;
  };
  consent_model: {
    consent_state_required: boolean;
    field: string;
  };
  internal_qa_filtering: {
    traffic_labels: string[];
    default_dashboard_excludes_internal_qa_bot_non_production: boolean;
  };
  revenue_model: {
    source_of_truth: string;
  };
  semantic_claim_boundaries: {
    forbidden_implications: string[];
    forbidden_metric_name_fragments: string[];
  };
  logical_table_plan: {
    migrations_created: boolean;
    physical_schema_created: boolean;
    tables: string[];
  };
  next_task: string;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function currentChangedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
  ]) {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const line of output.split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/seo/search-intelligence-data-contract.md",
    "docs/seo/generated/search-intelligence-data-contract.v1.json",
    "tests/contracts/search-intelligence-data-contract.contract.test.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file);
}

describe("Search Intelligence data contract", () => {
  it("has version and required source documents", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("search_intelligence_data_contract.v1");
    expect(artifact.source_documents).toEqual(
      expect.arrayContaining(["SEO-DASH-00A", "BACKEND-RUNTIME-02D", "ARCH-SEO-CMS-01", "ARCH-SEO-CMS-02"])
    );
  });

  it("locks purchase truth to backend orders, payments, and benefits rather than GA4", () => {
    const artifact = readArtifact();

    expect(artifact.truth_rules.purchase_truth).toBe("backend_orders_payment_benefit");
    expect(artifact.truth_rules.purchase_truth_not_ga4).toBe(true);
    expect(artifact.revenue_model.source_of_truth).toBe("backend_orders_payment_benefit");
  });

  it("keeps /api/track as transport rather than final source of truth", () => {
    const artifact = readArtifact();

    expect(artifact.truth_rules.api_track_role).toBe("transport_only");
    expect(artifact.truth_rules.api_track_final_source_of_truth).toBe(false);
    expect(artifact.source_of_truth_hierarchy.map((source) => source.source)).toEqual([
      "backend_business_truth",
      "backend_events",
      "fap_web_public_runtime",
      "search_engine_data",
      "browser_analytics",
    ]);
  });

  it("uses canonical URL plus locale and excludes private flows from SEO URL entities", () => {
    const artifact = readArtifact();

    expect(artifact.key_model.seo_url_key).toEqual(["canonical_url", "locale"]);
    expect(artifact.key_model.private_flows_excluded_from_seo_url_entities).toBe(true);
    expect(artifact.key_model.excluded_private_flows).toEqual(
      expect.arrayContaining(["result", "order", "take", "share", "pay", "checkout", "webhook"])
    );
  });

  it("defines the canonical funnel events and legacy pay_success alias", () => {
    const artifact = readArtifact();

    expect(artifact.funnel_event_taxonomy.canonical_events).toEqual(
      expect.arrayContaining([
        "start_attempt",
        "submit_attempt",
        "view_result",
        "click_unlock",
        "create_order",
        "payment_confirmed",
        "purchase_success",
      ])
    );
    expect(artifact.funnel_event_taxonomy.legacy_aliases.pay_success).toBe("purchase_success");
  });

  it("records attribution windows and forbids direct keyword purchase attribution", () => {
    const artifact = readArtifact();

    expect(artifact.attribution_model.first_touch_window_days).toBe(30);
    expect(artifact.attribution_model.last_touch_window_days).toBe(7);
    expect(artifact.attribution_model.cta_touch_window).toBe("same_session_or_24h");
    expect(artifact.attribution_model.keyword_direct_purchase_attribution_allowed).toBe(false);
  });

  it("treats China search engines as channel adapters, not alternate truth", () => {
    const artifact = readArtifact();

    expect(artifact.search_channel_model.first_class_channels).toEqual(
      expect.arrayContaining(["google", "baidu", "bing_indexnow", "llms", "paid_google", "paid_baidu"])
    );
    expect(artifact.search_channel_model.reserved_planned_channels).toEqual(
      expect.arrayContaining(["so360", "sogou", "shenma", "quark", "ai_search"])
    );
    expect(artifact.search_channel_model.china_search_engines_are_channel_adapters).toBe(true);
    expect(artifact.search_channel_model.domestic_search_alternate_truth_allowed).toBe(false);
  });

  it("forbids email and raw order references from SEO detail dashboards", () => {
    const artifact = readArtifact();

    expect(artifact.pii_rules.forbidden_in_seo_intel_detail).toEqual(
      expect.arrayContaining(["email", "raw_cookies", "payment_payload", "raw_order_no", "raw_attempt_id"])
    );
    expect(artifact.pii_rules.raw_order_no_allowed_for_normal_dashboards).toBe(false);
  });

  it("requires consent state and internal QA filters", () => {
    const artifact = readArtifact();

    expect(artifact.consent_model.consent_state_required).toBe(true);
    expect(artifact.consent_model.field).toBe("consent_state");
    expect(artifact.internal_qa_filtering.traffic_labels).toEqual(
      expect.arrayContaining([
        "codex_qa",
        "controlled_pilot",
        "acceptance",
        "internal_ip",
        "test_user",
        "qa_email",
        "test_order",
        "bot_crawler_user_agent",
        "non_production_environment",
      ])
    );
    expect(artifact.internal_qa_filtering.default_dashboard_excludes_internal_qa_bot_non_production).toBe(true);
  });

  it("forbids recommender and high-risk claim metric names", () => {
    const artifact = readArtifact();

    expect(artifact.semantic_claim_boundaries.forbidden_implications).toEqual(
      expect.arrayContaining([
        "RIASEC as complete career outcome recommender",
        "Big Five as career outcome recommender",
        "AI career planning",
        "diagnosis",
        "true IQ authority",
      ])
    );
    expect(artifact.semantic_claim_boundaries.forbidden_metric_name_fragments).toEqual(
      expect.arrayContaining(["riasec_career_recommender", "big_five_career_recommender", "ai_career_planning"])
    );
  });

  it("defines logical tables without creating migrations or physical schema", () => {
    const artifact = readArtifact();

    expect(artifact.logical_table_plan.migrations_created).toBe(false);
    expect(artifact.logical_table_plan.physical_schema_created).toBe(false);
    expect(artifact.logical_table_plan.tables).toEqual(
      expect.arrayContaining([
        "seo_urls",
        "seo_url_entities",
        "seo_event_funnel_daily",
        "seo_landing_attribution_daily",
        "seo_revenue_daily",
        "seo_cluster_daily",
        "seo_search_channel_status",
        "seo_consent_daily",
        "seo_internal_traffic_rules",
        "seo_issue_queue",
      ])
    );
  });

  it("points the train to SEO-DASH-01 next", () => {
    const artifact = readArtifact();

    expect(artifact.next_task).toBe("SEO-DASH-01");
  });

  it("ensures no runtime files are changed", () => {
    const changed = currentChangedFiles();

    expect(changed.every(isAllowedFile), changed.join("\n")).toBe(true);
  });
});
