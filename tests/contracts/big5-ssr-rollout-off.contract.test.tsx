import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-anon-id": "rollout-off-fixture" }) }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`redirect:${path}`); },
  permanentRedirect: (path: string) => { throw new Error(`redirect:${path}`); },
  notFound: () => { throw new Error("not-found"); },
}));
vi.mock("@/lib/content", () => ({
  getTestBySlug: async () => ({
    slug: "big-five-personality-test-ocean-model", scale_code: "BIG5_OCEAN", title: "Big Five",
  }),
  resolveTestTitleByLocale: () => "Big Five",
}));
vi.mock("@/app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient", () => ({ default: () => null }));
vi.mock("@/app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient", () => ({ default: () => null }));
vi.mock("@/app/(localized)/[locale]/tests/[slug]/take/EnneagramTakeClient", () => ({ default: () => null }));
vi.mock("@/app/(localized)/[locale]/tests/[slug]/take/EqSjtTakeClient", () => ({ default: () => null }));
vi.mock("@/app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient", () => ({ default: () => null }));

import TakePage from "@/app/(localized)/[locale]/tests/[slug]/take/page";

describe("Big Five server-side rollout boundary", () => {
  beforeEach(() => {
    vi.stubEnv("ENABLE_BIG5_OCEAN", "true");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it.each([
    ["en", false, "free_only"],
    ["zh", false, "free_only"],
    ["en", true, "off"],
    ["zh", true, "off"],
  ] as const)("%s backend gate (enabled=%s, mode=%s) redirects before rendering the quiz", async (locale, enabled, mode) => {
    const slug = "big-five-personality-test-ocean-model";
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      capabilities: { enabled_in_prod: enabled, paywall_mode: mode },
      forms: [{ form_code: "big5_120", question_count: 120 }],
    })));
    await expect(TakePage({
      params: Promise.resolve({ locale, slug }), searchParams: Promise.resolve({}),
    })).rejects.toThrow(`redirect:/${locale}/tests/${slug}?maintenance=1`);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/v0.3/scales/lookup?slug=${slug}&locale=${locale}`),
      expect.objectContaining({ headers: expect.objectContaining({ "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en" }) })
    );
  });
});
