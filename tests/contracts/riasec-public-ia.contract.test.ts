import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildRiasecTakeHref,
  getRiasecStartLabel,
  listRiasecFormMetas,
} from "@/lib/riasec/forms";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

const LEGACY_RIASEC_ROUTE_SEGMENT = ["career", "tests", "riasec"].join("/");

describe("riasec public IA contract", () => {
  it("keeps riasec forms ordered as standard 60Q then enhanced 140Q", () => {
    expect(listRiasecFormMetas().map((form) => form.formCode)).toEqual(["riasec_60", "riasec_140"]);
    expect(getRiasecStartLabel("riasec_60", "zh")).toBe("开始标准版");
    expect(getRiasecStartLabel("riasec_140", "zh")).toBe("开始增强版");
    expect(buildRiasecTakeHref("holland-career-interest-test-riasec", "zh", "riasec_60")).toBe(
      "/zh/tests/holland-career-interest-test-riasec/take?form=riasec_60"
    );
  });

  it("uses canonical riasec links in major static entry sources touched by this PR", () => {
    const canonical = "/tests/holland-career-interest-test-riasec";
    const files = [
      "lib/navigation/headerDropdownMenus.ts",
      "lib/marketing/homepageContent.ts",
      "app/(localized)/[locale]/career/tests/page.tsx",
      "app/(localized)/[locale]/career/recommendations/page.tsx",
      "components/career/CareerRecommendationPanel.tsx",
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain(canonical);
      expect(source).not.toContain(LEGACY_RIASEC_ROUTE_SEGMENT);
    }
  });

  it("keeps riasec in the catalog fallback seed under the canonical scale slug", () => {
    const source = read("lib/content.ts");

    expect(source).toContain("SCALE_CANONICAL_SLUG_MAP.RIASEC");
    expect(source).toContain('scale_code: "RIASEC"');
    expect(source).toContain("霍兰德职业兴趣测试（RIASEC）");
    expect(source).toContain("questions_count: 60");
  });

  it("adds backend-history and shared share affordances for canonical riasec results", () => {
    const historySource = read("app/(localized)/[locale]/(app)/history/riasec/RiasecHistoryClient.tsx");
    const resultShellSource = read("components/result/riasec/RiasecResultShell.tsx");
    const assemblerSource = read("lib/riasec/resultAssembler.ts");

    expect(historySource).toContain("fetchRiasecHistory");
    expect(historySource).toContain("createAttemptShare");
    expect(historySource).toContain("SCALE_CANONICAL_SLUG_MAP.RIASEC");
    expect(historySource).toContain("buildRiasecTakeHref");
    expect(resultShellSource).toContain("createAttemptShare");
    expect(resultShellSource).toContain('localizedPath("/history/riasec", locale)');
    expect(resultShellSource).toContain("buildRiasecTakeHref");
    expect(resultShellSource).toContain("riasec-trusted-result-card");
    expect(resultShellSource).toContain("riasec-six-dimension-map");
    expect(resultShellSource).toContain("riasec-governed-copy-surface");
    expect(resultShellSource).toContain("riasec-governed-copy-empty");
    expect(resultShellSource).not.toContain("DIMENSION_COPY");
    expect(assemblerSource).toContain("riasec_public_projection_v2");
    expect(assemblerSource).toContain("activity_explorer_v0_1");
    expect(assemblerSource).toContain("exploration_feedback_overlay_v0_1");
    expect(assemblerSource).toContain("trustedResultCard");
    expect(assemblerSource).toContain("activityExplorer");
    expect(assemblerSource).toContain("feedbackOverlay");
  });
});
