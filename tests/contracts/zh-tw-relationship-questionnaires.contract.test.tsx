import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RelationshipQuestionnairePage, relationshipQuestionnaireMetadata } from "@/components/i18n/zh-TW/RelationshipQuestionnairePage";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalRelationshipQuestionnaire } from "@/lib/i18n/zh-TW/relationshipQuestionnaire";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Taiwan relationship questionnaire flows", () => {
  beforeEach(() => { vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });
  it.each([
    ["attachment-styles", "data-attachment-profile"],
    ["communication-style", "data-communication-profile"],
  ])("keeps %s source scores and renders the existing take and report", async (slug, reportMarker) => {
    const raw = (await loadQuestionnaire(slug))!;
    const quiz = (await loadTraditionalRelationshipQuestionnaire(slug))!;
    expect(quiz.source).toEqual(raw.source);
    expect(quiz.questions).toHaveLength(24);
    expect(quiz.questions[0].prompt.zh).not.toEqual(raw.questions[0].prompt.zh);
    const key = (item: typeof quiz.questions[number]) => [item.id, item.reverse, item.options.map((option) => [option.id, option.directionId, option.score])];
    expect(quiz.questions.map(key)).toEqual(raw.questions.map(key));
    expect(quiz.profiles.map((item) => item.sections.map((section) => section.id)))
      .toEqual(prepareQuestionnaireResultReadings(raw).profiles.map((item) => item.sections.map((section) => section.id)));
    const answers = Object.fromEntries(raw.questions.map((item) => [item.id, "3"]));
    expect(scoreQuestionnaire(quiz, answers)).toEqual(scoreQuestionnaire(raw, answers));

    const path = `/zh-TW/tests/explore/${slug}`;
    expect(traditionalPath(`/zh/tests/explore/${slug}`)).toBe(path);
    expect(traditionalPath(`${path}/results/unknown`)).toBeNull();
    expect(traditionalPath("/zh-TW/tests/explore/constructor/results/secure")).toBeNull();
    expect((await relationshipQuestionnaireMetadata(path)).robots).toMatchObject({ index: false });
    expect((await relationshipQuestionnaireMetadata(`${path}/take`)).robots).toMatchObject({ index: false, follow: false });

    const { container } = render(await RelationshipQuestionnairePage({ path: `${path}/take` }));
    for (const [index, item] of quiz.questions.entries()) {
      const heading = await screen.findByRole("heading", { name: item.prompt.zh });
      expect(heading).toBeVisible();
      const group = screen.getByRole("group", { name: item.prompt.zh });
      fireEvent.click(within(group).getByRole("radio", { name: item.options.find((option) => option.id === "3")!.label.zh }));
      const next = container.querySelector<HTMLButtonElement>("[data-questionnaire-next]");
      expect(next).toBeEnabled();
      if (index === quiz.questions.length - 1) fireEvent.click(next!);
      else await waitFor(() => expect(heading).not.toHaveTextContent(item.prompt.zh));
    }
    await waitFor(() => expect(container.querySelectorAll(`[${reportMarker}]`)).toHaveLength(4));
    const guideLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>(`[${reportMarker}] > a[href*="/results/"]`));
    expect(guideLinks.map((link) => link.getAttribute("href"))).toEqual(quiz.profiles.map((item) => `${path}/results/${item.id}`));
    const copyButton = screen.getByRole("button", { name: "複製公開入口" });
    fireEvent.click(copyButton);
    expect(await screen.findByRole("textbox", { name: "手動複製結果" })).toHaveValue(`${quiz.title.zh}\nhttps://fermatmind.com${path}`);
  });
});
