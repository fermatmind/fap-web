import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NatalChartClient } from "@/components/questionnaires/NatalChartClient";
import { NatalChartGuidePage, NatalChartPage } from "@/components/questionnaires/NatalChartPage";
import { NatalChartReport } from "@/components/questionnaires/NatalChartReport";
import { calculateNatalChart } from "@/lib/questionnaires/natalChartCalculation";
import { calculateNatalAdditionalAngles } from "@/lib/questionnaires/natalChartAngles";
import type { NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;
function change(id: string, value: string) { fireEvent.change(document.getElementById(id)!, { target: { value } }); }
function enter(date = "2001-06-15", time = "08:30") {
  change("natal-date", date); change("natal-time", time); change("natal-reference", "europe-london");
  fireEvent.click(document.getElementById("natal-confirm")!);
}
async function calculate() {
  fireEvent.click(screen.getByRole("button", { name: "Calculate this chart" }));
  await waitFor(() => expect(document.querySelector("[data-natal-result]")).not.toBeNull());
}
function transition(type: string, persisted = false) {
  const event = new Event(type); Object.defineProperty(event, "persisted", { value: persisted }); fireEvent(window, event);
}

describe("T199 memory-only native chart client and complete public prose", () => {
  it("renders a disabled, empty server shell with no form capable of submitting birth values", () => {
    const html = renderToStaticMarkup(<NatalChartClient quiz={quiz} locale="en" />);
    expect(html).toContain('<fieldset disabled=""'); expect(html).not.toContain("<form");
    expect(html).not.toContain("2001-06-15"); expect(html).not.toContain("data-natal-result");
    expect(html).toContain("requires JavaScript"); expect(html).toContain("loading screen");
    const bad = structuredClone(quiz); bad.natalChart.display = "round" as never;
    const unavailable = renderToStaticMarkup(<NatalChartClient quiz={bad} locale="en" />);
    expect(unavailable).toContain("chart content is unavailable"); expect(unavailable).not.toContain("<input");
  });

  it("renders all72 adopted sections in both public locales, without birth data or hidden paid text", () => {
    for (const locale of ["en", "zh"] as const) {
      const entry = renderToStaticMarkup(<NatalChartPage quiz={quiz} locale={locale} />);
      expect(entry).toContain(quiz.title[locale]);
      const dom = document.createElement("div"); dom.innerHTML = entry;
      const motion = dom.querySelector("[data-natal-motion-guide]");
      expect(motion?.querySelector("h2")?.textContent).toBe(quiz.natalChart.motion.name[locale]);
      expect(Array.from(motion?.querySelectorAll("p") ?? []).map(p => p.textContent)).toEqual(quiz.natalChart.motion.paragraphs.map(p => p[locale]));
      expect(dom.querySelectorAll("[data-natal-angle-reference]")).toHaveLength(3);
      for (const role of quiz.natalChart.angles.roles) for (const p of role.paragraphs) expect(dom.querySelector(`[data-natal-angle-reference="${role.id}"]`)?.textContent).toContain(p[locale]);
      expect(dom.querySelector("[data-natal-angles-guide]")?.textContent).toContain(quiz.natalChart.angles.methodReading[locale]);
      expect(dom.querySelectorAll("[data-natal-aspect-definition]")).toHaveLength(5);
      expect(dom.querySelector("[data-natal-aspect-convention]")?.textContent).toBe(quiz.natalChart.aspects.convention[locale]);
      for (const reading of quiz.natalChart.aspects.readings) {
        const definition = dom.querySelector(`[data-natal-aspect-definition="${reading.id}"]`);
        for (const p of reading.paragraphs) expect(definition?.textContent).toContain(p[locale]);
      }
      for (const p of quiz.profiles) {
        const body = renderToStaticMarkup(<NatalChartGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(body).not.toContain("data-natal-result");
        for (const s of p.sections) for (const paragraph of s.paragraphs) {
          const escaped = renderToStaticMarkup(<p>{paragraph[locale]}</p>);
          expect(body).toContain(escaped);
        }
        expect(body).toContain("natal-chart/results/");
      }
    }
  });

  it("connects every computed pair to its actual body roles, signs and full public definition in both locales", () => {
    const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/natal-chart-aspects-reference.json", "utf8"));
    const result = calculateNatalChart({ date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", coordinatesConfirmed: true, knownTime: true }, Date.parse("2026-10-28T00:00Z"));
    if (result.status !== "complete") throw new Error("Fixed fictional sample unavailable");
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={result.chart} locale={locale} />);
      expect(dom.querySelectorAll("[data-natal-aspect-pair]")).toHaveLength(17);
      for (const expected of reference.expectedOwn8DegreePairs) {
        const pair = dom.querySelector(`[data-natal-aspect-pair="${expected.id}"]`)!;
        expect(pair).not.toBeNull();
        expect(pair.querySelector(`a[href="#natal-aspect-${expected.type}"]`)).not.toBeNull();
        for (const body of expected.id.split(":")) {
          expect(pair.querySelector(`a[href="#natal-body-role-${body}"]`)).not.toBeNull();
          const placement = result.chart.placements.find(p => p.body === body)!;
          expect(pair.querySelector(`a[href="/${locale}/tests/explore/natal-chart/results/${placement.coordinate.sign}"]`)).not.toBeNull();
        }
        // Independent Swiss longitudes + acos(cos Δ) witness, allowing the recorded engine difference and display truncation.
        const separation = Number(pair.querySelector("[data-natal-aspect-separation]")?.textContent?.replace("°", ""));
        expect(Math.abs(separation - expected.separationDegrees)).toBeLessThan(0.11);
        const orb = Number(pair.querySelector("[data-natal-aspect-orb]")?.textContent?.replace("°", ""));
        expect(Math.abs(orb - expected.orbDegrees)).toBeLessThan(0.11);
      }
    }
  });

  it("uses the actual selected signs and shows every body-role paragraph in the computed result", async () => {
    const view = render(<NatalChartClient quiz={quiz} locale="en" />); enter(); await calculate();
    expect(document.querySelectorAll("[data-natal-aspect-pair]")).toHaveLength(17);
    expect(document.querySelectorAll("[data-natal-motion]")).toHaveLength(10);
    expect(Array.from(document.querySelectorAll('[data-natal-motion-state="retrograde"]')).map(n => n.getAttribute("data-natal-motion"))).toEqual(["mercury", "mars", "uranus", "neptune", "pluto"]);
    expect(document.querySelector('[data-natal-motion="sun"]')).toHaveTextContent("Direct");
    expect(document.querySelectorAll("[data-natal-angle]")).toHaveLength(3); expect(document.querySelectorAll("[data-natal-angle-reading]")).toHaveLength(3);
    // The picker uses its labeled IANA reference coordinates, not the fixed numeric witness's51.5/-0.1.
    expect(document.querySelector('[data-natal-angle="mc"]')).toHaveTextContent("Aries");
    expect(document.querySelector('[data-natal-angle="mc"] [data-natal-angle-house]')).toHaveTextContent("9");
    expect(document.querySelector('[data-natal-aspect-pair="neptune:pluto"]')).toHaveTextContent("Sextile");
    expect(document.querySelectorAll("[data-natal-body]")).toHaveLength(10);
    expect(document.querySelectorAll("[data-natal-body-reading]")).toHaveLength(10);
    expect(document.querySelector("[data-natal-rising-reading]")).not.toBeNull();
    expect(document.querySelector('[data-natal-body-reading="sun"]')).toHaveTextContent("Sun in Gemini: what you choose to explore");
    expect(document.querySelector('[data-natal-body-reading="moon"]')).toHaveTextContent("Moon in Aries: movement as a reflection prompt");
    expect(document.querySelector("[data-natal-rising-reading]")).toHaveTextContent("Leo rising: choosing how to introduce an offering");
    for (const role of quiz.natalChart.bodyRoles) for (const p of role.paragraphs) expect(document.querySelector(`[data-natal-body-reading="${role.id}"]`)).toHaveTextContent(p.en);
    expect(document.querySelector('[data-natal-element="air"]')).toHaveTextContent("6");
    expect(document.querySelector('[data-natal-element="water"]')).toHaveTextContent("0");
    change("natal-time", "09:00"); expect(document.querySelector("[data-natal-result]")).toBeNull();
    view.unmount();
  });

  it("shows independent MC/IC with unavailable houses and DSC in both locales when ASC fails", () => {
    const result = calculateNatalChart({ date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true }, Date.parse("2026-10-28T00:00Z"));
    if (result.status !== "complete") throw new Error("Original body chart unavailable");
    const ascendant = { status: "unavailable", reason: "geometry" } as const;
    const chart = { ...result.chart, ascendant, placements: result.chart.placements.map(p => ({ ...p, house: null })), angles: calculateNatalAdditionalAngles(Date.parse(result.chart.utc), 51.5, -0.1, ascendant) };
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={chart} locale={locale} />);
      expect(dom.querySelectorAll("[data-natal-angle-reading]")).toHaveLength(2);
      expect(dom.querySelector('[data-natal-angle-reading="mc"]')).not.toBeNull(); expect(dom.querySelector('[data-natal-angle-reading="descendant"]')).toBeNull();
      expect(dom.querySelector('[data-natal-angle="mc"]')?.textContent).toContain(locale === "zh" ? "白羊座 17.4°" : "Aries 17.4°");
      expect(dom.querySelector('[data-natal-angle="mc"] [data-natal-angle-house]')?.textContent).toBe(locale === "zh" ? "不可用" : "Unavailable");
      expect(dom.querySelector('[data-natal-angle="descendant"]')?.textContent).toContain(locale === "zh" ? "不可用" : "Unavailable");
      expect(dom.querySelectorAll("[data-natal-body]")).toHaveLength(10); expect(dom.querySelectorAll("[data-natal-motion]")).toHaveLength(10);
    }
  });

  it("renders the actual supported near-station minute without presenting it as an exact station time", () => {
    const result = calculateNatalChart({ date: "2024-04-01", time: "22:14", zone: "UTC", latitude: "51.5", longitude: "-0.1", knownTime: true, coordinatesConfirmed: true }, Date.parse("2026-10-28T00:00Z"));
    if (result.status !== "complete") throw new Error("Known station minute unavailable");
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={result.chart} locale={locale} />);
      const motion = dom.querySelector('[data-natal-motion="mercury"]');
      expect(motion?.getAttribute("data-natal-motion-state")).toBe("near-stationary");
      expect(motion?.textContent).toBe(locale === "zh" ? "接近停滞" : "Near-stationary");
      expect(dom.querySelectorAll("[data-natal-body]")).toHaveLength(10);
    }
  });

  it("exposes an ambiguous minute with two unselected offsets and requires an explicit choice", async () => {
    const view = render(<NatalChartClient quiz={quiz} locale="en" />);
    enter("2024-11-03", "01:30"); change("natal-reference", "america-new-york"); fireEvent.click(document.getElementById("natal-confirm")!);
    fireEvent.click(screen.getByRole("button", { name: "Calculate this chart" }));
    await waitFor(() => expect(screen.getByText("This local minute occurred twice")).toBeVisible());
    const radios = screen.getAllByRole("radio"); expect(radios).toHaveLength(2); expect(radios.every(r => !(r as HTMLInputElement).checked)).toBe(true);
    expect(document.querySelector("[data-natal-result]")).toBeNull();
    fireEvent.click(screen.getByLabelText(/Second occurrence/)); await calculate();
    expect(document.querySelector("[data-natal-result]")).toHaveTextContent("2024-11-03T06:30:00Z");
    view.unmount();
  });

  it("does not guess a gap, an unknown birth time or unconfirmed reference coordinates", async () => {
    const view = render(<NatalChartClient quiz={quiz} locale="en" />);
    enter("2024-03-10", "02:30"); change("natal-reference", "america-new-york"); fireEvent.click(document.getElementById("natal-confirm")!);
    fireEvent.click(screen.getByRole("button", { name: "Calculate this chart" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("does not exist"));
    expect(document.querySelector("[data-natal-result]")).toBeNull();
    fireEvent.click(document.getElementById("natal-unknown-time")!);
    expect(screen.getByRole("button", { name: "Calculate this chart" })).toBeDisabled(); expect(document.getElementById("natal-time")).toHaveValue("");
    expect(document.querySelector("[data-natal-known-time-notice]")).toHaveTextContent("will not substitute noon");
    fireEvent.click(screen.getByRole("button", { name: "Clear input and result" }));
    change("natal-date", "2000-01-01"); change("natal-time", "12:00"); change("natal-reference", "europe-london");
    fireEvent.click(screen.getByRole("button", { name: "Calculate this chart" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("confirm you checked"));
    expect(document.querySelector("[data-natal-result]")).toBeNull(); view.unmount();
  });

  it("keeps planet interpretations but omits every dependent house and rising reading at a pole", () => {
    const result = calculateNatalChart({ date: "2001-06-15", time: "08:30", zone: "Europe/London", latitude: "90", longitude: "0", coordinatesConfirmed: true, knownTime: true }, Date.parse("2026-10-28T00:00Z"));
    if (result.status !== "complete") throw new Error("Pole planet calculation unavailable");
    const html = renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={result.chart} locale="en" />);
    expect(html).toContain("data-natal-angle-unavailable"); expect(html).not.toContain("data-natal-rising-reading");
    expect(html.match(/data-natal-body-reading=/g)).toHaveLength(10);
    expect(html.match(/data-natal-motion=/g)).toHaveLength(10);
    expect(html).toContain("data-natal-no-angles"); expect(html).not.toContain("data-natal-angle-reading=");
    expect(html).not.toContain("Whole-sign house1");
  });

  it("uses no storage and clears birth input/results on leave, BFCache restoration and locale change", async () => {
    const original = ["localStorage", "sessionStorage"].map(name => [name, Object.getOwnPropertyDescriptor(window, name)] as const);
    const access = vi.fn(() => { throw new Error("Storage unavailable"); });
    for (const [name] of original) Object.defineProperty(window, name, { configurable: true, get: access });
    const view = render(<NatalChartClient quiz={quiz} locale="en" />);
    try {
      enter(); await calculate(); transition("pagehide");
      expect(document.getElementById("natal-date")).toHaveValue(""); expect(document.querySelector("[data-natal-result]")).toBeNull();
      enter(); await calculate(); transition("pageshow", true);
      expect(document.getElementById("natal-zone")).toHaveValue(""); expect(document.querySelector("[data-natal-result]")).toBeNull();
      enter(); await calculate(); view.rerender(<NatalChartClient quiz={quiz} locale="zh" />);
      expect(document.getElementById("natal-date")).toHaveValue(""); expect(document.getElementById("natal-latitude")).toHaveValue("");
      expect(document.querySelector("[data-natal-result]")).toBeNull(); expect(access).not.toHaveBeenCalled();
    } finally { view.unmount(); for (const [name, descriptor] of original) if (descriptor) Object.defineProperty(window, name, descriptor); }
  });

  it("handles denied and late clipboard writes with public URLs only and no stale private state", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const view = render(<NatalChartClient quiz={quiz} locale="en" />); enter(); await calculate();
    fireEvent.click(screen.getByRole("button", { name: "Copy public calculator and guide URLs" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Public URLs for manual copying" })).toBeVisible());
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied.split("\n")).toHaveLength(13); expect(copied).not.toMatch(/2001|08:30|51\.5|London|24\.0/);
    let finish: (() => void) | undefined;
    writeText.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Copy public calculator and guide URLs" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear input and result" }));
    await act(async () => { finish?.(); });
    expect(screen.queryByRole("textbox", { name: "Public URLs for manual copying" })).toBeNull(); expect(screen.getByRole("status").textContent).toBe("");
    expect(document.getElementById("natal-date")).toHaveValue(""); view.unmount();
  });
});
