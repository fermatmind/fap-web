import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MbtiTestVersionNote } from "@/components/personality/MbtiTestVersionNote";
import { buildMbtiEntryHref } from "@/lib/mbti/entryTracking";
import { DEFAULT_MBTI_FORM_CODE, resolveMbtiFormMeta } from "@/lib/mbti/forms";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

describe("bilingual personality test version disclosure", () => {
  it.each(["en", "zh"] as const)("describes the direct form and links to same-language choices in %s", (locale) => {
    render(<MbtiTestVersionNote locale={locale} />);
    const sourcePath = `/${locale}/personality/intp-a`;
    const href = buildMbtiEntryHref({
      locale, entrySurface: "mbti_personality_detail", sourcePageType: "personality_detail",
      targetAction: "start_mbti_test_primary", sourcePath,
    });
    const formCode = new URL(href, "https://fermatmind.com").searchParams.get("form");
    const form = resolveMbtiFormMeta(formCode);
    expect(formCode).toBe(DEFAULT_MBTI_FORM_CODE);
    expect(screen.getByTestId("mbti-personality-version-note")).toHaveTextContent(
      locale === "zh"
        ? `${form.questionCount} 题 · 约 ${form.estimatedMinutes} 分钟。`
        : `${form.questionCount} questions · About ${form.estimatedMinutes} minutes.`
    );
    expect(screen.getByRole("link", { name: locale === "zh" ? "比较 93 题与 144 题版本" : "Compare 93- and 144-question versions" })).toHaveAttribute(
      "href", `/${locale}/tests/mbti-personality-test-16-personality-types#choose-version`
    );
    expect(new URL(href, "https://fermatmind.com").searchParams.get("landing_path")).toBe(sourcePath);
  });
});
