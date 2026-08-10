import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicTopicEdgeRenderer } from "@/components/public-topic-graph/PublicTopicEdgeRenderer";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  loadPublicTopicEdges,
  normalizePublicTopicEdgeProjection,
  PUBLIC_TOPIC_EDGE_RELATION_TYPES,
  type PublicTopicEdgeItem,
  type PublicTopicEdgeSource,
} from "@/lib/cms/publicTopicEdges";
import {
  buildPublicTopicEdgeClickPayload,
  PUBLIC_TOPIC_EDGE_CLICK_EVENT,
  resetPublicTopicEdgeClickDedupForTests,
  trackPublicTopicEdgeClick,
} from "@/lib/tracking/publicTopicEdge";

const ROOT = process.cwd();
const SOURCE: PublicTopicEdgeSource = { type: "topic", id: 17, locale: "en" };
const VALID_ID_A = "a".repeat(64);
const VALID_ID_B = "b".repeat(64);
const NOW = Date.parse("2026-08-10T00:00:00Z");
const CONSENT_KEY = "fm_consent_v1";

function validItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    identity: VALID_ID_A,
    source_type: "topic",
    source_id: 17,
    source_locale: "en",
    source_canonical: "https://fermatmind.com/en/topics/source",
    relation_type: "learn_more",
    target_type: "article",
    target_id: 31,
    target_locale: "en",
    cross_locale_approved: false,
    visible_label: "Backend label A",
    context: "Backend context A",
    position: 10,
    active: true,
    proposed_active_state: true,
    publication_allowed: true,
    blocker: null,
    review_state: "approved",
    evidence_refs: ["window6:G03"],
    version: "window6-v1",
    valid_from: null,
    valid_until: null,
    target_publication_eligible: true,
    target_canonical: "https://fermatmind.com/en/articles/backend-a",
    ...overrides,
  };
}

function rawProjection(items: unknown[], authorityOverrides: Record<string, unknown> = {}) {
  return {
    schema_version: "public-topic-edges.v1",
    authority: {
      owner: "fap-api/cms",
      authority_version: "cms-public-topic-edge-authority.v1",
      source_type: "topic",
      source_id: 17,
      source_locale: "en",
      source_publication_eligible: true,
      source_canonical: "https://fermatmind.com/en/topics/source",
      eligible_item_count: items.length,
      frontend_fallback_allowed: false,
      target_truth_readback: "live",
      career_link_publication_gate: "CLOSED",
      reason: "OK",
      ...authorityOverrides,
    },
    items,
  };
}

function grantConsent(value: "granted" | "denied" | "unknown") {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: value, updatedAt: "2026-08-10T00:00:00.000Z" }),
  );
}

