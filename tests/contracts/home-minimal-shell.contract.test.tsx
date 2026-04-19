import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeMinimalShell } from "@/components/marketing/HomeMinimalShell";

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

describe("home minimal shell contract", () => {
  it("renders only minimal product recovery actions", () => {
    render(<HomeMinimalShell locale="en" />);

    expect(screen.getByTestId("home-minimal-shell")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types"
    );
    expect(screen.getByRole("link", { name: "Browse all tests" })).toHaveAttribute("href", "/en/tests");
  });

  it("keeps root and localized home pages on minimal shell fallback instead of local editorial copy", () => {
    for (const relPath of ["app/(root)/page.tsx", "app/(localized)/[locale]/page.tsx"]) {
      const source = read(relPath);
      expect(source).toContain("HomeMinimalShell");
      expect(source).toContain("getHomePageContent");
      expect(source).toContain(".catch(() => null)");
      expect(source).toContain("noindex: true");
    }
  });
});
