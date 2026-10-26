export type Locale = "en" | "zh";
export type Choice = 0 | 1;
export type Question = { id: string; category: string; en: { prompt: string; options: [string, string] }; zh: { prompt: string; options: [string, string] } };
export type Pack = { version: string; categories: Record<string, Record<Locale, string>>; questions: Question[] };
export type Entry = { id: string; nickname: string; correct: number; categories: Record<string, { correct: number; total: number }>; hidden: boolean };
export type Challenge = { id: string; nickname: string; locale: Locale; version: string; questions: Question[]; entries: Entry[]; answers?: Choice[]; closed: boolean; expires_at: string };
export type Result = { id?: string; nickname: string; correct: number; total: number; percent: number; categories: Record<string, { correct: number; total: number }>; answers: Choice[]; guesses: Choice[]; preview: boolean; entries: Entry[] };
export const CATEGORIES: Pack["categories"] = { food: { en: "Food", zh: "美食" }, connection: { en: "Connection", zh: "相处" }, play: { en: "Fun & movement", zh: "玩乐与运动" }, reflection: { en: "Real talk", zh: "真心话" }, personality: { en: "Personal style", zh: "个人风格" }, daily: { en: "Daily life", zh: "日常" } };
export const LENGTHS = [30, 60, 90, 120, 150] as const;
export const PUBLIC_PATH = "/tests/friendship-quiz";
export const RESOURCE_PATHS = ["", "/questions", "/how-to-play", "/scores"] as const;
export function secret(): string { return Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join(""); }
export function shuffled<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) { const n = crypto.getRandomValues(new Uint32Array(1))[0]; const j = n % (i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function selectQuestions(pack: Pack, size: number, exclude: string[] = [], first?: string): Question[] {
  if (!(LENGTHS as readonly number[]).includes(size)) throw new Error("Unsupported length");
  const groups = Object.keys(pack.categories).map(category => {
    const pool = pack.questions.filter(q => q.category === category);
    const fresh = shuffled(pool.filter(q => !exclude.includes(q.id)));
    return [...fresh, ...shuffled(pool.filter(q => exclude.includes(q.id)))].slice(0, size / 6);
  });
  if (groups.some(g => g.length !== size / 6)) throw new Error("Question bank unavailable");
  const result = shuffled(groups.flat());
  return first ? [...result.filter(q => q.category === first), ...result.filter(q => q.category !== first)] : result;
}
export function swapQuestion(pack: Pack, questions: Question[], index: number, seen: string[]): Question | null {
  return shuffled(pack.questions.filter(q => q.category === questions[index].category && !questions.some(item => item.id === q.id) && !seen.includes(q.id)))[0] ?? null;
}
export function title(percent: number, locale: Locale): string {
  return (percent >= 90 ? { en: "Detail detective", zh: "细节侦探" } : percent >= 73 ? { en: "On the same wavelength", zh: "默契同频" } : percent >= 50 ? { en: "Getting the picture", zh: "渐入佳境" } : percent >= 27 ? { en: "Plot twist explorer", zh: "反转探索家" } : { en: "Fresh discoveries", zh: "新发现满满" })[locale];
}
export function ranked(entries: Entry[]): (Entry & { rank: number })[] {
  return entries.filter(e => !e.hidden).sort((a, b) => b.correct - a.correct).map((entry, i, rows) => ({ ...entry, rank: rows.findIndex(row => row.correct === entry.correct) + 1 }));
}
export function average(entries: Entry[], category: string, excludeId?: string): number | null {
  const rows = entries.filter(e => !e.hidden && e.id !== excludeId && e.categories[category]?.total > 0);
  return rows.length ? rows.reduce((sum, e) => sum + e.categories[category].correct / e.categories[category].total * 100, 0) / rows.length : null;
}
export function readSaved<T>(key: string): T | null { try { return JSON.parse(localStorage.getItem(key) ?? "null") as T | null; } catch { return null; } }
export function save(key: string, value: unknown): boolean { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function forget(key: string): void { try { localStorage.removeItem(key); } catch { /* Storage may be disabled. */ } }
export function validAnswers(value: unknown, max: number): value is (Choice | null)[] { return Array.isArray(value) && value.length === max && value.every(v => v === 0 || v === 1 || v === null); }
