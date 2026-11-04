import { CognitiveFunctionsVersions } from "@/components/questionnaires/CognitiveFunctionsVersions";
import { StrictMode, useEffect, useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionnaireTakeSession } from "@/components/questionnaires/QuestionnaireTakeSession";
import { QuestionnaireTakeOptions } from "@/components/questionnaires/QuestionnaireTakeOptions";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => window.history.replaceState(null, "", "/zh/tests/explore/example/take?start=1"));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const session = (children: React.ReactNode, autoStart = true) => <QuestionnaireTakeSession title="Example" minutes={3} locale="zh" landing="/zh/tests/explore/example" autoStart={autoStart}>{children}</QuestionnaireTakeSession>;

describe("Shared take session", () => {
  it("invokes a hydrated engine once in StrictMode and removes only the public start command", async () => {
    const started = vi.fn();
    function Engine() {
      const [ready, setReady] = useState(false), [stage, setStage] = useState("welcome");
      useEffect(() => { const timer = setTimeout(() => setReady(true), 0); return () => clearTimeout(timer); }, []);
      return <section data-stage={stage}><button disabled={!ready} data-explore-start onClick={() => { started(); setStage("answer"); }}>Start</button>{stage === "answer" && <p>First question</p>}</section>;
    }
    render(<StrictMode>{session(<Engine />)}</StrictMode>);
    await screen.findByText("First question");
    expect(started).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe("");
  });
  it("starts a new attempt on reload instead of restoring an old draft", async () => {
    window.history.replaceState(null, "", "/zh/tests/explore/example/take");
    const started = vi.fn(), resumed = vi.fn();
    render(session(<section data-stage="welcome"><button data-explore-start onClick={started}>Start</button><button data-questionnaire-resume onClick={resumed}>Resume</button></section>));
    await waitFor(() => expect(screen.queryByText("正在准备题目…")).toBeNull());
    expect(started).toHaveBeenCalledTimes(1);
    expect(resumed).not.toHaveBeenCalled();
  });
  it("keeps the real script retry control available and starts only after recovery", async () => {
    const started = vi.fn();
    function Engine() {
      const [failed, setFailed] = useState(true);
      return failed ? <div role="alert"><button onClick={() => setFailed(false)}>Retry module</button></div> : <section data-stage="welcome"><button data-explore-start onClick={started}>Start</button></section>;
    }
    render(session(<Engine />));
    fireEvent.click(screen.getByRole("button", { name: "Retry module" }));
    await waitFor(() => expect(started).toHaveBeenCalledTimes(1));
  });
  it("does not auto-submit configurable friendship setup forms", () => {
    window.history.replaceState(null, "", "/zh/tests/explore/example/take?start=1&edition=selected");
    const submitted = vi.fn();
    render(session(<form onSubmit={submitted}><label>Nickname<input /></label><button>Create</button></form>, false));
    expect(screen.queryByText("正在准备题目…")).toBeNull();
    expect(submitted).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?edition=selected");
  });
  it.each([2, 4, 5])("preserves the original option IDs through the %i-option template", count => {
    const changed = vi.fn();
    render(<QuestionnaireTakeOptions questionId="q1" prompt="Example question" options={Array.from({ length: count }, (_, i) => ({ id: `original-${i}`, label: `Original option ${i}` }))} onChange={changed} scale={count === 5} />);
    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(count);
    fireEvent.click(options[count - 1]);
    expect(changed).toHaveBeenCalledWith(`original-${count - 1}`);
  });
});


it("runs the original draft-deletion handler before starting a direct 56-choice entry", async () => {
  const scroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  try {
    window.history.replaceState(null, "", "/en/tests/explore/cognitive-functions-test/take?edition=paired56&start=1");
    const removed = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw Error("Synthetic storage denial"); });
    render(<QuestionnaireTakeSession title="Cognitive functions" minutes={15} locale="en" landing="/en/tests/explore/cognitive-functions-test"><CognitiveFunctionsVersions locale="en" initialMethod="paired56" /></QuestionnaireTakeSession>);
    await screen.findByText(/deletion of that copy could not be confirmed/);
    expect(removed).toHaveBeenCalledWith("fm_questionnaire_draft:cognitive-functions-test");
    await waitFor(() => expect(document.querySelector("[data-jung56-progress]")).toHaveTextContent("Question 1 / 56"));
    expect(new URL(window.location.href).searchParams.get("edition")).toBe("paired56");
    expect(new URL(window.location.href).searchParams.has("start")).toBe(false);
  } finally {
    if (scroll) Object.defineProperty(Element.prototype, "scrollIntoView", scroll);
    else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  }
});
