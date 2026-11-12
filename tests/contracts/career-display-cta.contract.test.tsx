import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import {
  CAREER_DISPLAY_RIASEC_TEST_SLUG,
  adaptCareerDisplaySurface,
  buildCareerDisplayCtaAttribution,
  buildCareerDisplayCtaHref,
} from "@/lib/career/displaySurface";
import {
  buildActorsDisplaySurfaceFixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/analytics")>(),
  trackEvent: vi.fn(),
}));

function readClickPayload(cta: HTMLAnchorElement) {
  cta.addEventListener("click", (event) => event.preventDefault(), { once: true });
  vi.mocked(trackEvent).mockClear();
  fireEvent.click(cta);
  expect(trackEvent).toHaveBeenCalledTimes(1);
  expect(trackEvent).toHaveBeenCalledWith("career_job_detail_cta_click", expect.any(Object));
  return vi.mocked(trackEvent).mock.calls[0]?.[1] ?? {};
}

function getPrimaryDecisionCta(): HTMLAnchorElement {
  const actionContainer = screen.queryByTestId("career-production-assessment-rail") ??
    screen.getByTestId("career-decision-action-block");
  const links = Array.from(actionContainer.querySelectorAll("a"));
  const cta = links.find((link) =>
    link.getAttribute("href")?.includes(`/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`)
  );

  if (!cta) {
    throw new Error("Expected the primary career decision CTA to link to the RIASEC test");
  }

  return cta;
}

