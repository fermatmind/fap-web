import type { Questionnaire, Text } from "./types";
import { scoreDataEntryRound, type DataEntryRound } from "./dataEntry";
import { readAfqt32Clock } from "./afqt32";

export const WRITTEN_COORDINATION_PARTS = ["entry", "cross-reference", "memory", "priority", "map", "summary"] as const;
export type WrittenCoordinationPart = typeof WRITTEN_COORDINATION_PARTS[number];
export type WrittenCoordinationMode = "timed" | "study";
export type WrittenCoordinationGrid = { columns: string[]; rows: number[]; north: string; edges: Record<string, string[]>; blockedEdges: string[][]; instructions: Text };
export type WrittenCoordinationQuiz = Questionnaire & {
  kind: "written-coordination";
  coordination: {
    entry: DataEntryRound;
    sections: { id: Exclude<WrittenCoordinationPart, "entry">; title: Text; timeCapMs: number }[];
    studyMs: 15000;
    memoryText: Text;
    priorityRule: Text;
    grid: WrittenCoordinationGrid;
  };
};
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v)
  && [Object.prototype, null].includes(Object.getPrototypeOf(v)) && Reflect.ownKeys(v).length === Object.keys(v).length;
const text = (v: unknown): v is Text => record(v) && typeof v.en === "string" && !!v.en.trim() && typeof v.zh === "string" && !!v.zh.trim();
const list = (v: unknown, count: number, predicate: (item: unknown, index: number) => boolean) => Array.isArray(v) && v.length === count && Array.from(v).every(predicate);
const node = (v: unknown): v is string => typeof v === "string" && /^[A-E][1-5]$/.test(v);
const nodePosition = (v: string) => [v.charCodeAt(0) - 65, Number(v[1]) - 1];
const closed = (a: string, b: string) => ["B2,B3", "C4,D4"].includes([a, b].sort().join(","));

export function isWrittenCoordinationGridValid(grid: unknown): grid is WrittenCoordinationGrid {
  if (!record(grid) || !list(grid.columns, 5, (v, i) => v === "ABCDE"[i]) || !list(grid.rows, 5, (v, i) => v === i + 1)
    || grid.north !== "row1" || !text(grid.instructions) || !record(grid.edges)
    || !list(grid.blockedEdges, 2, (v, i) => list(v, 2, (n, j) => n === [["B2", "B3"], ["C4", "D4"]][i][j]))) return false;
  const ids = Object.keys(grid.edges);
  if (ids.length !== 25 || !ids.every(node)) return false;
  const edges = grid.edges;
  return ids.every(a => {
    const p = nodePosition(a), expected = ids.filter(b => {
      const q = nodePosition(b);
      return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) === 1 && !closed(a, b);
    });
    return list(edges[a], expected.length, n => node(n) && expected.includes(n))
      && new Set(edges[a] as string[]).size === expected.length;
  });
}

export function writtenCoordinationDistance(grid: unknown, from: unknown, to: unknown): number | null {
  if (!isWrittenCoordinationGridValid(grid) || !node(from) || !node(to)) return null;
  const queue: [string, number][] = [[from, 0]], seen = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const [id, distance] = queue[i];
    if (id === to) return distance;
    for (const next of grid.edges[id]) if (!seen.has(next)) { seen.add(next); queue.push([next, distance + 1]); }
  }
  return null;
}

