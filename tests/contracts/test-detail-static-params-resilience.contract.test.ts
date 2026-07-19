import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicReadError } from "@/lib/public-content/readError";

const getAllTestsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/content", async () => {
  const actual = await vi.importActual<typeof import("@/lib/content")>("@/lib/content");

  return {
    ...actual,
    getAllTests: getAllTestsMock,
  };
});

import { generateStaticParams } from "@/app/(localized)/[locale]/tests/[slug]/page";

describe("test detail static params resilience", () => {
  beforeEach(() => {
    getAllTestsMock.mockReset();
  });

  it("fails closed without local static params when backend catalog authority times out", async () => {
    getAllTestsMock.mockRejectedValue(new PublicReadError({ kind: "timeout", status: 408 }));

    await expect(generateStaticParams()).resolves.toEqual([]);
  });

  it("does not hide non-retryable catalog contract failures", async () => {
    const contractError = new PublicReadError({ kind: "contract" });
    getAllTestsMock.mockRejectedValue(contractError);

    await expect(generateStaticParams()).rejects.toBe(contractError);
  });

  it("keeps backend catalog rows as the only EN/ZH static param authority", async () => {
    getAllTestsMock.mockResolvedValue([{ slug: "backend-authoritative-test" }]);

    await expect(generateStaticParams()).resolves.toEqual([
      { locale: "en", slug: "backend-authoritative-test" },
      { locale: "zh", slug: "backend-authoritative-test" },
    ]);
  });
});
