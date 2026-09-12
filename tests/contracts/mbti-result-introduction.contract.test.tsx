import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { fetchPersonalityResultIntroduction } from "@/lib/cms/personality-result-introduction";
import { useMbtiResultIntroduction } from "@/components/result/mbti/clone/useMbtiResultIntroduction";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("@/lib/api-client", () => ({ apiClient: { get: vi.fn() } }));
const get = vi.mocked(apiClient.get);
function response(code: string, locale: Locale) {
  return { ok: true, schema: "mbti_result_introduction.v1", full_code: code,
    locale: locale === "zh" ? "zh-CN" : "en", paragraphs: [`${code} ${locale} first`, `${code} ${locale} second`],
    revision: 1, content_hash: "a".repeat(64) };
}
beforeEach(() => get.mockReset());

describe("MBTI introduction authority", () => {
  for (const ei of ["E", "I"]) for (const sn of ["S", "N"]) for (const tf of ["T", "F"]) for (const jp of ["J", "P"]) for (const at of ["A", "T"]) {
    const code = `${ei}${sn}${tf}${jp}-${at}`;
    for (const locale of ["zh", "en"] as const) it(`reads the exact ${code} ${locale} asset`, async () => {
      const payload = response(code, locale); get.mockResolvedValueOnce(payload);
      expect((await fetchPersonalityResultIntroduction(code, locale))?.paragraphs).toEqual(payload.paragraphs);
      expect(get).toHaveBeenCalledWith(`/v0.5/personality/${code.toLowerCase()}/result-intro?locale=${payload.locale}`,
        expect.objectContaining({ skipAuth: true, cache: "no-store", locale }));
    });
  }
  it.each([
    { full_code: "INTP-T" }, { locale: "en" }, { paragraphs: [] }, { paragraphs: ["one", ""] },
    { paragraphs: ["one", 2] }, { schema: "other" }, { revision: 0 }, { revision: 1.5 },
    { content_hash: "invalid" }, { ok: false },
  ])("rejects incompatible content %j without a fallback", async (override) => {
    get.mockResolvedValueOnce({ ...response("INTP-A", "zh"), ...override });
    expect(await fetchPersonalityResultIntroduction("INTP-A", "zh")).toBeNull();
    expect(get).toHaveBeenCalledTimes(1);
  });
  it("rejects a base type instead of silently assigning a suffix", async () => {
    expect(await fetchPersonalityResultIntroduction("INTP", "zh")).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
  it("does not flash or restore the prior type or language after a late response", async () => {
    let resolveFirst!: (value: ReturnType<typeof response>) => void;
    get.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve; }));
    const { result, rerender } = renderHook(({ code, locale }: {code: string; locale: Locale}) => useMbtiResultIntroduction(code, locale),
      { initialProps: { code: "INTP-A", locale: "zh" as Locale } });
    expect(result.current.pending).toBe(true);
    get.mockResolvedValueOnce(response("INTP-T", "en"));
    rerender({ code: "INTP-T", locale: "en" });
    expect(result.current.content).toBeNull();
    await waitFor(() => expect(result.current.content?.fullCode).toBe("INTP-T"));
    await act(async () => resolveFirst(response("INTP-A", "zh")));
    expect(result.current.content?.locale).toBe("en");
    expect(result.current.content?.fullCode).toBe("INTP-T");
    get.mockReturnValueOnce(new Promise(() => {}));
    rerender({ code: "INTP-T", locale: "zh" });
    expect(result.current.content).toBeNull();
    expect(result.current.pending).toBe(true);
  });
  it("finishes in an explicit unavailable state on an API failure", async () => {
    get.mockRejectedValueOnce(new Error("unavailable"));
    const { result } = renderHook(() => useMbtiResultIntroduction("INTP-A", "zh"));
    await waitFor(() => expect(result.current.unavailable).toBe(true));
    expect(result.current.content).toBeNull();
    expect(result.current.pending).toBe(false);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
