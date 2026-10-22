import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerRiasecExploreLink } from "@/components/career/CareerRiasecExploreLink";
import { buildCareerDisplayCtaHref } from "@/lib/career/displaySurface";
import { setAnalyticsConsent } from "@/lib/consent/store";
import type { Locale } from "@/lib/i18n/locales";
import { buildCareerPageFixture } from "./careerPage.fixture";
import CareerJobDetailPage from "@/app/(localized)/[locale]/career/jobs/[slug]/page";

const mocks = vi.hoisted(() => ({ fetchBundle: vi.fn(), track: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ children, prefetch: _prefetch, ...props }: { children: ReactNode; prefetch?: boolean }) => { void _prefetch; return <a {...props}>{children}</a>; } }));
vi.mock("@/lib/career/api/fetchCareerJobBundle", () => ({ fetchCareerJobBundle: mocks.fetchBundle }));
vi.mock("@/hooks/useAnalytics", () => ({ AnalyticsPageViewTracker: () => null }));
vi.mock("@/lib/tracking/client", () => ({ trackClientEvent: mocks.track }));
vi.mock("@/lib/tracking/internalTraffic", () => ({ shouldAllowBrowserAnalyticsRuntime: () => ({ allowed: true }) }));

function component(locale: Locale) {
  const href = buildCareerDisplayCtaHref({ locale, subjectSlug: "materials-scientists", landingPath: `/${locale}/career/jobs/materials-scientists`, attributionParams: { utm_source: "career-test" } });
  return <CareerRiasecExploreLink locale={locale} subjectSlug="materials-scientists" careerName={'Materials <script>private</script>'} href={href} />;
}

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllEnvs(); });

describe.each<Locale>(["zh", "en"])("career detail next steps: %s", locale => {
  it("offers one localized path per task and retains the attributed RIASEC option", () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(component(locale)), "text/html");
    expect(doc.querySelectorAll("aside")).toHaveLength(1);
    expect(doc.querySelectorAll("li")).toHaveLength(3);
    expect(doc.querySelectorAll("a")).toHaveLength(4);
    expect(doc.querySelector("script")).toBeNull();
    expect(doc.querySelector("h2")?.textContent).toContain("Materials <script>private</script>");
    for (const path of ["/career/tests", "/career", "/career/guides"]) expect(doc.querySelector(`a[href="/${locale}${path}"]`)).not.toBeNull();
    expect(doc.querySelector(`a[href="/${locale}/career/jobs"]`)).toBeNull();
    const riasec = new URL(doc.querySelector('[data-target-action="start_riasec_test"]')!.getAttribute("href")!, "https://fermatmind.com");
    expect(riasec.pathname).toBe(`/${locale}/tests/holland-career-interest-test-riasec`);
    expect(riasec.searchParams.get("subject_key")).toBe("materials-scientists");
    expect(riasec.searchParams.get("utm_source")).toBe("career-test");
    expect(doc.querySelector("aside")?.textContent).toContain(locale === "zh" ? "兴趣不等于能力或职业资格" : "Interests do not establish ability or qualifications");
    expect(doc.querySelectorAll("button")).toHaveLength(0);
  });

  it.each(["denied", "granted"] as const)("keeps navigation usable and emits at most one event per click with consent=%s", async consent => {
    // Keep the real consent gate and payload filter; replace only network delivery.
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    vi.resetModules();
    const { CareerRiasecExploreLink: ActiveComponent } = await import("@/components/career/CareerRiasecExploreLink");
    setAnalyticsConsent(consent);
    const view = render(<ActiveComponent locale={locale} subjectSlug="actors" careerName={locale === "zh" ? "演员" : "Actors"} href={`/${locale}/tests/holland-career-interest-test-riasec`} />);
    const links = [...view.container.querySelectorAll("a")];
    mocks.track.mockClear();
    for (const link of links) {
      link.addEventListener("click", event => event.preventDefault());
      fireEvent.click(link);
    }
    expect(mocks.track).toHaveBeenCalledTimes(consent === "granted" ? 4 : 0);
    if (consent === "granted") {
      expect(mocks.track.mock.calls.map(call => call[0].payload.target_action)).toEqual(["choose_career_assessment", "start_riasec_test", "browse_career_options", "plan_career_action"]);
      for (const [{ eventName, payload }] of mocks.track.mock.calls) {
        expect(eventName).toBe("career_job_detail_cta_click");
        expect(payload).toMatchObject({ locale, entry_surface: "career_job_detail", source_page_type: "career_job_detail", subject_kind: "job_slug", subject_key: "actors", landing_path: `/${locale}/career/jobs/actors` });
        expect(payload).not.toHaveProperty("answers");
      }
    }
  });
});

function bundle(empty: boolean) {
  const page = buildCareerPageFixture("actors", empty ? "en" : "zh");
  page.locale = "zh-CN";
  page.content.locale = "zh-CN";
  return { bundle_kind: "career_job_detail", bundle_version: "career.detail.page.v1", identity: { canonical_slug: "actors" }, locale_policy: { requested_locale: "zh-CN" }, career_page: page,
    seo_contract: { canonical_path: "/zh/career/jobs/actors", canonical_target: "/zh/career/jobs/actors", metadata_fingerprint: page.source_content_sha256, index_eligible: false, index_state: "noindex", robots_policy: "noindex,follow", reason_codes: [] } };
}

describe("real detail route publication boundary", () => {
  it.each([false, true])("shows next steps only with published body (empty=%s)", async empty => {
    mocks.fetchBundle.mockResolvedValue(bundle(empty));
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(await CareerJobDetailPage({ params: Promise.resolve({ locale: "zh", slug: "actors" }) })), "text/html");
    expect(doc.querySelectorAll('[data-testid="career-riasec-explore-link"]')).toHaveLength(empty ? 0 : 1);
  });
  it("keeps authoritative absence and API failure visible instead of rendering next steps", async () => {
    const params = () => ({ params: Promise.resolve({ locale: "zh", slug: "actors" }) });
    mocks.fetchBundle.mockResolvedValue(null);
    await expect(CareerJobDetailPage(params())).rejects.toThrow();
    mocks.fetchBundle.mockRejectedValue(new Error("API_UNAVAILABLE"));
    await expect(CareerJobDetailPage(params())).rejects.toThrow("API_UNAVAILABLE");
  });
});
