import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IqOptionBoard } from "@/components/quiz/iq/IqOptionBoard";
import { IqStemSvg, IqVectorSvg } from "@/components/quiz/iq/IqStemSvg";
import {
  normalizeIqOptionForRenderer,
  normalizeIqQuestionForRenderer,
  normalizeIqStructuredSvg,
} from "@/lib/iq/renderer";

describe("IQ question renderer contract", () => {
  it("renders structured SVG path arrays", () => {
    render(
      <IqVectorSvg
        svg={{
          viewBox: "0 0 100 100",
          paths: [{ d: "M0 0h10v10z", fill: "#111" }],
        }}
      />
    );

    const svg = screen.getByRole("img", { name: "IQ matrix graphic" });
    expect(svg.querySelectorAll("path")).toHaveLength(1);
  });

  it("accepts both view_box and viewBox", () => {
    expect(
      normalizeIqStructuredSvg({
        view_box: "0 0 40 40",
        paths: [{ d: "M0 0h10v10z" }],
      })
    ).toMatchObject({ viewBox: "0 0 40 40" });

    expect(
      normalizeIqStructuredSvg({
        viewBox: "0 0 50 50",
        paths: [{ d: "M0 0h20v20z" }],
      })
    ).toMatchObject({ viewBox: "0 0 50 50" });
  });

  it("accepts both stroke_width and strokeWidth plus fill_rule and fillRule", () => {
    render(
      <IqVectorSvg
        svg={{
          view_box: "0 0 100 100",
          paths: [
            { d: "M0 0h10v10z", stroke_width: 2, fill_rule: "evenodd", opacity: 0.5 },
            { d: "M20 20h10v10z", strokeWidth: 3, fillRule: "nonzero" },
          ],
        }}
      />
    );

    const paths = screen.getByRole("img", { name: "IQ matrix graphic" }).querySelectorAll("path");
    expect(paths[0]?.getAttribute("stroke-width")).toBe("2");
    expect(paths[0]?.getAttribute("fill-rule")).toBe("evenodd");
    expect(paths[0]?.getAttribute("opacity")).toBe("0.5");
    expect(paths[1]?.getAttribute("stroke-width")).toBe("3");
    expect(paths[1]?.getAttribute("fill-rule")).toBe("nonzero");
  });

  it("does not use raw SVG innerHTML", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "components/quiz/iq/IqStemSvg.tsx"),
      "utf8"
    );

    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("renders stem wrapper with normalized SVG payload", () => {
    render(
      <IqStemSvg
        stem={{
          svg: {
            view_box: "0 0 100 100",
            paths: [{ d: "M0 0h10v10z" }],
          },
        }}
      />
    );

    expect(screen.getByTestId("iq-stem-svg")).toBeInTheDocument();
  });

  it("renders 6 options in a 2x3-ready desktop grid", () => {
    render(
      <IqOptionBoard
        questionId="IQ_Q_01"
        options={["A", "B", "C", "D", "E", "F"].map((code) => ({ option_code: code, label: code }))}
        value="A"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options"
        onChange={() => undefined}
      />
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(6);
    const grid = screen.getByTestId("iq-option-board-desktop").querySelector(".grid") as HTMLElement | null;
    expect(grid?.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("renders 5 legacy options gracefully", () => {
    render(
      <IqOptionBoard
        questionId="IQ_Q_02"
        options={["A", "B", "C", "D", "E"].map((code) => ({ option_code: code, label: code }))}
        value="B"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options"
        onChange={() => undefined}
      />
    );

    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("keeps the mobile option board selectable in the narrow responsive layout", () => {
    const onChange = vi.fn();

    render(
      <IqOptionBoard
        questionId="IQ_Q_02_MOBILE"
        options={["A", "B", "C", "D", "E", "F"].map((code) => ({ option_code: code, label: code }))}
        value="A"
        locale="en"
        layoutMode="mobile"
        noOptionsLabel="No options"
        onChange={onChange}
      />
    );

    const mobileBoard = screen.getByTestId("iq-option-board-mobile");
    expect(mobileBoard.className).toContain("min-[390px]:grid-cols-2");

    fireEvent.click(screen.getByRole("radio", { name: "Option D" }));
    expect(onChange).toHaveBeenCalledWith("D");
  });

  it("selecting an option calls onSelect with option_code", () => {
    const onChange = vi.fn();

    render(
      <IqOptionBoard
        questionId="IQ_Q_03"
        options={[
          { option_code: "A", label: "A" },
          { option_code: "B", label: "B" },
          { option_code: "C", label: "C" },
        ]}
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Option C" }));
    expect(onChange).toHaveBeenCalledWith("C");
  });

  it("represents selected state visibly and semantically", () => {
    render(
      <IqOptionBoard
        questionId="IQ_Q_04"
        options={[
          { option_code: "A", label: "A" },
          { option_code: "B", label: "B" },
        ]}
        value="B"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options"
        onChange={() => undefined}
      />
    );

    const selected = screen.getByRole("radio", { name: "Option B" });
    expect(selected).toHaveAttribute("aria-checked", "true");
    expect(selected).toHaveAttribute("data-state", "selected");
  });

  it("disabled state prevents selection", () => {
    const onChange = vi.fn();

    render(
      <IqOptionBoard
        questionId="IQ_Q_05"
        options={[
          { option_code: "A", label: "A" },
          { option_code: "B", label: "B" },
        ]}
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options"
        disabled
        onChange={onChange}
      />
    );

    const optionA = screen.getByRole("radio", { name: "Option A" });
    fireEvent.click(optionA);
    fireEvent.keyDown(optionA, { key: "ArrowRight" });
    expect(optionA).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not require correct_answer to normalize renderer input", () => {
    const normalized = normalizeIqQuestionForRenderer({
      item_id: "FM-IQ-VSPR-MX-L3-0001",
      stem: {
        svg: {
          viewBox: "0 0 100 100",
          paths: [{ d: "M0 0h10v10z" }],
        },
      },
      options: [{ option_code: "A", svg: { view_box: "0 0 50 50", paths: [{ d: "M0 0h5v5z" }] } }],
    });

    expect(normalized?.id).toBe("FM-IQ-VSPR-MX-L3-0001");
    expect(normalized?.options).toHaveLength(1);
  });

  it("does not introduce fake scoring fields during option normalization", () => {
    const normalized = normalizeIqOptionForRenderer({
      option_code: "A",
      label: "A",
      score: 999,
      correct_answer: "B",
    });

    expect(normalized).toMatchObject({
      code: "A",
      label: "A",
    });
    expect(normalized && "score" in normalized).toBe(false);
    expect(normalized && "correct_answer" in normalized).toBe(false);
  });
});
