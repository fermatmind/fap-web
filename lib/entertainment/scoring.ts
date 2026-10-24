import type { Answers, FunQuiz } from "./types";

// Pure, reproducible story rules. No network, random choice, or core-test inference.
export function resolveFunQuiz(quiz: FunQuiz, answers: Answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers) || Object.entries(answers).some(([id, answer]) => !quiz.questions.some(q => q.id === id && q.options.some(o => o.id === answer)))) throw new Error("Invalid answers");
  const scores = Object.fromEntries(quiz.results.map(result => [result.id, 0]));
  const path: string[] = [];
  let question = quiz.questions[0];
  let branchResult: string | undefined;
  while (question) {
    if (path.includes(question.id)) throw new Error("Cyclic story");
    path.push(question.id);
    const selected = answers[question.id];
    if (!selected) return { path, scores, complete: false, resultIds: [] as string[] };
    const option = question.options.find(candidate => candidate.id === selected);
    if (!option) throw new Error("Invalid answer");
    for (const [id, points] of Object.entries(option.points ?? {})) {
      if (!(id in scores) || !Number.isFinite(points)) throw new Error("Invalid scoring reference");
      scores[id] += points;
    }
    if (quiz.mechanism === "branch") {
      if (option.result) {
        branchResult = option.result;
        break;
      }
      const next = quiz.questions.find(candidate => candidate.id === option.next);
      if (!next) throw new Error("Invalid branch");
      question = next;
    } else {
      question = quiz.questions[path.length];
    }
  }
  const maximum = Math.max(...Object.values(scores));
  const resultIds = branchResult ? [branchResult] : quiz.tieOrder.filter(id => scores[id] === maximum);
  if (!resultIds.length || resultIds.some(id => !quiz.results.some(result => result.id === id))) throw new Error("Invalid result");
  return { path, scores, complete: true, resultIds };
}

export function readFunDraft(quiz: FunQuiz, raw: string | null, now = Date.now()): Answers | null {
  if (!raw || raw.length > 20000) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version !== quiz.version || !Number.isFinite(value.savedAt) || now - value.savedAt >= 86400000 || value.savedAt > now || !value.answers || typeof value.answers !== "object" || Array.isArray(value.answers)) return null;
    const entries = Object.entries(value.answers);
    if (entries.some(([id, answer]) => !quiz.questions.some(question => question.id === id && question.options.some(option => option.id === answer)))) return null;
    resolveFunQuiz(quiz, value.answers);
    return value.answers as Answers;
  } catch { return null; }
}
