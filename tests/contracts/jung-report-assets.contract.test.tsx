import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  archetypeAssets,
  commonAssets,
  buildReportView,
  makePreviewScores,
  interpretJungScores,
} from "@/components/result/jung/jungReportAssets";
import careerData from "@/components/result/jung/assets/careers.json";
import { JungReportPreview } from "@/components/result/jung/JungReportPreview";

const allScores = (score: number) =>
  Object.fromEntries(archetypeAssets.map((asset) => [asset.id, score]));
describe("twelve-archetype replacement report", () => {
  it("covers all seven modules for every archetype and resolves every career and image", () => {
    expect(new Set(archetypeAssets.map((asset) => asset.id)).size).toBe(12);
    expect(
      archetypeAssets.reduce((n, asset) => n + asset.careerLinks.length, 0),
    ).toBe(60);
    const intros = new Set<string>();
    for (const asset of archetypeAssets) {
      intros.add(asset.profile.intro);
      expect(asset.profile.story).toHaveLength(2);
      expect(asset.profile.traits).toHaveLength(4);
      expect(asset.profile.signature).toHaveLength(3);
      expect(asset.evidenceItems).toHaveLength(4);
      expect(asset.dimension.reading.length).toBeGreaterThan(35);
      expect(asset.deep.traits).toHaveLength(4);
      expect(asset.deep.growth).toHaveLength(4);
      expect(asset.work.paragraphs).toHaveLength(6);
      expect(asset.relationship.paragraphs).toHaveLength(3);
      expect(asset.work.growth).toHaveLength(4);
      expect(asset.relationship.growth).toHaveLength(4);
      expect(asset.actions).toHaveLength(5);
      for (const [title, body] of asset.actions) {
        expect(title.length).toBeGreaterThan(4);
        expect(body.trim()).not.toBe("");
      }
      expect(asset.careerLinks).toHaveLength(5);
      for (const link of asset.careerLinks)
        expect(careerData.careers.some((row) => row.slug === link.slug)).toBe(
          true,
        );
      expect(
        existsSync(join(process.cwd(), "public", asset.illustration)),
      ).toBe(true);
    }
    expect(intros.size).toBe(12);
    expect(Object.keys(commonAssets.states)).toHaveLength(4);
    expect(
      existsSync(join(process.cwd(), "public", commonAssets.ai.illustration)),
    ).toBe(true);
    expect(
      existsSync(
        join(process.cwd(), "components/result/jung/jungReportPreviewData.ts"),
      ),
    ).toBe(false);
  });
  it("preserves backend exact ties and near leaders without inventing one winner", () => {
    const scores = { ...allScores(25), hero: 100, sage: 100, explorer: 93.75 };
    const result = interpretJungScores(scores);
    expect(result.primary).toEqual(["hero", "sage"]);
    expect(result.secondary).toEqual([]);
    expect(result.nearLeaders).toEqual(["hero", "sage", "explorer"]);
    expect(result.state).toBe("tied");
    expect(interpretJungScores({ ...scores, sage: 93.75 }).state).toBe("near");
    expect(
      interpretJungScores({ ...scores, sage: 87.5, explorer: 87.5 }).secondary,
    ).toEqual(["sage", "explorer"]);
  });
  it("does not turn a flat profile into a primary or erase a tie at third place", () => {
    const flat = interpretJungScores({ ...allScores(62.5), hero: 56.25 });
    expect(flat.primary).toEqual([]);
    expect(flat.state).toBe("flat");
    expect(flat.readingIds).toHaveLength(12);
    const ties = interpretJungScores({
      ...allScores(25),
      hero: 100,
      sage: 93.75,
      explorer: 87.5,
      creator: 87.5,
      ruler: 87.5,
    });
    expect(ties.readingIds).toEqual([
      "hero",
      "sage",
      "explorer",
      "creator",
      "ruler",
    ]);
  });
  it("rejects missing, foreign, nonfinite and off-grid score inputs", () => {
    for (const bad of [
      { hero: 100 },
      { ...allScores(50), hero: NaN },
      { ...allScores(50), hero: 51 },
      { ...allScores(50), hero: 101 },
      { ...allScores(50), foreign: 50 },
    ])
      expect(() => interpretJungScores(bad)).toThrow();
  });
  it.each(archetypeAssets.map((asset) => [asset.id, asset.name]))(
    "renders replacement %s content in all report modules",
    (id, name) => {
      for (const state of ["clear", "near", "tied", "flat"] as const) {
        const view = buildReportView(makePreviewScores(id, state), id);
        expect(view.result.state).toBe(state);
        expect(view.actions).toHaveLength(5);
        expect(view.careers.length).toBeGreaterThanOrEqual(5);
        expect(view.prompt).not.toMatch(/\{scores\}|\{state\}/);
      }
      const html = renderToStaticMarkup(
        <JungReportPreview initialArchetype={id} />,
      );
      const root = document.createElement("div");
      root.innerHTML = html;
      expect(root.querySelector("#profile h2")?.textContent).toBe(name);
      expect(root.querySelectorAll("#careers article")).toHaveLength(5);
      expect(root.querySelectorAll("#actions input")).toHaveLength(5);
      expect(html).toContain(
        archetypeAssets.find((asset) => asset.id === id)!.work.intro,
      );
      expect(html).not.toContain("ias-researcher");
      expect(root.querySelector("#ai img")?.getAttribute("src")).toContain(
        "shared-reflection",
      );
    },
  );
  it("uses the score-authoritative single leader even if a different reference is selected", () => {
    const view = buildReportView({ ...allScores(25), hero: 100 }, "sage");
    expect(view.profile.primaryId).toBe("hero");
    expect(view.sections[0].intro).toBe(
      archetypeAssets.find((asset) => asset.id === "hero")!.work.intro,
    );
  });
  it("keeps the preview development-only and validates query selections", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/(localized)/[locale]/(app)/dev/jung-report/page.tsx",
      ),
      "utf8",
    );
    expect(source).toContain('process.env.NODE_ENV !== "development"');
    expect(source).toContain("Object.hasOwn(commonAssets.states, pattern)");
  });
});
