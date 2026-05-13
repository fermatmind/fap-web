import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { collectPathDecisions, POST } from "@/app/api/content-release/revalidate/route";

describe("content release revalidate allowlist", () => {
  afterEach(() => {
    mocks.revalidatePath.mockClear();
    delete process.env.CONTENT_RELEASE_REVALIDATE_TOKEN;
  });

  it("accepts zh/en article, topic, career, test, personality, and llms paths", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "article", locale: "zh-CN" },
        cache_signal: {
          paths: [
            "/zh",
            "/zh/articles",
            "/zh/articles/how-personality-shapes-attitude-toward-ai",
            "/zh/topics/mbti",
            "/zh/career/guides/how-to-find-right-career-direction",
            "/zh/career/jobs/software-engineer",
            "/zh/tests/mbti-personality-test-16-personality-types",
            "/zh/personality",
            "/zh/personality/infj-a",
            "/llms.txt",
            "/llms-full.txt",
            "/en",
            "/en/articles",
            "/en/articles/how-personality-shapes-attitude-toward-ai",
            "/en/topics/mbti",
            "/en/career/guides/how-to-find-right-career-direction",
            "/en/career/jobs/software-engineer",
            "/en/tests/mbti-personality-test-16-personality-types",
            "/en/personality",
            "/en/personality/infj-a",
          ],
        },
      },
      "https://fermatmind.com"
    );

    expect(decisions.rejected).toEqual([]);
    expect(decisions.accepted).toEqual([
      "/zh",
      "/zh/articles",
      "/zh/articles/how-personality-shapes-attitude-toward-ai",
      "/zh/topics/mbti",
      "/zh/career/guides/how-to-find-right-career-direction",
      "/zh/career/jobs/software-engineer",
      "/zh/tests/mbti-personality-test-16-personality-types",
      "/zh/personality",
      "/zh/personality/infj-a",
      "/llms.txt",
      "/llms-full.txt",
      "/en",
      "/en/articles",
      "/en/articles/how-personality-shapes-attitude-toward-ai",
      "/en/topics/mbti",
      "/en/career/guides/how-to-find-right-career-direction",
      "/en/career/jobs/software-engineer",
      "/en/tests/mbti-personality-test-16-personality-types",
      "/en/personality",
      "/en/personality/infj-a",
    ]);
  });

  it("rejects api, private, take-flow, traversal, and external paths", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "article", locale: "en" },
        cache_signal: {
          paths: [
            "/api/content-release/revalidate",
            "/ops/articles",
            "/result/abc",
            "/orders/ord_1",
            "/payment/checkout",
            "/share/private-token",
            "/zharticles/how-personality-shapes-attitude-toward-ai",
            "/en/tests/mbti-personality-test-16-personality-types/take",
            "/en/articles/../orders",
          ],
          urls: ["https://evil.example/en/articles/fake"],
        },
      },
      "https://fermatmind.com"
    );

    expect(decisions.accepted).toEqual([]);
    expect(decisions.rejected.map((item) => item.reason)).toEqual([
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "not_allowlisted",
      "private_or_api_path",
      "path_traversal",
      "malformed_or_external_url",
    ]);
  });

  it("reports accepted and rejected paths while only revalidating accepted paths", async () => {
    process.env.CONTENT_RELEASE_REVALIDATE_TOKEN = "release-token";

    const request = new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
      method: "POST",
      headers: {
        "x-fm-content-release-token": "release-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: { type: "article", locale: "zh-CN" },
        cache_signal: {
          paths: ["/zh/articles/how-personality-shapes-attitude-toward-ai", "/api/private"],
        },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revalidated_paths).toEqual(["/zh/articles/how-personality-shapes-attitude-toward-ai"]);
    expect(payload.rejected_paths).toEqual([{ path: "/api/private", reason: "private_or_api_path" }]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/zh/articles/how-personality-shapes-attitude-toward-ai");
  });

  it("requires the shared content release token", async () => {
    process.env.CONTENT_RELEASE_REVALIDATE_TOKEN = "release-token";

    const response = await POST(
      new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cache_signal: { paths: ["/zh/articles"] } }),
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
