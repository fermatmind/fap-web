import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career common detail template contract", () => {
  it("uses one file-backed entry without legacy render branches", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    expect(source).toContain("CareerPageTemplate");
    expect(source).toContain("normalizeCareerPage");
    expect(source).not.toContain("CareerDocx");
    expect(source).not.toContain("presentation_v2");
    expect(source).not.toContain("job.page.content");
  });
  it("preserves arbitrary item counts and explicit headings", () => {
    const source = read("components/career/display/CareerPageTemplate.tsx");
    expect(source).toContain("block.items.map");
    expect(source).toContain("item.title");
    expect(source).not.toContain(".slice(0, 3)");
  });
  it("carries the career identity and incoming attribution into the common CTA", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    expect(source).toContain("buildCareerDisplayCtaHref");
    expect(source).toContain("subjectSlug: job.slug");
    expect(source).toContain("landingPath, attributionParams");
  });
});
