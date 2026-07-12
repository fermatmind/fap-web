import { describe, expect, it } from "vitest";
import {
  extractBackendSitemapMbtiPersonalityPaths,
} from "@/lib/seo/backendSitemapSource";
import {
  LLMS_ROUTE_PERSONALITY_TIMEOUT_MS,
  LLMS_ROUTE_SOURCE_TIMEOUT_MS,
  withLlmsRouteBudget,
} from "@/lib/seo/llmsRouteBudget";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_PATHS = [
  "/zh/personality/istj-a",
  "/zh/personality/istp-a",
  "/zh/personality/isfp-a",
  "/zh/personality/esfj-a",
  "/zh/personality/intp-a-vs-intp-t",
  "/zh/personality/intj-vs-intp",
  "/zh/personality/entj-vs-intj",
  "/zh/personality/infj-vs-infp",
  "/zh/personality/istj-vs-isfj",
];

describe("MBTI-INDEX-24C llms personality authority budget", () => {
  it("gives backend-authoritative personality enumeration a dedicated long budget and signal", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");

    expect(LLMS_ROUTE_PERSONALITY_TIMEOUT_MS).toBe(60_000);
    expect(LLMS_ROUTE_PERSONALITY_TIMEOUT_MS).toBeGreaterThan(LLMS_ROUTE_SOURCE_TIMEOUT_MS);
    expect(route).toContain("async function listPersonalityPaths(): Promise<PersonalityPathResult>");
    expect(route).toContain("listBackendSitemapMbtiPersonalityPaths({ signal })");
    expect(route).toContain("listBackendSitemapBigFiveZhPaths({ signal })");
    expect(route).toContain("timeoutMs: LLMS_ROUTE_PERSONALITY_TIMEOUT_MS");
    expect(route).not.toContain("withLlmsRouteBudget((signal) => listPersonalityPaths(signal)");
  });

  it("accepts the exact nine promoted backend paths without inventing local coverage", () => {
    const payload = {
      items: [
        ...TARGET_PATHS.map((path) => ({ loc: `https://fermatmind.com${path}` })),
        { loc: "https://fermatmind.com/zh/personality/intj" },
        { loc: "https://evil.example/zh/personality/infj-a" },
        { loc: "https://fermatmind.com/zh/personality/intj-a?private=1" },
        { loc: "https://fermatmind.com/zh/result/private-attempt" },
      ],
    };

    expect(extractBackendSitemapMbtiPersonalityPaths(payload)).toEqual([...TARGET_PATHS].sort());
  });

  it("fails closed to an empty authority set when the source exceeds its budget", async () => {
    const result = await withLlmsRouteBudget(
      () => new Promise<string[]>((resolve) => setTimeout(() => resolve(TARGET_PATHS), 30)),
      [],
      { timeoutMs: 1 },
    );

    expect(result).toEqual([]);
  });
});
