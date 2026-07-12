import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("performance operations", () => {
  it("keeps the scheduled scanner read-only and evidence-producing", () => {
    const workflow = read(".github/workflows/public-performance-audit.yml");
    const script = read("scripts/performance/audit-public-performance.mjs");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("retention-days: 90");
    expect(script).toContain('method: "GET"');
    expect(script.replace(/\s+/g, " ")).not.toMatch(/fetch\(.+method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
    expect(script).toContain("slow_pages_top_n");
    expect(script).toContain("slow_apis_top_n");
  });

  it("scans only anonymous public targets and documents operational boundaries", () => {
    const config = JSON.parse(read("scripts/performance/public-performance-targets.json"));
    const sop = read("docs/performance/performance-operations-sop.md");
    expect(config.samples).toBe(3);
    expect(config.targets.every((target: { url: string }) => target.url.startsWith("https://"))).toBe(true);
    expect(config.targets.every((target: { url: string }) => !/(result|order|payment|attempt|report)/i.test(target.url))).toBe(true);
    expect(sop).toContain("does not trigger it");
    expect(sop).toContain("Do not call three samples field p75");
  });
});
