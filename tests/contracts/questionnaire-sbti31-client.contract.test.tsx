import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/sbti-test.json";
import reference from "../fixtures/questionnaires/sbti31-original-reference.json";
import { QuestionnaireSbti31Client } from "@/components/questionnaires/QuestionnaireSbti31Client";
const events = vi.hoisted(() => ({ start: vi.fn(), complete: vi.fn(), view: vi.fn(), share: vi.fn() }));
vi.mock("@/components/entertainment/useEntertainmentMetrics", () => ({ useEntertainmentMetrics: () => ({ ...events, consent: <p>Optional activity consent</p> }), useEntertainmentResultView: () => {} }));
beforeEach(() => { Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function answer(locale: "en" | "zh" = "en") {
  fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "开始31题" : "Start 31 questions" }));
  for (const [i, q] of data.questions.entries()) {
    const option = q.options.find(o => o.id === reference.cases[0].answers[q.id as keyof typeof reference.cases[0]["answers"]])!;
    fireEvent.click(screen.getByRole("radio", { name: option.label[locale] }));
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? (i === 30 ? "查看完整结果" : "下一题") : (i === 30 ? "See the complete result" : "Next") }));
  }
}
describe("SBTI original31 real client flow", () => {
  it.each(["en", "zh"] as const)("shows original result/full body/all15scores, then clears and retakes in %s", locale => {
    const { container } = render(<QuestionnaireSbti31Client quiz={data} locale={locale} />); answer(locale);
    expect(container.querySelector("[data-sbti31-result]")?.getAttribute("data-sbti31-result")).toBe(reference.cases[0].expected.profileCode);
    expect([...container.querySelectorAll("[data-sbti31-score]")].map(e => Number(e.textContent))).toEqual(reference.cases[0].expected.dimensionCards.map(d => d.score));
    const profile = data.profiles.find(p => p.id === reference.profiles.find(p => p.code === reference.cases[0].expected.profileCode)?.id)!;
    for (const section of profile.sections) for (const p of section.paragraphs) expect(container.textContent).toContain(p[locale]);
    expect(events.complete).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "清除并重测31题" : "Clear and retake 31 questions" }));
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "开始31题" : "Start 31 questions" }));
    expect(screen.getAllByRole("radio").every(e => !(e as HTMLInputElement).checked)).toBe(true);
  });
  it("requires an answer, retains back edits and clears on pagehide/bfcache", () => {
    render(<QuestionnaireSbti31Client quiz={data} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Start 31 questions" })); fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status").textContent).toContain("Choose one");
    fireEvent.click(screen.getAllByRole("radio")[1]); fireEvent.click(screen.getByRole("button", { name: "Next" })); fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect((screen.getAllByRole("radio")[1] as HTMLInputElement).checked).toBe(true);
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(screen.getByRole("button", { name: "Start 31 questions" })).toBeTruthy();
  });
  it("copies only the public guide and ignores a late clipboard completion after clearing", async () => {
    let finish: (() => void) | undefined;
    const write = vi.fn(() => new Promise<void>(r => { finish = r; }));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: write } });
    render(<QuestionnaireSbti31Client quiz={data} locale="en" />); answer();
    fireEvent.click(screen.getByRole("button", { name: "Copy public portrait guide link" }));
    const path = reference.profiles.find(p => p.code === reference.cases[0].expected.profileCode)!.id;
    expect(write).toHaveBeenCalledWith(`${window.location.origin}/en/tests/explore/sbti-test/results/${path}`);
    fireEvent.click(screen.getByRole("button", { name: "Clear and retake 31 questions" }));
    await act(async () => finish?.()); expect(events.share).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Start 31 questions" })).toBeTruthy();
  });
  it("fails visibly for drifted source prompts instead of starting a different bank", () => {
    const bad = structuredClone(data); bad.questions[0].prompt.zh += "changed";
    render(<QuestionnaireSbti31Client quiz={bad} locale="en" />);
    expect(screen.getByRole("status").textContent).toContain("unavailable"); expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
