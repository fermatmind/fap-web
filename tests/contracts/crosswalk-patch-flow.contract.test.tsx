import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrosswalkPatchForm } from "@/components/ops/career/CrosswalkPatchForm";

describe("crosswalk patch flow contract", () => {
  it("renders patch create and approve/reject action controls", () => {
    const html = renderToStaticMarkup(
      (
        <CrosswalkPatchForm
          locale="en"
          subjectSlug="unmapped-role"
          defaultTargetKind="family"
          defaultTargetSlug="software-engineering-family"
          latestPatchKey="patch-v3"
        />
      ) as ReactNode
    );

    expect(html).toContain("crosswalk-patch-form");
    expect(html).toContain("Submit patch");
    expect(html).toContain("Approve latest");
    expect(html).toContain("Reject latest");
    expect(html).toContain("subject: unmapped-role");
  });
});

