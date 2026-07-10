import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const SOURCE = readFileSync("app/(localized)/[locale]/personality/enneagram/page.tsx", "utf8");

describe("SECURITY-123-WEB-08 Enneagram robots follow semantics", () => {
  it("derives noindex follow from the backend robots directive", () => {
    expect(SOURCE).toContain("function robotsAllowsFollow");
    expect(SOURCE).toContain("noindexFollow: robotsAllowsFollow(asset.robots)");
    expect(SOURCE).not.toContain('asset.robots.includes("nofollow") ? true');
  });
});
