import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WarningBanner } from "@/components/career/WarningBanner";

describe("career warning copy experiment contract", () => {
  it("switches warning copy style via experiment variant without changing warning truth payload", () => {
    const html = renderToStaticMarkup(
      (
        <WarningBanner
          locale="en"
          copyVariant="strict"
          warnings={{
            redFlags: ["index_state_restricted"],
            amberFlags: ["low_quality_confidence"],
            blockedClaims: ["strong_claim"],
          }}
          testId="career-warning-banner-experiment"
        />
      ) as ReactNode
    );

    expect(html).toContain("career-warning-banner-experiment");
    expect(html).toContain("High-priority warnings and limits");
    expect(html).toContain("Critical signals");
    expect(html).toContain("Restricted claims");
    expect(html).toContain("index_state_restricted");
    expect(html).toContain("strong_claim");
  });
});

