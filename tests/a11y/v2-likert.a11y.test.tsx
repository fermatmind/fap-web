import { fireEvent, render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";

expect.extend(toHaveNoViolations);

describe("V2LikertScale accessibility", () => {
  it("is keyboard and screen-reader friendly", async () => {
    const onChange = vi.fn();
    const { container, getAllByRole } = render(
      <V2LikertScale
        questionId="q-1"
        options={[
          { code: "A", text: "Strongly agree" },
          { code: "B", text: "Agree" },
          { code: "C", text: "Neutral" },
          { code: "D", text: "Disagree" },
          { code: "E", text: "Strongly disagree" },
        ]}
        value="B"
        onChange={onChange}
      />
    );

    const radios = getAllByRole("radio");
    fireEvent.keyDown(radios[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("C");
    fireEvent.keyDown(radios[2], { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("B");

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});
