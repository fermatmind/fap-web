import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/science-contentpage-discoverability-gate-01.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/science-contentpage-discoverability-gate-01.md");

const ALLOWED_FILES = new Set([
  "docs/seo/generated/science-contentpage-discoverability-gate-01.v1.json",
  "docs/seo/science-contentpage-discoverability-gate-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/science-contentpage-faq-schema-gate.contract.test.ts",
  "tests/contracts/science-contentpage-discoverability-gate.contract.test.ts",
]);

type DiscoverabilityGateArtifact = {
  version: string;
  id: string;
  mode: string;
  runtime_behavior_changed: boolean;
  publish_allowed: boolean;
  default_decision: string;
  candidate_public_routes: string[];
  dependency_gates: Array<{ id: string; required_status: string }>;
  eligibility_fields: Record<string, boolean>;
  forbidden_route_patterns: string[];
  blocked_actions: string[];
  non_runtime_change_guarantees: Record<string, boolean>;
  follow_up_implementation_required: boolean;
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

describe("SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01", () => {
  it("keeps discoverability blocked by default with no runtime behavior change", () => {
    const artifact = readJson<DiscoverabilityGateArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("seo.science_contentpage_discoverability_gate.v1");
    expect(artifact.id).toBe("SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01");
    expect(artifact.mode).toBe("contract_discoverability_gate_only");
    expect(artifact.runtime_behavior_changed).toBe(false);
    expect(artifact.publish_allowed).toBe(false);
    expect(artifact.default_decision).toBe("blocked_until_dependency_gates_pass");
    expect(Object.values(artifact.non_runtime_change_guarantees).every((value) => value === false)).toBe(true);
  });

  it("requires CMS, claim, FAQ schema, operator, route, and private URL gates before exposure", () => {
    const artifact = readJson<DiscoverabilityGateArtifact>(ARTIFACT_PATH);
    const gates = new Map(artifact.dependency_gates.map((gate) => [gate.id, gate.required_status]));

    expect(gates.get("SCIENCE-CONTENTPAGE-CMS-FIELD-MAPPING-01")).toBe("complete_before_discoverability");
    expect(gates.get("SCIENCE-CONTENTPAGE-CLAIM-GATE-01")).toBe("passed");
    expect(gates.get("SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01")).toBe("passed_when_faq_schema_requested");
    expect(gates.get("operator_review")).toBe("approved");
    expect(gates.get("production_route_smoke")).toBe("public_canonical_200");
    expect(gates.get("private_url_scan")).toBe("no_private_or_tokenized_routes");
  });

  it("defaults all public exposure fields to false while allowing draft generation only", () => {
    const fields = readJson<DiscoverabilityGateArtifact>(ARTIFACT_PATH).eligibility_fields;

    expect(fields).toMatchObject({
      sitemap_eligible: false,
      llms_eligible: false,
      footer_eligible: false,
      header_eligible: false,
      search_submission_eligible: false,
      social_distribution_eligible: false,
      daily_giving_tail_allowed: false,
      paid_ads_allowed: false,
      natural_distribution_allowed: false,
      draft_generation_allowed: true,
    });
  });

  it("limits route candidates to public canonical science routes and blocks private route patterns", () => {
    const artifact = readJson<DiscoverabilityGateArtifact>(ARTIFACT_PATH);

    expect(artifact.candidate_public_routes).toEqual([
      "/science",
      "/item-design-notes",
      "/reliability-validity",
      "/data-privacy",
      "/common-misconceptions",
      "/method-boundaries",
    ]);
    expect(artifact.candidate_public_routes.every((route) => route.startsWith("/") && !route.includes("?"))).toBe(true);
    expect(artifact.forbidden_route_patterns).toEqual(
      expect.arrayContaining(["/result", "/results/", "/orders", "/pay", "/payment", "/share/", "/history", "token=", "orderNo="])
    );
  });

  it("blocks premature sitemap, llms, footer, search, DailyGiving, ads, community, and competitor actions", () => {
    const artifact = readJson<DiscoverabilityGateArtifact>(ARTIFACT_PATH);

    expect(artifact.blocked_actions).toEqual(
      expect.arrayContaining([
        "no_sitemap_addition_from_draft",
        "no_llms_addition_from_draft",
        "no_footer_or_header_link_before_operator_approval",
        "no_search_submission_before_public_smoke",
        "no_private_url_reference",
        "no_daily_giving_amplification",
        "no_paid_ads",
        "no_batch_community_posting",
        "no_fake_user_voice",
        "no_competitor_imitation",
      ])
    );
    expect(artifact.follow_up_implementation_required).toBe(true);
  });

  it("does not include discoverability implementation instructions or publishable copy", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("This PR is a gate definition only");
    expect(doc).toContain("does not add URLs to sitemap or llms");
    expect(doc).not.toMatch(/sitemap_eligible:\s*true/i);
    expect(doc).not.toMatch(/llms_eligible:\s*true/i);
    expect(doc).not.toMatch(/footer_eligible:\s*true/i);
    expect(doc).not.toMatch(/publish_allowed:\s*true/i);
  });

  it("keeps the diff inside the authorized discoverability gate scope", () => {
    for (const file of changedFiles()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });
});
