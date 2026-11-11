import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export const responseColorLandingSummaries: Record<string, { zh: string; en: string }> = {
  red: { zh: "临时有了可用时间时，先选一件事开始做。结合实际例子观察及时回应怎样帮助推进，以及哪些条件适合先核对。", en: "When time unexpectedly opens up, starting one activity may come first. Explore when prompt action helps and which conditions are worth checking before moving." },
  yellow: { zh: "安排出现空白时，先展开几种有趣的可能。围绕新想法与选择，观察开放联想何时有帮助、何时需要收束成具体一步。", en: "An open space in a plan may invite several possibilities. Explore when new connections help and when narrowing them into a concrete step would be useful." },
  blue: { zh: "面对新安排时，先理清条件、顺序和遗漏。通过准备与核对的例子，比较必要的信息和可以边做边补充的细节。", en: "A new arrangement may prompt clarification of conditions, sequence and omissions. Compare information needed before starting with details that can be added along the way." },
  green: { zh: "共同安排变化时，先顾及节奏与配合。结合沟通例子，观察怎样维持顺畅协调，同时说清自己实际需要调整的地方。", en: "When a shared arrangement changes, pace and cooperation may come first. Explore how to keep coordination workable while expressing your own need for an adjustment." },
  "tied-red-yellow": { zh: "行动回应与开放联想同为最高次数。以空出一段时间为例，回看先尝试一件事与先想几种过法的不同作用。", en: "Action and exploring connections share the highest count. With unexpected free time, compare trying one activity with first considering several possibilities." },
  "tied-red-blue": { zh: "行动回应与审慎整理并列最高。围绕临时任务，比较快速开始与核对条件的配合，区分可以试做的步骤和必须先确认的信息。", en: "Action and careful organization share the highest count. For an unexpected task, compare beginning promptly with checking conditions, distinguishing a reversible trial from information that must be confirmed first." },
  "tied-red-green": { zh: "行动回应与稳定协调并列最高。以共同计划临时改变为例，观察尽快推进与保持可承受节奏的取舍，并列不规定哪一种必须优先。", en: "Action and steady coordination share the highest count. When a shared plan changes, explore moving promptly alongside preserving a manageable pace. Neither tied response is assigned priority." },
  "tied-yellow-blue": { zh: "开放联想与审慎整理并列最高。围绕一个新点子，比较继续扩展可能与梳理可行条件的选择，观察何时发散、何时收束。", en: "Exploring connections and careful organization share the highest count. For a new idea, compare opening up possibilities with clarifying practical conditions, including when to expand and when to narrow the discussion." },
  "tied-yellow-green": { zh: "开放联想与稳定协调并列最高。以朋友间商量活动为例，观察新过法怎样进入共同安排，以及怎样让参与节奏保持舒适。", en: "Exploring connections and steady coordination share the highest count. When friends plan an activity, examine introducing alternatives while keeping participation comfortable." },
  "tied-blue-green": { zh: "审慎整理与稳定协调并列最高。围绕交接或日常约定，比较清楚条件与照顾配合节奏的作用，寻找既准确又容易共同执行的说明方式。", en: "Careful organization and steady coordination share the highest count. For a handoff or everyday agreement, explore clear conditions and a workable shared pace, aiming for an explanation others can actually use." },
  "tied-red-yellow-blue": { zh: "行动、联想与整理三项并列最高。通过一次临时安排，分别回看开始尝试、提出替代过法和核对条件的选择；绿色较少不代表缺少协调能力。", en: "Action, connections and organization share the highest count. Revisit trying an activity, proposing alternatives and checking conditions in a changed plan. Fewer Green choices do not establish a lack of coordination ability." },
  "tied-red-yellow-green": { zh: "行动、联想与协调三项并列最高。以共同活动为例，比较启动一步、尝试新过法和照顾参与节奏的选择，并留意哪些信息仍需核对。", en: "Action, connections and coordination share the highest count. In a shared activity, compare starting, trying alternatives and attending to participation, while noting which information still needs checking." },
  "tied-red-blue-green": { zh: "行动、整理与协调三项并列最高。围绕一项需要共同完成的小任务，观察推进、条件核对与交接节奏怎样一起影响选择。", en: "Action, organization and coordination share the highest count. For a small shared task, explore how moving forward, checking conditions and sustaining handoffs jointly influence choices." },
  "tied-yellow-blue-green": { zh: "联想、整理与协调三项并列最高。通过商量新安排的例子，回看提出可能、澄清条件与保持交流的不同作用，以及何时需要决定下一步。", en: "Connections, organization and coordination share the highest count. When discussing a new arrangement, examine proposing possibilities, clarifying conditions and sustaining the exchange, including when a next step needs deciding." },
  "tied-red-yellow-blue-green": { zh: "四项均为6次，全部保留为最高并列。这只说明本题组的选择次数相同；请按不同情境回看具体做法，不把相等计数解读为能力全面或固定混合人格。", en: "All four counts are six and remain tied leaders. Equal choices in this set do not establish well-rounded abilities or a fixed blended personality. Revisit specific responses across different situations." },
};

export function responseColorLandingSummary(profile: QuestionnaireProfile, locale: Locale): string {
  return responseColorLandingSummaries[profile.id]?.[locale] ?? profile.summary[locale];
}

/** Current answering UI copy; the accepted source questionnaire keeps its original bytes. */
const currentEntryCopies = {
  zh: new Map<string, string>([
    ["答案只在浏览器计算，不进入网址、答案上传或分析事件。默认不保存；主动保存的标签页草稿24小时后失效，并在完成、退出并清除或重测时删除。本站不通过该草稿保留历史个人报告；复制公开入口和指南无需披露答案或计数。", "答案只在浏览器计算，不进入网址、答案上传或分析事件。当前答题页不提供进度保存；刷新页面、切换语言或离开后会从头开始。重测开始新的作答，不保留历史个人报告；复制公开入口和指南不包含答案或计数。"],
    ["答案在当前浏览器中计分，默认不保存。只有主动选择临时保存后，才在本标签页保留可恢复草稿；24小时后失效，完成、退出并清除或重测会删除。重测开始新的作答，不保留可供比较的历史个人报告。", "答案在当前浏览器中计分，当前答题页不提供进度保存；刷新、切换语言或离开后会从头开始。重测开始新的作答，不保留可供比较的历史个人报告。"],
    ["重测、临时草稿与隐私", "重测与隐私"],
  ]),
  en: new Map<string, string>([
    ["Answers are scored in the browser, without answer uploads or inclusion in URLs or analytics events. Saving is off by default. An optional tab draft expires after 24 hours and clears on completion, exit-and-clear or retake; it does not maintain a history of personal reports. Copying public entry and guide links does not disclose answers or counts.", "Answers are scored in your browser, without answer uploads or inclusion in URLs or analytics events. This question page does not save progress: refreshing, changing language or leaving it starts over. Retaking starts a new attempt and keeps no history of personal reports. Public entry and guide links contain no answers or counts."],
    ["Answers are scored in the current browser and are not saved by default. Only an explicit save choice creates a resumable draft in this tab. It expires after 24 hours and clears on completion, exit-and-clear or retake. Retaking starts a new attempt rather than maintaining a history of personal reports.", "Answers are scored in the current browser. This question page does not save progress; refreshing, changing language or leaving it starts over. Retaking starts a new attempt rather than maintaining a history of personal reports."],
    ["Retesting, optional drafts and privacy", "Retesting and privacy"],
  ]),
};

export function responseColorCurrentEntryCopy(text: string, locale: Locale): string {
  return currentEntryCopies[locale].get(text) ?? text;
}
