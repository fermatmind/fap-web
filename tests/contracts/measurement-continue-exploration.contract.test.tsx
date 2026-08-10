import { fireEvent, render, screen } from "@testing-library/react";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import { RelatedContent } from "@/components/content/RelatedContent";
import { trackEvent } from "@/lib/analytics";
import { mapTrackingEventToGa4Name, trackClientEvent } from "@/lib/tracking/client";
import {
  CONTINUE_EXPLORATION_ACTION_CATEGORIES,
  TRACKING_EVENTS,
  filterTrackingPayload,
  normalizeTrackingEventName,
  type TrackingEventName,
} from "@/lib/tracking/events";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const CONSENT_KEY = "fm_consent_v1";
const TRACKING_ENV_KEYS = [
  "ANALYTICS_ENDPOINT",
  "MBTI_ATTRIBUTION_INGEST_ENDPOINT",
  "EDM_ENDPOINT",
  "CAREER_ATTRIBUTION_INGEST_ENDPOINT",
  "TRACK_INGEST_TOKEN",
] as const;

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-08-10T00:00:00.000Z" })
  );
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MEASUREMENT-CONTINUE-EXPLORATION-01 contract", () => {
  it("keeps continue_exploration independent from result, commercial, and failure events", () => {
    const eventName: TrackingEventName = TRACKING_EVENTS.CONTINUE_EXPLORATION;

    expect(eventName).toBe("continue_exploration");
    expect(Object.values(CONTINUE_EXPLORATION_ACTION_CATEGORIES)).toEqual([
      "read_related_content",
    ]);
    expect(normalizeTrackingEventName(eventName)).toBe("continue_exploration");
    expect(mapTrackingEventToGa4Name(eventName)).toBe("continue_exploration");
    expect(eventName).not.toBe(TRACKING_EVENTS.VIEW_RESULT);
    expect(Object.values(TRACKING_EVENTS)).toEqual(expect.arrayContaining([
      "questions_load_failure",
      "submit_failure",
      "view_result",
      "result_load_failure",
      "begin_checkout",
      "purchase_success",
      "report_unlock",
      "report_ready",
    ]));
  });

  it("allows only the frozen action enum and nine privacy-safe contract fields", () => {
    const filtered = filterTrackingPayload(TRACKING_EVENTS.CONTINUE_EXPLORATION, {
      action_category: CONTINUE_EXPLORATION_ACTION_CATEGORIES.READ_RELATED_CONTENT,
      scale_code: "MBTI",
      form_code: "mbti_93",
      locale: "en",
      entry_surface: "related_content",
      source_page_type: "article_detail",
      organic_channel: "organic_search",
      device_class: "desktop",
      result_state: "public_content",
      href: "/en/articles/related?token=secret",
      path: "/en/articles/private",
      destination_url: "https://example.com/private",
      referrer: "https://search.example/?q=private",
      landing_path: "/en/articles/source",
      current_path: "/en/articles/source?utm_term=private",
      source_engine: "google",
      attempt_id: "attempt-private",
      result_id: "result-private",
      order_id: "order-private",
      score: 99,
      answer: "private-answer",
      profile: "private-profile",
      email: "person@example.com",
      token: "private-token",
      arbitrary_target_action: "free text",
    });

    expect(filtered).toEqual({
      action_category: "read_related_content",
      scale_code: "MBTI",
      form_code: "mbti_93",
      locale: "en",
      entry_surface: "related_content",
      source_page_type: "article_detail",
      organic_channel: "organic_search",
      device_class: "desktop",
      result_state: "public_content",
    });
    expect(
      filterTrackingPayload(TRACKING_EVENTS.CONTINUE_EXPLORATION, {
        action_category: "read whatever the caller says",
        locale: "en",
      })
    ).toEqual({ locale: "en" });
  });

  it("tracks one explicit click on the existing public related-content link without changing its target", () => {
    render(
      <RelatedContent
        title="Related articles"
        items={[
          {
            slug: "related-public-article",
            title: "Related public article",
            href: "/en/articles/related-public-article",
            summary: "Existing CMS summary",
          },
        ]}
      />
    );

    const link = screen.getByRole("link", { name: "Related public article" });
    link.addEventListener("click", (event) => event.preventDefault());
    expect(link).toHaveAttribute("href", "/en/articles/related-public-article");
    expect(screen.getByText("Existing CMS summary")).toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalled();

    fireEvent.click(link);

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(TRACKING_EVENTS.CONTINUE_EXPLORATION, {
      action_category: CONTINUE_EXPLORATION_ACTION_CATEGORIES.READ_RELATED_CONTENT,
      entry_surface: "related_content",
    });
  });

  it("does not render or track when the existing related-content surface has no items", () => {
    const { container } = render(<RelatedContent title="Related articles" items={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("does not track a private or tokenized destination while preserving the existing link", () => {
    render(
      <RelatedContent
        title="Related articles"
        items={[
          {
            slug: "private-result",
            title: "Existing private destination",
            href: "/en/result/private-result-id?token=secret",
          },
        ]}
      />
    );

    const link = screen.getByRole("link", { name: "Existing private destination" });
    link.addEventListener("click", (event) => event.preventDefault());
    expect(link).toHaveAttribute("href", "/en/result/private-result-id?token=secret");

    fireEvent.click(link);

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("preserves consent and private-result suppression before browser transport", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    await trackClientEvent({
      eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
      payload: { action_category: "read_related_content" },
      anonymousId: "existing-transport-envelope",
      path: "/en/articles/public-article",
    });
    expect(fetchMock).not.toHaveBeenCalled();

    grantAnalyticsConsent();
    await trackClientEvent({
      eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
      payload: { action_category: "free text from caller" },
      anonymousId: "existing-transport-envelope",
      path: "/en/articles/public-article",
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await trackClientEvent({
      eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
      payload: { action_category: "read_related_content" },
      anonymousId: "existing-transport-envelope",
      path: "/en/result/private-result-id?token=secret",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a sanitized public browser observation without URL or private payload fields", async () => {
    grantAnalyticsConsent();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    await trackClientEvent({
      eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
      payload: {
        action_category: "read_related_content",
        locale: "en",
        entry_surface: "related_content",
        source_page_type: "article_detail",
        href: "/en/articles/related?attempt=private",
        referrer: "https://search.example/?q=private",
        attempt_id: "attempt-private",
        result_id: "result-private",
        order_id: "order-private",
        score: 99,
        answer: "private-answer",
      },
      anonymousId: "existing-transport-envelope",
      path: "/en/articles/public-article?utm_term=private-query",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      eventName?: string;
      path?: string;
      payload?: Record<string, unknown>;
    };
    expect(body).toMatchObject({
      eventName: "continue_exploration",
      path: "/en/articles/public-article",
      payload: {
        action_category: "read_related_content",
        locale: "en",
        entry_surface: "related_content",
        source_page_type: "article_detail",
      },
    });
    expect(Object.keys(body.payload ?? {}).sort()).toEqual([
      "action_category",
      "entry_surface",
      "locale",
      "source_page_type",
    ]);
    expect(JSON.stringify(body.payload)).not.toMatch(
      /href|path|query|referrer|attempt|result|order|score|answer|private/i
    );
  });

  it("lets the existing safe proxy accept the event and suppress a private result path", async () => {
    const previous = Object.fromEntries(
      TRACKING_ENV_KEYS.map((key) => [key, process.env[key]])
    ) as Record<(typeof TRACKING_ENV_KEYS)[number], string | undefined>;
    for (const key of TRACKING_ENV_KEYS) delete process.env[key];

    try {
      const publicResponse = await postTrackingEvent(
        new NextRequest("https://fermatmind.com/api/track", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
            anonymousId: "existing-transport-envelope",
            path: "/en/articles/public-article",
            payload: {
              action_category: "read_related_content",
              locale: "en",
              href: "/en/articles/private",
              attempt_id: "attempt-private",
            },
          }),
        })
      );
      expect(publicResponse.status).toBe(200);
      await expect(publicResponse.json()).resolves.toMatchObject({ ok: true, forwarded: 0 });

      const privateResponse = await postTrackingEvent(
        new NextRequest("https://fermatmind.com/api/track", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            eventName: TRACKING_EVENTS.CONTINUE_EXPLORATION,
            anonymousId: "existing-transport-envelope",
            path: "/en/result/private-result-id?token=secret",
            payload: { action_category: "read_related_content" },
          }),
        })
      );
      expect(privateResponse.status).toBe(200);
      await expect(privateResponse.json()).resolves.toMatchObject({
        ok: true,
        forwarded: 0,
        suppressed: true,
      });
    } finally {
      for (const key of TRACKING_ENV_KEYS) {
        if (previous[key] === undefined) delete process.env[key];
        else process.env[key] = previous[key];
      }
    }
  });
});
