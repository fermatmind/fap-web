import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import type { TraitUnlockBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const items = [1, 2, 3, 4].map(index => ({
  id: `factor-${index}`, label: `Factor ${index}`, role: "support",
  definition: `Definition ${index}`, expression: `Expression ${index}`,
  whyItMatters: `Reason ${index}`, advantage: `Advantage ${index}`,
  overuseRisk: `Risk ${index}`, realWorldSignal: `Signal ${index}`, upgradeHint: `Action ${index}`,
})) as TraitUnlockBlock["items"];
const props = {
  sectionId: "career", locale: "en" as const, traits: [],
  traitsUnlock: { title: "Factors", intro: "Context", items },
  isUnlocked: true, unlockHref: "#offer", unlockPayLabel: "Unlock",
};

describe("MBTI practical factor summaries", () => {
  it("shows risks and actions first, with keyboard-accessible explanations on demand", () => {
    render(<MbtiCloneInfluentialTraitsCard {...props} />);
    const first = screen.getByRole("heading", { name: "Factor 1" }).closest("article")!;
    expect(within(first).getByText("Action 1", { exact: false })).toBeVisible();
    expect(within(first).getByText("Risk 1", { exact: false })).toBeVisible();
    const details = first.querySelector("details")!;
    expect(details.open).toBe(false);
    expect(within(first).getByText("Definition 1")).not.toBeVisible();
    fireEvent.click(within(first).getByText("See how it shows up"));
    expect(details.open).toBe(true);
    expect(within(first).getByText("Definition 1")).toBeVisible();
  });

  it("expands every explanation in PDF snapshot mode", () => {
    const { container } = render(<MbtiCloneInfluentialTraitsCard {...props} snapshotMode />);
    expect(container.querySelectorAll("details[open]")).toHaveLength(4);
    for (const index of [1, 2, 3, 4]) expect(screen.getByText(`Definition ${index}`)).toBeVisible();
  });
});
