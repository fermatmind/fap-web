import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(async (): Promise<
    | { ok: true; nonceHash: string }
    | { ok: false; status: 401 | 429 | 503; errorCode: string; message: string }
  > => ({ ok: true, nonceHash: "test-nonce-hash" })),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

vi.mock("@/lib/security/contentReleaseRevalidationAuth", () => ({
  authenticateContentReleaseRevalidation: mocks.authenticate,
}));

import { collectPathDecisions, POST } from "@/app/api/content-release/revalidate/route";

describe("content release revalidate allowlist", () => {
  afterEach(() => {
    mocks.revalidatePath.mockClear();
    mocks.revalidateTag.mockClear();
    mocks.authenticate.mockClear();
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
            "/zh/personality/big-five/openness",
            "/zh/personality/big-five/openness-high",
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
            "/en/personality/big-five/openness",
            "/en/personality/big-five/openness-high",
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
      "/zh/personality/big-five/openness",
      "/zh/personality/big-five/openness-high",
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
      "/en/personality/big-five/openness",
      "/en/personality/big-five/openness-high",
    ]);
  });

  it("accepts Big Five public asset paths while rejecting deeper unpublished nested paths", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "personality_public_content_asset", locale: "zh-CN" },
        cache_signal: {
          paths: [
            "/zh/personality/big-five/openness",
            "/zh/personality/big-five/openness-high",
            "/zh/personality/big-five/neuroticism-low",
            "/zh/personality/big-five/facets/imagination",
          ],
        },
      },
      "https://fermatmind.com"
    );

    expect(decisions.accepted).toEqual([
      "/zh/personality/big-five/openness",
      "/zh/personality/big-five/openness-high",
      "/zh/personality/big-five/neuroticism-low",
    ]);
    expect(decisions.rejected).toEqual([
      { path: "/zh/personality/big-five/facets/imagination", reason: "not_allowlisted" },
    ]);
  });

  it("accepts exactly the 58 x 2 Enneagram public routes", async () => {
    const paths = ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.flatMap((entry) => [
      buildEnneagramPublicContentPath("en", entry),
      buildEnneagramPublicContentPath("zh", entry),
    ]);

    expect(paths).toHaveLength(116);
    expect(new Set(paths).size).toBe(116);

    const decisions = collectPathDecisions(
      {
        content: { type: "personality_public_content_asset", locale: "en" },
        cache_signal: { paths },
      },
      "https://fermatmind.com"
    );

    expect(decisions.accepted).toEqual(paths);
    expect(decisions.rejected).toEqual([]);

    const response = await POST(
      new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: { type: "personality_public_content_asset", locale: "en" },
          cache_signal: { paths },
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revalidated_paths).toEqual(paths);
    expect(payload.rejected_paths).toEqual([]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(116);
  });

  it("rejects nonexistent and arbitrary Enneagram paths plus private path classes", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "personality_public_content_asset", locale: "en" },
        cache_signal: {
          paths: [
            "/en/personality/enneagram/wings/1w3",
            "/zh/personality/enneagram/centers/body",
            "/en/personality/enneagram/type-10",
            "/zh/personality/enneagram/type-4/instincts/intimate",
            "/en/personality/enneagram/type-4/instincts/social/extra",
            "/en/personality/enneagram/arbitrary/deep/path",
            "/en/personality/enneagram/../orders",
            "/api/personality/enneagram",
            "/results/private-report",
            "/orders/order-1",
            "/payment/checkout",
            "/share/private-token",
            "/en/tests/enneagram-personality-test/take",
          ],
          urls: ["https://evil.example/en/personality/enneagram/type-1"],
        },
      },
      "https://fermatmind.com"
    );

    expect(decisions.accepted).toEqual([]);
    expect(decisions.rejected.map((item) => item.reason)).toEqual([
      "not_allowlisted",
      "not_allowlisted",
      "not_allowlisted",
      "not_allowlisted",
      "not_allowlisted",
      "not_allowlisted",
      "path_traversal",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "private_or_api_path",
      "malformed_or_external_url",
    ]);
  });

  it("rejects api, private, take-flow, traversal, and external paths", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "content_page", locale: "en" },
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
    expect(payload.revalidated_paths).toEqual([
      "/zh/articles/how-personality-shapes-attitude-toward-ai",
      "/zh/articles",
      "/en/articles",
      "/llms.txt",
      "/llms-full.txt",
    ]);
    expect(payload.rejected_paths).toEqual([{ path: "/api/private", reason: "private_or_api_path" }]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(5);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/zh/articles/how-personality-shapes-attitude-toward-ai");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/zh/articles");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/en/articles");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/llms.txt");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/llms-full.txt");
  });

  it("derives article list and detail paths from article release metadata", async () => {
    process.env.CONTENT_RELEASE_REVALIDATE_TOKEN = "release-token";

    const request = new NextRequest("https://www.fermatmind.com/api/content-release/revalidate", {
      method: "POST",
      headers: {
        "x-fm-content-release-token": "release-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: {
          type: "article",
          slug: "big-five-personality-test-vs-mbti",
          locale: "zh-CN",
        },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revalidated_paths).toEqual([
      "/zh/articles",
      "/en/articles",
      "/zh/articles/big-five-personality-test-vs-mbti",
      "/en/articles/big-five-personality-test-vs-mbti",
      "/llms.txt",
      "/llms-full.txt",
    ]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(6);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/zh/articles");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/en/articles");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(3, "/zh/articles/big-five-personality-test-vs-mbti");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(4, "/en/articles/big-five-personality-test-vs-mbti");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(5, "/llms.txt");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(6, "/llms-full.txt");
    expect(payload.invalidated_tags).toEqual([
      "article-detail:zh-CN:big-five-personality-test-vs-mbti",
      "article-seo:zh-CN:big-five-personality-test-vs-mbti",
    ]);
    expect(mocks.revalidateTag).toHaveBeenNthCalledWith(
      1,
      "article-detail:zh-CN:big-five-personality-test-vs-mbti",
      { expire: 0 }
    );
    expect(mocks.revalidateTag).toHaveBeenNthCalledWith(
      2,
      "article-seo:zh-CN:big-five-personality-test-vs-mbti",
      { expire: 0 }
    );
  });

  it("accepts apex and www article URLs for the same public frontend surface", () => {
    const decisions = collectPathDecisions(
      {
        content: { type: "article", locale: "en" },
        cache_signal: {
          urls: [
            "https://fermatmind.com/zh/articles/big-five-personality-test-vs-mbti",
            "https://www.fermatmind.com/en/articles/big-five-personality-test-vs-mbti",
            "https://evil.example/en/articles/big-five-personality-test-vs-mbti",
          ],
        },
      },
      "https://www.fermatmind.com"
    );

    expect(decisions.accepted).toEqual([
      "/zh/articles/big-five-personality-test-vs-mbti",
      "/en/articles/big-five-personality-test-vs-mbti",
      "/zh/articles",
      "/en/articles",
      "/llms.txt",
      "/llms-full.txt",
    ]);
    expect(decisions.rejected).toEqual([{ path: "", reason: "malformed_or_external_url" }]);
  });

  it("requires valid content release authentication", async () => {
    mocks.authenticate.mockResolvedValueOnce({ ok: false, status: 401, errorCode: "UNAUTHORIZED", message: "invalid revalidation signature" });
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
