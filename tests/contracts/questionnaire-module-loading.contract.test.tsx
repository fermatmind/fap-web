import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { questionnaireModule } from "@/components/questionnaires/QuestionnaireModule";

describe("Questionnaire module loading and retained inputs", () => {
  afterEach(() => vi.useRealTimers());

  it("retries a rejected module without losing the caller's answers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const load = vi.fn()
      .mockRejectedValueOnce(new Error("Interrupted chunk request"))
      .mockResolvedValue({ default: ({ locale }: { locale: "en" | "zh" }) => <p>{locale === "en" ? "Complete reading" : "完整解读"}</p> });
    const Reading = questionnaireModule(load);
    function Attempt() {
      const [answer, setAnswer] = useState("4");
      return <><input aria-label="Current answer" value={answer} onChange={event => setAnswer(event.target.value)} /><Reading locale="en" /></>;
    }
    render(<Attempt />);
    fireEvent.change(screen.getByLabelText("Current answer"), { target: { value: "5" } });
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
    await screen.findByText("Complete reading");
    expect(screen.getByLabelText("Current answer")).toHaveValue("5");
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("offers a recovery action when a selected edition never resolves", async () => {
    vi.useFakeTimers();
    const Edition = questionnaireModule<{ locale: "en" | "zh" }>(() => new Promise(() => {}));
    render(<Edition locale="zh" />);
    expect(screen.getByRole("status")).toHaveTextContent("正在准备内容");
    await act(() => vi.advanceTimersByTimeAsync(12_000));
    expect(screen.getByRole("status")).toHaveTextContent("加载比预期慢");
    expect(screen.getByRole("button", { name: "重试加载" })).toBeEnabled();
  });

  it("loads only rendered modules and cancels the slow-load timer on exit", async () => {
    const selected = vi.fn().mockResolvedValue({ default: () => <p>Selected edition</p> });
    const other = vi.fn();
    const Selected = questionnaireModule(selected);
    questionnaireModule(other);
    const view = render(<Selected locale="en" />);
    await waitFor(() => expect(screen.getByText("Selected edition")).toBeVisible());
    expect(other).not.toHaveBeenCalled();
    view.unmount();
  });
});
