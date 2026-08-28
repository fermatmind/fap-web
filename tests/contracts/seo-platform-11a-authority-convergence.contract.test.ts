import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const API_REGISTRY_HASH = "b02b6edd816b75b42582468e5bc3aa2c9cd0060149825d1fdc6131cf71d73791";

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function listFiles(relativeDir: string, suffix = ""): string[] {
  return fs.readdirSync(path.join(ROOT, relativeDir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => `${relativeDir}/${entry.name}`)
    .sort();
}

describe("SEO-PLATFORM-11A fap-web authority convergence", () => {
  it("supersedes the 18-unit Agent OS and binds only to the fap-api frozen registry", () => {
    const registry = readJson("docs/agent-os/agent-registry.v1.json");
    const pointer = readJson("docs/seo/seo-platform-11a-authority-supersession.v1.json");

    expect(registry.authority_status).toBe("historical_superseded");
    expect(registry.execution_authorized).toBe(false);
    expect(registry.fap_web_agent_authority).toBe(false);
    expect(registry.recommended_counts).toMatchObject({
      historical_declared_agent_units: 18,
      active_agent_units: 0,
    });
    expect(Object.keys(registry.authority_supersession)).toHaveLength(12);
    expect(registry.authority_supersession).toMatchObject({
      agent_os_release_coordination: { classification: "historical_superseded" },
      seo_geo_control: { replacement: "seo.orchestrator" },
      runtime_qa: { classification: "review_mode" },
      cms_draft_package: { classification: "deterministic_tool" },
      cms_publish_readback: { classification: "review_mode" },
      analytics_gsc_opportunity: { replacement: "seo.expert.search_analytics_measurement" },
      assessment_hub: { classification: "product_domain_out_of_seo_scope" },
      result_page_agent_platform: { classification: "product_domain_out_of_seo_scope" },
      career_content_graph: { replacement: "career.content_agent" },
      public_personality_content: { classification: "bounded_capability" },
      competitor_alternative_research: { replacement: "seo.expert.competitor_research" },
      claim_privacy_safety_gate: { classification: "contract_only" },
    });
    expect(registry.canonical_registry.registry_hash).toBe(API_REGISTRY_HASH);
    expect(pointer.canonical_registry.registry_hash).toBe(API_REGISTRY_HASH);
    expect(pointer.owner_repository).toBe("fap-api");
    expect(pointer.fap_web_agent_authority).toBe(false);
    expect(pointer).not.toHaveProperty("roles");
    expect(pointer).not.toHaveProperty("capabilities");
  });

  it("moves exactly six result-page identities out of the SEO domain", () => {
    const contract = readJson("docs/result-page-agents/seo-authority-supersession.v1.json");
    expect(contract.fap_web_agent_authority).toBe(false);
    expect(contract.seo_role_registry_inclusion).toBe(false);
    expect(contract.seo_tool_allowlist_inclusion).toBe(false);
    expect(contract.result_page_assets).toEqual([
      { agent_id: "mbti_result_page", classification: "product_domain_out_of_seo_scope" },
      { agent_id: "big_five_result_page", classification: "product_domain_out_of_seo_scope" },
      { agent_id: "riasec_result_page", classification: "product_domain_out_of_seo_scope" },
      { agent_id: "iq_raven_result_page", classification: "product_domain_out_of_seo_scope" },
      { agent_id: "eq60_result_page", classification: "product_domain_out_of_seo_scope" },
      { agent_id: "enneagram_result_page", classification: "product_domain_out_of_seo_scope" },
    ]);
  });

  it("historicalizes all seven public-profile agent documents and ten prompts", () => {
    const base = ".agents/skills/public-profile-seo-asset-factory";
    const contract = readJson(`${base}/authority-supersession.v1.json`);
    expect(contract.authority_status).toBe("historical_superseded");
    expect(contract.execution_authorized).toBe(false);
    expect(contract.model_invocation_enabled).toBe(false);
    expect(contract.write_permissions).toEqual([]);
    expect(contract.external_egress).toEqual([]);
    expect(contract.agent_documents).toEqual(listFiles(`${base}/agents`, ".md").map((file) => file.slice(base.length + 1)));
    expect(contract.prompt_documents).toEqual(listFiles(`${base}/prompts`, ".md").map((file) => file.slice(base.length + 1)));
    expect(contract.agent_documents).toHaveLength(7);
    expect(contract.prompt_documents).toHaveLength(10);
    expect(contract.canonical_policy).toMatchObject({
      repository: "fap-api",
      policy_id: "seo.release_separation",
      future_consumer: "seo.policy_gateway",
    });
  });

  it("exposes neither an Agent entrypoint nor direct Baidu submission", () => {
    const pkg = readJson("package.json");
    const scriptNames = Object.keys(pkg.scripts);
    expect(scriptNames.filter((name) => name.startsWith("seo-agent:"))).toEqual([]);
    expect(pkg.scripts).not.toHaveProperty("seo:push-baidu");
    expect(pkg.scripts["seo:code-change-artifact"]).toBe("node scripts/seo/generate-seo-code-change-artifact.mjs");
    expect(fs.existsSync(path.join(ROOT, "scripts/seo/push-baidu.mjs"))).toBe(true);
  });

  it("keeps frontend ownership to rendering, read-only QA, and projection consumption", () => {
    const pointer = readJson("docs/seo/seo-platform-11a-authority-supersession.v1.json");
    expect(pointer.frontend_scope).toEqual(["renderer", "read_only_qa", "public_projection_consumer"]);
    expect(pointer.global_guards).toMatchObject({
      read_only_gsc: true,
      search_submission_allowed: false,
      post12_agent_write_enabled: false,
      l4_state: "dormant_not_authorized",
      runtime_model_invocation_enabled: false,
      runtime_created: false,
    });
    expect(pointer.write_outcomes).toEqual({
      model_calls_performed: 0,
      cms_writes: 0,
      seo_data_writes: 0,
      search_submissions: 0,
      production_data_writes: 0,
    });
    const seoProfiles = execFileSync("find", [".agents/skills", "-path", "*seo*", "-name", "openai.yaml"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    expect(seoProfiles).toBe("");
  });

  it("generates a stable non-Agent artifact with every write boundary disabled", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-platform-11a-web-"));
    const requestPath = path.join(tempDir, "request.json");
    fs.writeFileSync(requestPath, JSON.stringify({
      schema_version: "seo-code-change-request.v1",
      request_id: "seo-platform-11a-test",
      fix_type: "runtime_seo_rendering",
      scope_summary: "Normalize a read-only QA finding",
      target_files: ["lib/seo/example.ts", "tests/example.test.ts"],
      evidence_refs: ["docs/seo/evidence.json"],
      direct_main_push_allowed: false,
      auto_deploy_allowed: false,
    }, null, 2));
    const run = () => JSON.parse(execFileSync("node", [
      "scripts/seo/generate-seo-code-change-artifact.mjs",
      `--request=${requestPath}`,
      `--artifact-dir=${tempDir}`,
      "--json",
    ], { cwd: ROOT, encoding: "utf8" }));
    const first = run();
    const second = run();
    const artifact = JSON.parse(fs.readFileSync(first.artifact_path, "utf8"));
    expect(first.ok).toBe(true);
    expect(second.artifact_sha256).toBe(first.artifact_sha256);
    expect(artifact).toMatchObject({
      schema_version: "seo-code-change-artifact.v1",
      artifact_kind: "deterministic_change_plan",
      authority: "none",
      execution_authorized: false,
    });
    expect(Object.values(artifact.boundaries)).toEqual(Array(10).fill(false));
  });
});
