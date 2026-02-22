import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { LikertScale } from "@/components/big5/quiz/LikertScale";

expect.extend(toHaveNoViolations);

describe("LikertScale accessibility", () => {
  it("is keyboard and screen-reader friendly", async () => {
    const { container } = render(
      <LikertScale
        questionId="1"
        options={[
          { code: "1", text: "Strongly disagree" },
          { code: "2", text: "Disagree" },
          { code: "3", text: "Neutral" },
          { code: "4", text: "Agree" },
          { code: "5", text: "Strongly agree" },
        ]}
        value="3"
        onChange={() => undefined}
      />
    );

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});
