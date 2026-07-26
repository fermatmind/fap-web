import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ROUTE_PATH = "app/(localized)/[locale]/personality/[type]/page.tsx";

describe("MBTI comparison robots follow contract", () => {
  it("preserves the backend follow directive while comparison content remains noindex", () => {
    const source = fs.readFileSync(path.join(ROOT, ROUTE_PATH), "utf8");

    expect(source).toContain(
      "const robotsPolicy = comparison.seoSurface?.robotsPolicy ?? comparison.seoMeta?.robots;"
    );
    expect(source).toContain("const noindex = !comparison.isIndexable || shouldNoindex(robotsPolicy);");
    expect(source).toContain("noindexFollow: robotsAllowsFollow(robotsPolicy),");
    expect(source).toContain('.includes("nofollow");');
  });
});
