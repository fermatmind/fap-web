import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerShortlistAction } from "@/components/career/CareerShortlistAction";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

const CONSENT_KEY = "fm_consent_v1";
const VISITOR_KEY_STORAGE = "fm_career_shortlist_visitor_key";

const hoisted = vi.hoisted(() => ({
  fetchCareerShortlistState: vi.fn(),
  submitCareerShortlistAdd: vi.fn(),
  trackCareerAttributionEvent: vi.fn(),
}));

vi.mock("@/lib/career/api/fetchCareerShortlistState", () => ({
  fetchCareerShortlistState: hoisted.fetchCareerShortlistState,
}));

vi.mock("@/lib/career/api/submitCareerShortlistAdd", () => ({
  submitCareerShortlistAdd: hoisted.submitCareerShortlistAdd,
}));

vi.mock("@/lib/career/attribution", async () => {
  const actual = await vi.importActual<typeof import("@/lib/career/attribution")>(
    "@/lib/career/attribution"
  );
  return {
    ...actual,
    trackCareerAttributionEvent: hoisted.trackCareerAttributionEvent,
  };
});

function grantAnalyticsConsent() {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ analytics: "granted", updatedAt: "2026-05-01T00:00:00.000Z" })
  );
}

function renderShortlistAction() {
  return render(
    <CareerShortlistAction
      locale="en"
      subjectSlug="Data-Scientists"
      sourcePageType="career_job_detail"
      entrySurface="career_job_detail"
      routeFamily="job_detail"
      landingPath="/en/career/jobs/data-scientists"
    />
  );
}

afterEach(() => {
  window.localStorage.clear();
  hoisted.fetchCareerShortlistState.mockReset();
  hoisted.submitCareerShortlistAdd.mockReset();
  hoisted.trackCareerAttributionEvent.mockReset();
  vi.restoreAllMocks();
});

describe("career shortlist consent contract", () => {
  it("does not create visitor identifiers, read state, or track before analytics consent", async () => {
    renderShortlistAction();

    const button = await screen.findByRole("button", { name: "Add to shortlist" });
    expect(button).not.toBeDisabled();
    expect(window.localStorage.getItem(VISITOR_KEY_STORAGE)).toBeNull();
    expect(hoisted.fetchCareerShortlistState).not.toHaveBeenCalled();

    fireEvent.click(button);

    expect(hoisted.submitCareerShortlistAdd).not.toHaveBeenCalled();
    expect(hoisted.trackCareerAttributionEvent).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(VISITOR_KEY_STORAGE)).toBeNull();
  });

  it("loads shortlist state and tracks the persisted action after analytics consent", async () => {
    grantAnalyticsConsent();
    hoisted.fetchCareerShortlistState.mockResolvedValue({ data: { is_shortlisted: false } });
    hoisted.submitCareerShortlistAdd.mockResolvedValue({ ok: true });

    renderShortlistAction();

    await waitFor(() => {
      expect(hoisted.fetchCareerShortlistState).toHaveBeenCalledTimes(1);
    });

    const visitorKey = window.localStorage.getItem(VISITOR_KEY_STORAGE);
    expect(visitorKey).toEqual(expect.any(String));
    expect(hoisted.fetchCareerShortlistState).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorKey,
        subjectSlug: "data-scientists",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to shortlist" }));

    await waitFor(() => {
      expect(hoisted.submitCareerShortlistAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          visitorKey,
          subjectSlug: "data-scientists",
        })
      );
    });
    expect(hoisted.trackCareerAttributionEvent).toHaveBeenCalledWith(
      "career_shortlist_add",
      expect.objectContaining({
        targetAction: "add_shortlist",
        landingPath: "/en/career/jobs/data-scientists",
      })
    );
  });

  it("waits for the consent update event before creating a visitor key", async () => {
    hoisted.fetchCareerShortlistState.mockResolvedValue({ data: { is_shortlisted: false } });

    renderShortlistAction();

    await screen.findByRole("button", { name: "Add to shortlist" });
    expect(window.localStorage.getItem(VISITOR_KEY_STORAGE)).toBeNull();
    expect(hoisted.fetchCareerShortlistState).not.toHaveBeenCalled();

    act(() => {
      grantAnalyticsConsent();
      window.dispatchEvent(
        new CustomEvent("fm:analytics-consent-updated", { detail: { analytics: "granted" } })
      );
    });

    await waitFor(() => {
      expect(hoisted.fetchCareerShortlistState).toHaveBeenCalledTimes(1);
    });
    expect(window.localStorage.getItem(VISITOR_KEY_STORAGE)).toEqual(expect.any(String));
  });

  it("keeps existing analytics payload privacy rules on consented shortlist attribution", () => {
    const payload = filterTrackingPayload(TRACKING_EVENTS.CAREER_SHORTLIST_ADD, {
      landing_path: "/en/career/jobs/data-scientists?token=secret&utm_source=search",
      entry_surface: "career_job_detail",
      source_page_type: "career_job_detail",
      target_action: "add_shortlist",
      route_family: "job_detail",
      subject_kind: "job_slug",
      subject_key: "data-scientists",
      query_mode: "non_query",
      fm_visitor_key: "visitor-secret",
      locale: "en",
    });

    expect(payload).toMatchObject({
      landing_path: "/en/career/jobs/data-scientists?token=redacted&utm_source=search",
      entry_surface: "career_job_detail",
      source_page_type: "career_job_detail",
      target_action: "add_shortlist",
      route_family: "job_detail",
      subject_kind: "job_slug",
      subject_key: "data-scientists",
      query_mode: "non_query",
      locale: "en",
    });
    expect(payload).not.toHaveProperty("fm_visitor_key");
    expect(JSON.stringify(payload)).not.toContain("visitor-secret");
  });
});
