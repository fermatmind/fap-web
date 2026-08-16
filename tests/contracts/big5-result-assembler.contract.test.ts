import { describe, expect, it } from "vitest";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import { BIG5_V1_SECTION_KEYS } from "@/lib/big5/sectionBlueprint";
import { BIG5_SOURCE_HASH, canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";

const gate = { isFreeVariant: false, modulesAllowed: new Set<string>(), modulesPreview: new Set<string>(), freeSections: null };

describe("Big Five canonical private result assembler", () => {
  it("renders the exact canonical section order and preserves authority", () => {
    const view = assembleBig5ResultViewModel({ locale: "zh", reportData: canonicalPrivateReport(), gate });
    expect(view.authority?.source_hash).toBe(BIG5_SOURCE_HASH);
    expect(view.plannedSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(view.plannedSections.every((section) => section.module_code === "canonical_private_result")).toBe(true);
  });

  it("copies resolved backend text without composing fallback prose", () => {
    const report = canonicalPrivateReport();
    const sourceText = String(report.big5_report_engine_v2?.sections?.[0]?.blocks?.[0]?.resolved_copy?.body_core ?? "");
    const view = assembleBig5ResultViewModel({ locale: "zh", reportData: report, gate });
    expect(sourceText).not.toBe("");
    expect(view.visibleSections.flatMap((section) => section.blocks).some((block) => block.body === sourceText)).toBe(true);
    expect(JSON.stringify(view.visibleSections)).not.toContain("frontend_fallback");
  });

  it("preserves structured D-grade authority for component renderers", () => {
    const report = canonicalPrivateReport();
    const engine = report.big5_report_engine_v2!;
    engine.quality = { grade: "D", confidence_mode: "low" };
    engine.norm_evidence = { status: "provisional", status_label: "暂定比较", show_precise_percentiles: false };
    const block = engine.sections?.[6]?.blocks?.[0];
    expect(block).toBeDefined();
    Object.assign(block!, {
      component: "BigFiveActionMatrixScenarioBullets",
      resolved_copy: {
        title: "低风险行动",
        interpretation_qualifier: "这只是当前信号。",
        items: [{ title: "先观察", why_recommended: "匹配当前证据", completion_signal: "记下一次反馈" }],
      },
    });

    const view = assembleBig5ResultViewModel({ locale: "zh", reportData: report, gate });
    const rendered = view.visibleSections[6]?.blocks[0];
    expect(view.qualityLevel).toBe("D");
    expect(view.normsStatus).toBe("暂定比较");
    expect(view.normEvidence?.show_precise_percentiles).toBe(false);
    expect(rendered?.component).toBe("BigFiveActionMatrixScenarioBullets");
    expect((rendered?.resolved_copy as Record<string, unknown>)?.items).toEqual([
      { title: "先观察", why_recommended: "匹配当前证据", completion_signal: "记下一次反馈" },
    ]);
  });

  it("fails closed when authority or immutable asset identity is invalid", () => {
    const missingAuthority = canonicalPrivateReport();
    delete missingAuthority.big5_private_result_authority;
    if (missingAuthority.report?._meta) delete (missingAuthority.report._meta as Record<string, unknown>).big5_private_result_authority;
    expect(assembleBig5ResultViewModel({ locale: "zh", reportData: missingAuthority, gate }).plannedSections).toEqual([]);

    const missingBlockId = canonicalPrivateReport();
    delete missingBlockId.big5_report_engine_v2?.sections?.[0]?.blocks?.[0]?.block_id;
    expect(assembleBig5ResultViewModel({ locale: "zh", reportData: missingBlockId, gate }).plannedSections).toEqual([]);
  });

  it("keeps immutable legacy snapshots as stored", () => {
    const legacy = canonicalPrivateReport();
    legacy.big5_private_result_authority = { schema_version: "fap.big5.private_result_authority.v1", mode: "immutable_legacy_snapshot", locale: "zh-CN", source_hash: "", compiled_hash: "" };
    legacy.report = { sections: [{ key: "legacy", title: "历史快照", blocks: [{ kind: "paragraph", body: "原样保留" }] }] };
    const view = assembleBig5ResultViewModel({ locale: "zh", reportData: legacy, gate });
    expect(view.plannedSections).toHaveLength(1);
    expect(view.plannedSections[0]?.blocks[0]?.body).toBe("原样保留");
  });
});
