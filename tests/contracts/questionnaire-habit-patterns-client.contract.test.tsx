import { renderToStaticMarkup } from "react-dom/server";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, act, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/habit-patterns-test.json";
import { QuestionnaireHabitClient } from "@/components/questionnaires/QuestionnaireHabitClient";

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});

function finishSkipped() {
  fireEvent.click(screen.getByRole("button", { name: "Start test" }));
  for (let i = 0; i < 20; i++) {
    fireEvent.click(screen.getByRole("radio", { name: "I prefer not to answer this statement" }));
    fireEvent.click(screen.getByRole("button", { name: i === 19 ? "See this record" : "Next" }));
  }
}
it("keeps private controls disabled before hydration and rejects an incomplete form", () => {
  for (const locale of ["en", "zh"] as const) {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireHabitClient quiz={data} locale={locale} />), "text/html");
    expect(doc.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
    expect(doc.querySelector('input[type="text"], textarea, form')).toBeNull();
    expect(doc.body.textContent).toContain(data.instructions[locale]);
  }
  const damaged = structuredClone(data); damaged.instructions.en = "";
  expect(renderToStaticMarkup(<QuestionnaireHabitClient quiz={damaged} locale="en" />)).toContain("unavailable");
});
it("finishes twenty skips without private factors or storage and shares only the public entry", async () => {
  const get = vi.spyOn(Storage.prototype, "getItem"), set = vi.spyOn(Storage.prototype, "setItem");
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  try {
    render(<QuestionnaireHabitClient quiz={data} locale="en" />); finishSkipped();
    expect(document.querySelector("[data-habit-all-insufficient]")).not.toBeNull();
    expect(document.querySelectorAll("[data-habit-part], [data-habit-mean], [data-habit-sum], [data-honor-reading]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Share Result" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${data.title.en}\nhttps://fermatmind.com/en/tests/explore/${data.slug}`));
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retake" }));
    expect(screen.getByRole("radio", { name: "1 — Does not fit at all" })).not.toBeChecked();
    expect(document.querySelector("[data-habit-result]")).toBeNull();
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});
it("clears edited responses on locale, pagehide and persisted pageshow", () => {
  const view = render(<QuestionnaireHabitClient quiz={data} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Start test" }));
  fireEvent.click(screen.getByRole("radio", { name: "2 — Mostly does not fit" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("radio", { name: "2 — Mostly does not fit" })).toBeChecked();
  view.rerender(<QuestionnaireHabitClient quiz={data} locale="zh" />);
  fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
  expect(screen.getByRole("radio", { name: "2 — 比较不符合" })).not.toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "4 — 比较符合" }));
  act(() => window.dispatchEvent(new Event("pagehide")));
  fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
  expect(screen.getByRole("radio", { name: "4 — 比较符合" })).not.toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "5 — 非常符合" }));
  const restored = new Event("pageshow"); Object.defineProperty(restored, "persisted", { value: true });
  act(() => window.dispatchEvent(restored));
  fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
  expect(screen.getByRole("radio", { name: "5 — 非常符合" })).not.toBeChecked();
});
