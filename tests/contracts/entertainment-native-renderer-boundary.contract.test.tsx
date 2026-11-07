import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
// A story must remain available even if the unrelated native questionnaire module cannot load.
vi.mock("@/components/questionnaires/QuestionnairePage", () => {
  throw new Error("Synthetic native questionnaire renderer outage");
});

afterEach(() => vi.unstubAllEnvs());

describe("story and native questionnaire failure isolation", () => {
  it.each(["en", "zh"])("renders the %s story and metadata without its unrelated questionnaire renderer", async locale => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const route = await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
    const props = { params: Promise.resolve({locale, slug: "weather-in-a-bottle"}) };
    const metadata = await route.generateMetadata(props);
    expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/weather-in-a-bottle`);
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(await route.default(props));
    expect(root.querySelector("h1")).not.toBeNull();
    expect(root.querySelector("#play form")?.getAttribute("action")).toBe(`/${locale}/tests/play/weather-in-a-bottle/take`);
  });
});
