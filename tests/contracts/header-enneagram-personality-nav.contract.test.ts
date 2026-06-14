import { describe, expect, it } from "vitest";

import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

describe("header Enneagram personality navigation", () => {
  it("points personality navigation to the Enneagram hub while keeping the test entry in test navigation", () => {
    const enMenus = getHeaderDropdownMenus("en");
    const zhMenus = getHeaderDropdownMenus("zh");
    const enPersonalityMenu = enMenus.find((menu) => menu.key === "personality");
    const zhPersonalityMenu = zhMenus.find((menu) => menu.key === "personality");
    const enTestsMenu = enMenus.find((menu) => menu.key === "tests");
    const zhTestsMenu = zhMenus.find((menu) => menu.key === "tests");

    expect(enPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality/enneagram",
          label: "Enneagram",
        }),
      ])
    );
    expect(zhPersonalityMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/personality/enneagram",
          label: "九型人格",
        }),
      ])
    );
    expect(enPersonalityMenu?.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/tests/enneagram-personality-test-nine-types",
          label: "Enneagram test",
        }),
      ])
    );
    expect(zhPersonalityMenu?.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/tests/enneagram-personality-test-nine-types",
          label: "九型人格测试",
        }),
      ])
    );
    expect(enTestsMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/tests/enneagram-personality-test-nine-types",
          label: "Enneagram test",
        }),
      ])
    );
    expect(zhTestsMenu?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: "/tests/enneagram-personality-test-nine-types",
          label: "九型人格测试",
        }),
      ])
    );
  });
});
