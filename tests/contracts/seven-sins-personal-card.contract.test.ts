import { describe, expect, it } from "vitest";
import quiz from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { scoreMiniVirtuesQuestionnaire, type MiniVirtuesDualResult } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsCardRows } from "@/lib/questionnaires/sevenSinsCard";

function completed(option: string) {
  return scoreMiniVirtuesQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(question => [question.id, option]))) as MiniVirtuesDualResult;
}
describe("personal sins and virtues image data", () => {
  it("keeps all 14 independent scores and all seven leaders on each side when tied", () => {
    const rows = sevenSinsCardRows(completed("3"))!;
    expect(rows).toHaveLength(7);
    expect(rows.every(row => row.scores.sin === 50 && row.scores.virtue === 50 && row.leadingSin && row.leadingVirtue)).toBe(true);
    expect(sevenSinsCardRows(completed("5"))!.every(row => row.scores.sin === 100 && row.scores.virtue === 100)).toBe(true);
  });
  it("binds by identity rather than result order, retains fractional scores and separate leaders", () => {
    const result = completed("1");
    result.miniVirtues[0].sin = 87.5;
    result.miniVirtues[1].sin = 87.5;
    result.miniVirtues[5].virtue = 75;
    result.miniVirtues.reverse();
    const rows = sevenSinsCardRows(result)!;
    expect(rows.filter(row => row.leadingSin).map(row => row.sin.en)).toEqual(["Pride", "Greed"]);
    expect(rows.filter(row => row.leadingVirtue).map(row => row.virtue.en)).toEqual(["Patience"]);
    expect(rows[0].scores.sin).toBe(87.5);
    expect(Object.keys(rows[0]).some(key => /answer|question/i.test(key))).toBe(false);
  });
  it("rejects partial, duplicated or nonfinite score data instead of making an image", () => {
    const result = completed("3");
    expect(sevenSinsCardRows({ ...result, answered: 27 } as unknown as MiniVirtuesDualResult)).toBeNull();
    expect(sevenSinsCardRows({ ...result, miniVirtues: result.miniVirtues.slice(1) })).toBeNull();
    expect(sevenSinsCardRows({ ...result, miniVirtues: Array(7).fill(result.miniVirtues[0]) })).toBeNull();
    result.miniVirtues[0].sin = NaN;
    expect(sevenSinsCardRows(result)).toBeNull();
  });
});
