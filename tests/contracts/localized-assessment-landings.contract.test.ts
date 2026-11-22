import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, within } from "@testing-library/react";
import { LocalizedAssessmentLanding } from "@/components/tests/LocalizedAssessmentLanding";
import { TrioLanding } from "@/components/tests/trio/TrioLanding";
import type { ComponentProps } from "react";

vi.mock("@/lib/eq/loadResultSample", () => ({loadEqResultSample: async () => null}));
import { assessmentLandingKind, assessmentLandingPaths, getLocalizedLanding } from "@/lib/tests/localized-landings";
import type { LocalizedLandingKind } from "@/lib/tests/localized-landings/types";

const kinds = Object.keys(assessmentLandingPaths) as LocalizedLandingKind[];
const locales = ["en", "zh-TW"] as const;
const cardCounts: Record<LocalizedLandingKind, number> = {
  mbti: 16, holland: 6, career: 6, big5: 5, iq: 4, enneagram: 9, jung: 12, disc: 4, eq: 4,
};

describe("localized assessment landing data", () => {
  it("describes the nine stable assessment routes", () => {
    expect(kinds).toHaveLength(9);
    expect(new Set(Object.values(assessmentLandingPaths)).size).toBe(9);
    for (const kind of kinds) {
      if (kind === "career" || kind === "jung" || kind === "disc") continue;
      expect(assessmentLandingKind(assessmentLandingPaths[kind].split("/").at(-1)!)).toBe(kind);
    }
  });

  for (const locale of locales) {
    it.each(kinds)(`${locale} %s supplies the complete landing sections`, (kind) => {
      const profile = getLocalizedLanding(locale, kind);
      expect(profile.h1.trim()).toBeTruthy();
      expect(profile.seoTitle.trim()).toBeTruthy();
      expect(profile.seoDescription.trim()).toBeTruthy();
      expect(profile.hero.trim()).toBeTruthy();
      expect(profile.intro.trim()).toBeTruthy();
      expect(profile.facts).toHaveLength(3);
      expect(profile.benefits).toHaveLength(3);
      expect(profile.cards).toHaveLength(cardCounts[kind]);
      expect(new Set(profile.cards.map(([code]) => code)).size).toBe(cardCounts[kind]);
      expect(profile.scenarios).toHaveLength(3);
      expect(profile.faq.length).toBeGreaterThanOrEqual(6);
      expect(profile.faq.length).toBeLessThanOrEqual(7);
      expect(new Set(profile.faq.map(([question]) => question)).size).toBe(profile.faq.length);
      expect(profile.faq.every(([question, answer]) => question.trim() && answer.trim())).toBe(true);
      expect(profile.science.length).toBeGreaterThanOrEqual(3);
      expect(profile.sampleLabels).toHaveLength(3);
      expect(profile.sampleNotes).toHaveLength(3);
      expect(profile.sampleLabels.every(label => label.trim())).toBe(true);
      expect(profile.sampleNotes.every(note => note.trim())).toBe(true);
    });
  }

  it("uses locale-specific search copy for every test", () => {
    const hanText = /\p{Script=Han}/u;
    for (const locale of locales) {
      const titles = new Set<string>();
      const descriptions = new Set<string>();
      for (const kind of kinds) {
        const { h1, seoTitle, seoDescription } = getLocalizedLanding(locale, kind);
        expect([h1, seoTitle, seoDescription].every(value => hanText.test(value) === (locale === "zh-TW"))).toBe(true);
        titles.add(seoTitle);
        descriptions.add(seoDescription);
      }
      expect(titles.size).toBe(kinds.length);
      expect(descriptions.size).toBe(kinds.length);
    }
  });
});


describe("localized assessment landing server HTML", () => {
  for (const locale of locales) {
    it.each(kinds)(`${locale} %s renders matching visible FAQ and structured data`, async (kind) => {
      const profile = getLocalizedLanding(locale, kind);
      const testPath = `/${locale}${assessmentLandingPaths[kind]}`;
      const result = await LocalizedAssessmentLanding({
        kind, locale,
        entries: [{href: `${testPath}/take`, label: "Start", testId: "localized-test-start"}],
      });
      const [schema, landing] = result.props.children;
      const content = await TrioLanding(landing.props as ComponentProps<typeof TrioLanding>);
      const html = renderToStaticMarkup(content);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      const structured = document.createElement("div");
      structured.innerHTML = renderToStaticMarkup(schema);
      const faq = JSON.parse(structured.querySelector("#assessment-landing-faq")!.textContent!);
      expect(wrapper.querySelectorAll("h1")).toHaveLength(1);
      expect(wrapper.querySelector("h1")?.textContent).toContain(profile.h1);
      expect(wrapper.querySelector("[data-testid=localized-test-start]")?.getAttribute("href")).toBe(`${testPath}/take`);
      const visibleFaq = Array.from(wrapper.querySelectorAll("#faq details"), (item) => [
        item.querySelector("summary")?.textContent, item.querySelector("p")?.textContent,
      ]);
      expect(visibleFaq).toEqual(faq.mainEntity.map((item: {name: string; acceptedAnswer: {text: string}}) =>
        [item.name, item.acceptedAnswer.text]));
      expect(JSON.parse(structured.querySelector("#assessment-landing-quiz")!.textContent!)["@type"]).toBe("Quiz");
      expect(JSON.parse(structured.querySelector("#assessment-landing-software")!.textContent!)["@type"]).toBe("SoftwareApplication");
    });
  }
});


it.each(locales)("keeps MBTI sample controls and percentage direction correct in %s", async (locale) => {
  const result = await LocalizedAssessmentLanding({kind: "mbti", locale, entries: []});
  const [, landing] = result.props.children;
  const {container} = render(landing.props.report);
  const profile = getLocalizedLanding(locale, "mbti");
  const toggle = within(container).getByRole("button", {name: profile.sampleLabels[1]});
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  const jp = container.querySelector("[data-axis=JP]");
  expect(jp).toHaveAttribute("data-direction", "right");
  expect(jp).toHaveTextContent("52% P");
  expect(jp?.querySelector("[data-preference-fill]")).toHaveStyle({width: "2%"});
});
