import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { generateMetadata as landingMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/page";
import { generateMetadata as takeMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/take/page";
import { generateMetadata as portraitMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/results/[portrait]/page";
import HistoryTake from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";
import { matchGlobalHistory } from "@/lib/entertainment/global-history/actions";
import { globalHistoryPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { globalHistoryResultKey } from "@/lib/entertainment/global-history/local-result";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", async (original) => ({
  ...await original<typeof import("next/navigation")>(),
  useRouter: () => ({ push }),
}));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: vi.fn() }));

it("keeps the Taiwan route private to indexing and uses the original 12-scene match", async () => {
  const copy = await loadTraditionalAssessmentText();
  const expected = await matchGlobalHistory(Array(historyScenes.length).fill(0));
  expect(expected).not.toBeNull();
  expect(await landingMetadata()).toMatchObject({ robots: { index: false }, alternates: { canonical: expect.stringContaining(globalHistoryPath("zh-TW")) } });
  expect(await takeMetadata()).toMatchObject({ robots: { index: false, follow: false } });
  expect(await portraitMetadata({ params: Promise.resolve({ portrait: expected!.id }), searchParams: Promise.resolve({}) }))
    .toMatchObject({ robots: { index: false }, alternates: { canonical: expect.stringContaining(globalHistoryResultPath("zh-TW", expected!.id)) } });

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
