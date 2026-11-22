import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Focused DISC landing", () => {
  it.each(["en", "zh", "zh-TW"] as const)("offers the original questionnaire and result guides in %s", async locale => {
    const focused = await import("@/app/(localized)/[locale]/tests/explore/disc/page");
    const quiz = await loadQuestionnaire("disc");
    const params = Promise.resolve({ locale });
    const stream = await renderToReadableStream(await focused.default({ params }));
    const article = document.createElement("div");
    article.innerHTML = await new Response(stream).text();
    const path = questionnairePath(locale, "disc");
    const metadata = await focused.generateMetadata({ params });

    expect(article.querySelectorAll("main")).toHaveLength(1);
    expect(article.querySelectorAll("h1")).toHaveLength(1);
    expect(article.querySelector(`#take-test form[action="${path}/take"] input[name="start"]`)).toHaveAttribute("value", "1");
    for (const { id } of quiz!.profiles) {
      expect(article.querySelector(`a[href="${questionnaireGuidePath(locale, "disc", id)}"]`)).toBeTruthy();
    }
    expect(String(metadata.alternates?.canonical)).toContain(path);
    const schema = [...article.querySelectorAll('script[type="application/ld+json"]')]
      .map(script => JSON.parse(script.textContent!)).flatMap(value => value["@graph"] ?? [value])
      .find(value => value["@type"] === "FAQPage");
    const visible = [...article.querySelectorAll("details[data-ent-faq], #faq details")].map(item => [
      item.querySelector("summary")?.textContent,
      item.querySelector("p")?.textContent,
    ]);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible).toEqual(schema.mainEntity.map((item: {name: string; acceptedAnswer: {text: string}}) =>
      [item.name, item.acceptedAnswer.text]));
  });
});
