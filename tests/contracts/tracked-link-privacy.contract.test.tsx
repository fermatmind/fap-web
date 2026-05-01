import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  linkProps: [] as Array<{ href: string; prefetch: boolean | undefined }>,
}));

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  children?: ReactNode;
};

vi.mock("next/link", () => ({
  default: ({ href, prefetch, children, ...props }: MockLinkProps) => {
    hoisted.linkProps.push({ href, prefetch });
    return (
      <a href={href} data-prefetch={String(prefetch)} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("tracked link privacy contract", () => {
  beforeEach(() => {
    hoisted.trackEvent.mockReset();
    hoisted.linkProps = [];
  });

  it("keeps entry CTA prefetch opted out by default and preserves explicit opt-in", () => {
    render(
      <>
        <TrackedEntryCtaLink href="/en/tests/mbti" eventProperties={{ surface: "test" }}>
          Default opt-out
        </TrackedEntryCtaLink>
        <TrackedEntryCtaLink href="/en/topics/mbti" prefetch eventProperties={{ surface: "test" }}>
          Explicit opt-in
        </TrackedEntryCtaLink>
      </>
    );

    expect(screen.getByRole("link", { name: "Default opt-out" })).toHaveAttribute("data-prefetch", "false");
    expect(screen.getByRole("link", { name: "Explicit opt-in" })).toHaveAttribute("data-prefetch", "true");
    expect(hoisted.linkProps).toEqual([
      { href: "/en/tests/mbti", prefetch: false },
      { href: "/en/topics/mbti", prefetch: true },
    ]);
  });

  it("keeps career tracking links opted out unless a caller explicitly opts in", () => {
    const eventPayload = {
      locale: "en",
      entrySurface: "career_landing",
      sourcePageType: "career_landing",
      targetAction: "open_jobs",
      landingPath: "/en/career",
      routeFamily: "landing",
    } as const;

    render(
      <>
        <TrackedCareerLink
          href="/en/career/jobs"
          eventName={CAREER_TRACKING_EVENTS.jobIndexView}
          eventPayload={eventPayload}
        >
          Jobs opt-out
        </TrackedCareerLink>
        <TrackedCareerLink
          href="/en/career/recommendations"
          prefetch
          eventName={CAREER_TRACKING_EVENTS.recommendationIndexView}
          eventPayload={eventPayload}
        >
          Recommendations opt-in
        </TrackedCareerLink>
      </>
    );

    expect(screen.getByRole("link", { name: "Jobs opt-out" })).toHaveAttribute("data-prefetch", "false");
    expect(screen.getByRole("link", { name: "Recommendations opt-in" })).toHaveAttribute(
      "data-prefetch",
      "true"
    );
    expect(hoisted.linkProps).toEqual([
      { href: "/en/career/jobs", prefetch: false },
      { href: "/en/career/recommendations", prefetch: true },
    ]);
  });
});
