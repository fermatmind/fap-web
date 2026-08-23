import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("career root redirect contract", () => {
  it("removes the landing page and redirects both locale entries to the occupation library", () => {
    const root = process.cwd();
    const pagePath = path.join(root, "app/(localized)/[locale]/career/page.tsx");
    const config = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");

    expect(fs.existsSync(pagePath)).toBe(false);
    expect(config).toContain('source: "/:locale(en|zh)/career"');
    expect(config).toContain('destination: "/:locale/career/jobs"');
    expect(config).toContain("permanent: true");
  });
});
