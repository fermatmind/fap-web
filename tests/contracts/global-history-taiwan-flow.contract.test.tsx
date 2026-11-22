import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { generateMetadata as landingMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/page";
import { generateMetadata as takeMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/take/page";
import { generateMetadata as portraitMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/results/[portrait]/page";
import { GlobalHistoryLanding } from "@/components/entertainment/GlobalHistoryLanding";
import HistoryTake from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";
import { matchGlobalHistory } from "@/lib/entertainment/global-history/actions";
import { globalHistoryPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { globalHistoryResultKey } from "@/lib/entertainment/global-history/local-result";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { historyLandingCopy } from "@/lib/entertainment/global-history/landing-copy";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", async (original) => ({
  ...await original<typeof import("next/navigation")>(),
  useRouter: () => ({ push }),
}));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: vi.fn() }));

it("keeps the Taiwan take flow out of indexing and uses the original 12-scene match", async () => {
  const copy = await loadTraditionalAssessmentText();
  const expected = await matchGlobalHistory(Array(historyScenes.length).fill(0));
  expect(expected).not.toBeNull();
  expect(await landingMetadata()).toMatchObject({ robots: { index: false, follow: true }, alternates: { canonical: expect.stringContaining(globalHistoryPath("zh-TW")) } });
  expect(await takeMetadata()).toMatchObject({ robots: { index: false, follow: false } });
  expect(await portraitMetadata({ params: Promise.resolve({ portrait: expected!.id }), searchParams: Promise.resolve({}) }))
    .toMatchObject({ robots: { index: true, follow: true }, alternates: { canonical: expect.stringContaining(globalHistoryResultPath("zh-TW", expected!.id)) } });

  render(await HistoryTake({ params: Promise.resolve({ locale: "zh-TW" }) }));
  fireEvent.click(await screen.findByRole("button", { name: copy("走进展馆") }));
  for (const scene of historyScenes) {
    expect(await screen.findByRole("heading", { name: copy(scene.prompt.zh) })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: copy(scene.options[0][1]) }));
  }
  await waitFor(() => expect(push).toHaveBeenCalledWith(globalHistoryResultPath("zh-TW", expected!.id)));
  expect(JSON.parse(sessionStorage.getItem(globalHistoryResultKey)!)).toMatchObject({ id: expected!.id, vector: expected!.vector });
  sessionStorage.removeItem(globalHistoryResultKey);
});

it.each(["en", "zh", "zh-TW"] as const)("renders the %s flagship entrance, real guide IDs and local practice feedback", async locale => {
  const { container } = render(await GlobalHistoryLanding({ locale }));
  await waitFor(() => expect(container.querySelectorAll("[data-ent-module]")).toHaveLength(8));
  const start = container.querySelector("form[data-ent-start]");
  expect(start).toHaveAttribute("action", `${globalHistoryPath(locale)}/take`);
  expect(container.querySelectorAll("#history-directory-list a")).toHaveLength(historyPeople.length);
  for (const id of ["isaac-newton", "li-bai", "mansa-musa"]) {
    expect(container.querySelector(`#history-figures [data-ent-result-id="${id}"] a[data-ent-guide]`))
      .toHaveAttribute("href", globalHistoryResultPath(locale, id));
  }
  const sampleButtons = container.querySelectorAll<HTMLButtonElement>("[data-ent-sample-choice]");
  expect(sampleButtons).toHaveLength(3);
  fireEvent.click(sampleButtons[1]);
  expect(container.querySelector('[data-ent-sample-result-id="li-bai"]')).toBeVisible();
  const choices = container.querySelectorAll<HTMLButtonElement>("[data-explore-choice] button");
  expect(choices).toHaveLength(4);
  fireEvent.click(choices[0]);
  expect(container.querySelector("[data-explore-choice] [aria-live]")).toHaveTextContent(historyLandingCopy[locale].notes[0]);
});
