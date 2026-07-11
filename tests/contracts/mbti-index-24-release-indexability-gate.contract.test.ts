import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-index-24-release-indexability-gate.mjs";
const output = "docs/seo/personality/mbti-index-24-release-indexability-gate-2026-07-11.json";

describe("MBTI-INDEX-24 release indexability gate", () => {
  it("records CMS-28 9/9 but holds expansion behind backend authority", () => {
    execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(report.cms28.result).toBe("PASS_9_OF_9");
    expect(report.records).toHaveLength(9);
    expect(report.records.filter((r: {kind:string}) => r.kind === "profile")).toHaveLength(4);
    expect(report.records.filter((r: {kind:string}) => r.kind === "comparison")).toHaveLength(5);
    expect(report.records.every((r: {content_complete:boolean;sitemap_present:boolean;llms_present:boolean;llms_full_present:boolean}) => r.content_complete && !r.sitemap_present && !r.llms_present && !r.llms_full_present)).toBe(true);
    expect(report.records.filter((r: {kind:string;schema_present:boolean}) => r.kind === "profile").every((r: {schema_present:boolean}) => r.schema_present)).toBe(true);
    expect(report.records.filter((r: {kind:string;schema_present:boolean}) => r.kind === "comparison").every((r: {schema_present:boolean}) => !r.schema_present)).toBe(true);
    expect(report.final_decision).toBe("HOLD_NO_URL_EXPANSION_NOINDEX_AND_COMPARISON_SCHEMA_MISSING");
    expect(report.expansion_allowed).toBe(false);
    expect(report.gsc_allowed).toBe(false);
  });

  it("keeps this PR artifact-only and points to backend promotion", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(report.required_next_tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({id:"MBTI-INDEX-24A",repo:"fap-web"}),
      expect.objectContaining({id:"MBTI-INDEX-24B",repo:"fap-api"}),
    ]));
    expect(report.safety_boundary).toEqual(expect.objectContaining({artifact_only:true,cms_write_attempted:false,database_mutation_attempted:false,sitemap_runtime_mutation_attempted:false,llms_runtime_mutation_attempted:false,gsc_submission_attempted:false,production_deploy_attempted:false}));
  });
});
