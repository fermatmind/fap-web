import { fireEvent, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Archive90GuideShare } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { QuestionnaireTakeSession } from "@/components/questionnaires/QuestionnaireTakeSession";
import { archive90Topic } from "@/lib/entertainment/archive90";
import { getArchiveExperience } from "@/lib/entertainment/archiveExperience";
import catalog from "@/lib/questionnaires/catalog.json";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isArchivedEntertainmentPath } from "@/lib/seo/discoverabilityExposurePolicy";

const locales = ["en", "zh", "zh-TW"] as const;
function Example({ generic }: { generic: boolean }) {
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [readable, setReadable] = useState(!generic);
  return <section id="take-test" data-stage={stage} data-questionnaire-slug={generic ? "type-ab" : undefined}>
    <button data-explore-start onClick={() => setStage("answer")}>Start example</button>
    <button onClick={() => setStage("result")}>Show result</button>
    <button onClick={() => setReadable(true)}>Finish loading report</button>
    {stage === "result" && readable && <div data-archive-report-ready>Free report</div>}
    <button onClick={() => { setStage("answer"); setReadable(!generic); }}>Retake example</button>
  </section>;
}

describe("90-title archive experience", () => {
  it("covers exactly 90 active catalog entries and every existing public result in each language", () => {
    const entries = catalog.filter(row => archive90Topic(row.slug));
    expect(entries).toHaveLength(90);
    expect(new Set(entries.map(x => x.slug)).size).toBe(90);
    for (const entry of entries) {
      expect(getArchiveExperience(entry.slug)).toBeUndefined();
      for (const locale of locales) {
        expect(isArchivedEntertainmentPath(questionnairePath(locale, entry.slug))).toBe(true);
        const topic = archive90Topic(entry.slug)!;
        expect([topic.label[locale], topic.hint[locale], topic.detail[locale]].every(Boolean)).toBe(true);
        for (const id of entry.resultSlugs) {
          expect(isArchivedEntertainmentPath(questionnaireGuidePath(locale, entry.slug, id))).toBe(true);
          const rendered = renderToStaticMarkup(<Archive90GuideShare slug={entry.slug} id={id} locale={locale} />);
          expect(rendered).toContain(`data-archive-guide="${id}"`);
          expect(rendered.match(/data-public-guide-share/g)).toHaveLength(1);
        }
      }
    }
    expect(archive90Topic("constructor")).toBeUndefined();
    expect(renderToStaticMarkup(<Archive90GuideShare slug="temperament" id="sanguine" locale="en" />)).toBe("");
  });

  it.each([true, false])("waits for a completed free report, including a manually started session (generic=%s)", async generic => {
    const landing = questionnairePath("zh-TW", "type-ab");
    const { container, getByRole } = render(<QuestionnaireTakeSession title="測驗" minutes={0}
      locale="zh" landing={landing} autoStart={false}><Example generic={generic} /></QuestionnaireTakeSession>);
    const hint = () => container.querySelector("[data-archive-90-hint]");
    const CTA = () => container.querySelector("[data-archive-next-step]");
    expect(CTA()).toBeNull();
    fireEvent.click(getByRole("button", { name: "Start example" }));
    await waitFor(() => expect(hint()?.textContent).toBe(archive90Topic("type-ab")?.hint["zh-TW"]));
    fireEvent.click(getByRole("button", { name: "Show result" }));
    if (generic) {
      await waitFor(() => expect(hint()).toBeNull());
      expect(CTA()).toBeNull();
      fireEvent.click(getByRole("button", { name: "Finish loading report" }));
    }
    await waitFor(() => expect(CTA()?.querySelector("a")?.getAttribute("href"))
      .toBe("/zh-TW/tests/big-five-personality-test-ocean-model"));
    expect(CTA()?.querySelectorAll("a")).toHaveLength(1);
    fireEvent.click(getByRole("button", { name: "Retake example" }));
    await waitFor(() => expect(CTA()).toBeNull());
  });
});
