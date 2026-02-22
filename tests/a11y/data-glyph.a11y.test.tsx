import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { CARD_VISUAL_KINDS } from "@/lib/design/card-spec";

expect.extend(toHaveNoViolations);

describe("DataGlyph accessibility", () => {
  it("uses a safe fallback aria label when label is omitted", () => {
    const { getByRole } = render(<DataGlyph kind="bars_ocean" />);
    expect(getByRole("img", { name: "Structured assessment visual chart." })).toBeTruthy();
  });

  it("has no a11y violations across all visual kinds", async () => {
    const { container } = render(
      <div>
        {CARD_VISUAL_KINDS.map((kind) => (
          <DataGlyph key={kind} kind={kind} ariaLabel={`${kind} visual`} />
        ))}
      </div>
    );

    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});
