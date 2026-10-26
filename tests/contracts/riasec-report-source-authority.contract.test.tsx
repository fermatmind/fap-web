import fs from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import * as api from "@/lib/api/v0_3";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assembleRiasecResultViewModel, hasRiasecProjection, parseRiasecPrivateResultAuthority,
  resolveRiasecPrivateResultAuthority,
} from "@/lib/riasec/resultAssembler";
import { buildRiasecResultExport } from "@/lib/riasec/exportAdapter";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));

type NativeReport = { _meta: Record<string, unknown> } & Record<string, unknown>;
const nativeReports = JSON.parse(fs.readFileSync(path.join(process.cwd(),
  "tests/contracts/fixtures/riasec/native-report-source-authority.json"), "utf8")) as Record<string, NativeReport>;
const SOURCE = "c7ab76c33fb28b70623b0edb5e263ea657581f2aa41338808ee4231737206854";
const COMPILED = "b66309240729d785a43aac1e5a2770281520716b93ac330eb47becb830cf7c3d";

function wire(key: string): ReportResponse {
  const report = nativeReports[key];
  // Reproduce the existing endpoint extraction, then JSON decode as the browser does.
  return JSON.parse(JSON.stringify({
    ok: true, scale_code: "RIASEC", type_code: report.top_code, report,
    riasec_public_projection_v1: report._meta.riasec_public_projection_v1,
    riasec_public_projection_v2: report._meta.riasec_public_projection_v2,
    riasec_private_result_authority: report._meta.riasec_private_result_authority ?? null,
  })) as ReportResponse;
}

