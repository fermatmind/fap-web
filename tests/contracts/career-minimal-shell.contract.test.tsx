import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CareerMinimalShell } from "@/components/marketing/CareerMinimalShell";

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

describe("career minimal shell contract", () => {
  it("renders a minimal MBTI recovery path", () => {
    render(<CareerMinimalShell locale="en" />);

    expect(screen.getByTestId("career-minimal-shell")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types"
    );
    expect(screen.getByRole("link", { name: "Browse all tests" })).toHaveAttribute("href", "/en/tests");
  });

  it("keeps the career hub on minimal shell fallback instead of local editorial copy", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");

    expect(source).toContain("CareerMinimalShell");
    expect(source).toContain("getCareerCenterContent");
    expect(source).toContain(".catch(() => null)");
    expect(source).toContain("noindex: true");
    expect(source).toContain("return <CareerMinimalShell locale={locale} />");
  });
});
