import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/stress-check-in-test.json";
import { QuestionnaireStressCheckInClient } from "@/components/questionnaires/QuestionnaireStressCheckInClient";

vi.mock("@/lib/tracking/internalTraffic", () => ({ getAnalyticsDeploymentEnvironment: () => "production", shouldAllowFirstPartyAnalyticsRuntime: () => ({ allowed: true }) }));

function finishComplete() {
  fireEvent.click(screen.getByRole("button", { name: "Start test" }));
  for (let i = 0; i < 4; i++) {
    fireEvent.click(screen.getAllByRole("radio")[2]);
    fireEvent.click(screen.getByRole("button", { name: i === 3 ? "See this check-in total" : "Next" }));
  }
}
it("disables private controls before hydration and fails visibly on incomplete manuscripts", () => {
  for (const locale of ["en", "zh"] as const) {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireStressCheckInClient quiz={data} locale={locale} />), "text/html");
    expect(doc.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
    expect(doc.querySelector("form")).toBeNull();
    expect(doc.querySelector("noscript")?.textContent).toContain(locale === "zh" ? "加载画面" : "loading screen");
    expect(doc.body.textContent).toContain(data.instructions[locale]);
  }
  const damaged = structuredClone(data); damaged.resultHeading.en = "";
  expect(renderToStaticMarkup(<QuestionnaireStressCheckInClient quiz={damaged} locale="en" />)).toContain("unavailable");
});
it("uses no browser persistence, keeps the one full guide, and clears on language and BFCache restoration", async () => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage denied"); });
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage denied"); });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) } });
  const view = render(<QuestionnaireStressCheckInClient quiz={data} locale="en" />); finishComplete();
  expect(view.container.querySelectorAll("[data-stress-check-in-contribution]")).toHaveLength(4);
  expect(view.container.querySelectorAll("[data-stress-check-in-total]")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Copy public explanation link" }));
  const copied = await screen.findByRole("textbox", { name: "Public link for manual copying" });
  expect((copied as HTMLTextAreaElement).value).toBe(data.profiles.map(p => `${p.title.en}\nhttps://fermatmind.com/en/tests/explore/stress-check-in-test/results/${p.id}`).join("\n\n"));
  expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled();
  view.rerender(<QuestionnaireStressCheckInClient quiz={data} locale="zh" />);
  expect(view.container.querySelector("[data-stress-check-in-result]")).toBeNull();
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
  const view = render(<QuestionnaireStressCheckInClient quiz={data} locale="en" />); finishComplete();
  fireEvent.click(screen.getByRole("button", { name: "Copy public explanation link" }));
  fireEvent.click(screen.getByRole("button", { name: "Exit and clear these responses" }));
  await act(async () => resolve());
  expect(view.container.querySelector("[data-stress-check-in-result]")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("");
});

it("counts no private actions by default and sends only bounded action metadata after both consents", () => {
  vi.restoreAllMocks();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
  const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
  const view = render(<QuestionnaireStressCheckInClient quiz={data} locale="en" />);
  try {
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    finishComplete(); expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox")); expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Edit answers and clear this result" }));
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: i === 3 ? "See this check-in total" : "Next" }));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(([, init]) => JSON.parse(init.body).eventName)).toEqual(["fun_complete", "fun_result_view"]);
    for (const [url, init] of fetch.mock.calls) {
      expect(url).toBe("/api/track"); expect(init).toMatchObject({ credentials: "omit", referrerPolicy: "no-referrer" });
      const body = JSON.parse(init.body); expect(body.path).toBe("/en/tests"); expect(body.anonymousId).toBe("");
      expect(Object.keys(body.payload).sort()).toEqual(["consent_state", "entry_surface", "form_code", "locale", "slug", "target_action"]);
      expect(body.payload).toMatchObject({ slug: data.slug, consent_state: "activity_opt_in" });
      expect(JSON.stringify(body)).not.toMatch(/stress-check-in-0[1-4]|contributions|answers|total/);
    }
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
    fireEvent.click(screen.getByRole("button", { name: "Exit and clear these responses" }));
    fireEvent.click(screen.getByRole("button", { name: "Start test" }));
    expect(fetch).toHaveBeenCalledTimes(2);
  } finally { view.unmount(); window.localStorage.clear(); vi.unstubAllGlobals(); }
});
