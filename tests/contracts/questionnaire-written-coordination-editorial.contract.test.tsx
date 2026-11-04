import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/written-coordination-practice.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { WrittenCoordinationQuiz } from "@/lib/questionnaires/writtenCoordination";
import { scoreWrittenCoordinationModule } from "@/lib/questionnaires/writtenCoordination";
import { scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import { WrittenCoordinationPage } from "@/components/questionnaires/WrittenCoordinationPage";
import { writtenLandingSections, writtenLandingFaq } from "@/components/questionnaires/WrittenCoordinationLandingEditorial";
const quiz = raw as WrittenCoordinationQuiz;
describe("Written coordination editorial preserves task conditions and full bilingual readings", () => {
  it("checks the worked field fraction and keeps wrong and unanswered apart", () => {
    const card = quiz.coordination.entry.records[0];
    const r = scoreDataEntryRound(quiz.coordination.entry, [{ recordId: card.id, values: [card.values[0] + "X", ...card.values.slice(1)] }], 60000);
    expect(r).toMatchObject({ status: "complete", exactFields: 3, consideredFields: 4, exactRecords: 0, fieldAccuracy: 75 });
    const qs = quiz.questions.slice(0, 6), answers = Object.fromEntries(qs.slice(0, 4).map(q => [q.id, q.correctOptionId]));
    answers[qs[4].id] = qs[4].options.find(o => o.id !== qs[4].correctOptionId)!.id;
    expect(scoreWrittenCoordinationModule(quiz, "cross-reference", { mode: "study", reason: "finished", elapsedMs: 0, studyElapsedMs: 0, answers })).toMatchObject({ status: "complete", result: { correct: 4, wrong: 1, unanswered: 1, total: 6 } });
  });
  it.each(["en", "zh"] as const)("renders original and new chapters without abridgement in %s", locale => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<WrittenCoordinationPage quiz={quiz} locale={locale} />);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim(), body = norm(dom.textContent ?? "");
    expect(writtenLandingSections).toHaveLength(8); expect(writtenLandingFaq).toHaveLength(8);
    for (const s of [...quiz.guide, ...writtenLandingSections]) for (const p of s.paragraphs) expect(body).toContain(norm(p[locale]));
    for (const f of [...quiz.faq, ...writtenLandingFaq]) expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="written-faq"] > div')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="written-guide-library"] > ul > li')).toHaveLength(6);
    expect(dom.querySelectorAll('[data-written-full-guide]')).toHaveLength(6);
    for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(body).toContain(norm(t[locale]));
    expect(dom.querySelector('.explore-intro input:not([type="hidden"]), .explore-intro aside')).toBeNull();
    expect(dom.querySelector('input[type="checkbox"], input[required]')).toBeNull();
    for (const n of [1, 2, 3]) { expect(dom.querySelector(`a[href="#written-reference-${n}"]`)).not.toBeNull(); expect(dom.querySelector(`#written-reference-${n}`)).not.toBeNull(); }
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
  });
});
