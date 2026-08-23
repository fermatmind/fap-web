import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CareerMinimalShell } from "@/components/marketing/CareerMinimalShell";

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
});
