import { fireEvent, render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { it, expect, describe, vi } from "vitest";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";

expect.extend(toHaveNoViolations);

describe("V2LikertScale accessibility", () => {
  it.each(["default", "cards"] as const)("%s is keyboard and screen-reader friendly", async (appearance) => {
    const onChange = vi.fn();
    const { container, getAllByRole } = render(
      <V2LikertScale
        appearance={appearance}
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

// The four ascending scales must retain their API order and answer codes while
// displaying expressions that agree with the response labels.
describe("ascending response cards", () => {
  it.each([
    ["Big Five", ["1", "2", "3", "4", "5"]],
    ["Enneagram", ["-2", "-1", "0", "1", "2"]],
    ["RIASEC", ["1", "2", "3", "4", "5"]],
    ["EQ", ["A", "B", "C", "D", "E"]],
  ])("preserves %s codes and maps negative through positive expressions", (_, codes) => {
    const onChange = vi.fn();
    const { getAllByRole } = render(<V2LikertScale questionId="ascending" appearance="cards" positiveEnd="last"
      options={codes.map((code, i) => ({ code, text: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][i] }))}
      value={codes[3]} onChange={onChange} />);
    const radios = getAllByRole("radio");
    radios.forEach((radio, i) => {
      expect(radio).toHaveAttribute("data-tone", String(4 - i));
      fireEvent.click(radio);
      expect(onChange).toHaveBeenLastCalledWith(codes[i]);
    });
    expect(radios[3]).toHaveAttribute("aria-checked", "true");
  });
});
