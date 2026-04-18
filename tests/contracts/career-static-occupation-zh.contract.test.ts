import { describe, expect, it } from "vitest";
import { CAREER_STATIC_OCCUPATION_MEMBERS } from "@/lib/career/staticOccupationMembers";

describe("static occupation zh title contract", () => {
  it("keeps all 342 occupation directory entries translated for zh display", () => {
    expect(CAREER_STATIC_OCCUPATION_MEMBERS).toHaveLength(342);
    expect(CAREER_STATIC_OCCUPATION_MEMBERS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canonicalSlug: "actuaries",
          canonicalTitleZh: "精算师",
        }),
        expect.objectContaining({
          canonicalSlug: "administrative-services-managers",
          canonicalTitleZh: "行政服务和设施经理",
        }),
        expect.objectContaining({
          canonicalSlug: "aerospace-engineering-and-operations-technicians",
          canonicalTitleZh: "航空航天工程与运行技术员",
        }),
      ])
    );

    const untranslated = CAREER_STATIC_OCCUPATION_MEMBERS.filter(
      (member) => !member.canonicalTitleZh || member.canonicalTitleZh.trim().length === 0
    );
    expect(untranslated).toEqual([]);
  });
});
