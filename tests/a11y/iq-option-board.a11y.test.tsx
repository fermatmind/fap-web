import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { IqOptionBoard } from "@/components/quiz/iq/IqOptionBoard";

expect.extend(toHaveNoViolations);

describe("IqOptionBoard accessibility", () => {
  it("is accessible in desktop layout", async () => {
    const { container } = render(
      <IqOptionBoard
        questionId="MATRIX_Q01"
        options={[
          { code: "A", text: "A" },
          { code: "B", text: "B" },
          { code: "C", text: "C" },
          { code: "D", text: "D" },
        ]}
        value="B"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options available"
        onChange={() => undefined}
      />
    );

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  it("is accessible with owner image options", async () => {
    const { container } = render(
      <IqOptionBoard
        questionId="IQ_OWNER_ORIGINAL_30_01"
        options={["A", "B", "C", "D", "E", "F"].map((code) => ({
          code,
          text: code,
          image: {
            src: `/media/iq/q1-option-${code.toLowerCase()}.webp`,
            width: 296,
            height: 168,
            alt: `Owner option ${code}`,
          },
        }))}
        value="B"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options available"
        onChange={() => undefined}
      />
    );

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  it("supports arrow key navigation", () => {
    const onChange = vi.fn();

    render(
      <IqOptionBoard
        questionId="MATRIX_Q02"
        options={[
          { code: "A", text: "A" },
          { code: "B", text: "B" },
          { code: "C", text: "C" },
          { code: "D", text: "D" },
        ]}
        value="B"
        locale="en"
        layoutMode="desktop"
        noOptionsLabel="No options available"
        onChange={onChange}
      />
    );

    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("C");
  });
});
