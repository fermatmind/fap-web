import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiscPaidReport } from "@/components/result/disc/DiscPaidReport";
import { prepareDiscResultProfile } from "@/lib/questionnaires/result-content/disc";
import source from "@/lib/questionnaires/data/disc.json";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

vi.mock("@/lib/tests/traditionalAssessmentDisplay", () => ({ loadTraditionalAssessmentText: async () => (text: string) => `繁體：${text}` }));

describe("paid DISC existing report language projection", () => {
  it("translates the score-reading explanation with the rest of the Traditional report", async () => {
    const profile = prepareDiscResultProfile(source.profiles[0] as QuestionnaireProfile);
    render(<DiscPaidReport payload={{counts: {D: 12, I: 5, S: 4, C: 3}, profile}} locale="zh" displayLocale="zh-TW" />);
    fireEvent.click(await screen.findByText("查看完整解釋、計分與依據"));
    await waitFor(() => expect(screen.getByText(`繁體：${profile.scoreReading.zh}`)).toBeVisible());
    expect(screen.queryByText(profile.scoreReading.zh, {exact:true})).not.toBeInTheDocument();
  });
});
