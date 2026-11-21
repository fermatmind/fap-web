import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DiscResultDesignPreview } from "@/components/result/disc/DiscResultDesignPreview";
import { discDirections, discPreviewProfiles } from "@/components/result/disc/discPreviewProfiles";
import { discPreviewLocales, discResultPreviewPath, discUnlockPreviewPath } from "@/components/result/disc/discPreviewLocale";
import { DiscUnlockPreview, buildDiscDesignPreview } from "@/components/commerce/DiscUnlockPreview";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import type { ReportResponse, RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/reports/samples/disc" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const locales: DisplayLocale[] = ["zh", "zh-TW", "en"];
const cases = locales.flatMap(locale => discPreviewProfiles.map(profile => ({ locale, profile })));
const leaves = (value: unknown): string[] => typeof value === "string" ? [value] : Array.isArray(value) ? value.flatMap(leaves) : value && typeof value === "object" ? Object.values(value).flatMap(leaves) : [];
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  return typeof value;
}
const textOf = (html: string) => new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";

describe("DISC one-template translation coverage", () => {
  it("has complete matching fields, no empty translations and unchanged references for every locale", () => {
    for (const locale of locales) {
      const bundle = discPreviewLocales[locale];
      expect(shape(bundle)).toEqual(shape(discPreviewLocales.zh));
      expect(bundle.alts).toHaveLength(15);
      expect(bundle.directions).toHaveLength(4);
      for (const profile of discPreviewProfiles) for (const text of leaves(bundle.profiles[profile.id])) expect(text.trim()).not.toBe("");
      for (let index = 0; index < bundle.evidence.sources.length; index++) {
        expect(bundle.evidence.sources[index].url).toBe(discPreviewLocales.zh.evidence.sources[index].url);
        expect(bundle.evidence.sources[index].id).toBe(discPreviewLocales.zh.evidence.sources[index].id);
      }
      expect(bundle.evidence.science.map(item => item.reference)).toEqual(discPreviewLocales.zh.evidence.science.map(item => item.reference));
      const equal = bundle.profiles["tied-d-i-s-c"];
      expect(equal.introduction).toContain("6");
      expect(equal.introduction).toMatch(locale === "en" ? /do not mean/ : /不代表/);
      expect(bundle.evidence.science[3].body).toMatch(locale === "en" ? /has not established/ : /尚未建立/);
    }
    expect(leaves(discPreviewLocales.en).join("\n")).not.toMatch(/\p{Script=Han}/u);
  });

  it.each(cases)("$locale / $profile.id renders the full translated content with the same scores and layout", ({ locale, profile }) => {
    const bundle = discPreviewLocales[locale];
    const content = bundle.profiles[profile.id];
    const html = renderToStaticMarkup(<DiscResultDesignPreview locale={locale} profileId={profile.id} counts={profile.scores} />);
    const document = new DOMParser().parseFromString(html, "text/html");
    const text = textOf(html);
    for (const paragraph of leaves(content)) expect(text).toContain(paragraph);
    expect(document.querySelector("main")?.getAttribute("lang")).toBe(locale === "zh" ? "zh-CN" : locale);
    expect(document.querySelectorAll("[data-leading]")).toHaveLength(profile.leaders.length);
    expect(document.querySelector("#disc-science")?.textContent).toContain(bundle.evidence.science[3].body);
    const counts = [...document.querySelectorAll('section[aria-labelledby="disc-scores-title"] dl strong')].map(item => Number(item.textContent));
    expect(counts).toEqual(profile.counts);
    expect(html).toContain(discUnlockPreviewPath(locale, profile.id).replaceAll("&", "&amp;"));
    for (const language of locales) expect(html).toContain(discResultPreviewPath(language, profile.id));
    if (locale === "en") {
      document.querySelector(`nav[aria-label="${bundle.ui.languages}"]`)?.remove();
      expect(document.body.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(cases)("$locale / $profile.id uses one unlock builder without language-specific scoring", ({ locale, profile }) => {
    const headline = Object.fromEntries(locales.map(language => [language, discPreviewLocales[language].profiles[profile.id].headline]));
    const result = buildDiscDesignPreview({ counts: profile.scores, profile: { headline } }, locale, profile.artwork)!;
    expect(result.headline).toBe(discPreviewLocales[locale].profiles[profile.id].headline);
    expect(result.axes.map(axis => axis.count)).toEqual(profile.counts);
    expect(result.axes.map(axis => axis.code)).toEqual(discDirections.map(direction => direction.code));
    const html = renderToStaticMarkup(<DiscUnlockPreview result={result} locale={locale} />);
    const text = textOf(html);
    expect(text).toContain(result.headline);
    expect(html).toContain(profile.artwork.replaceAll("/", "%2F"));
    expect((html.match(/data-leading="true"/g) ?? []).length).toBe(profile.leaders.length);
    if (locale === "en") expect(text).not.toMatch(/\p{Script=Han}/u);
  });

  it.each(locales)("%s keeps the unlock-to-result link in the same language and result", locale => {
    const profile = discPreviewProfiles.find(item => item.id === "tied-i-s-c")!;
    const headline = Object.fromEntries(locales.map(language => [language, discPreviewLocales[language].profiles[profile.id].headline]));
    const disc = buildDiscDesignPreview({ counts: profile.scores, profile: { headline } }, locale, profile.artwork)!;
    const data = { ok:true, meta:{ scale_code:"DISC_BEHAVIOR" }, result:{ scores_pct:{}, summary:{} } } as unknown as ReportResponse;
    const purchase = { attempt_id:"local-design-preview", unlocked:false, order_no:null, payment_state:null, offers:[] } as RiasecPurchase;
    const html = renderToStaticMarkup(<MainstreamPaidResult data={data} purchase={purchase} locale={locale} preview discPreview={disc} sampleResultId={profile.id} />);
    expect(html).toContain(discResultPreviewPath(locale, profile.id));
    if (locale === "en") expect(textOf(html)).not.toMatch(/\p{Script=Han}/u);
    expect(new DOMParser().parseFromString(html, "text/html").querySelectorAll("button[disabled]")).toHaveLength(3);
  });
});

describe("traditional unlock preview routing", () => {
  it.each(["development", "production"])("restricts the native preview route in %s", async mode => {
    const { traditionalPath } = await import("@/lib/i18n/traditionalRoutes");
    vi.stubEnv("NODE_ENV", mode);
    try {
      expect(traditionalPath("/zh-TW/dev/mainstream-unlock")).toBe(mode === "development" ? "/zh-TW/dev/mainstream-unlock" : null);
    } finally { vi.unstubAllEnvs(); }
  });
});


describe("live DISC locked result", () => {
  it.each(cases)("$locale / $profile.id uses actual scored counts without granting access", ({locale,profile}) => {
    const data={ok:true,meta:{scale_code:"DISC_BEHAVIOR"},result:{scores_pct:profile.scores,summary:{}}} as unknown as ReportResponse;
    const purchase={attempt_id:"scored-attempt",unlocked:false,order_no:null,payment_state:null,offers:[]} as RiasecPurchase;
    const html=renderToStaticMarkup(<MainstreamPaidResult data={data} purchase={purchase} locale={locale}/>);
    expect(html).toContain(discPreviewLocales[locale].profiles[profile.id].headline);
    const image = new DOMParser().parseFromString(html,"text/html").querySelector("img");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(profile.artwork);
    expect(html).not.toContain("disc-portrait");
    expect(html).not.toContain("Local design preview");
    expect(html).not.toContain("当前模拟");
  });
});
