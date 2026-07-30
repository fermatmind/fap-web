import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { expect, test } from "@playwright/test";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";

type JsonValue = Record<string, unknown>;

let mockApiServer: ReturnType<typeof createServer> | null = null;

function writeJson(res: ServerResponse, statusCode: number, body: JsonValue) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function createMockTopicDetailResponse(): JsonValue {
  return {
    ok: true,
    profile: {
      id: 1,
      org_id: 0,
      topic_code: "mbti",
      slug: "mbti",
      locale: "en-US",
      title: "MBTI",
      subtitle: "MBTI topic",
      excerpt: "MBTI continuation entry surface.",
      hero_kicker: "MBTI",
      hero_quote: "MBTI quote",
      status: "published",
      is_public: true,
      is_indexable: true,
      published_at: "2026-03-27T00:00:00.000Z",
      updated_at: "2026-03-27T00:00:00.000Z",
      seo_meta: {
        seo_title: "MBTI",
        seo_description: "MBTI topic",
        canonical_url: "/en/topics/mbti",
        og_title: "MBTI",
        og_description: "MBTI topic",
        twitter_title: "MBTI",
        twitter_description: "MBTI topic",
        robots: "index,follow",
      },
    },
    sections: [],
    entry_groups: {},
    seo_meta: {
      seo_title: "MBTI",
      seo_description: "MBTI topic",
      canonical_url: "/en/topics/mbti",
      og_title: "MBTI",
      og_description: "MBTI topic",
      twitter_title: "MBTI",
      twitter_description: "MBTI topic",
      robots: "index,follow",
    },
    landing_surface_v1: null,
    answer_surface_v1: null,
  };
}

function createMockTopicSeoResponse(): JsonValue {
  return {
    meta: {
      title: "MBTI",
      description: "MBTI topic",
      canonical: "/en/topics/mbti",
      alternates: {
        en: "/en/topics/mbti",
        "zh-CN": "/zh/topics/mbti",
      },
      og: {
        title: "MBTI",
        description: "MBTI topic",
        image: null,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "MBTI",
        description: "MBTI topic",
        image: null,
      },
      robots: "index,follow",
    },
    jsonld: null,
    seo_surface_v1: null,
  };
}

function createMockResultResponse(attemptId: string): JsonValue {
  return {
    ok: true,
    attempt_id: attemptId,
    result: {
      type_code: "ENFP",
      summary: "Mock MBTI result for e2e coverage.",
    },
    meta: {
      scale_code: "MBTI",
    },
  };
}