function set(target: unknown, pointer: string, value: unknown) {
  const keys = pointer.split(".");
  let row = target as Record<string, unknown>;
  for (const key of keys.slice(0, -1)) row = row[key] as Record<string, unknown>;
  row[keys.at(-1)!] = value;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("native RIASEC report-source consumer", () => {
  it.each(["riasec_60", "riasec_140"])("preserves native English source and instance evidence through the real reader: %s", form => {
    const input = wire(`1.9/en/${form}`);
    const before = structuredClone(input);
    const vm = assembleRiasecResultViewModel(input, "en");
    expect(hasRiasecProjection(input)).toBe(true);
    expect(vm.authority).toMatchObject({ mode: "canonical", authorityId: "FERMATMIND_RIASEC_PRIVATE_RESULT_EN_REPORT",
      locale: "en", compilerVersion: "1.9.0", coverageScope: "report_sources", sourceHash: SOURCE, compiledHash: COMPILED });
    expect(vm.reportContent?.status).toBe("complete");
    expect(vm.reportContent?.instanceHash).toBe(vm.authority?.instanceHash);
    expect(vm.reportContent?.sourceAuthority.sourceCoverageHash).toBe(vm.authority?.sourceCoverageHash);
    expect(vm.reportContent?.rawScores).toBe("not_required_when_absent_from_snapshot_unknown");
    render(<RichResultReport locale="en" reportData={input} />);
    const reader = screen.getByTestId("riasec-reading-report");
    expect(reader).toHaveAttribute("data-riasec-source-hash", SOURCE);
    expect(reader).toHaveAttribute("data-riasec-compiled-hash", COMPILED);
    expect(screen.getByTestId("riasec-trusted-result-card")).toBeInTheDocument();
    expect(buildRiasecResultExport(input, "en")?.assessment.locale).toBe("en");
    for (const key of ["owner", "paid", "entitlement", "pdfEligible"]) expect(vm.authority).not.toHaveProperty(key);
    expect(input).toEqual(before);
  });

  it.each(["1.9", "1.8"])("restores both native Chinese forms without replacing the renderer or access data: %s", version => {
    for (const form of ["riasec_60", "riasec_140"]) {
      const input = wire(`${version}/zh-CN/${form}`);
      expect(hasRiasecProjection(input)).toBe(true);
      const vm = assembleRiasecResultViewModel(input, "zh");
      expect(vm.authority?.mode).toBe("canonical");
      expect(vm.authority?.compilerVersion).toBe(`${version}.0`);
      render(<RichResultReport locale="zh" reportData={input} />);
      expect(screen.getByTestId("riasec-reading-report")).toHaveAttribute("data-riasec-source-hash", vm.authority?.sourceHash);
      expect(buildRiasecResultExport(input, "zh")).not.toBeNull();
      cleanup();
    }
  });

  it("keeps old English selected reading and known immutable Chinese versions compatible", () => {
    for (const form of ["riasec_60", "riasec_140"]) {
      const old = wire(`1.8/en/${form}`);
      const vm = assembleRiasecResultViewModel(old, "en");
      expect(vm.authority).toBeNull();
      expect(vm.reportContent).toBeNull();
      expect(hasRiasecProjection(old)).toBe(true);
      render(<RichResultReport locale="en" reportData={old} />);
      expect(screen.getByTestId("riasec-reading-report")).not.toHaveAttribute("data-riasec-source-hash");
      cleanup();
    }
    const zh = wire("1.8/zh-CN/riasec_60").riasec_private_result_authority!;
    for (let minor = 0; minor <= 9; minor++) {
      expect(parseRiasecPrivateResultAuthority({ ...zh, compiler_version: `1.${minor}.0` })?.mode).toBe("canonical");
    }
    expect(parseRiasecPrivateResultAuthority({ ...zh, compiler_version: "1.10.0" })).toBeNull();
    expect(parseRiasecPrivateResultAuthority({ ...zh, locale: "en", authority_id: "FERMATMIND_RIASEC_PRIVATE_RESULT_EN_SELECTED", coverage_scope: "selected_modules" })).toBeNull();
    expect(parseRiasecPrivateResultAuthority({ schema_version: "fap.riasec.private_result_authority.v1", mode: "immutable_legacy_snapshot", source_hash: "", compiled_hash: "" })?.mode).toBe("immutable_legacy_snapshot");
    for (const version of ["1.8", "1.9"]) {
      const wrongReplica = wire(`${version}/zh-CN/riasec_140`);
      set(wrongReplica, "report._meta.riasec_private_result_authority.compiled_hash", "f".repeat(64));
      expect(hasRiasecProjection(wrongReplica)).toBe(false);
      expect(assembleRiasecResultViewModel(wrongReplica, "zh").authority).toBeNull();
      const wrongLocale = wire(`${version}/zh-CN/riasec_140`);
      set(wrongLocale, "riasec_public_projection_v2.locale", "en");
      expect(resolveRiasecPrivateResultAuthority(wrongLocale)).toBeNull();
    }
  });

  it("rejects source/instance/context conflicts without a projection-only authority fallback", () => {
    const prefix = "riasec_public_projection_v2.";
    const bad: Record<string, unknown> = {
      [`${prefix}private_result_authority.locale`]: "zh-CN",
      [`${prefix}private_result_authority.compiler_version`]: "1.8.0",
      [`${prefix}private_result_authority.instance_hash`]: null,
      [`${prefix}private_result_authority.instance_contract_id`]: "other",
      [`${prefix}private_result_authority.source_coverage_hash`]: "short",
      "riasec_private_result_authority.compiled_hash": "a".repeat(64),
      "report._meta.riasec_private_result_authority.instance_hash": "b".repeat(64),
      "report._meta.riasec_public_projection_v2.private_result_authority.source_hash": "c".repeat(64),
      "report._meta.riasec_public_projection_v2.report_content_v1.instance_hash": "f".repeat(64),
      "report._meta.riasec_public_projection_v2.form.question_count": 60,
      "report._meta.riasec_public_projection_v2.form.form_kind": "standard",
      "report._meta.riasec_public_projection_v2.form.score_space_version": "wrong",
      "report._meta.riasec_public_projection_v2.measurement_evidence.form_version": "other-version",
      "report._meta.snapshot_binding_v1": null,
      "report._meta.snapshot_binding_v1.form_code": "riasec_60",
      "report._meta.snapshot_binding_v1.canonical_compiler_version": "1.8.0",
      [`${prefix}report_content_v1.source_authority.compiled_hash`]: "d".repeat(64),
      [`${prefix}report_content_v1.instance_hash`]: "e".repeat(64),
      [`${prefix}report_content_v1.errors`]: [{ pointer: "/form", reason: "incomplete" }],
      [`${prefix}report_content_v1`]: null,
      [`${prefix}locale`]: "zh-CN",
      [`${prefix}form.form_code`]: "unknown",
      [`${prefix}form.question_count`]: 60,
      [`${prefix}form.score_space_version`]: "other",
      [`${prefix}measurement_evidence.content_package_version`]: "",
      [`${prefix}measurement_evidence.snapshot_bound`]: false,
      [`${prefix}measurement_evidence.normalization_method`]: "percentile",
      [`${prefix}quality.quality_state`]: "caution",
      [`${prefix}quality.grade`]: "B",
      [`${prefix}interpretation_state.profile_shape`]: "unsupported",
      [`${prefix}holland_code.primary_type`]: "C",
      [`${prefix}scores.dimensions.0.score`]: "75",
      [`${prefix}scores.dimensions.0.label`]: "",
      [`${prefix}claim_boundary`]: {},
      [`${prefix}dimension_score_band_contract_v1.percentile_interpretation_allowed`]: true,
      [`${prefix}deep_content_slots_v1.slots`]: [],
      [`${prefix}deep_content_slots_v1.slots.0.content`]: {},
      [`${prefix}lifecycle_copy_v1.faq_items`]: [],
      [`${prefix}lifecycle_copy_v1.technical_note_summary_sections.0.data_status`]: "validated",
    };
    for (const [pointer, value] of Object.entries(bad)) {
      const input = wire("1.9/en/riasec_140");
      set(input, pointer, value);
      expect(resolveRiasecPrivateResultAuthority(input), pointer).toBeNull();
      expect(assembleRiasecResultViewModel(input, "en").authority, pointer).toBeNull();
    }
    expect(assembleRiasecResultViewModel(wire("1.9/en/riasec_140"), "zh").authority).toBeNull();
  });

  it.each([["missing-content-version", "incomplete"], ["caution", "restricted"]])("retains native %s evidence and the existing English weak reader", (variant, status) => {
    const input = wire(`1.9/en/riasec_140-${variant}`);
    const vm = assembleRiasecResultViewModel(input, "en");
    expect(vm.authority).toBeNull();
    expect(vm.reportContent?.status).toBe(status);
    expect(vm.reportContent?.errors[0].pointer).toBeTruthy();
    render(<RichResultReport locale="en" reportData={input} />);
    expect(screen.getByTestId("riasec-reading-report")).not.toHaveAttribute("data-riasec-source-hash");
  });

  it("does not promote hidden unknown content into the source-qualified reading", () => {
    const input = wire("1.9/en/riasec_140");
    const p = input.riasec_public_projection_v2 as Record<string, unknown>;
    const deep = p.deep_content_slots_v1 as { slots: unknown[] };
    deep.slots.push({ module_key: "unknown_hidden_module", content: { copy: "Hidden source must stay omitted" } });
    const vm = assembleRiasecResultViewModel(input, "en");
    expect(vm.authority?.instanceHash).toBeTruthy();
    render(<RichResultReport locale="en" reportData={input} />);
    expect(screen.queryByText("Hidden source must stay omitted")).not.toBeInTheDocument();
  });

  it("uses the existing share source checks without adding an access decision", async () => {
    const input = wire("1.9/en/riasec_140");
    const vm = assembleRiasecResultViewModel(input, "en");
    const share = vi.spyOn(api, "createAttemptShare").mockResolvedValue({
      ok: true, share_url: "https://fermatmind.com/en/share/local-display",
      riasec_private_result_authority: input.riasec_private_result_authority,
    } as Awaited<ReturnType<typeof api.createAttemptShare>>);
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<RiasecResultShell locale="en" viewModel={vm} attemptId="local-display-only" />);
      fireEvent.click(screen.getByRole("button", { name: /share/i }));
      await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://fermatmind.com/en/share/local-display"));
      expect(share.mock.calls[0][0]).toEqual({ attemptId: "local-display-only", locale: "en" });
      cleanup(); writeText.mockClear();
      share.mockResolvedValueOnce({ ok: true, share_url: "https://fermatmind.com/en/share/local-display",
        riasec_private_result_authority: { ...input.riasec_private_result_authority, compiled_hash: "f".repeat(64) },
      } as Awaited<ReturnType<typeof api.createAttemptShare>>);
      render(<RiasecResultShell locale="en" viewModel={vm} attemptId="local-display-only" />);
      fireEvent.click(screen.getByRole("button", { name: /share/i }));
      await waitFor(() => expect(screen.getByRole("button", { name: "Retry share" })).toBeInTheDocument());
      expect(writeText).not.toHaveBeenCalled();
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
