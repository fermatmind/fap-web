import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, existsSync } from "node:fs";
import { DiscResultDesignPreview } from "@/components/result/disc/DiscResultDesignPreview";
import { discDirections, discPreviewProfiles, findDiscPreviewProfile, isDiscPreviewScoreValid } from "@/components/result/disc/discPreviewProfiles";
import { discSharedEvidence } from "@/components/result/disc/discPreviewContent";
import bank from "@/lib/questionnaires/data/disc.json";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function reachableScores() {
  let states = new Set(["0,0,0,0"]);
  for (const question of bank.questions) {
    const next = new Set<string>();
    for (const state of states) for (const option of question.options) {
      const counts = state.split(",").map(Number);
      const index = discDirections.findIndex(direction => direction.id === option.directionId);
      counts[index]++;
      next.add(counts.join(","));
    }
    states = next;
  }
  return states;
}

describe("local DISC full-result design candidates", () => {
  const reachable = reachableScores();

  it("covers exactly the fifteen authoritative identities and all reachable scoring categories", () => {
    expect(discPreviewProfiles.map(profile => profile.id).sort()).toEqual(bank.profiles.map(profile => profile.id).sort());
    expect(reachable.size).toBe(1289);
    for (const state of reachable) {
      const counts = state.split(",").map(Number);
      const maximum = Math.max(...counts);
      const leaderIds = discDirections.filter((_, index) => counts[index] === maximum).map(direction => direction.id);
      const source = bank.profiles.find(profile => [...profile.directionIds].sort().join() === [...leaderIds].sort().join());
      const candidate = findDiscPreviewProfile(source?.id);
      expect(candidate).toBeDefined();
      expect(isDiscPreviewScoreValid(Object.fromEntries(discDirections.map((direction, index) => [direction.id, counts[index]])), candidate!.leaders)).toBe(true);
    }
  });

  it.each(discPreviewProfiles)("$id has complete distinct content, a reachable sample and its own illustration", profile => {
    const content = profile.content;
    expect(reachable.has(profile.counts.join(","))).toBe(true);
    expect(isDiscPreviewScoreValid(profile.scores, profile.leaders)).toBe(true);
    expect(content.tags).toHaveLength(3);
    expect(content.portrait).toHaveLength(5);
    expect(content.strengths).toHaveLength(5);
    expect(content.edges).toHaveLength(4);
    expect(content.work).toHaveLength(2);
    expect(content.relationships).toHaveLength(2);
    expect(content.careers).toHaveLength(8);
    expect(new Set(content.careers.map(item => item.title)).size).toBe(8);
    expect(new Set(content.portrait).size).toBe(5);
    for (const paragraph of [...content.portrait, ...content.work, ...content.relationships]) expect(paragraph.length).toBeGreaterThan(25);
    for (const item of [...content.strengths, ...content.edges]) expect(item.body.length).toBeGreaterThan(20);
    for (const value of Object.values(content.experiment)) expect(value.length).toBeGreaterThan(8);
    expect(existsSync(`public${profile.artwork}`)).toBe(true);
    const html = renderToStaticMarkup(<DiscResultDesignPreview profileId={profile.id} counts={profile.scores} />);
    expect(html).toContain(content.title);
    expect(html).toContain(content.experiment.title);
    expect(html).toContain(content.careers[7].detail);
    expect(html).toContain("科学依据");
    expect((html.match(/data-leading="true"/g) ?? []).length).toBe(profile.leaders.length);
    expect(html.includes('id="others-title"')).toBe(profile.leaders.length < 4);
    for (const source of discSharedEvidence.sources) expect(html).toContain(source.url);
    expect(html).not.toContain("关于这次结果，你可能还想知道");
    expect(html).not.toContain("The Initiator");
  });

  it("does not show a D interpretation for unknown, incomplete, invalid or mismatched scores", () => {
    expect(findDiscPreviewProfile("__proto__")).toBeUndefined();
    expect(findDiscPreviewProfile(["single-i"])).toBeUndefined();
    const profile = findDiscPreviewProfile("single-d")!;
    for (const scores of [{}, { ...profile.scores, DOMINANCE: 13 }, { ...profile.scores, DOMINANCE: 7 }, { DOMINANCE: 8, INFLUENCE: 8, STEADINESS: 4, CONSCIENTIOUSNESS: 4 }]) {
      const html = renderToStaticMarkup(<DiscResultDesignPreview profileId="single-d" counts={scores} />);
      expect(html).toContain("当前示例数据无法展示");
      expect(html).not.toContain("你的行为画像");
    }
  });

  it("uses the shared sample route with development-only design controls", () => {
    const route = readFileSync("app/(localized)/[locale]/reports/samples/[test]/page.tsx", "utf8");
    expect(route).toContain('if (test === "disc")');
    expect(route).toContain('mode={process.env.NODE_ENV === "development" ? "preview" : "sample"}');
    expect(route).toContain("if (!profile) notFound()");
    expect(discSharedEvidence.science).toHaveLength(4);
    expect(new Set(discPreviewProfiles.map(profile => profile.content.headline)).size).toBe(15);
    expect(new Set(discPreviewProfiles.map(profile => profile.content.experiment.title)).size).toBe(15);
    expect(new Set(discPreviewProfiles.map(profile => profile.artwork)).size).toBe(15);
  });
});
