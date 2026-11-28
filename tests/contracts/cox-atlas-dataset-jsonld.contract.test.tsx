import { GlobalHistoryAtlas } from "@/components/entertainment/GlobalHistoryAtlas";
import { historyAtlasCopy, historyAtlasMetadata } from "@/lib/entertainment/global-history/atlas";
import { coxStudy, coxTranscriptionCredit } from "@/lib/entertainment/global-history/result-v2";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("Cox atlas Dataset JSON-LD", () => {
  it.each(["zh", "zh-TW", "en"] as const)("emits a valid description and credited dataset in %s", (locale) => {
    const html = renderToStaticMarkup(<GlobalHistoryAtlas locale={locale} atlas="cox-1926" query={{}} />);
    const page = new DOMParser().parseFromString(html, "text/html");
    const graph = JSON.parse(page.querySelector("#history-atlas-data")!.textContent!)["@graph"];
    const originalDescription = historyAtlasCopy["cox-1926"].description[locale];
    const dataset = graph.find((item: { "@type": string }) => item["@type"] === "Dataset");

    expect(dataset.creator).toMatchObject({ "@type": "Organization", name: "FermatMind" });
    expect(dataset.isBasedOn).toEqual([coxStudy, coxTranscriptionCredit.url]);
    expect(dataset.license).toBe(coxTranscriptionCredit.license);
    expect(dataset.distribution).toHaveLength(2);
    if (locale === "en") {
      expect(dataset.description).toBe(originalDescription);
    } else {
      expect(dataset.description).toMatch(/12A.*12B.*301/);
      expect(Array.from(dataset.description as string).length).toBeGreaterThanOrEqual(80);
      expect(Array.from(dataset.description as string).length).toBeLessThanOrEqual(120);
    }
    expect(page.querySelector("main > h1 + p")?.textContent).toBe(originalDescription);
    expect(historyAtlasMetadata(locale, "cox-1926", {}).description).toBe(originalDescription);
  });
});
