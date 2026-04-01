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
      letters_intro: {
        headline: `letters headline ${tag}`,
        letters: [
          { letter: "E", title: `letter E ${tag}`, description: `letter E body ${tag}` },
          { letter: "I", title: `letter I ${tag}`, description: `letter I body ${tag}` },
        ],
      },
      overview: {
        title: `overview title ${tag}`,
        paragraphs: [`overview 1 ${tag}`, `overview 2 ${tag}`],
      },
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
          strengths: {
            title: `career strengths ${tag}`,
            items: [
              { title: `career strengths item 1 ${tag}`, description: `career strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `career weaknesses ${tag}`,
            items: [
              { title: `career weaknesses item 1 ${tag}`, description: `career weaknesses body 1 ${tag}` },
            ],
          },
          matched_jobs: {
            title: `matched jobs ${tag}`,
            fit_bucket: "primary",
            summary: `matched jobs summary ${tag}`,
            fit_reason: `matched jobs reason ${tag}`,
            job_examples: [`job 1 ${tag}`, `job 2 ${tag}`],
          },
          matched_guides: {
            title: `matched guides ${tag}`,
            summary: `matched guides summary ${tag}`,
            fit_reason: `matched guides reason ${tag}`,
          },
          career_ideas: {
            title: `career ideas ${tag}`,
            items: [
              { title: `career ideas item 1 ${tag}`, description: `career ideas body 1 ${tag}` },
            ],
          },
          work_styles: {
            title: `work styles ${tag}`,
            items: [
              { title: `work styles item 1 ${tag}`, description: `work styles body 1 ${tag}` },
            ],
          },
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
          strengths: {
            title: `growth strengths ${tag}`,
            items: [
              { title: `growth strengths item 1 ${tag}`, description: `growth strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `growth weaknesses ${tag}`,
            items: [
              { title: `growth weaknesses item 1 ${tag}`, description: `growth weaknesses body 1 ${tag}` },
            ],
          },
          what_energizes: {
            title: `what energizes ${tag}`,
            items: [
              { title: `what energizes item 1 ${tag}`, description: `what energizes body 1 ${tag}` },
            ],
          },
          what_drains: {
            title: `what drains ${tag}`,
            items: [
              { title: `what drains item 1 ${tag}`, description: `what drains body 1 ${tag}` },
            ],
          },
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
          strengths: {
            title: `relationships strengths ${tag}`,
            items: [
              { title: `relationships strengths item 1 ${tag}`, description: `relationships strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `relationships weaknesses ${tag}`,
            items: [
              { title: `relationships weaknesses item 1 ${tag}`, description: `relationships weaknesses body 1 ${tag}` },
            ],
          },
          superpowers: {
            title: `superpowers ${tag}`,
            items: [
              { title: `superpowers item 1 ${tag}`, description: `superpowers body 1 ${tag}` },
            ],
          },
          pitfalls: {
            title: `pitfalls ${tag}`,
            items: [
              { title: `pitfalls item 1 ${tag}`, description: `pitfalls body 1 ${tag}` },
            ],
          },
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
  it("normalizes locale and fullCode slug, then maps a published payload with compatibility fields retained", async () => {
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
    expect(result?.content.lettersIntro?.headline).toBe("letters headline seed");
    expect(result?.content.overview?.title).toBe("overview title seed");
    expect(result?.content.chapters.career.strengths?.items[0]?.description).toBe("career strengths body 1 seed");
    expect(result?.content.chapters.career.weaknesses?.items[0]?.description).toBe("career weaknesses body 1 seed");
    expect(result?.content.chapters.growth.strengths?.items[0]?.description).toBe("growth strengths body 1 seed");
    expect(result?.content.chapters.growth.weaknesses?.items[0]?.description).toBe("growth weaknesses body 1 seed");
    expect(result?.content.chapters.relationships.strengths?.items[0]?.description).toBe("relationships strengths body 1 seed");
    expect(result?.content.chapters.relationships.weaknesses?.items[0]?.description).toBe("relationships weaknesses body 1 seed");
    expect(result?.content.chapters.career.matchedJobs?.fitBucket).toBe("primary");
    expect(result?.content.chapters.career.matchedGuides?.fitReason).toBe("matched guides reason seed");
    // Deprecated transition fields remain adapter-visible for compatibility,
    // but this assertion does not imply they are rendered in desktop main flow.
    expect(result?.content.chapters.career.careerIdeas?.items[0]?.description).toBe("career ideas body 1 seed");
    expect(result?.content.chapters.career.workStyles?.items[0]?.description).toBe("work styles body 1 seed");
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.description).toBe("what energizes body 1 seed");
    expect(result?.content.chapters.growth.whatDrains?.items[0]?.description).toBe("what drains body 1 seed");
    expect(result?.content.chapters.relationships.superpowers?.items[0]?.description).toBe("superpowers body 1 seed");
    expect(result?.content.chapters.relationships.pitfalls?.items[0]?.description).toBe("pitfalls body 1 seed");
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

  it("keeps rendering-safe parsing when optional canonical and compatibility modules are missing", async () => {
    const payload = createValidPayload("partial");
    delete (payload.content as Record<string, unknown>).letters_intro;
    delete (payload.content as Record<string, unknown>).overview;
    const chapters = (payload.content as Record<string, unknown>).chapters as Record<string, unknown>;
    const career = chapters.career as Record<string, unknown>;
    const growth = chapters.growth as Record<string, unknown>;
    const relationships = chapters.relationships as Record<string, unknown>;
    delete career.matched_jobs;
    delete career.matched_guides;
    delete career.career_ideas;
    delete career.work_styles;
    delete growth.what_energizes;
    delete growth.what_drains;
    delete relationships.superpowers;
    delete relationships.pitfalls;

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(payload)));

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh-CN");
    expect(result).not.toBeNull();
    expect(result?.content.lettersIntro).toBeUndefined();
    expect(result?.content.overview).toBeUndefined();
    expect(result?.content.chapters.career.matchedJobs).toBeUndefined();
    expect(result?.content.chapters.career.matchedGuides).toBeUndefined();
    expect(result?.content.chapters.career.careerIdeas).toBeUndefined();
    expect(result?.content.chapters.career.workStyles).toBeUndefined();
    expect(result?.content.chapters.growth.whatEnergizes).toBeUndefined();
    expect(result?.content.chapters.growth.whatDrains).toBeUndefined();
    expect(result?.content.chapters.relationships.superpowers).toBeUndefined();
    expect(result?.content.chapters.relationships.pitfalls).toBeUndefined();
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
