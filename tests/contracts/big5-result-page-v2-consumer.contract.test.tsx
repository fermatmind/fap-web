import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canRenderRichResultReport, RichResultReport } from "@/components/result/RichResultReport";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import { BIG5_SOURCE_HASH, canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";
import { createRuntimeV2Payload } from "@/tests/fixtures/big5/runtimeV2Payload";

describe("Big Five private result page consumer", () => {
  it("renders canonical payload with exact authority hashes", () => {
    const report = canonicalPrivateReport();
    expect(canRenderRichResultReport(report)).toBe(true);
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-shell")).toHaveAttribute("data-authority-mode", "canonical");
    expect(screen.getByTestId("big5-result-shell")).toHaveAttribute("data-source-hash", BIG5_SOURCE_HASH);
  });

  it.each([
    ["zh" as const, { notice: "本次结果置信度较低，建议复测", retest: "状态稳定时复测", synergy: "谨慎探索者", norm: "暂定比较", action: "先记录一次反馈", why: "匹配当前组合证据", completion: "完成一条记录" }],
    ["en" as const, { notice: "This result has low confidence", retest: "Retake when settled", synergy: "Cautious explorer", norm: "Provisional comparison", action: "Log one response", why: "Matches the current combined evidence", completion: "One note is recorded" }],
  ])("renders rich backend-authored D-grade blocks in %s", (locale, copy) => {
    const report = canonicalPrivateReport();
    const engine = report.big5_report_engine_v2!;
    engine.quality = { grade: "D", confidence_mode: "low" };
    engine.norm_evidence = { status: "provisional", status_label: copy.norm, comparison_allowed: true, show_precise_percentiles: false };
    const section = (key: string) => engine.sections!.find((item) => item.section_key === key)!;
    Object.assign(section("hero_summary").blocks![0]!, { component: "BigFiveQualityNotice", kind: "callout", resolved_copy: { title: copy.notice, body: "Authority body", why: "Authority reason", retest_label: copy.retest, grade: "D", interpretation_qualifier: "Tentative authority qualifier" } });
    Object.assign(section("core_portrait").blocks![0]!, { component: "BigFiveSynergyCallout", kind: "callout", resolved_copy: { headline: copy.synergy, mechanism: "Combined mechanism", strengths: "Combined strength", tradeoffs: "Combined tradeoff", evidence: [{ type: "domain", code: "O", percentile: 20 }], interpretation_qualifier: "Tentative authority qualifier" } });
    Object.assign(section("norms_comparison").blocks![0]!, { component: "BigFiveNormEvidenceCard", kind: "metric_card", resolved_copy: { status_label: copy.norm, comparison_allowed: true, show_precise_percentiles: false, sample_label: "Validated sample", sample_n: 1200, match_label: "Broad match", percentile_explanation: "Authority percentile explanation", interpretation_qualifier: "Tentative authority qualifier" } });
    Object.assign(section("action_plan").blocks![0]!, { component: "BigFiveActionMatrixScenarioBullets", kind: "bullets", resolved_copy: { title: "Action authority", interpretation_qualifier: "Tentative authority qualifier", items: [{ label: "Observe", title: copy.action, body: "Low-risk body", why_recommended: copy.why, completion_signal: copy.completion, time_horizon_label: "Today", difficulty_label: "Low effort", bucket: "start", rule_id: "internal-rule", evidence: [{ type: "domain_percentile", code: "O", percentile: 20 }] }] } });

    render(<RichResultReport locale={locale} reportData={report} />);
    expect(screen.getByText(copy.notice)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.retest })).toHaveAttribute("href", expect.stringContaining("/take"));
    expect(screen.getByText(copy.synergy)).toBeInTheDocument();
    expect(screen.getAllByText(copy.norm).length).toBeGreaterThan(0);
    expect(screen.getByText(copy.action)).toBeInTheDocument();
    expect(screen.getByText(copy.why, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(copy.completion, { exact: false })).toBeInTheDocument();
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(screen.queryByTestId("big5-dimensions")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("big5-action-matrix").every((node) => node.dataset.evidenceMode === "provisional")).toBe(true);
    expect(screen.queryByText("internal-rule")).not.toBeInTheDocument();
    expect(screen.queryByText("start")).not.toBeInTheDocument();
    expect(screen.queryByText("开放性 · 20")).not.toBeInTheDocument();
    expect(screen.queryByText("Openness · 20")).not.toBeInTheDocument();
  });

  it("ignores the retired result-page candidate for canonical attempts", () => {
    const report = canonicalPrivateReport();
    report[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY] = createRuntimeV2Payload();
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("fails closed for missing or invalid canonical metadata", () => {
    const report = canonicalPrivateReport();
    report.big5_private_result_authority = { ...report.big5_private_result_authority!, source_hash: "invalid" };
    if (report.report?._meta) delete (report.report._meta as Record<string, unknown>).big5_private_result_authority;
    expect(canRenderRichResultReport(report)).toBe(false);
    expect(render(<RichResultReport locale="zh" reportData={report} />).container).toBeEmptyDOMElement();
  });

  it("allows a stored V2 shell only for an immutable legacy snapshot", () => {
    const report = canonicalPrivateReport();
    report.big5_private_result_authority = { schema_version: "fap.big5.private_result_authority.v1", mode: "immutable_legacy_snapshot", locale: "zh-CN", source_hash: "", compiled_hash: "" };
    report[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY] = createRuntimeV2Payload();
    expect(canRenderRichResultReport(report)).toBe(true);
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
  });
});
