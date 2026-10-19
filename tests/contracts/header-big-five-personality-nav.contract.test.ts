import { describe, expect, it } from "vitest";

import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

describe("header Big Five personality navigation", () => {
  it("exposes the Big Five public content hub in the personality dropdown for both locales", () => {
    const enPersonalityMenu = getHeaderDropdownMenus("en").find((menu) => menu.key === "personality");
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(enPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/topics#big-five",
          label: "Big Five",
        }),
      ])
    );
    expect(zhPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/topics#big-five",
          label: "大五人格",
        }),
      ])
    );
  });

  it("organizes the zh resource dropdown into six self-understanding directions", () => {
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(zhPersonalityMenu?.items).toEqual([
      { href: "/topics", label: "认识自己 · 全部资源" },
      { href: "/topics#mbti", label: "MBTI与16型人格" },
      { href: "/topics#big-five", label: "大五人格" },
      { href: "/topics#enneagram", label: "九型人格与成长" },
      { href: "/topics#riasec", label: "职业兴趣" },
      { href: "/topics#iq", label: "IQ与认知" },
      { href: "/topics#eq", label: "情绪与人际能力" },
    ]);
    expect(zhPersonalityMenu?.items.map((item) => item.label)).not.toEqual(
      expect.arrayContaining(["全部人格画像", "分析家（NT）", "外交家（NF）", "守护者（SJ）", "探索者（SP）", "MBTI 主题中心", "职业推荐"])
    );
  });
});
