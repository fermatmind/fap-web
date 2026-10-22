import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import type { ReactNode, MouseEventHandler } from "react";
import { afterEach, expect, it, vi } from "vitest";

const transport = vi.hoisted(() => vi.fn());
vi.mock("@/lib/tracking/client", () => ({ trackClientEvent: transport, trackNetworkObservableFunnelEvent: vi.fn() }));
vi.mock("@/lib/tracking/internalTraffic", () => ({ shouldAllowBrowserAnalyticsRuntime: () => ({ allowed: true }) }));
vi.mock("next/link", () => ({ default: ({ href, children, onClick }: { href: string; children: ReactNode; onClick?: MouseEventHandler<HTMLAnchorElement> }) => <a href={href} onClick={onClick}>{children}</a> }));
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllEnvs(); vi.resetModules(); transport.mockClear(); });

it("sends one bounded planning click only after consent, using the existing career transport", async () => {
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  const { TrackedCareerLink } = await import("@/components/analytics/TrackedCareerLink");
  render(<TrackedCareerLink href="#worked-example" eventName="career_support_link_click"
    onClick={(event) => event.preventDefault()}
    eventPayload={{ locale: "en", entrySurface: "career_guides", sourcePageType: "landing", targetAction: "select_start_candidates", landingPath: "/en/career/guides", routeFamily: "landing" }}>Compare candidates</TrackedCareerLink>);
  fireEvent.click(screen.getByText("Compare candidates"));
  expect(transport).not.toHaveBeenCalled();
  localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
  fireEvent.click(screen.getByText("Compare candidates"));
  expect(transport).not.toHaveBeenCalled();
  localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
  fireEvent.click(screen.getByText("Compare candidates"));
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][0]).toMatchObject({ eventName: "career_support_link_click", payload: {
    locale: "en", entry_surface: "career_guides", source_page_type: "landing", target_action: "select_start_candidates", landing_path: "/en/career/guides", route_family: "landing", subject_kind: "none", query_mode: "non_query",
  } });
  expect(transport.mock.calls[0][0].payload).not.toHaveProperty("answers");
  expect(transport.mock.calls[0][0].payload).not.toHaveProperty("subject_key");
});
