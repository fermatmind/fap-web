import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicEnneagramTechnicalNote } from "@/lib/enneagram/technicalNote.server";

function payload(locale = "en") {
  return { ok: true, technical_note_v1: {
    schema_version: "enneagram.technical_note.v1", scale_code: "ENNEAGRAM",
    canonical_authority_id: "FERMATMIND_ENNEAGRAM_PRIVATE_RESULT_CANONICAL",
    canonical_release_id: "fixture-release", canonical_source_hash: "a".repeat(64),
    canonical_compiled_hash: "b".repeat(64), canonical_locale: locale,
    sections: [{ section_key: "test_goal", title: "Methods", body: "A hypothesis is not a diagnosis." }],
  } };
}

afterEach(() => vi.unstubAllGlobals());

describe("public Enneagram technical-note server reader", () => {
  it.each([["en", "en"], ["zh", "zh-CN"]] as const)("uses the authoritative %s locale without caching a fallback", async (locale, apiLocale) => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload(apiLocale))));
    vi.stubGlobal("fetch", fetch);
    expect(await getPublicEnneagramTechnicalNote(locale)).toMatchObject({ canonical_locale: apiLocale });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`locale=${apiLocale}`), expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }));
  });

  it("rejects wrong-language, incomplete and unsuccessful authority responses", async () => {
    const missing = payload();
    missing.technical_note_v1.sections = [];
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(payload("zh-CN"))))
      .mockResolvedValueOnce(new Response(JSON.stringify(missing)))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockRejectedValueOnce(new Error("timeout"));
    vi.stubGlobal("fetch", fetch);
    for (let i = 0; i < 4; i += 1) expect(await getPublicEnneagramTechnicalNote("en")).toBeNull();
  });
});
