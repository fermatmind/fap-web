import { describe, expect, it } from "vitest";

import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

describe("header Big Five personality navigation", () => {
  it("exposes the Big Five public content hub in the personality dropdown for both locales", () => {
    const enPersonalityMenu = getHeaderDropdownMenus("en").find((menu) => menu.key === "personality");
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(enPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality/big-five",
          label: "Big Five (OCEAN)",
        }),
      ])
    );
    expect(zhPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality/big-five",
          label: "大五人格（OCEAN）",
        }),
      ])
    );
  });

  it("keeps the zh personality dropdown focused on top-level personality frameworks", () => {
    const zhPersonalityMenu = getHeaderDropdownMenus("zh").find((menu) => menu.key === "personality");

    expect(zhPersonalityMenu?.items).toEqual([
      { href: "/personality", label: "16型人格" },
      { href: "/personality/big-five", label: "大五人格（OCEAN）" },
      { href: "/personality/enneagram", label: "九型人格" },
    ]);
    expect(zhPersonalityMenu?.items.map((item) => item.label)).not.toEqual(
      expect.arrayContaining(["全部人格画像", "分析家（NT）", "外交家（NF）", "守护者（SJ）", "探索者（SP）", "MBTI 主题中心", "职业推荐"])
    );
  });
});
