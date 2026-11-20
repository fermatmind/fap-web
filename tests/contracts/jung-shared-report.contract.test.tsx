import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JungReport } from "@/components/result/jung/JungReportPreview";
import { JungResult } from "@/components/result/jung/JungResult";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import {
  interpretJungScores,
  jungSampleScores,
  makePreviewScores,
  readJungArchetypeScores,
} from "@/components/result/jung/jungReportAssets";
import SamplePage, {
  metadata,
} from "@/app/(localized)/[locale]/tests/jung-archetypes/sample/page";
import CanonicalSamplePage from "@/app/(localized)/[locale]/reports/samples/[test]/page";
import { loadFixedSample } from "@/lib/reports/fixedSamples";
import type { RiasecPurchase } from "@/lib/api/v0_3";

vi.mock(
  "@/app/(localized)/[locale]/career/assessment/Career94Purchase",
  () => ({
    Career94Checkout: () => <p>Existing checkout</p>,
  }),
);
vi.mock("@/components/commerce/CareerRefundPanel", () => ({
  CareerRefundPanel: ({ onRefunded }: { onRefunded: () => void }) => (
    <button onClick={onRefunded}>Refund</button>
  ),
}));
const rootFor = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};
const payloadFor = (scores: Record<string, number>) => {
  const result = interpretJungScores(scores);
  return {
    scores,
    primary: result.primary,
    secondary: result.secondary,
    near_leaders: result.nearLeaders,
    pattern: result.state === "flat" ? "flat" : "differentiated",
  };
};
const purchase: RiasecPurchase = {
  attempt_id: "synthetic-attempt",
  unlocked: false,
  order_no: null,
  payment_state: null,
  offers: [
    {
      provider: "alipay",
      sku: "synthetic-offer",
      currency: "CNY",
      amount_cents: 299,
    },
  ],
};

describe("shared Chinese Jung report and fixed public sample", () => {
  it("renders identical report chapters from the same assets in real and sample modes", async () => {
    const sample = rootFor(
      renderToStaticMarkup(
        await SamplePage({ params: Promise.resolve({ locale: "zh" }) }),
      ),
    );
    const canonical = rootFor(
      renderToStaticMarkup(
        await CanonicalSamplePage({
          params: Promise.resolve({ locale: "zh", test: "archetypes" }),
        }),
      ),
    );
    expect(canonical.textContent).toBe(sample.textContent);
    expect(
      (await loadFixedSample("archetypes", "zh"))?.report?.jung,
    ).toMatchObject(payloadFor({ ...jungSampleScores }));
    const real = rootFor(
      renderToStaticMarkup(
        <JungResult
          scale="JUNG_ARCHETYPES"
          locale="zh"
          payload={payloadFor({ ...jungSampleScores })}
        />,
      ),
    );
    for (const chapter of [
      "profile",
      "dimensions",
      "reading",
      "careers",
      "work",
      "relationships",
      "actions",
      "method",
    ]) {
      expect(real.querySelector(`#${chapter}`)?.textContent).toBe(
        sample.querySelector(`#${chapter}`)?.textContent,
      );
    }
    expect(
      real
        .querySelector("[data-report-mode]")
        ?.getAttribute("data-report-mode"),
    ).toBe("result");
    expect(
      sample
        .querySelector("[data-report-mode]")
        ?.getAttribute("data-report-mode"),
    ).toBe("sample");
    expect(real.querySelector("[data-testid=jung-report-shell]")?.tagName).toBe(
      "ARTICLE",
    );
    expect(real.querySelectorAll("select")).toHaveLength(0);
    expect(sample.querySelectorAll("select")).toHaveLength(0);
    expect(sample.textContent).toContain("所有人看到相同示例");
    expect(sample.querySelector("#ai")?.textContent).toContain(
      "不能当作我的真实测评结果",
    );
    expect(real.querySelector("#ai")?.textContent).toContain(
      "以下是我本次作答得到",
    );
    expect(real.textContent).not.toMatch(/本地|虚构|\{context\}/);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it.each(["clear", "near", "tied", "flat"] as const)(
    "keeps actual backend score relations in %s results",
    (state) => {
      const scores = makePreviewScores("rebel", state);
      const root = rootFor(
        renderToStaticMarkup(
          <JungResult
            scale="JUNG_ARCHETYPES"
            locale="zh"
            payload={payloadFor(scores)}
          />,
        ),
      );
      expect(
        root.querySelector("#profile")?.getAttribute("data-result-state"),
      ).toBe(state);

      expect(
        root.querySelector("#dimensions svg")?.getAttribute("aria-label"),
      ).toContain(`反叛者 ${scores.rebel} 分`);
      expect(root.querySelector("#ai")?.textContent).toContain(
        `反叛者 ${scores.rebel}`,
      );
    },
  );
  it.each(["zh", "en", "zh-TW"])(
    "does not expose the retired cognitive sample in %s",
    async (locale) => {
      await expect(
        CanonicalSamplePage({
          params: Promise.resolve({ locale, test: "cognitive" }),
        }),
      ).rejects.toThrow();
    },
  );
  it("fails unavailable or inconsistent real payloads without falling back to the sample", () => {
    for (const bad of [
      undefined,
      null,
      {},
      { scores: { sage: 100 } },
      { scores: { ...jungSampleScores, sage: 51 } },
      { ...payloadFor({ ...jungSampleScores }), primary: ["hero"] },
      { ...payloadFor({ ...jungSampleScores }), pattern: "flat" },
      { scores: { ...jungSampleScores, foreign: 25 } },
    ]) {
      expect(readJungArchetypeScores(bad)).toBeNull();
      const html = renderToStaticMarkup(
        <JungResult scale="JUNG_ARCHETYPES" locale="zh" payload={bad} />,
      );
      expect(html).toContain("当前无法读取报告");
      expect(html).not.toContain("87.5");
    }
    const html = renderToStaticMarkup(
      <JungReport mode="result" scores={{ sage: 100 }} />,
    );
    expect(html).toContain("当前无法读取报告");
  });
  it("links only the fixed sample while retaining existing payment and refund behavior", () => {
    const data = { ok: true, meta: { scale_code: "JUNG_ARCHETYPES" } };
    const { rerender } = render(
      <MainstreamPaidResult data={data} purchase={purchase} locale="zh">
        <p>Private real result</p>
      </MainstreamPaidResult>,
    );
    expect(screen.queryByText("Private real result")).not.toBeInTheDocument();
    expect(screen.getByText("Existing checkout")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /查看完整示例报告/ }),
    ).toHaveAttribute("href", "/zh/reports/samples/archetypes");
    rerender(
      <MainstreamPaidResult
        data={data}
        purchase={{
          ...purchase,
          unlocked: true,
          order_no: "synthetic-order",
          payment_state: "paid",
        }}
        locale="zh"
      >
        <p>Private real result</p>
      </MainstreamPaidResult>,
    );
    expect(screen.getByText("Private real result")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /查看完整示例报告/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Refund"));
    expect(screen.queryByText("Private real result")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /查看完整示例报告/ }),
    ).toBeVisible();
    expect(screen.queryByText("Existing checkout")).not.toBeInTheDocument();
  });
});