afterEach(() => {
  resetPublicTopicEdgeClickDedupForTests();
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("public topic graph renderer contract", () => {
  it("preserves backend position, uses identity tiebreakers, deduplicates, and drops invalid edges", () => {
    const second = validItem({
      identity: VALID_ID_B,
      visible_label: "Backend label B",
      context: null,
      target_id: 32,
      target_canonical: "https://fermatmind.com/en/articles/backend-b",
      position: 20,
    });
    const items = [
      second,
      validItem(),
      validItem(),
      validItem({ identity: "c".repeat(64), relation_type: "invented" }),
      validItem({ identity: "d".repeat(64), target_id: 0 }),
      validItem({ identity: "e".repeat(64), active: false }),
      validItem({ identity: "f".repeat(64), publication_allowed: false }),
      validItem({ identity: "1".repeat(64), target_publication_eligible: false }),
      validItem({
        identity: "2".repeat(64),
        target_locale: "zh-CN",
        target_canonical: "https://fermatmind.com/zh/articles/backend-a",
      }),
      validItem({ identity: "3".repeat(64), target_canonical: "https://fermatmind.com/en/results/private" }),
      validItem({ identity: "6".repeat(64), target_canonical: "https://fermatmind.com:444/en/articles/private-port" }),
      validItem({ identity: "4".repeat(64), target_type: "career_job" }),
      validItem({ identity: "5".repeat(64), valid_until: "2026-08-09T00:00:00Z" }),
      validItem({ identity: "7".repeat(64), source_canonical: "https://fermatmind.com/en/topics/stale" }),
    ];

    const projection = normalizePublicTopicEdgeProjection(rawProjection(items), SOURCE, NOW);

    expect(projection?.items.map((item) => item.identity)).toEqual([VALID_ID_A, VALID_ID_B]);
    expect(projection?.items.map((item) => item.position)).toEqual([10, 20]);
  });

  it("requires exact source canonical readback and explicit approval for cross-locale items", () => {
    const projection = normalizePublicTopicEdgeProjection(
      rawProjection([
        validItem({
          identity: VALID_ID_A,
          target_locale: "zh-CN",
          target_canonical: "https://fermatmind.com/zh/articles/held",
        }),
        validItem({
          identity: VALID_ID_B,
          target_locale: "zh-CN",
          cross_locale_approved: true,
          target_canonical: "https://fermatmind.com/zh/articles/approved",
        }),
        validItem({
          identity: "c".repeat(64),
          source_canonical: "https://fermatmind.com/en/topics/stale",
        }),
      ]),
      SOURCE,
      NOW,
    );

    expect(projection?.items).toHaveLength(1);
    expect(projection?.items[0]).toEqual(
      expect.objectContaining({ identity: VALID_ID_B, crossLocaleApproved: true }),
    );
  });

  it("fails the whole projection closed on invalid authority, locale, source, and count contracts", () => {
    expect(normalizePublicTopicEdgeProjection(rawProjection([validItem()], { owner: "frontend" }), SOURCE, NOW)).toBeNull();
    expect(normalizePublicTopicEdgeProjection(rawProjection([validItem()], { source_locale: "zh-CN" }), SOURCE, NOW)).toBeNull();
    expect(normalizePublicTopicEdgeProjection(rawProjection([validItem()], { source_publication_eligible: false }), SOURCE, NOW)).toBeNull();
    expect(normalizePublicTopicEdgeProjection(rawProjection([validItem()], { eligible_item_count: 2 }), SOURCE, NOW)).toBeNull();
  });

  it("renders deterministic SSR-visible exact canonical links without tracking query parameters", () => {
    const projection = normalizePublicTopicEdgeProjection(
      rawProjection([
        validItem({ identity: VALID_ID_B, position: 10 }),
        validItem({ identity: VALID_ID_A, position: 10 }),
      ]),
      SOURCE,
      NOW,
    );

    const first = renderToStaticMarkup(
      <PublicTopicEdgeRenderer projection={projection} entrySurface="topic_detail" />,
    );
    const second = renderToStaticMarkup(
      <PublicTopicEdgeRenderer projection={projection} entrySurface="topic_detail" />,
    );

    expect(first).toBe(second);
    expect(first).toContain("<a href=\"https://fermatmind.com/en/articles/backend-a\"");
    expect(first).toContain("Backend label A");
    expect(first).toContain("Backend context A");
    expect(first).not.toContain("utm_");
    expect(first).not.toContain("public_topic_edge_click");
  });

  it("renders no module for empty or unavailable authority and supplies no local fallback", () => {
    const empty = normalizePublicTopicEdgeProjection(rawProjection([]), SOURCE, NOW);
    const unavailable = normalizePublicTopicEdgeProjection(
      rawProjection([], { source_publication_eligible: false, reason: "SOURCE_NOT_PUBLICLY_ELIGIBLE" }),
      SOURCE,
      NOW,
    );

    expect(renderToStaticMarkup(<PublicTopicEdgeRenderer projection={empty} entrySurface="topic_detail" />)).toBe("");
    expect(renderToStaticMarkup(<PublicTopicEdgeRenderer projection={unavailable} entrySurface="topic_detail" />)).toBe("");
  });

  it("fails API errors and timeouts closed without a second request or fallback", async () => {
    const getPublic = vi.spyOn(apiClient, "getPublic");
    getPublic.mockRejectedValueOnce(new Error("network unavailable"));
    await expect(loadPublicTopicEdges(SOURCE)).resolves.toBeNull();

    getPublic.mockRejectedValueOnce(new ApiError({
      status: 408,
      errorCode: "REQUEST_TIMEOUT",
      message: "Request timed out.",
    }));
    await expect(loadPublicTopicEdges(SOURCE)).resolves.toBeNull();
    getPublic.mockRejectedValueOnce(new ApiError({
      status: 503,
      errorCode: "AUTHORITY_UNAVAILABLE",
      message: "Public topic edge authority is unavailable.",
    }));
    await expect(loadPublicTopicEdges(SOURCE)).resolves.toBeNull();
    expect(getPublic).toHaveBeenCalledTimes(3);
    expect(getPublic).toHaveBeenLastCalledWith(
      "/v0.5/public-topic-edges?source_type=topic&source_id=17&locale=en",
      expect.objectContaining({ cache: "no-store", skipAuth: true, timeoutMs: 5000 }),
    );
  });

  it("keeps Career source and target projections closed before C06", async () => {
    const getPublic = vi.spyOn(apiClient, "getPublic");
    const careerSource = { type: "career_job", id: 1, locale: "en" } as unknown as PublicTopicEdgeSource;
    await expect(loadPublicTopicEdges(careerSource)).resolves.toBeNull();
    expect(getPublic).not.toHaveBeenCalled();

    const careerTarget = normalizePublicTopicEdgeProjection(
      rawProjection([validItem({ target_type: "career_job" })]),
      SOURCE,
      NOW,
    );
    expect(careerTarget?.items).toEqual([]);
  });

  it("builds only the approved low-cardinality payload and honors consent plus dedup", () => {
    const item = normalizePublicTopicEdgeProjection(rawProjection([validItem()]), SOURCE, NOW)?.items[0];
    expect(item).toBeDefined();
    const payload = buildPublicTopicEdgeClickPayload(item as PublicTopicEdgeItem, 0, "topic_detail");

    expect(payload).toEqual({
      edge_id: VALID_ID_A,
      locale: "en",
      source_surface: "topic",
      target_surface: "article",
      relation_type: "learn_more",
      display_region: "public_topic_edges",
      position_bucket: "first",
      target_action: "open_public_edge",
      entry_surface: "topic_detail",
    });
    expect(JSON.stringify(payload)).not.toMatch(/url|slug|query|session|anonymous|attempt|report|order|payment/i);

    const gtag = vi.fn();
    const fetchMock = vi.fn();
    Object.defineProperty(window, "gtag", { configurable: true, value: gtag });
    vi.stubGlobal("fetch", fetchMock);

    grantConsent("denied");
    expect(trackPublicTopicEdgeClick(payload)).toBe(false);
    grantConsent("granted");
    expect(trackPublicTopicEdgeClick(payload)).toBe(true);
    expect(trackPublicTopicEdgeClick(payload)).toBe(false);

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", PUBLIC_TOPIC_EDGE_CLICK_EVENT, payload);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the runtime, M06, and Window 6 machine contracts aligned without deployment claims", () => {
    const auditRoot = path.join(
      ROOT,
      "docs/research/marketing-growth/FERMATMIND-MARKETING-GROWTH-DEEP-SCAN-01",
    );
    const eventContract = JSON.parse(
      fs.readFileSync(path.join(auditRoot, "window-02-measurement/event_contract.json"), "utf8"),
    ) as {
      semantic_allowlists: { relation_type: string[] };
      deployment_state: Record<string, unknown>;
    };
    const frontendContract = JSON.parse(
      fs.readFileSync(
        path.join(auditRoot, "window-06-topic-graph/topic_graph_frontend_contract.json"),
        "utf8",
      ),
    ) as {
      design_only: boolean;
      backend_projection: { endpoint: string };
      tracking_requirement: {
        semantic_allowlists: { relation_type: string[] };
        runtime_callsite_present: boolean;
        telemetry_sent: boolean;
      };
      implementation_pr: { deployment_proven: boolean };
    };

    expect(eventContract.semantic_allowlists.relation_type).toEqual(PUBLIC_TOPIC_EDGE_RELATION_TYPES);
    expect(eventContract.deployment_state).toEqual(
      expect.objectContaining({
        contract_only: false,
        runtime_callsite_present: true,
        telemetry_sent: false,
        deployment_proven: false,
      }),
    );
    expect(frontendContract.design_only).toBe(false);
    expect(frontendContract.backend_projection.endpoint).toBe(
      "/api/v0.5/public-topic-edges?source_type={type}&source_id={id}&locale={locale}",
    );
    expect(frontendContract.tracking_requirement.semantic_allowlists.relation_type).toEqual(
      PUBLIC_TOPIC_EDGE_RELATION_TYPES,
    );
    expect(frontendContract.tracking_requirement.runtime_callsite_present).toBe(true);
    expect(frontendContract.tracking_requirement.telemetry_sent).toBe(false);
    expect(frontendContract.implementation_pr.deployment_proven).toBe(false);
  });

  it("integrates the shared server module only where the CMS numeric source id exists", () => {
    const topicPage = fs.readFileSync(path.join(ROOT, "app/(localized)/[locale]/topics/[slug]/page.tsx"), "utf8");
    const articlePage = fs.readFileSync(path.join(ROOT, "app/(localized)/[locale]/articles/[slug]/page.tsx"), "utf8");
    const personalityPage = fs.readFileSync(
      path.join(ROOT, "app/(localized)/[locale]/personality/[type]/page.tsx"),
      "utf8",
    );

    expect(topicPage).toContain('<PublicTopicEdgeModule');
    expect(topicPage).toContain('type: "topic", id: topic.id');
    expect(articlePage).toContain('<PublicTopicEdgeModule');
    expect(articlePage).toContain('type: "article", id: article.id');
    expect(personalityPage).toContain('<PublicTopicEdgeModule');
    expect(personalityPage).toContain('type: "personality_profile", id: detail.id');
  });
});
