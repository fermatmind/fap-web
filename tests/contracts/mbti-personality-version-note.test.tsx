import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MbtiTestVersionNote } from "@/components/personality/MbtiTestVersionNote";
import { buildMbtiEntryHref } from "@/lib/mbti/entryTracking";
import { DEFAULT_MBTI_FORM_CODE, resolveMbtiFormMeta } from "@/lib/mbti/forms";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

describe("English personality test version disclosure", () => {
  it("describes the same default form as the direct test entry and links to the version choices", () => {
    render(<MbtiTestVersionNote />);
    const href = buildMbtiEntryHref({
      locale: "en", entrySurface: "mbti_personality_detail", sourcePageType: "personality_detail",
      targetAction: "start_mbti_test_primary", sourcePath: "/en/personality/intp-a",
    });
    const formCode = new URL(href, "https://fermatmind.com").searchParams.get("form");
    const form = resolveMbtiFormMeta(formCode);
    expect(formCode).toBe(DEFAULT_MBTI_FORM_CODE);
    expect(screen.getByTestId("mbti-personality-version-note")).toHaveTextContent(
      `${form.questionCount} questions · About ${form.estimatedMinutes} minutes.`
    );
    expect(screen.getByRole("link", { name: "Compare 93- and 144-question versions" })).toHaveAttribute(
      "href", "/en/tests/mbti-personality-test-16-personality-types#choose-version"
    );
    expect(new URL(href, "https://fermatmind.com").searchParams.get("landing_path")).toBe("/en/personality/intp-a");
  });
});