/** This fixed original edition does not inherit official test items, scoring or validation. */
export function isWrittenCoordinationConfigurationValid(q: unknown): q is WrittenCoordinationQuiz {
  if (!record(q) || q.kind !== "written-coordination" || q.slug !== "written-coordination-practice" || q.code !== "FM_WRITTEN_COORDINATION32_30"
    || q.version !== "fm_written_coordination32_30_v1" || !record(q.source) || q.source.formCode !== q.version
    || q.source.kind !== "fermatmind_original_written_coordination_entry32_mcq30"
    || q.source.itemBankVersion !== "original32_fourfield_cards_and30_english_questions_v1"
    || q.source.scoringVersion !== "separate_exact_entry60s_and5x6_CWU_site_caps_or_study_v1"
    || q.source.resultContentVersion !== "six_full_bilingual_written_coordination_guides_v1"
    || q.source.psychometricValidationCompleted !== false || typeof q.source.itemBankSha256 !== "string" || !/^[a-f0-9]{64}$/.test(q.source.itemBankSha256)
    || typeof q.source.resultContentSha256 !== "string" || !/^[a-f0-9]{64}$/.test(q.source.resultContentSha256)
    || ![q.title, q.seoTitle, q.description, q.instructions, q.introduction, q.resultHeading].every(text)
    || !record(q.coordination) || q.coordination.studyMs !== 15000 || !text(q.coordination.memoryText) || !text(q.coordination.priorityRule)
    || !isWrittenCoordinationGridValid(q.coordination.grid) || !record(q.coordination.entry)) return false;
  const entry = q.coordination.entry;
  if (entry.id !== "entry" || entry.profileId !== "entry" || !list(entry.fields, 4, record) || !list(entry.records, 32, record)
    || !Array.from(entry.records as unknown[]).every(r => record(r) && list(r.values, 4, v => typeof v === "string"))) return false;
  if (scoreDataEntryRound(entry as unknown as DataEntryRound, [], 60000).status !== "complete") return false;
  if (!list(q.coordination.sections, 5, (s, i) => record(s) && s.id === WRITTEN_COORDINATION_PARTS[i + 1] && text(s.title) && s.timeCapMs === (i === 1 ? 120000 : 180000))) return false;
  if (!list(q.directions, 6, (d, i) => record(d) && d.id === WRITTEN_COORDINATION_PARTS[i] && text(d.title) && d.itemCount === (i === 0 ? 32 : 6))) return false;
  if (!list(q.questions, 30, (item, i) => record(item) && item.id === `WC_${["REF", "MEM", "PRI", "MAP", "SUM"][Math.floor(i / 6)]}_${String(i % 6 + 1).padStart(2, "0")}` && text(item.prompt) && text(item.explanation)
    && typeof item.correctOptionId === "string" && /^[A-D]$/.test(item.correctOptionId) && item.reverse === false
    && list(item.options, 4, (o, j) => record(o) && o.id === "ABCD"[j] && o.directionId === WRITTEN_COORDINATION_PARTS[Math.floor(i / 6) + 1] && o.score === undefined && text(o.label)))) return false;
  if (new Set((q.questions as { id: string }[]).map(item => item.id)).size !== 30) return false;
  if (!list(q.profiles, 6, (p, i) => record(p) && p.id === WRITTEN_COORDINATION_PARTS[i] && list(p.directionIds, 1, id => id === p.id)
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && record(p.seo) && text(p.seo.title) && text(p.seo.description)
    && list(p.sections, 7, s => record(s) && typeof s.id === "string" && !!s.id && text(s.title) && list(s.paragraphs, 2, text))
    && new Set((p.sections as { id: string }[]).map(s => s.id)).size === 7)) return false;
  return list(q.guide, 4, (s, i) => record(s) && s.id === ["method", "timing", "scoring", "use"][i] && text(s.title) && list(s.paragraphs, 2, text))
    && list(q.faq, 6, f => record(f) && text(f.question) && text(f.answer))
    && list(q.references, 3, (r, i) => record(r) && text(r.title) && r.url === [
      "https://applicant.testgenius.com/knowledgebase/criticall",
      "https://criticall911.com/hubfs/Criticall-Website-Files/CritiCall_Candidate_Test_Preparation_Guide_2023.pdf",
      "https://criticall911.com/company/news/criticall-dispatcher-applicant",
    ][i]);
}

export const readWrittenCoordinationClock = readAfqt32Clock;
export type WrittenCoordinationReadout = {
  id: Exclude<WrittenCoordinationPart, "entry">;
  mode: WrittenCoordinationMode;
  reason: "finished" | "expired";
  elapsedMs: number;
  studyElapsedMs: number;
  correct: number;
  wrong: number;
  unanswered: number;
  total: 6;
  items: { id: string; outcome: "correct" | "wrong" | "unanswered" }[];
};

/** Separate six-item records; no total across modules or retained selected response text. */
export function scoreWrittenCoordinationModule(q: unknown, part: unknown, attempt: unknown):
  { status: "unavailable" | "invalid" } | { status: "complete"; result: WrittenCoordinationReadout } {
  if (!isWrittenCoordinationConfigurationValid(q)) return { status: "unavailable" };
  const section = q.coordination.sections.find(s => s.id === part);
  if (!section || !record(attempt) || Object.keys(attempt).some(k => !["mode", "reason", "elapsedMs", "studyElapsedMs", "answers"].includes(k))
    || typeof attempt.mode !== "string" || !["timed", "study"].includes(attempt.mode) || typeof attempt.reason !== "string" || !["finished", "expired"].includes(attempt.reason)
    || typeof attempt.elapsedMs !== "number" || !Number.isFinite(attempt.elapsedMs) || attempt.elapsedMs < 0
    || typeof attempt.studyElapsedMs !== "number" || !Number.isFinite(attempt.studyElapsedMs) || attempt.studyElapsedMs < 0 || !record(attempt.answers)) return { status: "invalid" };
  if (attempt.mode === "study" ? attempt.reason !== "finished" || attempt.elapsedMs !== 0 || attempt.studyElapsedMs !== 0
    : (attempt.reason === "expired" ? attempt.elapsedMs < section.timeCapMs : attempt.elapsedMs >= section.timeCapMs)
      || (part === "memory" ? attempt.studyElapsedMs < q.coordination.studyMs : attempt.studyElapsedMs !== 0)) return { status: "invalid" };
  const questions = q.questions.filter(item => item.options[0].directionId === part), answers = attempt.answers;
  if (Object.entries(answers).some(([id, value]) => !questions.some(item => item.id === id && typeof value === "string" && (value === "skip" || item.options.some(o => o.id === value))))) return { status: "invalid" };
  const items = questions.map(item => ({ id: item.id, outcome: answers[item.id] === undefined || answers[item.id] === "skip" ? "unanswered" as const : answers[item.id] === item.correctOptionId ? "correct" as const : "wrong" as const }));
  return { status: "complete", result: { id: section.id, mode: attempt.mode as WrittenCoordinationMode, reason: attempt.reason as "finished" | "expired", elapsedMs: attempt.elapsedMs, studyElapsedMs: attempt.studyElapsedMs,
    correct: items.filter(item => item.outcome === "correct").length, wrong: items.filter(item => item.outcome === "wrong").length, unanswered: items.filter(item => item.outcome === "unanswered").length, total: 6, items } };
}
