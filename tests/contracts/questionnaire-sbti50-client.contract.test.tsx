import { renderToStaticMarkup } from "react-dom/server";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/sbti-test.json";
import { QuestionnaireSbti50Client } from "@/components/questionnaires/QuestionnaireSbti50Client";

vi.mock("@/lib/tracking/internalTraffic", () => ({ getAnalyticsDeploymentEnvironment: () => "production", shouldAllowFirstPartyAnalyticsRuntime: () => ({ allowed: true }) }));
beforeEach(() => Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); window.localStorage.clear(); });
function finish() {
  fireEvent.click(screen.getByRole("button", { name: "Start 50 choices" }));
  for (let index = 0; index < 50; index++) {
    fireEvent.click(screen.getAllByRole("radio")[0]);
    fireEvent.click(screen.getByRole("button", { name: index === 49 ? "See these counts" : "Next" }));
  }
}
it("disables interaction before hydration and fails visibly for incomplete content", () => {
  for (const locale of ["en", "zh"] as const) {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireSbti50Client quiz={data} locale={locale} />), "text/html");
    expect(doc.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
    expect(doc.querySelector("form")).toBeNull();
    expect(doc.body.textContent).toContain(data.instructions[locale]);
  }
  const broken = structuredClone(data); broken.profiles.pop();
  expect(renderToStaticMarkup(<QuestionnaireSbti50Client quiz={broken} locale="en" />)).toContain("unavailable");
});
it("keeps all25 tied raw counts, selects no arbitrary personal reading, edits before submission and clears on locale/BFCache", () => {
  const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw Error("Storage denied"); });
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw Error("Storage denied"); });
  const view = render(<QuestionnaireSbti50Client quiz={data} locale="en" />);
  finish();
  expect(view.container.querySelectorAll("[data-sbti50-count]")).toHaveLength(25);
  expect([...view.container.querySelectorAll("[data-sbti50-count]")].every(n => n.textContent === "2 / 4")).toBe(true);
  expect(view.container.querySelector("[data-sbti50-reading]")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Read Caregiver" }));
  for (const section of data.profiles[2].sections) for (const p of section.paragraphs) expect(view.container.querySelector("[data-sbti50-reading]")?.textContent).toContain(p.en);
  fireEvent.click(screen.getByRole("button", { name: "Clear and retake" }));
  expect(screen.getAllByRole("radio").every(r => !(r as HTMLInputElement).checked)).toBe(true);
  fireEvent.click(screen.getAllByRole("radio")[1]);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getAllByRole("radio")[1]).toBeChecked();
  expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled();
  view.rerender(<QuestionnaireSbti50Client quiz={data} locale="zh" />);
  fireEvent.click(screen.getByRole("button", { name: "开始50组选择" }));
  expect(screen.getAllByRole("radio").every(r => !(r as HTMLInputElement).checked)).toBe(true);
  fireEvent.click(screen.getAllByRole("radio")[0]);
  const restored = new Event("pageshow"); Object.defineProperty(restored, "persisted", { value: true }); fireEvent(window, restored);
  expect(screen.getByRole("button", { name: "开始50组选择" })).toBeVisible();
});
it("copies only a public guide and ignores a late clipboard result after exit", async () => {
  let resolve!: () => void;
  const writeText = vi.fn(() => new Promise<void>(r => { resolve = r; }));
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const view = render(<QuestionnaireSbti50Client quiz={data} locale="en" />); finish();
  fireEvent.click(screen.getByRole("button", { name: "Read Caregiver" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy this public guide link" }));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/en/tests/explore/sbti-test/results/caregiver`);
  fireEvent.click(screen.getByRole("button", { name: "Exit and clear these choices" }));
  await act(async () => resolve());
  expect(view.container.querySelector("[data-sbti50-counts]")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("");
});
it("offers a public-link fallback when clipboard access is denied", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(Error("denied")) } });
  render(<QuestionnaireSbti50Client quiz={data} locale="en" />); finish();
  fireEvent.click(screen.getByRole("button", { name: "Read Initiator" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy this public guide link" }));
  expect(await screen.findByText(/Copy did not succeed/)).toBeVisible();
  expect(screen.getByRole("link", { name: "Open this public guide" })).toHaveAttribute("href", "/en/tests/explore/sbti-test/results/initiator");
});
it("sends no private actions by default, then only bounded metadata after both consents", () => {
  window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
  const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
  render(<QuestionnaireSbti50Client quiz={data} locale="en" />); finish();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox"));
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Clear and retake" }));
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, init] = fetch.mock.calls[0];
  expect(url).toBe("/api/track");
  expect(init).toMatchObject({ credentials: "omit", referrerPolicy: "no-referrer" });
  const body = JSON.parse(init.body);
  expect(body.eventName).toBe("fun_start");
  expect(body.path).toBe("/en/tests"); expect(body.anonymousId).toBe("");
  expect(Object.keys(body.payload).sort()).toEqual(["consent_state", "entry_surface", "form_code", "locale", "slug", "target_action"]);
  expect(JSON.stringify(body)).not.toMatch(/SBTI50_\d|leadingThemes|highestCount|answers|self-critic|caregiver/);
  window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
  fireEvent.click(screen.getByRole("button", { name: "Exit and clear these choices" }));
  fireEvent.click(screen.getByRole("button", { name: "Start 50 choices" }));
  expect(fetch).toHaveBeenCalledTimes(1);
});
