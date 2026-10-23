import worksheet from "./riasecWorksheet.json";
import type { Locale } from "@/lib/i18n/locales";

export const WORKSHEET_VERSION = "riasec-exploration-v1";
// These fields expand the compound prompts in the existing printable template.
export const WORKSHEET_FIELDS = [
  ["date", "作答日期", "Test date", 0],
  ["version", "测试版本", "Test version", 0],
  ["r", "R 实际型", "R Realistic", 0],
  ["i", "I 研究型", "I Investigative", 0],
  ["a", "A 艺术型", "A Artistic", 0],
  ["s", "S 社会型", "S Social", 0],
  ["e", "E 企业型", "E Enterprising", 0],
  ["c", "C 常规型", "C Conventional", 0],
  ["code", "三字代码", "Three-letter code", 0],
  ["close", "其他接近的兴趣方向", "Other close interests", 0],
  ["activity1", "喜欢并愿意再做的活动 1", "Activity I enjoyed and would repeat 1", 1],
  ["activity2", "喜欢并愿意再做的活动 2", "Activity I enjoyed and would repeat 2", 1],
  ["fits", "符合我经历的结果", "Result that fits my experience", 2],
  ["check", "需要新体验核实的线索", "Interest to check through a new experience", 2],
  ["careerA", "候选职业 A", "Career A", 3],
  ["careerB", "候选职业 B", "Career B", 3],
  ["tasks", "愿意尝试的日常任务", "Daily tasks I would try", 3],
  ["skills", "已有技能或作品证据", "Existing skills or work samples", 3],
  ["requirements", "需核对的资格、条件或机会", "Requirements or opportunities to check", 3],
  ["experiment", "准备尝试的任务", "Task to try", 4],
  ["cost", "时间与可承受成本", "Time and affordable cost", 4],
  ["evidence", "要留下的作品或反馈", "Work sample or feedback to collect", 4],
  ["repeat", "愿意继续做什么", "What I would do again", 5],
  ["learn", "需要学习或改变的条件", "Skill or condition that needs work", 5],
  ["next", "下一步与复盘日期", "Next step and review date", 5],
] as const;
export type WorksheetField = typeof WORKSHEET_FIELDS[number][0];
export type WorksheetRecord = Record<WorksheetField, string>;
export type WorksheetFormat = "text" | "markdown";
export function emptyWorksheet(): WorksheetRecord {
  return Object.fromEntries(WORKSHEET_FIELDS.map(([id]) => [id, ""])) as WorksheetRecord;
}
export function exampleWorksheet(locale: Locale): WorksheetRecord {
  const record = emptyWorksheet();
  return { ...record,
    activity1: locale === "zh" ? "合成示例：整理一次小型访谈的笔记" : "Synthetic example: organize notes from a short interview",
    check: locale === "zh" ? "是否愿意反复整理和分析资料？" : "Would I enjoy organizing and analyzing information repeatedly?",
    experiment: locale === "zh" ? "用 30 分钟整理一页访谈摘要，再请同伴反馈。" : "Spend 30 minutes on a one-page interview summary and ask a peer for feedback.",
    cost: locale === "zh" ? "30 分钟；使用现有工具，无新增预算。" : "30 minutes; existing tools, no additional budget.",
    next: locale === "zh" ? "体验后记录投入感与困难，再决定是否继续。" : "Record engagement and difficulties after the trial, then decide whether to continue.",
  };
}
export function worksheetLabel(field: typeof WORKSHEET_FIELDS[number], locale: Locale): string {
  return field[locale === "zh" ? 1 : 2];
}
// CommonMark fenced code blocks treat HTML, links, pipes and brackets literally.
// A fence longer than every backtick run in a value cannot be closed by that value.
export function markdownLiteral(value: string): string {
  const longest = (value.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0);
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}\n${value}\n${fence}`;
}
export function serializeWorksheet(record: WorksheetRecord, locale: Locale, format: WorksheetFormat, example = false): string {
  const copy = worksheet[locale];
  const identity = example ? (locale === "zh" ? "合成填写示例（不是本人记录）" : "Synthetic example (not my record)") : (locale === "zh" ? "本人探索记录" : "My exploration record");
  const sections = copy.pages.flatMap(page => page.sections);
  const blocks = [copy.title, `${identity} · ${WORKSHEET_VERSION}`, copy.intro];
  sections.forEach((section, index) => {
    blocks.push(format === "markdown" ? `## ${section.heading}` : section.heading);
    for (const field of WORKSHEET_FIELDS.filter(field => field[3] === index)) {
      const value = record[field[0]];
      blocks.push(`${worksheetLabel(field, locale)}:\n${format === "markdown" ? markdownLiteral(value) : value}`);
    }
  });
  // LF separates labels/fields; user values are never trimmed, normalized or escaped in text.
  return blocks.join("\n\n") + "\n";
}
export type CopyResult = "success" | "unsupported" | "denied" | "cancelled" | "failed";
export async function copyWorksheet(text: string, clipboard?: Pick<Clipboard, "writeText">): Promise<CopyResult> {
  if (!clipboard?.writeText) return "unsupported";
  try { await clipboard.writeText(text); return "success"; }
  catch (error) {
    const name = error && typeof error === "object" && "name" in error ? error.name : "";
    return name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "AbortError" ? "cancelled" : "failed";
  }
}
