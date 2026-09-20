import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

async function runProxy(path: string, method = "GET") {
  return await proxy(new NextRequest(`https://fermatmind.com${path}`, { method }));
}

describe("test detail HTTP boundary", () => {
  it.each([
    [
      "/zh/tests/big%E2%80%91five%E2%80%91personality%E2%80%91test%E2%80%91ocean%E2%80%91model?campaign=kept",
      "/zh/tests/big-five-personality-test-ocean-model?campaign=kept",
    ],
    [
      "/zh/tests/holland%E2%80%91career%E2%80%91interest%E2%80%91test%E2%80%91riasec?push_animated=1&theme=light",
      "/zh/tests/holland-career-interest-test-riasec?push_animated=1&theme=light",
    ],
  ])("permanently redirects observed Unicode-hyphen paths before rendering", async (source, target) => {
    const response = await runProxy(source);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://fermatmind.com${target}`);
  });

  it("returns a real non-cacheable 404 for an unknown test slug", async () => {
    const response = await runProxy("/en/tests/not-a-real-test");

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-robots-tag")?.toLowerCase()).toContain("noindex");
  });

  it("returns the same real 404 boundary for HEAD probes", async () => {
    const response = await runProxy("/zh/tests/not-a-real-test", "HEAD");

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-robots-tag")?.toLowerCase()).toContain("noindex");
  });

  it("preserves canonical test-detail routes", async () => {
    const response = await runProxy("/zh/tests/big-five-personality-test-ocean-model");

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not broaden this fix to existing ASCII aliases", async () => {
    const response = await runProxy("/en/tests/big5-ocean");

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
