import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerAliasResolution } from "@/lib/career/adapters/adaptCareerAliasResolution";
import { fetchCareerAliasResolution } from "@/lib/career/api/fetchCareerAliasResolution";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career alias resolution fetch and adapter contract", () => {
  it("requests the backend alias resolution endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/resolve?");
        expect(url).toContain("q=data");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          bundle_kind: "career_alias_resolution",
          resolution: {
            resolved_kind: "none",
          },
        });
      })
    );

    const payload = await fetchCareerAliasResolution({ locale: "zh", q: "data" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend-owned resolution states without local narrative synthesis", () => {
    const occupation = adaptCareerAliasResolution({
      locale: "en",
      payload: {
        bundle_kind: "career_alias_resolution",
        bundle_version: "career.protocol.alias_resolution.v1",
        query: {
          raw: "data scientist",
          normalized: "data scientist",
          locale: "en-us",
        },
        resolution: {
          resolved_kind: "occupation",
          occupation: {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientists",
            canonical_title_en: "Data Scientists",
            canonical_title_zh: "数据科学家",
          },
        },
      },
    });

    const ambiguous = adaptCareerAliasResolution({
      locale: "en",
      payload: {
        bundle_kind: "career_alias_resolution",
        bundle_version: "career.protocol.alias_resolution.v1",
        query: {
          raw: "analytics",
          normalized: "analytics",
          locale: "en-us",
        },
        resolution: {
          resolved_kind: "ambiguous",
          candidates: [
            {
              candidate_kind: "occupation",
              occupation_uuid: "occ_123",
              canonical_slug: "data-scientists",
              canonical_title_en: "Data Scientists",
            },
            {
              candidate_kind: "family",
              family_uuid: "fam_123",
              canonical_slug: "data-science",
              title_en: "Data Science",
            },
          ],
        },
      },
    });

    expect(occupation).toEqual({
      authoritySource: "career_backend_alias_resolution.v0.5",
      query: {
        raw: "data scientist",
        normalized: "data scientist",
        locale: "en-us",
      },
      resolution: {
        resolvedKind: "occupation",
        occupation: {
          canonicalSlug: "data-scientists",
          title: "Data Scientists",
          href: "/en/career/jobs/data-scientists",
        },
      },
    });
    expect(ambiguous).toEqual({
      authoritySource: "career_backend_alias_resolution.v0.5",
      query: {
        raw: "analytics",
        normalized: "analytics",
        locale: "en-us",
      },
      resolution: {
        resolvedKind: "ambiguous",
        candidates: [
          {
            candidateKind: "occupation",
            canonicalSlug: "data-scientists",
            title: "Data Scientists",
            href: "/en/career/jobs/data-scientists",
          },
          {
            candidateKind: "family",
            canonicalSlug: "data-science",
            title: "Data Science",
            href: "/en/career/family/data-science",
          },
        ],
      },
    });
    expect(ambiguous).not.toHaveProperty("summary");
    expect(ambiguous).not.toHaveProperty("guidance");
    expect(ambiguous).not.toHaveProperty("description");
  });
});
