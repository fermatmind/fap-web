import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DiscPaidReport } from "@/components/result/disc/DiscPaidReport";
import { discPreviewProfiles } from "@/components/result/disc/discPreviewProfiles";
import { discPreviewLocales } from "@/components/result/disc/discPreviewLocale";
import type { DisplayLocale } from "@/lib/i18n/locales";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("live DISC shared result", () => {
  for (const locale of ["zh", "zh-TW", "en"] as DisplayLocale[]) {
    it.each(discPreviewProfiles)(`${locale} renders server-scored $id without preview controls`, profile => {
      const html = renderToStaticMarkup(<DiscPaidReport payload={{counts:profile.scores,profile:{id:profile.id}}} locale={locale === "en" ? "en" : "zh"} displayLocale={locale}/>);
      const page = new DOMParser().parseFromString(html,"text/html");
      expect(page.querySelector("h1")?.textContent).toBe(discPreviewLocales[locale].profiles[profile.id].title);
      expect(page.querySelectorAll("[data-leading=true]")).toHaveLength(profile.leaders.length);
      expect(page.querySelector("select")).toBeNull();
      expect(page.querySelector('[aria-label="'+discPreviewLocales[locale].ui.languages+'"]')).toBeNull();
      expect(html).not.toContain("/dev/");
    });
  }
  it("preserves actual counts instead of replacing them with the sample vector", () => {
    const counts={DOMINANCE:12,INFLUENCE:4,STEADINESS:3,CONSCIENTIOUSNESS:5};
    const html=renderToStaticMarkup(<DiscPaidReport payload={{counts,profile:{id:"single-d"}}} locale="en" displayLocale="en"/>);
    expect(new DOMParser().parseFromString(html,"text/html").querySelector("dd strong")?.textContent).toBe("12");
  });
  it.each([undefined,{counts:{DOMINANCE:24},profile:{id:"single-d"}},{counts:discPreviewProfiles[0].scores,profile:{id:"single-s"}}])("fails closed for incomplete or mismatched report identity", payload => {
    const html=renderToStaticMarkup(<DiscPaidReport payload={payload} locale="en" displayLocale="en"/>);
    expect(html).toContain('role="status"');
    expect(html).not.toContain("disc-portrait");
  });
});
