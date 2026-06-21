import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import o59Envelope from "@/tests/fixtures/big5/result_page_v2/canonical_o59_core_body_preview.payload.json";
import expandedSurfaceMatrix from "@/tests/fixtures/big5/result_page_v2/o59_expanded_rendered_qa_surface_matrix.v0_1.json";

type SurfaceStatus = "pass" | "fail" | "pending_surface";

type RenderedQaSurface = {
  surface_key: string;
  status: SurfaceStatus;
  coverage: string;
  expected_visible_terms: string[];
  forbidden_visible_terms: string[];
  metadata_leak_terms: string[];
  evidence: string[];
};

const TESTED_SURFACES = ["result_page_desktop", "result_page_mobile"] as const;
const SECONDARY_SURFACES = ["pdf", "share_card", "history", "compare"] as const;

function createO59Report(): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
    },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: structuredClone(o59Envelope).big5_result_page_v2,
  } as ReportResponse;
}

function surfacesByKey(): Record<string, RenderedQaSurface> {
  const surfaces = expandedSurfaceMatrix.surfaces as RenderedQaSurface[];

  return Object.fromEntries(
    surfaces.map((surface) => [surface.surface_key, surface])
  );
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

function visibleTokens(): string[] {
  return Array.from(document.body.querySelectorAll("*"))
    .map((element) => element.textContent?.trim().replace(/\s+/g, " ") ?? "")
    .filter(Boolean);
}

function expectVisibleTerm(text: string, term: string) {
  if (term === "O59 / C32 / E20 / A55 / N68") {
    for (const scoreTerm of ["O59", "C32", "E20", "A55", "N68"]) {
      expect(text).toContain(scoreTerm);
    }
    return;
  }

  if (term === "不用于心理治疗") {
    expect(text).toMatch(/不用于[^。]*心理治疗/);
    return;
  }

  if (term === "不用于招聘筛选") {
    expect(text).toMatch(/不用于[^。]*招聘筛选/);
    return;
  }

  if (term === "个人成长") {
    expect(text).toMatch(/个人成长|成长行动|growth\/action/u);
    return;
  }

  if (term === "方法与边界说明") {
    expect(text).toMatch(/方法与边界说明|方法与隐私|中文方法边界/u);
    return;
  }

  expect(text).toContain(term);
}

function expectForbiddenTermAbsent(text: string, term: string) {
  if (term === "all") {
    expect(visibleTokens()).not.toContain("all");
    return;
  }

  if (term === "N1 百分位 作为主体解释") {
    expect(text).not.toContain(term);
    return;
  }

  expect(text).not.toContain(term);
}

describe("Big Five V2 O59 expanded rendered QA contract", () => {
  it("keeps the expanded surface matrix honest about pass evidence for every surface", () => {
    const surfaces = surfacesByKey();

    expect(Object.keys(surfaces).sort()).toEqual([
      "compare",
      "history",
      "pdf",
      "result_page_desktop",
      "result_page_mobile",
      "share_card",
    ]);

    for (const surfaceKey of TESTED_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
      expect(surfaces[surfaceKey].coverage).toBe("existing_fap_web_contract");
      expect(surfaces[surfaceKey].evidence.length).toBeGreaterThan(0);
    }

    for (const surfaceKey of SECONDARY_SURFACES) {
      expect(surfaces[surfaceKey].status).toBe("pass");
      expect(surfaces[surfaceKey].evidence.length).toBeGreaterThan(0);
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("backend/app/Services/BigFive/ResultPageV2/"))).toBe(true);
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("backend/tests/Fixtures/big5_result_page_v2/"))).toBe(true);
      expect(surfaces[surfaceKey].evidence.some((entry) => entry.startsWith("fap-web/tests/contracts/big5-"))).toBe(true);
    }
  });

  it.each(TESTED_SURFACES)("%s satisfies the expanded O59 visible text and banned term matrix", (surfaceKey) => {
    const surface = surfacesByKey()[surfaceKey];
    window.innerWidth = surfaceKey === "result_page_mobile" ? 390 : 1440;

    render(<RichResultReport locale="zh" reportData={createO59Report()} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    for (const term of surface.expected_visible_terms) {
      expectVisibleTerm(text, term);
    }

    for (const term of [...surface.forbidden_visible_terms, ...surface.metadata_leak_terms]) {
      expectForbiddenTermAbsent(text, term);
    }
  });

  it("treats secondary surfaces as covered only through backend fixture and rendered contract evidence", () => {
    const surfaces = surfacesByKey();

    expect(surfaces.pdf.coverage).toBe("backend_adapter_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.share_card.coverage).toBe("backend_share_safe_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.history.coverage).toBe("backend_history_snapshot_fixture_plus_fap_web_rendered_contract");
    expect(surfaces.compare.coverage).toBe("backend_compare_snapshot_fixture_plus_fap_web_rendered_contract");
  });
});
