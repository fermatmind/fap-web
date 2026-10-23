import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { OfficialCareerToolLink } from "@/app/(localized)/[locale]/career/tests/OfficialCareerToolLink";
import { trackCareerOfficialResourceClick } from "@/lib/career/toolTracking";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/career/toolTracking", () => ({ trackCareerOfficialResourceClick: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
afterEach(() => { window.localStorage.clear(); vi.clearAllMocks(); });
import CareerTestsPage, { generateMetadata } from "@/app/(localized)/[locale]/career/tests/page";

describe("career test tool selection", () => {
  it("requires consent for the real official-resource helper and sends only bounded metadata", async () => {
    const actual = await vi.importActual<typeof import("@/lib/career/toolTracking")>("@/lib/career/toolTracking");
    for (const analytics of ["unknown", "denied"]) {
      window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics }));
      actual.trackCareerOfficialResourceClick("en", "onet_interest_profiler");
    }
    expect(trackEvent).not.toHaveBeenCalled();
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    actual.trackCareerOfficialResourceClick("en", "onet_interest_profiler");
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith("career_support_link_click", {
      locale: "en", entry_surface: "career_tests_official_tools", source_page_type: "landing",
      target_action: "open_official_resource", landing_path: "/en/career/tests",
      route_family: "landing", subject_kind: "none", query_mode: "non_query", resource_key: "onet_interest_profiler",
    });
  });
  it("records only the bounded resource key while preserving the external destination", () => {
    const view = render(<OfficialCareerToolLink href="https://onetinterestprofiler.org/" resourceKey="onet_interest_profiler">O*NET Interest Profiler — external site</OfficialCareerToolLink>);
    const link = view.getByRole("link");
    link.addEventListener("click", event => event.preventDefault());
    fireEvent.click(link);
    expect(link.getAttribute("href")).toBe("https://onetinterestprofiler.org/");
    expect(trackCareerOfficialResourceClick).toHaveBeenCalledExactlyOnceWith("en", "onet_interest_profiler");
    view.unmount();
  });
  it("offers English readers distinct official tools and visibly identifies external destinations", async () => {
    const html = renderToStaticMarkup(await CareerTestsPage({ params: Promise.resolve({ locale: "en" }) }));
    const document = new DOMParser().parseFromString(html, "text/html");
    const section = document.querySelector('[data-testid="career-tools-next-step"]');
    expect(section).not.toBeNull();
    const links = [...section!.querySelectorAll("a")];
    expect(links).toHaveLength(7);
    expect(links.every(link => link.textContent?.includes("external"))).toBe(true);
    expect(links.every(link => new URL(link.href).protocol === "https:")).toBe(true);
    expect(section!.textContent).toContain("England");
    expect(section!.textContent).toContain("separate services");
    expect(section!.textContent).toContain("scores are not interchangeable");
    expect(document.querySelector('[data-testid="career-tests-primary-cta"]')?.getAttribute("href"))
      .toBe("/en/tests/holland-career-interest-test-riasec");
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en" }) });
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe("/en/career/tests");
  });

  it("preserves the Chinese selection flow without adding English local-service guidance", async () => {
    const html = renderToStaticMarkup(await CareerTestsPage({ params: Promise.resolve({ locale: "zh" }) }));
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector('[data-testid="career-tools-next-step"]')).toBeNull();
    expect(document.querySelector('[data-testid="career-tests-primary-cta"]')?.getAttribute("href"))
      .toBe("/zh/tests/holland-career-interest-test-riasec");
    expect(document.querySelector("h1")?.textContent).toBe("职业测试：先做职业兴趣测试");
  });
});
