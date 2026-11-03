import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SnowDayPanel } from "@/components/entertainment/SnowDayPanel";
import quiz from "@/lib/entertainment/data/snow-day.json";

describe("snow day illustration promise", () => {
  it.each(["en", "zh"] as const)("gives all six %s questions distinct static panels with equivalent descriptions", locale => {
    const scenes = quiz.questions.map(question => {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<SnowDayPanel questionId={question.id} locale={locale} />);
      const image = dom.querySelector("svg")!;
      expect(image.getAttribute("role")).toBe("img");
      const label = image.getAttribute("aria-label")!;
      expect(dom.querySelector("figcaption")?.textContent).toContain(label);
      expect(dom.querySelector("figure")?.dataset.snowDayPanel).toBe(question.id);
      expect(dom.querySelectorAll("audio, video, animate, animateTransform, script")).toHaveLength(0);
      expect(image.getAttribute("viewBox")).toBe("0 0 600 220");
      return { label, drawing: image.innerHTML };
    });
    expect(new Set(scenes.map(s => s.label)).size).toBe(6);
    expect(new Set(scenes.map(s => s.drawing)).size).toBe(6);
  });
  it("does not substitute a different panel for an unknown question", () => {
    expect(renderToStaticMarkup(<SnowDayPanel questionId="missing" locale="en" />)).toBe("");
  });
});