describe("career display CTA contract", () => {
  it("renders the RIASEC CTA and preserves the test slug", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    render(<CareerDisplaySurface surface={surface} />);

    const cta = getPrimaryDecisionCta();
    expect(cta).toBeInTheDocument();
    expect(cta?.getAttribute("href")).toContain(`/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`);
    expect(cta.getAttribute("href")).toBe(`/en/tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG}`);
    expect(cta?.getAttribute("data-test-slug")).toBe(CAREER_DISPLAY_RIASEC_TEST_SLUG);
  });

  it("uses existing career job detail attribution values", () => {
    const payload = buildCareerDisplayCtaAttribution({
      locale: "en",
      landingPath: "/en/career/jobs/actors",
    });

    expect(payload).toEqual({
      locale: "en",
      entry_surface: "career_job_detail",
      source_page_type: "career_job_detail",
      target_action: "start_riasec_test",
      landing_path: "/en/career/jobs/actors",
      route_family: "job_detail",
      subject_kind: "job_slug",
      subject_key: "actors",
      query_mode: "non_query",
    });
  });

  it("builds CTA href with target action, landing path, and existing subject key fields", () => {
    const href = buildCareerDisplayCtaHref({
      locale: "zh",
      landingPath: "/zh/career/jobs/actors",
    });
    const parsed = new URL(`https://fermatmind.test${href}`);

    expect(parsed.pathname).toBe("/zh/tests/holland-career-interest-test-riasec");
    expect(parsed.searchParams.get("entry_surface")).toBe("career_job_detail");
    expect(parsed.searchParams.get("source_page_type")).toBe("career_job_detail");
    expect(parsed.searchParams.get("target_action")).toBe("start_riasec_test");
    expect(parsed.searchParams.get("test_slug")).toBe(CAREER_DISPLAY_RIASEC_TEST_SLUG);
    expect(parsed.searchParams.get("subject_kind")).toBe("job_slug");
    expect(parsed.searchParams.get("subject_key")).toBe("actors");
    expect(parsed.searchParams.get("landing_path")).toBe("/zh/career/jobs/actors");
  });

  it("uses the selected pilot slug as the display CTA subject key", () => {
    const href = buildCareerDisplayCtaHref({
      locale: "en",
      landingPath: "/en/career/jobs/data-scientists",
      subjectSlug: "data-scientists",
    });
    const payload = buildCareerDisplayCtaAttribution({
      locale: "en",
      landingPath: "/en/career/jobs/data-scientists",
      subjectSlug: "data-scientists",
    });
    const parsed = new URL(`https://fermatmind.test${href}`);

    expect(parsed.searchParams.get("subject_key")).toBe("data-scientists");
    expect(payload.subject_key).toBe("data-scientists");
  });

  it("preserves UTM-like attribution query params when building CTA href", () => {
    const href = buildCareerDisplayCtaHref({
      locale: "en",
      landingPath: "/en/career/jobs/actors?utm_source=search",
      attributionParams: {
        utm_source: "search",
        utm_medium: "organic",
        utm_campaign: "actors_launch",
      },
    });
    const parsed = new URL(`https://fermatmind.test${href}`);

    expect(parsed.searchParams.get("utm_source")).toBe("search");
    expect(parsed.searchParams.get("utm_medium")).toBe("organic");
    expect(parsed.searchParams.get("utm_campaign")).toBe("actors_launch");
    expect(parsed.searchParams.get("landing_path")).toBe("/en/career/jobs/actors?utm_source=search");
  });

  it("preserves inbound UTM and click IDs on the rendered display CTA", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" }),
      "zh"
    );

    render(
      <CareerDisplaySurface
        surface={surface}
        ctaLandingPath="/zh/career/jobs/actors?utm_source=zhihu&utm_medium=community&utm_campaign=career_actor_test&utm_content=pilot&gclid=test-gclid&msclkid=test-msclkid&fbclid=test-fbclid"
        ctaAttributionParams={{
          utm_source: "zhihu",
          utm_medium: "community",
          utm_campaign: "career_actor_test",
          utm_content: "pilot",
          gclid: "test-gclid",
          msclkid: "test-msclkid",
          fbclid: "test-fbclid",
        }}
      />
    );

    const cta = getPrimaryDecisionCta();
    const parsed = new URL(cta.href);
    expect(parsed.search).toBe("");
    const payload = readClickPayload(cta);

    expect(parsed.pathname).toBe("/zh/tests/holland-career-interest-test-riasec");
    expect(payload.entry_surface).toBe("career_job_detail");
    expect(payload.source_page_type).toBe("career_job_detail");
    expect(payload.target_action).toBe("start_riasec_test");
    expect(payload.subject_kind).toBe("job_slug");
    expect(payload.subject_key).toBe("actors");
    expect(payload.utm_source).toBe("zhihu");
    expect(payload.utm_medium).toBe("community");
    expect(payload.utm_campaign).toBe("career_actor_test");
    expect(payload.utm_content).toBe("pilot");
    expect(payload.gclid).toBe("test-gclid");
    expect(payload.msclkid).toBe("test-msclkid");
    expect(payload.fbclid).toBe("test-fbclid");
    expect(payload.landing_path).toBe("/zh/career/jobs/actors?utm_source=zhihu&utm_medium=community&utm_campaign=career_actor_test&utm_content=pilot&gclid=test-gclid&msclkid=test-msclkid&fbclid=test-fbclid");
  });

  it("preserves inbound attribution for selected non-Actors display CTAs", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "registered-nurses",
        titleEn: "Registered Nurses",
        titleZh: "注册护士",
      }),
      "en"
    );

    render(
      <CareerDisplaySurface
        surface={surface}
        ctaLandingPath="/en/career/jobs/registered-nurses?utm_source=google&gclid=test-gclid"
        ctaAttributionParams={{
          utm_source: "google",
          gclid: "test-gclid",
        }}
      />
    );

    const cta = getPrimaryDecisionCta();
    const parsed = new URL(cta.href);
    expect(parsed.search).toBe("");
    const payload = readClickPayload(cta);

    expect(payload.subject_key).toBe("registered-nurses");
    expect(payload.utm_source).toBe("google");
    expect(payload.gclid).toBe("test-gclid");
    expect(payload.landing_path).toBe("/en/career/jobs/registered-nurses?utm_source=google&gclid=test-gclid");
  });

  it("uses a D5 selected slug as the display CTA subject key", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "civil-engineers",
        titleEn: "Civil Engineers",
        titleZh: "土木工程师",
      }),
      "en"
    );

    render(
      <CareerDisplaySurface
        surface={surface}
        ctaLandingPath="/en/career/jobs/civil-engineers?utm_source=d5&gclid=test-gclid"
        ctaAttributionParams={{
          utm_source: "d5",
          gclid: "test-gclid",
        }}
      />
    );

    const cta = getPrimaryDecisionCta();
    const parsed = new URL(cta.href);
    expect(parsed.search).toBe("");
    const payload = readClickPayload(cta);

    expect(payload.subject_key).toBe("civil-engineers");
    expect(payload.target_action).toBe("start_riasec_test");
    expect(payload.entry_surface).toBe("career_job_detail");
    expect(payload.utm_source).toBe("d5");
    expect(payload.gclid).toBe("test-gclid");
  });

  it("uses a D8 validator-eligible slug as the display CTA subject key", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "web-developers",
        titleEn: "Web Developers",
        titleZh: "网页开发人员",
      }),
      "en"
    );

    render(
      <CareerDisplaySurface
        surface={surface}
        ctaLandingPath="/en/career/jobs/web-developers?utm_source=d8&gclid=test-gclid"
        ctaAttributionParams={{
          utm_source: "d8",
          gclid: "test-gclid",
        }}
      />
    );

    const cta = getPrimaryDecisionCta();
    const parsed = new URL(cta.href);
    expect(parsed.search).toBe("");
    const payload = readClickPayload(cta);

    expect(payload.subject_key).toBe("web-developers");
    expect(payload.target_action).toBe("start_riasec_test");
    expect(payload.entry_surface).toBe("career_job_detail");
    expect(payload.utm_source).toBe("d8");
    expect(payload.gclid).toBe("test-gclid");
  });
});
