import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { AdaptiveOptionGroup } from "@/components/quiz/immersive/AdaptiveOptionGroup";

expect.extend(toHaveNoViolations);

describe("AdaptiveOptionGroup accessibility", () => {
  it("is accessible in bubble mode", async () => {
    const { container } = render(
      <AdaptiveOptionGroup
        questionId="q1"
        options={[
          { code: "1", text: "Strongly disagree" },
          { code: "2", text: "Disagree" },
          { code: "3", text: "Neutral" },
          { code: "4", text: "Agree" },
          { code: "5", text: "Strongly agree" },
        ]}
        value="3"
        noOptionsLabel="No options"
        onChange={() => undefined}
      />
    );

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  it("supports keyboard arrow navigation", () => {
    const onChange = vi.fn();

    render(
      <AdaptiveOptionGroup
        questionId="q2"
        options={[
          { code: "1", text: "Never" },
          { code: "2", text: "Rarely" },
          { code: "3", text: "Sometimes" },
          { code: "4", text: "Often" },
          { code: "5", text: "Always" },
        ]}
        value="3"
        noOptionsLabel="No options"
        onChange={onChange}
      />
    );

    const radios = screen.getAllByRole("radio");
    fireEvent.keyDown(radios[2], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("4");
  });
});
