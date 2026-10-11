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

  it("redirects ASCII aliases before rendering", async () => {
    const response = await runProxy("/en/tests/big5-ocean");

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://fermatmind.com/en/tests/big-five-personality-test-ocean-model");
  });

  it.each([
    ["/en/tests/personality-mbti-test?utm=a", "/en/tests/mbti-personality-test-16-personality-types?utm=a", "GET"],
    ["/zh/tests/personality-mbti-test", "/zh/tests/mbti-personality-test-16-personality-types", "HEAD"],
    ["/en/tests/sds-20/take?source=kept", "/en/tests/depression-screening-test-standard-edition/take?source=kept", "GET"],
    ["/zh/tests/big5-ocean/take", "/zh/tests/big-five-personality-test-ocean-model/take", "HEAD"],
  ])("redirects known detail and take aliases with locale and query intact", async (source, target, method) => {
    const response = await runProxy(source, method);
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://fermatmind.com${target}`);
  });

  it.each([
    ["/en/tests/not-a-real-test/take", "GET"],
    ["/en/tests/big5-ocean", "POST"],
    ["/zh/tests/big-five-personality-test-ocean-model/take", "HEAD"],
  ])("preserves routes outside alias redirect authority", async (path, method) => {
    const response = await runProxy(path, method);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps staging aliases excluded from search", async () => {
    const response = await proxy(new NextRequest("https://staging.fermatmind.com/en/tests/mbti-test/take?utm=a"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://staging.fermatmind.com/en/tests/mbti-personality-test-16-personality-types/take?utm=a");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });

});