function createMockMbtiPersonalityDetailResponse(routeSlug: string): JsonValue {
  const canonical = routeSlug.slice(0, 4).toUpperCase();
  const variant = routeSlug.toLowerCase().endsWith("-t") ? "T" : "A";

  return {
    ok: true,
    profile: {
      id: 1,
      org_id: 0,
      scale_code: "MBTI",
      type_code: canonical,
      slug: canonical.toLowerCase(),
      locale: "en",
      title: `${canonical} - Architect`,
      subtitle: "Independent, strategic, and future-oriented.",
      excerpt: `${canonical} personality detail.`,
      hero_kicker: "The Strategist",
      hero_quote: "See the pattern. Build the system.",
      hero_image_url: null,
      status: "published",
      is_public: true,
      is_indexable: true,
      published_at: "2026-03-08T10:00:00Z",
      updated_at: "2026-03-08T10:30:00Z",
      seo_meta: {
        seo_title: `${canonical} Personality Type`,
        seo_description: `${canonical} personality detail.`,
        canonical_url: `/en/personality/${routeSlug}`,
        og_title: `${canonical} Personality Type`,
        og_description: `${canonical} personality detail.`,
        twitter_title: `${canonical} Personality Type`,
        twitter_description: `${canonical} personality detail.`,
      },
    },
    sections: [
      {
        section_key: "faq",
        title: "FAQ",
        render_variant: "faq",
        body_md: "",
        body_html: null,
        payload_json: {
          items: [{ question: `What defines ${canonical}?`, answer: "Pattern logic and long-range planning." }],
        },
        sort_order: 90,
        is_enabled: true,
      },
      {
        section_key: "related_content",
        title: "Related content",
        render_variant: "links",
        body_md: "",
        body_html: null,
        payload_json: {
          items: [{ title: `${canonical} career`, slug: `${canonical.toLowerCase()}-career`, summary: "Career guidance." }],
        },
        sort_order: 100,
        is_enabled: true,
      },
    ],
    seo_meta: {
      seo_title: `${canonical} Personality Type`,
      seo_description: `${canonical} personality detail.`,
      canonical_url: `/en/personality/${routeSlug}`,
    },
    mbti_public_projection_v1: {
      runtime_type_code: `${canonical}-${variant}`,
      canonical_type_code: canonical,
      display_type: `${canonical}-${variant}`,
      variant_code: variant,
      profile: {
        type_name: "Architect",
        nickname: "Strategic Planner",
        rarity: "About 2%",
        keywords: ["strategy", "systems"],
        hero_summary: `${canonical} projection hero summary.`,
      },
      summary_card: {
        title: `${canonical} - Architect`,
        subtitle: "Independent, strategic, and future-oriented.",
        summary: `${canonical} projection summary card body.`,
        tagline: "Stable projection route",
        public_tags: ["MBTI"],
      },
      dimensions: [
        {
          id: "EI",
          name: "Energy",
          axis_left: "Extraversion",
          axis_right: "Introversion",
          summary: "Leans inward before acting.",
          description: "Prefers solitary synthesis before social output.",
        },
      ],
      sections: [
        {
          key: "overview",
          title: "Overview",
          render: "rich_text",
          body_md: "Projection overview body",
          payload: null,
          is_enabled: true,
          source: "base",
        },
      ],
      seo: {
        title: `${canonical} Personality Type`,
        description: `${canonical} projection-backed seo description.`,
        canonical_url: `/en/personality/${routeSlug}`,
        og_title: `${canonical} Personality Type`,
        og_description: `${canonical} projection-backed seo description.`,
        twitter_title: `${canonical} Personality Type`,
        twitter_description: `${canonical} projection-backed seo description.`,
        robots: "index,follow",
      },
      offer_set: [],
      _meta: {
        authority_source: "personality_cms_v2",
        route_mode: "public_variant",
        public_route_type: "32-type",
        schema_version: "v2",
      },
    },
    landing_surface_v1: {
      landing_contract_version: "landing.surface.v1",
      landing_scope: "public_indexable_detail",
      entry_surface: "personality_detail",
      entry_type: "personality_profile",
      cta_bundle: [
        { key: "start_test", label: "Start test", href: "/en/tests/mbti-personality-test-16-personality-types" },
      ],
    },
    answer_surface_v1: {
      answer_contract_version: "answer.surface.v1",
      answer_scope: "public_indexable_detail",
      surface_type: "personality_public_detail",
      summary_blocks: [
        {
          key: "hero_summary",
          title: "Quick summary",
          body: `${canonical} projection summary.`,
        },
      ],
      faq_blocks: [
        {
          key: "faq_0",
          question: `What defines ${canonical}?`,
          answer: "Pattern logic and long-range planning.",
        },
      ],
      compare_blocks: [
        {
          key: "EI",
          title: "Energy",
          body: "Leans inward before acting.",
        },
      ],
      next_step_blocks: [
        {
          key: "start_test",
          title: "Start test",
          href: "/en/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
  };
}

function createMockMbtiCareerRecommendationDetailResponse(routeSlug: string): JsonValue {
  const canonical = routeSlug.slice(0, 4).toUpperCase();
  const variant = routeSlug.toLowerCase().endsWith("-t") ? "T" : "A";

  return {
    ok: true,
    runtime_type_code: `${canonical}-${variant}`,
    canonical_type_code: canonical,
    display_type: `${canonical}-${variant}`,
    variant_code: variant,
    public_route_slug: routeSlug,
    graph_type_code: canonical,
    type_name: "Architect",
    nickname: "Strategic Planner",
    hero_summary: `${canonical} recommendation summary.`,
    keywords: ["strategy", "systems"],
    career: {
      summary: {
        title: "Career summary",
        paragraphs: [`${canonical} thrives in systems work.`],
      },
      advantages: {
        title: "Advantages",
        items: [{ title: "Systems thinking", description: "They connect moving parts quickly." }],
      },
      weaknesses: {
        title: "Weaknesses",
        items: [{ title: "Patience", description: "They can move faster than group consensus." }],
      },
      preferred_roles: {
        title: "Preferred roles",
        intro: "Architects like strategic ownership.",
        groups: [
          {
            group_title: "Strategy",
            description: "Roles with leverage and direction.",
            examples: ["Product Strategy", "Research Lead"],
          },
        ],
        outro: "They usually want room to design systems.",
      },
      upgrade_suggestions: {
        title: "Upgrade suggestions",
        paragraphs: ["Work on translating complex reasoning."],
        bullets: [{ label: "Communication", content: "Explain the why before the conclusion." }],
      },
    },
    matched_jobs: [
      {
        slug: `${canonical.toLowerCase()}-strategist`,
        title: "Product Strategist",
        summary: "Shape product direction and operating decisions.",
        fit_bucket: "primary",
        fit_personality_codes: [canonical],
        mbti_primary_codes: [canonical],
        mbti_secondary_codes: [],
      },
    ],
    matched_guides: [
      {
        slug: "systems-career-playbook",
        title: "Systems Career Playbook",
        summary: "How to choose roles with leverage and clarity.",
        fit_personality_codes: [canonical],
      },
    ],
    seo: {
      title: `${canonical}-${variant} Career Recommendations | FermatMind`,
      description: `Career recommendations for ${canonical}.`,
      canonical: `/en/career/recommendations/mbti/${routeSlug}`,
      alternates: {
        en: `/en/career/recommendations/mbti/${routeSlug}`,
        "zh-CN": `/zh/career/recommendations/mbti/${routeSlug}`,
      },
    },
    _meta: {
      public_route_type: "32-type",
      route_mode: "public_variant",
      authority_source: "career_recommendation_service.v1",
    },
    seo_surface_v1: {
      metadata_contract_version: "seo.surface.v1",
      metadata_fingerprint: "career-seo-fingerprint",
      metadata_scope: "public_indexable_detail",
      surface_type: "career_recommendation_public_detail",
      canonical_url: `http://localhost:3000/en/career/recommendations/mbti/${routeSlug}`,
      robots_policy: "index,follow",
      title: `${canonical}-${variant} Career Recommendations | FermatMind`,
      description: `Career recommendations for ${canonical}.`,
      og_payload: {
        title: `${canonical}-${variant} Career Recommendations | FermatMind`,
        description: `Career recommendations for ${canonical}.`,
        type: "article",
        url: `http://localhost:3000/en/career/recommendations/mbti/${routeSlug}`,
      },
      twitter_payload: {
        card: "summary_large_image",
        title: `${canonical}-${variant} Career Recommendations | FermatMind`,
        description: `Career recommendations for ${canonical}.`,
      },
      alternates: {
        en: `http://localhost:3000/en/career/recommendations/mbti/${routeSlug}`,
        "zh-CN": `http://localhost:3000/zh/career/recommendations/mbti/${routeSlug}`,
      },
      structured_data_keys: [],
      indexability_state: "indexable",
      sitemap_state: "included",
      llms_exposure_state: "allow",
    },
    landing_surface_v1: {
      landing_contract_version: "landing.surface.v1",
      landing_scope: "public_indexable_detail",
      entry_surface: "career_recommendation_detail",
      entry_type: "career_recommendation",
      cta_bundle: [
        { key: "matched_job", label: "View matching job", href: `/en/career/jobs/${canonical.toLowerCase()}-strategist` },
      ],
    },
    answer_surface_v1: {
      answer_contract_version: "answer.surface.v1",
      answer_scope: "public_indexable_detail",
      surface_type: "career_recommendation_public_detail",
      summary_blocks: [
        {
          key: "career_summary",
          body: `${canonical} thrives in systems work.`,
        },
      ],
      faq_blocks: [
        {
          key: "faq_0",
          question: "Which roles fit first?",
          answer: "Start with the highest-fit structured roles.",
        },
      ],
      compare_blocks: [
        {
          key: "graph_route_alignment",
          title: "Graph key",
          body: `Graph matching still follows ${canonical}.`,
        },
      ],
      next_step_blocks: [
        {
          key: "matched_job",
          title: "View matching job",
          href: `/en/career/jobs/${canonical.toLowerCase()}-strategist`,
        },
      ],
    },
  };
}

function createMockReportAccessResponse(attemptId: string): JsonValue {
  return {
    ok: true,
    attempt_id: attemptId,
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: `/en/result/${attemptId}`,
      pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
    },
    meta: {
      produced_at: "2026-03-27T00:00:00.000Z",
      refreshed_at: "2026-03-27T00:00:00.000Z",
    },
  };
}

function createMockInviteUnlockProgressResponse(attemptId: string): JsonValue {
  return {
    ok: true,
    attempt_id: attemptId,
    unlock_stage: "full",
    unlock_source: "report_ready",
    completed_invitees: 0,
    required_invitees: 0,
    target_attempt_id: attemptId,
    diagnostics: {
      status: "ok",
      progress_percent: 100,
    },
  };
}

function handleMockApiRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1:8000");
  const { searchParams } = requestUrl;
  const pathname = requestUrl.pathname.startsWith("/api")
    ? requestUrl.pathname.slice(4) || "/"
    : requestUrl.pathname;

  if (pathname === "/v0.5/topics/mbti") {
    writeJson(res, 200, createMockTopicDetailResponse());
    return;
  }

  if (pathname === "/v0.5/topics/mbti/seo") {
    writeJson(res, 200, createMockTopicSeoResponse());
    return;
  }

  if (pathname === "/v0.5/personality/intj-a") {
    writeJson(res, 200, createMockMbtiPersonalityDetailResponse("intj-a"));
    return;
  }

  if (pathname === "/v0.5/personality/intp-a") {
    writeJson(res, 200, createMockMbtiPersonalityDetailResponse("intp-a"));
    return;
  }

  if (pathname === "/v0.5/personality/intj-a/seo") {
    writeJson(res, 200, { meta: { title: "INTJ Personality Type", description: "INTJ personality detail." }, jsonld: null, seo_surface_v1: null });
    return;
  }

  if (pathname === "/v0.5/personality/intp-a/seo") {
    writeJson(res, 200, { meta: { title: "INTP Personality Type", description: "INTP personality detail." }, jsonld: null, seo_surface_v1: null });
    return;
  }

  if (pathname === "/v0.5/career-recommendations/mbti/intj-a" || pathname === "/v0.5/career-recommendations/mbti/intj") {
    writeJson(res, 200, createMockMbtiCareerRecommendationDetailResponse("intj-a"));
    return;
  }

  if (pathname === "/v0.5/career-recommendations/mbti/intp-a") {
    writeJson(res, 200, createMockMbtiCareerRecommendationDetailResponse("intp-a"));
    return;
  }

  if (pathname === "/v0.5/career-recommendations/mbti") {
    writeJson(res, 200, {
      ok: true,
      items: [
        {
          runtime_type_code: "INTJ-A",
          canonical_type_code: "INTJ",
          display_type: "INTJ-A",
          variant_code: "A",
          public_route_slug: "intj-a",
          type_name: "Architect",
          nickname: "Strategic Planner",
          hero_summary: "Assertive architect summary.",
        },
        {
          runtime_type_code: "INTP-A",
          canonical_type_code: "INTP",
          display_type: "INTP-A",
          variant_code: "A",
          public_route_slug: "intp-a",
          type_name: "Logician",
          nickname: "Systems analyst",
          hero_summary: "INTP summary.",
        },
      ],
    });
    return;
  }

  if (pathname === "/v0.3/scales/lookup") {
    writeJson(res, 200, {
      ok: true,
      slug: searchParams.get("slug") ?? "mbti-personality-test-16-personality-types",
      capabilities: {
        enabled_in_prod: true,
        paywall_mode: "full",
      },
    });
    return;
  }

  if (pathname === "/v0.3/auth/guest") {
    writeJson(res, 200, {
      ok: true,
      fm_token: "fm_e2e_mbti_career_join_guest_token",
    });
    return;
  }

  const attemptMatch = pathname.match(/^\/v0\.3\/attempts\/([^/]+)\/(report-access|report|result|submission|invite-unlocks)(?:\.pdf)?$/);
  if (attemptMatch) {
    const attemptId = decodeURIComponent(attemptMatch[1]);
    const resource = attemptMatch[2];

    if (resource === "report-access") {
      writeJson(res, 200, createMockReportAccessResponse(attemptId));
      return;
    }

    if (resource === "report") {
      writeJson(res, 200, createCareerContinuityFixture());
      return;
    }

    if (resource === "result") {
      writeJson(res, 200, createMockResultResponse(attemptId));
      return;
    }

    if (resource === "submission") {
      writeJson(res, 200, {
        ok: true,
        attempt_id: attemptId,
        submission: {
          state: "succeeded",
        },
      });
      return;
    }

    if (resource === "invite-unlocks") {
      writeJson(res, 200, createMockInviteUnlockProgressResponse(attemptId));
      return;
    }
  }

  if (pathname === "/v0.3/me/attempts") {
    const scale = String(searchParams.get("scale") ?? "").toUpperCase();

    if (scale.includes("MBTI")) {
      writeJson(res, 200, {
        ok: true,
        items: [{ attempt_id: "mbti1", type_code: "INTP" }],
        meta: { current_page: 1, last_page: 1 },
      });
      return;
    }

    if (scale.includes("BIG5")) {
      writeJson(res, 200, {
        ok: true,
        items: [
          {
            attempt_id: "big51",
            result_summary: {
              domains_mean: {
                openness: 78,
                conscientiousness: 72,
                extraversion: 52,
                agreeableness: 60,
                neuroticism: 28,
              },
            },
          },
        ],
        meta: { current_page: 1, last_page: 1 },
      });
      return;
    }

    if (scale.includes("IQ")) {
      writeJson(res, 200, {
        ok: true,
        items: [{ attempt_id: "iq1" }],
        meta: { current_page: 1, last_page: 1 },
      });
      return;
    }

    if (scale.includes("EQ")) {
      writeJson(res, 200, {
        ok: true,
        items: [{ attempt_id: "eq1" }],
        meta: { current_page: 1, last_page: 1 },
      });
      return;
    }

    writeJson(res, 200, { ok: true, items: [], meta: { current_page: 1, last_page: 1 } });
    return;
  }

  if (pathname === "/v0.3/attempts/mbti-career-join-0001/report.pdf") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/pdf");
    res.end("%PDF-1.4\n%");
    return;
  }

  writeJson(res, 200, { ok: true });
}

