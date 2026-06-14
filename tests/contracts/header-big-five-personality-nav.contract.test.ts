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
});
