import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { hasUsableCmsMediaAuthority } from "@/lib/cms/media";
import { getMockCmsLandingSurface } from "./fixtures/cmsLandingSurfaceMock";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import type { TestsHubContent } from "@/lib/marketing/testsHubContent";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    prefetch,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    prefetch?: boolean;
  }) => <a href={href} data-prefetch={prefetch ? "true" : undefined} {...props}>{children}</a>,
}));

describe("IQ CMS media rendering guard", () => {
  it("renders IQ homepage media as backend CMS metadata without image fallback", async () => {
    const surface = await getMockCmsLandingSurface<HomePageContent>("home", "zh");

    render(<HomePageExperience locale="zh" copy={surface.payloadJson} />);

    const title = screen.getByRole("heading", { level: 3, name: "IQ 智商测试" });
    const card = title.closest("article");
    expect(card).toBeTruthy();

    const shell = within(card as HTMLElement).getByTestId("cms-media-authority-shell");
    expect(shell).toHaveAttribute("data-asset-key", "iq-beta30-original-card");
    expect(shell).toHaveAttribute("data-media-state", "metadata-only");
    expect(shell).toHaveAttribute("data-surface", "home_quick_start");
    expect(shell).toHaveClass("sr-only");
    expect(within(card as HTMLElement).queryByRole("img", { name: /IQ|智商/i })).not.toBeInTheDocument();
    expect((card as HTMLElement).innerHTML).not.toContain("/public/");
    expect((card as HTMLElement).innerHTML).not.toContain("/static/");
  });

  it("renders IQ tests hub media metadata and keeps the renderer shell-only", async () => {
    const surface = await getMockCmsLandingSurface<TestsHubContent>("tests", "zh");

    render(<TestsHubExperience locale="zh" content={surface.payloadJson} />);

    const title = screen.getByRole("heading", { level: 2, name: "IQ 智商测试" });
    const card = title.closest("article");
    expect(card).toBeTruthy();

    const shell = within(card as HTMLElement).getByTestId("cms-media-authority-shell");
    expect(shell).toHaveAttribute("data-asset-key", "iq-beta30-original-card");
    expect(shell).toHaveAttribute("data-surface", "tests_hub_card");
    expect(shell).toHaveClass("sr-only");
    expect(within(card as HTMLElement).queryByRole("img", { name: /IQ|智商/i })).not.toBeInTheDocument();
  });

  it("uses a minimal shell when backend media authority metadata is missing or unsafe", () => {
    const unsafe = {
      asset_key: "iq-beta30-original-card",
      source: "frontend_static",
      fallback_allowed: true,
    };

    expect(hasUsableCmsMediaAuthority(unsafe)).toBe(false);

    render(<CmsMediaAuthorityShell locale="en" media={unsafe} surface="tests_hub_card" />);

    const shell = screen.getByTestId("cms-media-minimal-shell");
    expect(shell).toHaveAttribute("data-media-state", "authority-missing");
    expect(shell).toHaveClass("sr-only");
    expect(shell).toHaveTextContent("");
    expect(shell).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
