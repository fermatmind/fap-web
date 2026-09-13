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

import { canonicalReport, authority, SOURCE_HASH, COMPILED_HASH } from "./fixtures/riasec/canonicalReport";

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
