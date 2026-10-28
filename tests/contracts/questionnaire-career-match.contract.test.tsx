import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CareerMatchClient } from "@/components/questionnaires/CareerMatchClient";
import { CAREER_MATCH_INPUT_RULES, isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { careerMatchDirectoryFixture, careerMatchRoleFixture } from "@/tests/fixtures/questionnaires/careerMatch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerInterestComparisonRole } from "@/lib/career/api/fetchCareerInterestComparisonRole";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("@/lib/career/api/fetchCareerJobIndex", () => ({ fetchCareerJobIndex: vi.fn() }));
vi.mock("@/lib/career/api/fetchCareerInterestComparisonRole", () => ({ fetchCareerInterestComparisonRole: vi.fn() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/career-match.json", "utf8")) as Questionnaire;
const H = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
function responses(locale: "en" | "zh") {
  vi.mocked(fetchCareerJobIndex).mockResolvedValue(careerMatchDirectoryFixture(locale));
  vi.mocked(fetchCareerInterestComparisonRole).mockImplementation(async ({ slug }) => careerMatchRoleFixture(locale, slug, slug.endsWith("a") ? "ASE" : "RIC"));
}
async function start(locale: "en" | "zh") {
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Start comparison" : "开始比较" }));
  await screen.findByLabelText(locale === "en" ? "Occupation 1" : "职业1");
}
function pick() { for (const [i, suffix] of [[0, "a"], [1, "b"]]) fireEvent.change(document.getElementById(`career-match-role-${i}`)!, { target: { value: `contract-role-${suffix}` } }); }

describe("original Career Match tool, reusing the interest construct and published careers", () => {
  it("binds the input rule and bilingual guidance without inventing a questionnaire or result types", () => {
    expect(isCareerMatchConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual([]); expect(quiz.profiles).toEqual([]);
    expect(quiz.source.itemBankSha256).toBe(H(CAREER_MATCH_INPUT_RULES));
    expect(quiz.source.resultContentSha256).toBe(H(Object.fromEntries(["directions", "guide", "faq", "instructions", "resultHeading"].map(k => [k, quiz[k as keyof Questionnaire]]))));
    expect(scoreQuestionnaire(quiz, {})).toEqual({ status: "unavailable", answered: 0 });
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const mutate of [(q: Questionnaire) => { q.directions.pop(); }, (q: Questionnaire) => { q.directions[0].id = "IQ"; }, (q: Questionnaire) => { q.source.formCode = "other"; }, (q: Questionnaire) => { q.guide[0].paragraphs = []; }, (q: Questionnaire) => { q.references![0].url = "javascript:alert(1)"; }]) {
      const bad = structuredClone(quiz); mutate(bad); expect(isCareerMatchConfigurationValid(bad)).toBe(false);
      expect(renderToStaticMarkup(<CareerMatchClient quiz={bad} locale="en" />)).not.toContain("<button");
    }
  });
  it.each(["en", "zh"] as const)("%s: reads only after Start, requires explicit input, shows shared/absent themes and all source text", async locale => {
    responses(locale); const before = vi.mocked(fetchCareerJobIndex).mock.calls.length;
    const { container } = render(<CareerMatchClient quiz={quiz} locale={locale} />);
    expect(vi.mocked(fetchCareerJobIndex).mock.calls.length).toBe(before);
    await start(locale);
    const compare = () => fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Compare interest themes" : "查看主题比较" }));
    compare(); expect(container.querySelector("[data-career-match-message]")).toHaveTextContent(locale === "en" ? "at least one" : "至少选择");
    for (const id of ["A", "S"]) fireEvent.click(container.querySelector(`[data-interest-theme='${id}']`)!);
    compare(); expect(container.querySelector("[data-career-match-message]")).toHaveTextContent(locale === "en" ? "different occupations" : "不同职业");
    pick(); compare(); await waitFor(() => expect(container.querySelectorAll("[data-career-read-status='available']")).toHaveLength(2));
    await waitFor(() => expect(container.querySelector("#career-match-result-title")).toHaveFocus());
    const rows = container.querySelectorAll("[data-career-match-role]");
    expect(rows[0].getAttribute("data-career-match-role")).toBe("contract-role-a");
    expect(rows[0].querySelector("[data-career-shared-themes]")).toHaveTextContent(quiz.directions[2].title[locale]);
    expect(rows[0].querySelector("[data-career-shared-themes]")).toHaveTextContent(quiz.directions[3].title[locale]);
    expect(rows[1].querySelector("[data-career-shared-themes]")).toHaveTextContent(locale === "en" ? "No shared selected theme" : "没有共同");
    const source = careerMatchRoleFixture(locale).career_page.display.components.riasec_fit_block;
    for (const copy of [source.interest, source.fit_interest, source.riasec_short]) expect(rows[0]).toHaveTextContent(copy);
    expect(rows[0].querySelector("a")?.getAttribute("href")).toBe(`/${locale}/career/jobs/contract-role-a`);
    for (const d of quiz.directions) if (!container.querySelector<HTMLInputElement>(`[data-interest-theme='${d.id}']`)!.checked) fireEvent.click(container.querySelector(`[data-interest-theme='${d.id}']`)!);
    fireEvent.change(document.getElementById("career-match-role-2")!, { target: { value: "contract-role-c" } });
    compare(); await waitFor(() => expect(container.querySelectorAll("[data-career-read-status='available']")).toHaveLength(3));
    expect(container.querySelectorAll("[data-interest-theme]:checked")).toHaveLength(6);
    const calls = vi.mocked(fetchCareerInterestComparisonRole).mock.calls.length;
    fireEvent.change(document.getElementById("career-match-filter")!, { target: { value: "PRIVATE_TITLE_FILTER" } });
    expect(vi.mocked(fetchCareerInterestComparisonRole).mock.calls.length).toBe(calls);
    expect(window.location.search + window.location.hash).toBe("");
    fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Clear and compare again" : "清除并重新比较" }));
    expect(container.querySelector("[data-career-match-result]")).toBeNull(); expect(container.querySelector("#career-match-filter")).toBeNull();
    expect(container.querySelectorAll("[data-interest-theme]:checked")).toHaveLength(0);
  });
  it("keeps empty list, failed list, unavailable component and transport error distinct; ignores late reads", async () => {
    vi.mocked(fetchCareerJobIndex).mockRejectedValueOnce(new Error("transport")).mockResolvedValue(careerMatchDirectoryFixture("en", []));
    const { container, rerender } = render(<CareerMatchClient quiz={quiz} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Start comparison" })); await screen.findByText(/list for this language is unavailable/);
    fireEvent.click(screen.getByRole("button", { name: "Retry reading the career list" })); await screen.findByText(/no public occupations/);
    fireEvent.click(screen.getByRole("button", { name: "Exit and clear this comparison" }));
    expect(screen.getByRole("button", { name: "Start comparison" })).toBeInTheDocument();
    // A locale remount clears the whole memory-only attempt, including a pending public read.
    rerender(<CareerMatchClient quiz={quiz} locale="zh" />); expect(screen.getByRole("button", { name: "开始比较" })).toBeInTheDocument();
    responses("zh"); await start("zh"); pick(); fireEvent.click(container.querySelector("[data-interest-theme='A']")!);
    vi.mocked(fetchCareerInterestComparisonRole).mockImplementation(async ({ slug }) => { if (slug.endsWith("b")) throw new Error("transport"); return null; });
    fireEvent.click(screen.getByRole("button", { name: "查看主题比较" })); await screen.findByText(/比较尚不完整/);
    expect(container.querySelectorAll("[data-career-read-status='missing']")).toHaveLength(1); expect(container.querySelectorAll("[data-career-read-status='error']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-career-shared-themes]")).toHaveLength(0);
    vi.mocked(fetchCareerInterestComparisonRole).mockResolvedValue({ bundle_kind: "legacy" } as never);
    fireEvent.click(screen.getByRole("button", { name: "查看主题比较" }));
    await waitFor(() => expect(container.querySelectorAll("[data-career-read-status='invalid']")).toHaveLength(2));
    let resolve!: (value: ReturnType<typeof careerMatchRoleFixture>) => void;
    vi.mocked(fetchCareerInterestComparisonRole).mockImplementation(({ slug }) => slug.endsWith("a") ? new Promise(r => { resolve = r; }) : Promise.resolve(careerMatchRoleFixture("zh", slug)));
    fireEvent.click(screen.getByRole("button", { name: "查看主题比较" }));
    fireEvent.click(container.querySelector("[data-interest-theme='S']")!);
    await act(async () => { resolve(careerMatchRoleFixture("zh")); });
    expect(container.querySelector("[data-career-match-result]")).toBeNull();
    expect(screen.getByRole("button", { name: "查看主题比较" })).toBeEnabled();
  });
  it("copies only the public entry and supports clipboard denial without sending inputs or retaining a draft", async () => {
    responses("en"); const setItem = vi.spyOn(Storage.prototype, "setItem"), writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { container } = render(<CareerMatchClient quiz={quiz} locale="en" />); await start("en"); pick(); fireEvent.click(container.querySelector("[data-interest-theme='A']")!);
    fireEvent.click(screen.getByRole("button", { name: "Compare interest themes" })); await waitFor(() => expect(container.querySelectorAll("[data-career-read-status='available']")).toHaveLength(2));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy public entry" })));
    const expected = `${quiz.title.en}\nhttps://fermatmind.com/en/tests/explore/career-match`;
    expect(writeText).toHaveBeenCalledWith(expected); expect(screen.getByLabelText("Public entry for manual copying")).toHaveValue(expected); expect(expected).not.toContain("contract-role");
    expect(setItem).not.toHaveBeenCalled(); act(() => window.dispatchEvent(new Event("pagehide")));
    expect(container.querySelector("[data-career-match-result]")).toBeNull(); expect(container.querySelector("textarea")).toBeNull();
  });
});
