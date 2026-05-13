import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import TechnicalNoteRoute from "@/app/(localized)/[locale]/tests/[slug]/technical-note/page";

const hoisted = vi.hoisted(() => ({
  getTestBySlug: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: hoisted.notFound,
  permanentRedirect: hoisted.permanentRedirect,
}));

vi.mock("@/lib/content", () => ({
  getTestBySlug: hoisted.getTestBySlug,
  resolveTestTitleByLocale: (test: { title?: string; title_zh?: string }) => test.title_zh ?? test.title ?? "Technical Note",
}));

vi.mock("@/components/result/enneagram/EnneagramTechnicalNotePage", () => ({
  EnneagramTechnicalNotePage: ({ testTitle }: { testTitle: string }) => (
    <div data-testid="mock-enneagram-technical-note-page">{testTitle}</div>
  ),
  RiasecTechnicalNotePage: ({ testTitle }: { testTitle: string }) => (
    <div data-testid="mock-riasec-technical-note-page">{testTitle}</div>
  ),
}));

describe("RIASEC technical note route contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the canonical RIASEC technical-note route", async () => {
    hoisted.getTestBySlug.mockResolvedValueOnce({
      scale_code: "RIASEC",
      title_zh: "霍兰德职业兴趣测试（RIASEC）",
    });

    const element = (await TechnicalNoteRoute({
      params: Promise.resolve({
        locale: "zh",
        slug: SCALE_CANONICAL_SLUG_MAP.RIASEC,
      }),
    })) as ReactElement;

    render(element);

    expect(screen.getByTestId("mock-riasec-technical-note-page")).toHaveTextContent("霍兰德职业兴趣测试（RIASEC）");
    expect(hoisted.getTestBySlug).toHaveBeenCalledWith(SCALE_CANONICAL_SLUG_MAP.RIASEC, "zh");
  });

  it("keeps the Enneagram technical-note route enabled", async () => {
    hoisted.getTestBySlug.mockResolvedValueOnce({
      scale_code: "ENNEAGRAM",
      title_zh: "九型人格测试",
    });

    const element = (await TechnicalNoteRoute({
      params: Promise.resolve({
        locale: "zh",
        slug: SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
      }),
    })) as ReactElement;

    render(element);

    expect(screen.getByTestId("mock-enneagram-technical-note-page")).toHaveTextContent("九型人格测试");
  });

  it("continues to reject unsupported technical-note slugs", async () => {
    hoisted.getTestBySlug.mockResolvedValueOnce({
      scale_code: "BIG5_OCEAN",
      title_zh: "大五人格测试",
    });

    await expect(
      TechnicalNoteRoute({
        params: Promise.resolve({
          locale: "zh",
          slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
        }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(hoisted.notFound).toHaveBeenCalledTimes(1);
  });
});
