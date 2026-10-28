import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/stress-response-patterns-test.json";
import { QuestionnaireShadowClient } from "@/components/questionnaires/QuestionnaireShadowClient";

function finishComplete() {
  fireEvent.click(screen.getByRole("button", { name: "Start test" }));
  for (let i = 0; i < 20; i++) {
    fireEvent.click(screen.getAllByRole("radio")[2]);
    fireEvent.click(screen.getByRole("button", { name: i === 19 ? "See five records" : "Next" }));
  }
}
it("disables private controls before hydration and fails visibly on incomplete manuscripts", () => {
  for (const locale of ["en", "zh"] as const) {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireShadowClient quiz={data} locale={locale} />), "text/html");
    expect(doc.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
    expect(doc.querySelector("form")).toBeNull();
    expect(doc.querySelector("noscript")?.textContent).toContain(locale === "zh" ? "加载画面" : "loading screen");
    expect(doc.body.textContent).toContain(data.instructions[locale]);
  }
  const damaged = structuredClone(data); damaged.resultHeading.en = "";
  expect(renderToStaticMarkup(<QuestionnaireShadowClient quiz={damaged} locale="en" />)).toContain("unavailable");
});
it("uses no browser persistence, keeps all five full guides, and clears on language and BFCache restoration", async () => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage denied"); });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) } });
  const view = render(<QuestionnaireShadowClient quiz={data} locale="en" />); finishComplete();
  expect(view.container.querySelectorAll("[data-shadow-part]")).toHaveLength(5);
  expect(view.container.querySelectorAll("[data-shadow-sum]")).toHaveLength(5);
  fireEvent.click(screen.getByRole("button", { name: "Copy public explanation links" }));
  const copied = await screen.findByRole("textbox", { name: "Public links for manual copying" });
  expect((copied as HTMLTextAreaElement).value).toBe(data.profiles.map(p => `${p.title.en}\nhttps://fermatmind.com/en/tests/explore/stress-response-patterns-test/results/${p.id}`).join("\n\n"));
  expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled();
  view.rerender(<QuestionnaireShadowClient quiz={data} locale="zh" />);
  expect(view.container.querySelector("[data-shadow-result]")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "开始测试" }));
  expect(screen.getAllByRole("radio").every(r => !(r as HTMLInputElement).checked)).toBe(true);
  fireEvent.click(screen.getAllByRole("radio")[2]);
  const restored = new Event("pageshow"); Object.defineProperty(restored, "persisted", { value: true }); fireEvent(window, restored);
  expect(screen.getByRole("button", { name: "开始测试" })).toBeVisible();
});
it("does not restore a late clipboard success message after explicit exit", async () => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  let resolve!: () => void;
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise<void>(r => { resolve = r; }) } });
  const view = render(<QuestionnaireShadowClient quiz={data} locale="en" />); finishComplete();
  fireEvent.click(screen.getByRole("button", { name: "Copy public explanation links" }));
  fireEvent.click(screen.getByRole("button", { name: "Exit and clear these responses" }));
  await act(async () => resolve());
  expect(view.container.querySelector("[data-shadow-result]")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("");
});
