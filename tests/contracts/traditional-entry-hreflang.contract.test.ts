import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateMetadata as rootMetadata } from "@/app/(root)/page";
import { generateMetadata as localizedHomeMetadata } from "@/app/(localized)/[locale]/page";
import { generateMetadata as localizedTestsMetadata } from "@/app/(localized)/[locale]/tests/page";
import { generateMetadata as traditionalHomeMetadata } from "@/app/(traditional)/zh-TW/page";
import { generateMetadata as traditionalTestsMetadata } from "@/app/(traditional)/zh-TW/tests/page";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { SITE_URL } from "@/lib/site";

vi.mock("@/lib/marketing/homepageContent", () => ({ getHomePageContent: vi.fn() }));
vi.mock("@/lib/marketing/testsHubContent", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/marketing/testsHubContent")>(),
  getTestsHubContent: vi.fn(),
}));

const copy = { seo: { title: "Published page", description: "Published page description" } };
const props = (locale: "zh" | "en") => ({ params: Promise.resolve({ locale }) });

beforeEach(() => {
  vi.mocked(getHomePageContent).mockResolvedValue(copy as Awaited<ReturnType<typeof getHomePageContent>>);
  vi.mocked(getTestsHubContent).mockResolvedValue(copy as Awaited<ReturnType<typeof getTestsHubContent>>);
});

describe("published Taiwan entry alternates", () => {
  it("pairs the canonical root homepage with the English and Taiwan homepages", async () => {
    const metadata = await Promise.all([rootMetadata(), localizedHomeMetadata(props("en")), traditionalHomeMetadata()]);
    const languages = {
      en: SITE_URL + "/en",
      "zh-CN": SITE_URL + "/",
      "zh-TW": SITE_URL + "/zh-TW",
      "x-default": SITE_URL + "/",
    };
    for (const [index, locale] of (["zh-CN", "en", "zh-TW"] as const).entries()) {
      expect(metadata[index].alternates?.languages).toEqual(languages);
      expect(new URL(String(metadata[index].alternates?.canonical)).href).toBe(languages[locale]);
    }
  });

  it("pairs all three assessment directories with their equivalent directory", async () => {
    const metadata = await Promise.all([
      localizedTestsMetadata(props("zh")), localizedTestsMetadata(props("en")), traditionalTestsMetadata(),
    ]);
    const languages = {
      en: SITE_URL + "/en/tests",
      "zh-CN": SITE_URL + "/zh/tests",
      "zh-TW": SITE_URL + "/zh-TW/tests",
      "x-default": SITE_URL + "/zh/tests",
    };
    for (const [index, locale] of (["zh-CN", "en", "zh-TW"] as const).entries()) {
      expect(metadata[index].alternates?.languages).toEqual(languages);
      expect(metadata[index].alternates?.canonical).toBe(languages[locale]);
    }
  });
});
