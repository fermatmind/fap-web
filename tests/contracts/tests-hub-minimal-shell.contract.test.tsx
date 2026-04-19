import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestsHubMinimalShell } from "@/components/marketing/tests/TestsHubMinimalShell";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => <a href={href} {...props}>{children}</a>,
}));

describe("tests hub minimal shell contract", () => {
  it("renders a minimal MBTI recovery path", () => {
    render(<TestsHubMinimalShell locale="en" />);

    expect(screen.getByTestId("tests-hub-minimal-shell")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types"
    );
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/en");
  });

  it("keeps tests hub fallback minimal and keeps normal copy CMS-backed", () => {
    const route = read("app/(localized)/[locale]/tests/page.tsx");
    const experience = read("components/marketing/tests/TestsHubExperience.tsx");

    expect(route).toContain("TestsHubMinimalShell");
    expect(route).toContain("getTestsHubContent");
    expect(route).toContain(".catch(() => null)");
    expect(route).toContain("noindex: true");
    expect(route).toContain("<TestsHubExperience content={content} locale={locale} />");
    expect(experience).toContain("content.hero.title");
    expect(experience).toContain("content.hero.body");
    expect(experience).not.toContain("Life architecture starts with measurement");
  });
});
