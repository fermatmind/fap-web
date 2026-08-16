import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assembleRiasecResultViewModel,
  getRiasecModuleVisibility,
  hasRiasecProjection,
  resolveRiasecPrivateResultAuthority,
} from "@/lib/riasec/resultAssembler";

const SOURCE_HASH = "a".repeat(64);
const COMPILED_HASH = "b".repeat(64);

function authority(sourceHash = SOURCE_HASH, compiledHash = COMPILED_HASH) {
  return {
    schema_version: "fap.riasec.private_result_authority.v1",
    authority_id: "FERMATMIND_RIASEC_PRIVATE_RESULT_ZH_CN_CANONICAL",
    mode: "canonical",
    locale: "zh-CN",
    source_hash: sourceHash,
    compiled_hash: compiledHash,
    compiled_schema: "fap.riasec.private_result.compiled.v1",
    compiler_schema: "fap.riasec.private_result.compiler.v1",
    compiler_version: "1.0.0",
    runtime_contract: "riasec.report.v1",
  };
}

function canonicalReport(): ReportResponse {
  const privateAuthority = authority();
  return {
    ok: true,
    scale_code: "RIASEC",
    report: {
      scale_code: "RIASEC",
      _meta: { riasec_private_result_authority: privateAuthority },
    },
    riasec_private_result_authority: privateAuthority,
    riasec_public_projection_v2: {
      schema_version: "riasec.public_projection.v2",
      scale_code: "RIASEC",
      locale: "zh-CN",
      private_result_authority: privateAuthority,
      holland_code: { code: "RIA", primary_type: "实作型", secondary_type: "研究型", tertiary_type: "艺术型" },
      scores: {
        dimensions: ["R", "I", "A", "S", "E", "C"].map((code, index) => ({ code, label: code, score: 90 - index * 10 })),
      },
      form: { form_code: "riasec_60", question_count: 60, raw_score_delta_allowed: false },
      measurement_evidence: { snapshot_bound: true },
      quality: { quality_state: "normal", grade: "A", flags: [] },
      interpretation_state: {},
      module_visibility_policy: {
        schema_version: "riasec.module_visibility_policy.v1",
        modules: [],
        fallback_policy: { frontend_inference_allowed: false },
      },
      deep_content_slots_v1: {
        schema_version: "riasec.deep_content_slots.v1",
        scale_code: "RIASEC",
        locale: "zh-CN",
        slots: [],
        source_policy: { frontend_fallback_allowed: false },
        slot_visibility_policy: { frontend_inference_allowed: false },
      },
      lifecycle_copy_v1: {
        schema_version: "riasec.lifecycle_copy.v1",
        frontend_fallback_allowed: false,
        measured_payload_mutation_allowed: false,
        report_snapshot_mutation_allowed: false,
        raw_feedback_public_exposure_allowed: false,
        internal_snapshot_id_public_exposure_allowed: false,
        life_stage_public_exposure_allowed: false,
        organization_context_public_exposure_allowed: false,
        surfaces: [],
        faq_items: [],
      },
      activity_explorer_v0_1: {
        schema_version: "riasec.activity_explorer.v0.1",
        dimension_activity_families: [],
        code_activity_pack: { activities: [] },
      },
    },
  };
}

describe("RIASEC canonical renderer authority", () => {
  it("renders only a complete hash-bound canonical payload", () => {
    const report = canonicalReport();
    expect(hasRiasecProjection(report)).toBe(true);

    render(<RiasecResultShell locale="zh" viewModel={assembleRiasecResultViewModel(report, "zh")} />);

    const card = screen.getByTestId("riasec-trusted-result-card");
    expect(card).toHaveAttribute("data-riasec-source-hash", SOURCE_HASH);
    expect(card).toHaveAttribute("data-riasec-compiled-hash", COMPILED_HASH);
  });

  it("fails closed on missing, mismatched, or incompatible authority and required surfaces", () => {
    const missing = canonicalReport();
    delete missing.riasec_private_result_authority;
    delete (missing.report?._meta as Record<string, unknown>).riasec_private_result_authority;
    expect(hasRiasecProjection(missing)).toBe(false);

    const mismatch = canonicalReport();
    mismatch.riasec_private_result_authority = authority("c".repeat(64));
    expect(hasRiasecProjection(mismatch)).toBe(false);

    const incompatible = canonicalReport();
    (incompatible.riasec_public_projection_v2 as Record<string, unknown>).schema_version = "riasec.public_projection.v3";
    expect(hasRiasecProjection(incompatible)).toBe(false);

    const incomplete = canonicalReport();
    delete (incomplete.riasec_public_projection_v2 as Record<string, unknown>).lifecycle_copy_v1;
    expect(hasRiasecProjection(incomplete)).toBe(false);
  });

  it("preserves immutable legacy snapshot mode without promoting it to canonical", () => {
    const legacy: ReportResponse = {
      scale_code: "RIASEC",
      riasec_public_projection_v2: {
        schema_version: "riasec.public_projection.v2",
        scale_code: "RIASEC",
        locale: "zh-CN",
      },
      report: {
        scale_code: "RIASEC",
        sections: [{ key: "legacy", body: "immutable snapshot body" }],
        _meta: {
          riasec_private_result_authority: {
            schema_version: "fap.riasec.private_result_authority.v1",
            mode: "immutable_legacy_snapshot",
            source_hash: "",
            compiled_hash: "",
          },
        },
      },
    };

    expect(resolveRiasecPrivateResultAuthority(legacy)?.mode).toBe("immutable_legacy_snapshot");
    expect(hasRiasecProjection(legacy)).toBe(false);
  });

  it("keeps missing backend module policy hidden and contains no local interpretation fallback map", () => {
    expect(getRiasecModuleVisibility({ moduleVisibilityPolicy: null }, "hero_activity_chain")).toBe("hidden");

    const shellSource = fs.readFileSync(
      path.join(process.cwd(), "components/result/riasec/RiasecResultShell.tsx"),
      "utf8"
    );
    expect(shellSource).not.toContain("formatRiasecActivityFamily");
    expect(shellSource).not.toContain("formatRiasecOccupationPolicy");
    expect(shellSource).not.toContain("本次较突出的兴趣维度包括");
  });
});
