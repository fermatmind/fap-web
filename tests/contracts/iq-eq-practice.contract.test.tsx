import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";
import { IqProcessPractice } from "@/components/result/iq/IqProcessPractice";
import { EQEventPractice } from "@/components/result/eq/EQEventPractice";
import { isEqPrivateResultLocaleCompatible } from "@/lib/eq/privateResultLocale";
import { normalizeEqV5Report } from "@/components/result/eq/utils";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { buildEqRendererContractFixture } from "../fixtures/eq/v5/eq60RendererContractFixture";
import type { ReportResponse } from "@/lib/api/v0_3";

for (const locale of ["zh", "en"] as const) {
  describe(`IQ/EQ local practice in ${locale}`, () => {
    it("offers independent IQ examples with a textual alternative and optional condition review", async () => {
      const { container } = render(<IqProcessPractice locale={locale} />);
      expect(screen.getByRole("img")).toHaveAccessibleName(locale === "zh" ? /原创示意/ : /Original example/);
      expect(screen.getAllByRole("checkbox")).toHaveLength(3);
      fireEvent.click(screen.getAllByRole("checkbox")[0]);
      expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
      fireEvent.change(screen.getByRole("textbox"), { target: { value: '<script>literal notes</script>' } });
      expect(screen.getByRole("textbox")).toHaveValue('<script>literal notes</script>');
      expect(container.querySelector("script")).toBeNull();
      expect((await axe(container)).violations).toEqual([]);
    });
    it("lets users separate an event and choose one practical response without AI", async () => {
      const { container } = render(<EQEventPractice locale={locale} />);
      expect(screen.getAllByRole("textbox")).toHaveLength(6);
      fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "A recent event" } });
      fireEvent.click(screen.getAllByRole("radio")[2]);
      expect(screen.getByRole("status")).toHaveTextContent(locale === "zh" ? "实际反馈" : "actual feedback");
      expect(screen.getAllByRole("textbox")[0]).toHaveValue("A recent event");
      expect((await axe(container)).violations).toEqual([]);
    });
    it("accepts the canonical quality caution name while retaining required-asset fail-closed checks", () => {
      const fixture = buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en");
      const assets = fixture.report.assets as { quality_confidence: Record<string, unknown> };
      const warning = assets.quality_confidence.do_not_overread;
      assets.quality_confidence.what_to_hold_lightly = warning;
      delete assets.quality_confidence.do_not_overread;
      expect(normalizeEqV5Report(fixture.report as unknown as ReportResponse, locale)?.assets.quality_confidence.do_not_overread).toBe(warning);
      const { unmount } = render(<EQResultV5 locale={locale} reportData={fixture.report as unknown as ReportResponse} />);
      expect(screen.getByTestId("eq-quality-banner")).toHaveTextContent(String(warning));
      unmount();
      assets.quality_confidence.do_not_overread = "";
      expect(normalizeEqV5Report(fixture.report as unknown as ReportResponse, locale)).toBeNull();
      delete assets.quality_confidence.do_not_overread;
      delete assets.quality_confidence.what_to_hold_lightly;
      expect(normalizeEqV5Report(fixture.report as unknown as ReportResponse, locale)).toBeNull();
    });
    it("checks localized EQ copy without treating the documented bilingual routing record as displayed English", () => {
      const fixture = buildEqRendererContractFixture("en");
      const report = fixture.report as { interpretation: Record<string, unknown>; assets: { personalization_route: Record<string, unknown> } };
      report.interpretation.personalization_route = { locales: { "zh-CN": { route_headline: "路由元数据" }, en: { route_headline: "Routing metadata" } }, do_not_overread: { "zh-CN": "原始路由边界", en: "Routing boundary" } };
      expect(isEqPrivateResultLocaleCompatible(report, "en")).toBe(true);
      report.assets.personalization_route.route_headline = "错误中文正文";
      expect(isEqPrivateResultLocaleCompatible(report, "en")).toBe(false);
      expect(isEqPrivateResultLocaleCompatible({ interpretation: { personalization_route: "未声明的中文正文" } }, "en")).toBe(false);
    });
    it("mounts reflection only after a valid normal EQ projection and preserves low-confidence suppression", () => {
      const fixture = buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en");
      const scores = fixture.report.scores as { global: { raw_score?: number }; dimensions: Record<string, { raw_score?: number }> };
      scores.global.raw_score = 180;
      scores.dimensions.SA.raw_score = 43;
      const { rerender } = render(<EQResultV5 locale={locale} reportData={fixture.report as unknown as ReportResponse} />);
      expect(screen.getByTestId("eq-event-practice")).toBeInTheDocument();
      expect(screen.getByTestId("eq-score-units")).toHaveTextContent("POMP");
      expect(screen.getByTestId("eq-evidence-snapshot")).toHaveTextContent("180");
      expect(screen.getByTestId("eq-matrix-SA")).toHaveTextContent("43");
      const low = buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en", "low_confidence");
      rerender(<EQResultV5 locale={locale} reportData={low.report as unknown as ReportResponse} />);
      expect(screen.queryByTestId("eq-event-practice")).not.toBeInTheDocument();
      rerender(<EQResultV5 locale={locale} reportData={{ ...fixture.report, access: { locked: true } } as unknown as ReportResponse} />);
      expect(screen.queryByTestId("eq-event-practice")).not.toBeInTheDocument();
    });
  });
}
