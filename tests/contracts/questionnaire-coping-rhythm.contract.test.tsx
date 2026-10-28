import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/coping-rhythm-test.json";
import items from "@/tests/fixtures/questionnaires/coping-rhythm-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/coping-rhythm-profiles-reference.json";
import { copingPairDefinitions, isMiniCopingConfigurationValid, scoreMiniCopingQuestionnaire } from "@/lib/questionnaires/miniCoping";
import { QuestionnaireCopingReport } from "@/components/questionnaires/QuestionnaireCopingReport";

const base = () => Object.fromEntries(data.questions.map(q => [q.id, "A"]));
const complete = (answers: unknown) => {
  const result = scoreMiniCopingQuestionnaire(data, answers);
  expect(result.status).toBe("complete");
  if (result.status !== "complete") throw new Error("Expected complete choices");
  return result;
};

describe("original coping rhythm paired choices", () => {
  it("preserves all 24 source choices, both balanced poles and four frozen full guides", () => {
    expect(isMiniCopingConfigurationValid(data)).toBe(true);
    expect(data.profiles).toEqual(profiles);
    for (const [i, item] of items.items.entries()) {
      expect(data.questions[i].id).toBe(item.id);
      expect(data.questions[i].prompt).toEqual(item.prompt);
      expect(data.questions[i].options).toEqual(item.options.map(o => ({ id: o.id, directionId: o.pole, label: o.label })));
    }
    for (let group = 0; group < 4; group++) for (const pole of copingPairDefinitions[group].poleIds) {
      expect(data.questions.slice(group * 6, group * 6 + 6).filter(q => q.options[0].directionId === pole)).toHaveLength(3);
    }
  });

  it("matches every one of 256 marginal source choice patterns and retains 80 ties", () => {
    let ties = 0;
    for (let group = 0; group < 4; group++) for (let mask = 0; mask < 64; mask++) {
      const answers = base(), expected: Record<string, number> = Object.fromEntries(copingPairDefinitions[group].poleIds.map(p => [p, 0]));
      for (let i = 0; i < 6; i++) {
        const original = items.items[group * 6 + i], option = original.options[(mask >> i) & 1];
        answers[original.id] = option.id; expected[option.pole]++;
      }
      const result = complete(answers), pair = result.interactionPairs[group];
      expect(pair.counts).toEqual(expected);
      const max = Math.max(...Object.values(expected));
      expect(pair.leaders).toEqual(Object.keys(expected).filter(p => expected[p] === max).sort());
      expect(Object.values(pair.counts).reduce((a, b) => a + b, 0)).toBe(6);
      expect(Object.keys(result)).toEqual(["status", "answered", "interactionPairs"]);
      if (pair.leaders.length === 2) ties++;
    }
    expect(ties).toBe(80);
  });

  it("withholds all interpretation until 24 valid choices and rejects unsafe answer objects", () => {
    for (const q of data.questions) { const a = base(); delete a[q.id]; expect(scoreMiniCopingQuestionnaire(data, a).status).toBe("incomplete"); }
    for (const bad of [null, [], new Date(), true, { ...base(), extra: "A" }, ...["na", "1", "C", null, 1, NaN].map(v => ({ ...base(), [data.questions[0].id]: v }))]) expect(scoreMiniCopingQuestionnaire(data, bad).status).toBe("invalid");
    const getter = base(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get() { throw new Error("must not invoke"); } });
    expect(scoreMiniCopingQuestionnaire(data, getter).status).toBe("invalid");
    const symbol = { ...base(), [Symbol("hidden")]: "A" }; expect(scoreMiniCopingQuestionnaire(data, symbol).status).toBe("invalid");
    const hidden = base(); Object.defineProperty(hidden, data.questions[0].id, { value: "A", enumerable: false }); expect(scoreMiniCopingQuestionnaire(data, hidden).status).toBe("invalid");
    expect(scoreMiniCopingQuestionnaire(data, Object.assign(Object.create(null), base())).status).toBe("complete");
  });

  it("fails closed on sparse, reordered or semantically mismatched source configuration", () => {
    for (const mutate of [
      (q: typeof data) => { delete q.questions[1]; },
      (q: typeof data) => { delete q.questions[0].options[0]; },
      (q: typeof data) => { delete q.profiles[0].sections[0].paragraphs[0]; },
      (q: typeof data) => { delete q.directions[0]; },
      (q: typeof data) => { q.questions[0].options[0].directionId = "PRIVATE_PROCESSING"; },
      (q: typeof data) => { q.profiles[0].directionIds.reverse(); },
      (q: typeof data) => { q.source.psychometricValidationCompleted = true; },
      (q: typeof data) => { q.profiles[0].sections[1].id = q.profiles[0].sections[0].id; },
      (q: typeof data) => { q.resultHeading.en = ""; },
    ]) {
      const broken = structuredClone(data); mutate(broken);
      expect(isMiniCopingConfigurationValid(broken)).toBe(false);
      expect(scoreMiniCopingQuestionnaire(broken, base()).status).toBe("unavailable");
    }
  });

  it("renders all four complete paired guides and both tied poles in both languages", () => {
    const result = complete(base());
    if (!isMiniCopingConfigurationValid(data)) throw new Error("Unavailable source");
    for (const locale of ["en", "zh"] as const) {
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireCopingReport quiz={data} result={result} locale={locale} />), "text/html");
      expect(doc.querySelectorAll("[data-coping-pair]")).toHaveLength(4);
      expect(doc.querySelectorAll('[data-coping-tie="true"]')).toHaveLength(4);
      expect(doc.querySelectorAll("[data-coping-count]")).toHaveLength(8);
      let paragraphs = 0;
      for (const profile of data.profiles) for (const section of profile.sections) {
        const node = doc.getElementById(`coping-report-${profile.id}-${section.id}`)!;
        expect(node.querySelector("h4")?.textContent).toBe(section.title[locale]);
        expect([...node.querySelectorAll(":scope > ul > li, :scope > p")].map(p => p.textContent)).toEqual(section.paragraphs.map(p => p[locale]));
        paragraphs += section.paragraphs.length;
      }
      expect(paragraphs).toBe(64);
      const ids = [...doc.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      for (const element of doc.querySelectorAll("[aria-labelledby]")) for (const id of element.getAttribute("aria-labelledby")!.split(" ")) expect(doc.getElementById(id)).not.toBeNull();
      expect(doc.querySelectorAll("form, input, script")).toHaveLength(0);
    }
  });
});
