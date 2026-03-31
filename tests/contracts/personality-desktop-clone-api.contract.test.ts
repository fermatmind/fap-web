import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPersonalityDesktopCloneContent,
  normalizeDesktopCloneApiLocale,
  normalizeDesktopCloneTypeSlug,
} from "@/lib/cms/personality-desktop-clone";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function createValidPayload(tag: string) {
  return {
    ok: true,
    template_key: "mbti_desktop_clone_v1",
    schema_version: "v1",
    full_code: "INFJ-A",
    base_code: "INFJ",
    locale: "zh-CN",
    content: {
      hero: { summary: `hero ${tag}` },
      intro: { paragraphs: [`intro 1 ${tag}`, `intro 2 ${tag}`] },
      traits: {
        summaryPane: {
          eyebrow: `eyebrow ${tag}`,
          title: `title ${tag}`,
          value: `value ${tag}`,
          body: `body ${tag}`,
        },
        body: [`traits 1 ${tag}`, `traits 2 ${tag}`],
      },
      chapters: {
        career: {
          intro: [`career intro 1 ${tag}`, `career intro 2 ${tag}`],
          influentialTraits: [
            { label: `career trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `career trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `career trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `career trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `career visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `career locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `career locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        growth: {
          intro: [`growth intro 1 ${tag}`, `growth intro 2 ${tag}`],
          influentialTraits: [
            { label: `growth trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `growth trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `growth trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `growth trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `growth visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `growth locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `growth locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        relationships: {
          intro: [`relationships intro 1 ${tag}`, `relationships intro 2 ${tag}`],
          influentialTraits: [
            { label: `relationships trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `relationships trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `relationships trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `relationships trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `relationships visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `relationships locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `relationships locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "unlock",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
      },
      finalOffer: {
        eyebrow: `offer eyebrow ${tag}`,
        headline: `offer headline ${tag}`,
        body: `offer body ${tag}`,
        priceLabel: `offer price ${tag}`,
        ctaLabel: `offer cta ${tag}`,
        guarantee: `offer guarantee ${tag}`,
      },
    },
    asset_slots: [
      {
        slot_id: "hero-illustration",
        label: "Hero cover",
        aspect_ratio: "236:160",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "traits-illustration",
        label: "Traits illustration",
        aspect_ratio: "636:148",
        status: "ready",
        asset_ref: {
          provider: "cdn",
          path: "mbti/desktop/traits/infj-a/v1.webp",
          url: "https://cdn.example.com/mbti/desktop/traits/infj-a/v1.webp",
          version: "v1",
          checksum: "sha256:abc",
        },
        alt: "Traits",
        meta: null,
      },
      {
        slot_id: "traits-summary-illustration",
        label: "Traits summary",
        aspect_ratio: "240:118",
        status: "disabled",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "career-illustration",
        label: "Career illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "growth-illustration",
        label: "Growth illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "relationships-illustration",
        label: "Relationships illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "final-offer-illustration",
        label: "Final offer illustration",
        aspect_ratio: "252:220",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
    ],
    _meta: {
      authority_source: "personality_profile_variant_clone_contents",
      route_mode: "full_code_exact",
      public_route_type: "32-type",
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("personality desktop clone api adapter contract", () => {
  it("normalizes locale and fullCode slug, then maps a published payload", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("/api/v0.5/personality/infj-a/desktop-clone?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");
      expect(url).toContain("scale_code=MBTI");

      return jsonResponse(createValidPayload("seed"));
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");
    expect(result).not.toBeNull();
    expect(result?.templateKey).toBe("mbti_desktop_clone_v1");
    expect(result?.schemaVersion).toBe("v1");
    expect(result?.fullCode).toBe("INFJ-A");
    expect(result?.baseCode).toBe("INFJ");
    expect(result?.locale).toBe("zh-CN");
    expect(result?.content.hero.summary).toBe("hero seed");
    expect(result?.assetSlots).toHaveLength(7);
    expect(result?.assetSlots[0]?.slotId).toBe("hero-illustration");
    expect(result?.assetSlots[1]?.status).toBe("ready");
    expect(result?.assetSlots[2]?.status).toBe("disabled");
    expect(result?.meta?.route_mode).toBe("full_code_exact");
  });

  it("returns null when locale is not zh/zh-CN and skips network", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "en");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null for unsupported fullCode slug input", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ", "zh");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when api responds not found or shape validation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({
            ok: false,
            error_code: "NOT_FOUND",
            message: "Not found",
          }, 404),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            ...createValidPayload("bad-shape"),
            content: {},
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            ...createValidPayload("bad-meta"),
            _meta: {
              route_mode: "base_code_fallback",
              public_route_type: "32-type",
            },
          }),
        ),
    );

    const miss = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");
    const badShape = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh-CN");
    const badMeta = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");

    expect(miss).toBeNull();
    expect(badShape).toBeNull();
    expect(badMeta).toBeNull();
  });

  it("keeps normalization helpers aligned with cutover contract", () => {
    expect(normalizeDesktopCloneApiLocale("zh")).toBe("zh-CN");
    expect(normalizeDesktopCloneApiLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeDesktopCloneApiLocale("en")).toBeNull();

    expect(normalizeDesktopCloneTypeSlug("INFJ-A")).toBe("infj-a");
    expect(normalizeDesktopCloneTypeSlug("entj-t")).toBe("entj-t");
    expect(normalizeDesktopCloneTypeSlug("INFJ")).toBeNull();
  });
});