test.beforeAll(async () => {
  mockApiServer = createServer(handleMockApiRequest);
  await new Promise<void>((resolve) => {
    mockApiServer?.listen(8000, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  if (!mockApiServer) {
    return;
  }

  await new Promise<void>((resolve) => {
    mockApiServer?.close(() => resolve());
  });
  mockApiServer = null;
});

function createCareerContinuityFixture() {
  const fixture = structuredClone(reportReadyMbtiProjectionFixture) as Record<string, unknown>;
  const projection = (fixture.mbti_public_projection_v1 ?? {}) as Record<string, unknown>;
  projection.canonical_type_code = "ENFP";
  projection.display_type = "ENFP-T";
  projection.runtime_type_code = "ENFP-T";
  projection.variant_code = "T";
  const projectionMeta = ((projection._meta ?? {}) as Record<string, unknown>);
  const projectionPersonalization = ((projectionMeta.personalization ?? {}) as Record<string, unknown>);
  projectionPersonalization.continuity = {
    carryover_focus_key: "growth.next_actions",
    carryover_reason: "unlock_to_continue_focus",
    recommended_resume_keys: ["growth.next_actions", "career.next_step"],
    carryover_scene_keys: ["growth", "work"],
    carryover_action_keys: ["weekly_action.theme.name_decision_rule"],
  };
  projectionPersonalization.schema_version = "mbti.personalization.phase8a.v1";
  projectionPersonalization.dynamic_sections_version = "phase8a.v1";
  projectionMeta.personalization = projectionPersonalization;
  projection._meta = projectionMeta;
  fixture.mbti_public_projection_v1 = projection;

  const report = (fixture.report ?? {}) as Record<string, unknown>;
  const reportMeta = ((report._meta ?? {}) as Record<string, unknown>);
  reportMeta.personalization = structuredClone(projectionPersonalization);
  report._meta = reportMeta;
  fixture.report = report;

  return fixture;
}

for (const prefix of ["articles", "career", "topics", "personality"] as const) {
  test(`${prefix} root redirects by accept-language and preserves query`, async ({ request }) => {
    const response = await request.get(`/${prefix}?utm=a`, {
      maxRedirects: 0,
      headers: {
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
    });

    expect(response.status()).toBe(308);
    expect(response.headers().location).toContain(`/zh/${prefix}?utm=a`);
  });
}

test("legacy professions stay gone while types routes funnel into personality", async ({ request }) => {
  const gonePaths = ["/en/professions", "/zh/professions", "/professions"];

  for (const pathname of gonePaths) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(response.status(), pathname).toBe(410);
    expect(response.headers()["x-robots-tag"], pathname).toContain("noindex");
  }

  const typesIndex = await request.get("/en/types", { maxRedirects: 0 });
  expect(typesIndex.status()).toBe(308);
  expect(typesIndex.headers().location).toBe("http://localhost:3000/en/personality");

  const typesDetail = await request.get("/en/types/intj", { maxRedirects: 0 });
  expect(typesDetail.status()).toBe(308);
  expect(typesDetail.headers().location).toBe("http://localhost:3000/en/personality/intj-a");
});

test("mbti career recommendation route exposes answer-first, table, faq, and public backlinks", async ({ request }) => {
  const response = await request.get("/en/career/recommendations/mbti/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="answer-first"');
  expect(html).toContain('id="career-recommendation-type-interpretation"');
  expect(html).toContain("Why these roles attract this type");
  expect(html).toContain("Why some jobs drain this type");
  expect(html).toContain('id="recommended-roles"');
  expect(html).toContain('"@type":"ItemList"');
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain("/en/personality/intj-a");
  expect(html).toContain("/en/topics/mbti");
  expect(html).toContain("/en/career/guides/from-mbti-to-job-fit");
});

test("INTJ personality pages render CMS projection sections and keep source entry anchors", async ({ request }) => {
  const response = await request.get("/en/personality/intj-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="answer-first"');
  expect(html).toContain('data-testid="personality-detail-section-map"');
  expect(html).toContain('id="letters_intro"');
  expect(html).toContain('id="trait_overview"');
  expect(html).toContain('id="career.preferred_roles"');
  expect(html).not.toContain('data-testid="mbti-personality-content-pack"');
});

test("INTP recommendation pages render interpretation block instead of list-only view", async ({ request }) => {
  const response = await request.get("/en/career/recommendations/mbti/intp-a");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('id="career-recommendation-intp-interpretation"');
  expect(html).toContain("INTP-A career interpretation and continuation");
  expect(html).toContain("Why these roles attract this type");
  expect(html).toContain("Why some jobs drain this type");
});

test("MBTI topic page exposes grouped continuation entry links", async ({ request }) => {
  const response = await request.get("/en/topics/mbti");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('data-testid="mbti-topic-type-grid"');
  expect(html).toContain("/en/personality/intj-a");
  expect(html).toContain("/en/career/recommendations/mbti/intj-a");
  expect(html).toContain("/en/personality/enfp-a");
});

test("mbti career recommendation route treats 32-type as authority and 4-letter as a redirecting compatibility entry", async ({ request }) => {
  const legacyResponse = await request.get("/en/career/recommendations/mbti/intj", { maxRedirects: 0 });
  expect(legacyResponse.status()).toBe(308);
  expect(legacyResponse.headers().location).toBe("/en/career/recommendations/mbti/intj-a");

  const variantResponse = await request.get("/en/career/recommendations/mbti/intj-a");
  expect(variantResponse.status()).toBe(200);
  const variantHtml = await variantResponse.text();
  expect(variantHtml).toContain("/en/personality/intj-a");
});

test("mbti result career CTA points to the 32-type recommendation authority route", async ({ page }) => {
  const attemptId = "mbti-career-join-0001";
  const reportAccessPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`);
  const reportPattern = new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`);

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_career_join_guest_token",
      }),
    });
  });

  await page.route(reportAccessPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: "ready",
        report_state: "ready",
        pdf_state: "ready",
        reason_code: "report_ready",
        projection_version: 1,
        actions: {
          page_href: `/en/result/${attemptId}`,
          pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
        },
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route(reportPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createCareerContinuityFixture()),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/result*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMockResultResponse(attemptId)),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/submission*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        submission: {
          state: "succeeded",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/invite-unlocks*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMockInviteUnlockProgressResponse(attemptId)),
    });
  });

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "mbti-personality-test-16-personality-types",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);

  const careerCta = page.getByTestId("mbti-career-next-step-cta");
  await expect(careerCta).toHaveAttribute(
    "href",
    /\/en\/career\/recommendations\/mbti\/enfp-t\?.*carryover_focus_key=growth.next_actions/
  );
});

test("career recommendation route renders continuity carryover when query is present", async ({ request }) => {
  const response = await request.get(
    "/en/career/recommendations/mbti/intj-a?carryover_focus_key=career.next_step&carryover_reason=continue_career_bridge"
  );
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain('data-testid="mbti-career-continuity-entry"');
  expect(html).toContain("Career next step");
});

test("riasec canonical public entry exposes 60Q and 140Q take routes", async ({ page }) => {
  await page.goto("/en/tests/holland-career-interest-test-riasec");

  await expect(page.getByTestId("test-detail-landing-cta-riasec_60")).toHaveAttribute(
    "href",
    "/en/tests/holland-career-interest-test-riasec/take?form=riasec_60"
  );
  await expect(page.getByTestId("test-detail-landing-cta-riasec_140")).toHaveAttribute(
    "href",
    "/en/tests/holland-career-interest-test-riasec/take?form=riasec_140"
  );
});
