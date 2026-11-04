import { useEffect, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireTakeSession } from "@/components/questionnaires/QuestionnaireTakeSession";
import { QuestionnaireLegacyControl } from "@/components/questionnaires/QuestionnaireTakeContext";

const complete = vi.fn();
function Engine({ groups = 1, loading = false, clock = false }: { groups?: number; loading?: boolean; clock?: boolean }) {
  const [position, setPosition] = useState(0), [answers, setAnswers] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(!loading), [heartbeat, setHeartbeat] = useState(0);
  useEffect(() => { if (!clock) return; const timer = setInterval(() => setHeartbeat(n => n + 1), 25); return () => clearInterval(timer); }, [clock]);
  useEffect(() => { if (!loading) return; const timer = setTimeout(() => setReady(true), 500); return () => clearTimeout(timer); }, [loading]);
  return <section data-stage="answer"><h2>Question {position}</h2><output>{clock ? heartbeat : null}</output>{Array.from({ length: groups }, (_, group) => <fieldset key={group}><legend>Group {group}</legend>{["a", "b"].map(value => {
    const name = `q${position}-${group}`;
    return <label key={value}>{value}<input type="radio" name={name} value={value} checked={answers[name] === value} onChange={() => setAnswers(current => ({ ...current, [name]: value }))} /></label>;
  })}</fieldset>)}<button onClick={() => setPosition(p => p - 1)}>Back</button><button data-questionnaire-next disabled={!ready} onClick={() => { complete(answers); setPosition(p => p + 1); }}>Next</button><button onClick={() => setReady(true)}>Load stimulus</button><QuestionnaireLegacyControl><button>Exit and clear</button><label><input type="checkbox" />Save progress</label></QuestionnaireLegacyControl></section>;
}
function mount(props = {}) { return render(<QuestionnaireTakeSession title="Example" minutes={1} locale="en" landing="/en/tests/explore/example"><Engine {...props} /></QuestionnaireTakeSession>); }
async function tick() { await act(async () => { vi.advanceTimersByTime(201); }); }
beforeEach(() => { vi.useFakeTimers(); complete.mockClear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe("Standalone automatic question navigation", () => {
  it("waits for feedback, uses committed answers and advances once per selection", async () => {
    mount(); fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(complete).not.toHaveBeenCalled(); await tick();
    expect(complete).toHaveBeenNthCalledWith(1, { "q0-0": "a" });
    fireEvent.click(screen.getAllByRole("radio")[1]); await tick();
    expect(complete).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("heading", { name: "Question 2" })).toBeTruthy();
    expect(screen.queryByText("Exit and clear")).toBeNull(); expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("requires every radio group, preserving all values in a multi-part question", async () => {
    mount({ groups: 2 }); fireEvent.click(screen.getAllByRole("radio")[0]); await tick(); expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("radio")[3]); await tick(); expect(complete).toHaveBeenCalledWith({ "q0-0": "a", "q0-1": "b" });
  });
  it("cancels on Back and supports selecting the same saved value on return", async () => {
    mount(); fireEvent.click(screen.getAllByRole("radio")[0]); await tick();
    fireEvent.click(screen.getAllByRole("radio")[0]); fireEvent.click(screen.getByText("Back")); await tick();
    expect(complete).toHaveBeenCalledTimes(1); expect(screen.getAllByRole("radio")[0]).toBeChecked();
    fireEvent.click(screen.getAllByRole("radio")[0]); await tick(); expect(complete).toHaveBeenCalledTimes(2);
  });
  it("uses only the latest selection and cancels pending work on manual Next or unmount", async () => {
    const view = mount(); fireEvent.click(screen.getAllByRole("radio")[0]); fireEvent.click(screen.getAllByRole("radio")[1]); await tick();
    expect(complete).toHaveBeenCalledWith({ "q0-0": "b" });
    fireEvent.click(screen.getAllByRole("radio")[0]); fireEvent.click(screen.getByText("Next")); await tick(); expect(complete).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getAllByRole("radio")[0]); view.unmount(); await tick(); expect(complete).toHaveBeenCalledTimes(2);
  });
  it("does not bypass a disabled stimulus guard and resumes once ready", async () => {
    mount({ loading: true }); fireEvent.click(screen.getAllByRole("radio")[0]); await tick(); expect(complete).not.toHaveBeenCalled();
    // A stimulus becomes ready independently of a navigation button click.
    await act(async () => { vi.advanceTimersByTime(300); }); await tick(); expect(complete).toHaveBeenCalledTimes(1);
  });
  it("does not postpone navigation when a live timer keeps updating the page", async () => {
    mount({ clock: true }); fireEvent.click(screen.getAllByRole("radio")[0]);
    for (let tick = 0; tick < 9; tick++) await act(async () => { vi.advanceTimersByTime(25); });
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("rejects a double-tap falling onto the next question", async () => {
    mount(); fireEvent.click(screen.getAllByRole("radio")[0]); await tick();
    fireEvent.click(screen.getAllByRole("radio")[0], { detail: 2 }); await tick(); expect(complete).toHaveBeenCalledTimes(1);
  });
});

it.each(["en", "zh"] as const)("does not read or write legacy drafts in the real %s questionnaire and story engines", async locale => {
  vi.useRealTimers();
  const { QuestionnaireRunner } = await import("@/components/questionnaires/QuestionnaireRunner");
  const { scoreDirectionalQuestionnaire } = await import("@/lib/questionnaires/basicScoring");
  const { FunQuizClient } = await import("@/components/entertainment/FunQuizClient");
  const { default: dog } = await import("@/lib/questionnaires/data/what-dog-breed-am-i.json");
  const { loadFunQuiz } = await import("@/lib/entertainment/loaders");
  const harbor = await loadFunQuiz("harbor-light");
  if (!harbor) throw new Error("Published harbor-light source unavailable");
  const scroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  for (const [engine, slug, prefix] of [
    [<QuestionnaireRunner key="dog" quiz={dog as import("@/lib/questionnaires/types").Questionnaire} scoreQuestionnaire={scoreDirectionalQuestionnaire} locale={locale} />, dog.slug, "fm_questionnaire_draft:"],
    [<FunQuizClient key="harbor" quiz={harbor} locale={locale} />, harbor.slug, "fm_fun_draft:"],
  ] as const) {
    const key = prefix + slug;
    sessionStorage.setItem(key, "old saved attempt");
    const get = vi.spyOn(Storage.prototype, "getItem"), set = vi.spyOn(Storage.prototype, "setItem");
    render(<QuestionnaireTakeSession title="Test" minutes={1} locale={locale} landing="/en/tests"><>{engine}</></QuestionnaireTakeSession>);
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(screen.getAllByRole("radio").length).toBeGreaterThan(0));
    const firstName = screen.getAllByRole("radio")[0].getAttribute("name");
    fireEvent.click(screen.getAllByRole("radio")[0]);
    await waitFor(() => expect(document.querySelector('input[type="radio"]')?.getAttribute("name")).not.toBe(firstName));
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /Exit and clear|退出并清除/ })).toBeNull();
    expect(get.mock.calls.filter(([name]) => name === key)).toEqual([]);
    expect(set.mock.calls.filter(([name]) => name === key)).toEqual([]);
    expect(Storage.prototype.getItem.call(sessionStorage, key)).toBeNull();
    cleanup(); get.mockRestore(); set.mockRestore();
  }
  if (scroll) Object.defineProperty(Element.prototype, "scrollIntoView", scroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});
