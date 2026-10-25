import { afterEach, describe, expect, it, vi } from "vitest";
import { loadResultPrintBootstrap } from "@/app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap";
const mocks = vi.hoisted(() => ({ normalize: vi.fn(), publicContent: vi.fn(), validate: vi.fn() }));
vi.mock("@/lib/api-base", () => ({ buildApiUrl: (path: string) => `https://local.test/api${path}` }));
vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  normalizeDesktopCloneResponse: mocks.normalize,
  fetchPersonalityDesktopCloneSnapshotContent: mocks.publicContent,
}));
vi.mock("@/lib/result/mbtiSnapshotContent", () => ({
  resolveMbtiSnapshotFullCodeFromReport: () => "INTJ-A",
  validateMbtiSnapshotDesktopCloneContent: mocks.validate,
}));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe("authorized English MBTI print bootstrap", () => {
  it("consumes the owner-checked private report and never substitutes the redacted public endpoint", async () => {
    const authorized = { full_code: "INTJ-A", content: { private: "full existing content" } };
    const parsed = { fullCode: "INTJ-A", locale: "en" };
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ ok: true })).mockResolvedValueOnce(Response.json({ ok: true, scale_code: "MBTI", mbti_pdf_content: authorized }));
    vi.stubGlobal("fetch", fetchMock);
    mocks.normalize.mockReturnValue(parsed);
    mocks.validate.mockReturnValue({ ok: true, source: "server-prefetched-desktop-clone", missing: [] });
    const result = await loadResultPrintBootstrap({ attemptId: "synthetic", locale: "en", accessToken: "synthetic-print-grant" });
    expect(result.desktopCloneContent).toBe(parsed);
    expect(mocks.normalize).toHaveBeenCalledWith(authorized, "INTJ-A", "en", true);
    expect(mocks.publicContent).not.toHaveBeenCalled();
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.headers["X-Result-Access-Token"]).toBe("synthetic-print-grant");
      expect(options.cache).toBe("no-store");
    }
  });
  it("keeps English content unavailable when its private authority is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ ok: true })).mockResolvedValueOnce(Response.json({ ok: true, scale_code: "MBTI" })));
    mocks.validate.mockReturnValue({ ok: false, code: "DESKTOP_CLONE_CONTENT_MISSING", missing: ["desktop_clone_content"] });
    const result = await loadResultPrintBootstrap({ attemptId: "synthetic", locale: "en", accessToken: "synthetic-print-grant" });
    expect(result.desktopCloneContent).toBeNull();
    expect(mocks.normalize).not.toHaveBeenCalled();
    expect(mocks.publicContent).not.toHaveBeenCalled();
  });
});
