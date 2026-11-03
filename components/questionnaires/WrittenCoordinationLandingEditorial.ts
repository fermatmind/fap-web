import type { Questionnaire } from "@/lib/questionnaires/types";
export const writtenLandingSections: Questionnaire["guide"] = [
  {
    "id": "written-purpose",
    "title": {
      "en": "Written coordination practice: six tasks, six separate records",
      "zh": "书面协调技能练习：六类任务，分别记录"
    },
    "paragraphs": [
      {
        "en": "Work through fictional request cards, linked reference tables, a briefly presented note, a stated ordering rule, a schematic grid and written summaries. These tasks practise different operations: copying exact text, following a lookup chain, retrieving presented facts, applying rules, tracing permitted routes and distinguishing evidence from inference. They are not six personality dimensions or interchangeable measures of one ability.",
        "zh": "围绕虚构请求卡、关联表格、短时呈现记录、明确排序规则、示意网格与书面总结，分别练习精确复制、沿链查找、提取所呈现事实、应用规则、追踪允许路线，以及区分依据与推断。这些任务不是六个人格维度，也不是同一种能力的可互换测量。"
      },
      {
        "en": "Choose any module without completing the others. The bank contains 32 four-field entry cards plus 30 multiple-choice questions, six in each of five question modules. Six complete public guides explain the tasks before or after practice. All task stimuli remain English in both page languages; Chinese instructions and explanations support understanding without turning this into a Chinese-language performance test.",
        "zh": "可独立选择任一模块，无需先完成其他部分。题库包含32张四字段录入卡，以及五组各六题、共30道选择题。六篇完整公开指南可在练习前后阅读。两种页面语言中的任务材料均保留英文；中文说明与解析帮助理解，并不把它变成中文表现测验。"
      }
    ]
  },
  {
    "id": "written-entry",
    "title": {
      "en": "Data entry: exact fields, complete records and character output",
      "zh": "数据录入：精确字段、完整记录与字符产量"
    },
    "paragraphs": [
      {
        "en": "Entry runs for a full 60 seconds. Every attempted card contributes all four fields, including blank ones; untouched cards stay outside the denominator. Exact matching preserves case, spacing, punctuation and leading zeros. One incorrect character makes that field non-exact, while a complete exact record needs all four fields to match. Correcting a field changes the final text checked, not a running count of mistakes made while typing.",
        "zh": "录入持续完整60秒。每张纳入的卡贡献四个字段，包括空字段；未触及卡不进入分母。精确匹配保留大小写、空格、标点与前导零。一个字符错误就使该字段不精确，完整精确记录则需四字段全对。修改字段改变的是最终核对文本，不累计打字过程中的每次失误。"
      },
      {
        "en": "For example, three exact fields on one attempted card give 3/4 = 75% field accuracy but zero complete exact records. If the final committed strings contain 40 characters, character KPH is 40 × 60 = 2,400. Exact-field character KPH counts only characters inside entirely matching fields. These are final-text quantities, not physical keypresses, WPM or proof of sustainable hourly output. No attempted card leaves accuracy unavailable.",
        "zh": "例如，一张纳入卡有三个精确字段，字段准确率为3/4＝75%，完整精确记录仍为零。若最终已提交文本共40个字符，字符KPH为40×60＝2,400；精确字段字符KPH仅纳入整字段完全匹配的字符。这些是最终文本数量，不是物理按键、WPM或可持续一小时产量的证明。没有纳入卡时准确率不适用。"
      }
    ]
  },
  {
    "id": "written-lookup",
    "title": {
      "en": "Cross-reference: preserve the link between two tables",
      "zh": "交叉查找：保留两张表之间的关联"
    },
    "paragraphs": [
      {
        "en": "Two-step lookup means finding the supplied identifier in one table, carrying its associated intermediate value to a second table and returning the requested final value. Match the complete code rather than a familiar prefix. A plausible value from the right table can still be wrong if it belongs to a different intermediate key. The answer explanation identifies the relevant chain for each original question.",
        "zh": "两步查找需要在一张表中找到所给标识，将其关联的中间值带入第二张表，再取回所问的最终值。应匹配完整代码，而不是熟悉的前缀。即使某个值确实出现在正确表中，若属于另一中间键，仍不是答案。每道原创题的解析会指出相应关联链。"
      },
      {
        "en": "A useful untimed review is to name each handover: starting key → intermediate key → requested field. Then compare an incorrect option with the source and locate the exact step where the association changed. This separates a missed lookup from a transcription error without assigning a cognitive cause. Timed practice adds a 180-second cap for six questions; it does not add simultaneous interruptions or audio.",
        "zh": "不计时复习时，可依次指出“起始键→中间键→所问字段”。再把错误选项与来源对照，定位关联在哪一步改变。这能区分查找遗漏与抄录差异，但不据此判断认知原因。计时练习为六题增加180秒上限，并不加入并发打断或音频。"
      }
    ]
  },
  {
    "id": "written-memory",
    "title": {
      "en": "Written memory: distinguish recall from visible-source study",
      "zh": "书面记忆：区分回忆与可看来源学习"
    },
    "paragraphs": [
      {
        "en": "Timed memory presents one fictional English note for a nominal 15 seconds, removes its visible exercise card and allows 120 seconds for six questions. The recorded exposure end interval may exceed the nominal target because browser updates are scheduled. The page checks deadlines before accepting input; backgrounding or inconsistent clocks cancel the active timed section instead of treating it as a comparable completed attempt.",
        "zh": "计时记忆以15秒为目标呈现一则虚构英文记录，再移除练习中的可见记录卡，给120秒回答六题。浏览器按调度更新，记录的呈现结束时段可能超过目标。页面接纳输入前检查截止；进入后台或时钟不一致会取消活动计时部分，不把它当成条件可比的完成尝试。"
      },
      {
        "en": "Untimed memory keeps the note visible. That supports finding and checking information, so its correct count must be read as visible-source study rather than recall. Neither mode measures general memory capacity, auditory memory or resilience under real calls. Reading the public bank or repeating an item changes familiarity; a higher second count alone cannot show a general memory improvement.",
        "zh": "不计时记忆保留原文，支持查找与核对，因此其正确数应读作可看来源学习表现，而不是回忆表现。两种模式都不测一般记忆容量、听觉记忆或真实来电压力下的承受能力。阅读公开题库或重复题目会改变熟悉度；第二次正确数更高，本身不能证明一般记忆改善。"
      }
    ]
  },
  {
    "id": "written-rules-map",
    "title": {
      "en": "Ordering and map reading: use the stated constraints",
      "zh": "排序与地图阅读：按明示约束推导"
    },
    "paragraphs": [
      {
        "en": "The fictional ordering rule places BLOCKED before DUE before ROUTINE; within a label, the earlier logged time comes first. For illustration, a later BLOCKED item precedes an earlier ROUTINE item because label priority is compared before time. This is an exercise rule for artificial work labels, not a medical urgency scale, emergency dispatch protocol or recommendation for real decisions.",
        "zh": "虚构排序先比较BLOCKED、DUE、ROUTINE三种标签，再在同标签内按登记时间从早到晚排列。例如，较晚登记的BLOCKED项仍先于较早的ROUTINE项，因为先比较标签优先序，再比较时间。这是人为工作标签的练习规则，不是医疗紧急程度、应急派遣流程或真实决策建议。"
      },
      {
        "en": "The original grid has columns A–E and rows 1–5, with row 1 north and column A west. Each permitted horizontal or vertical edge is one equal-length block and works both ways; diagonals are excluded, and B2–B3 and C4–D4 are closed. Trace available edges rather than counting a straight line through a closure. Results concern this finite diagram, without traffic, travel-time estimates or real navigation.",
        "zh": "原创网格为A至E列、1至5行，第1行在北、A列在西。允许的横向或纵向边各为一个等长街段，可双向通行；不走对角，B2–B3与C4–D4关闭。应沿可用边追踪，不能把穿过关闭边的直线算成路线。结果只涉及这幅有限示意图，没有交通、行程时间估计或真实导航。"
      }
    ]
  },
  {
    "id": "written-summary",
    "title": {
      "en": "Written summaries: preserve facts and unresolved status",
      "zh": "书面总结：保留事实与尚未确定的状态"
    },
    "paragraphs": [
      {
        "en": "Summary items ask which option preserves the supplied message. Check the named item, time, location, requested action and stated status against the source. A request to check or transfer something is not evidence that the check or transfer has been completed. An answer can be fluent and brief yet introduce an unsupported completion, cause or urgency.",
        "zh": "总结题要求选择保留所给消息的选项。应将物品、时间、地点、请求行动与明示状态逐一对照来源。请求核对或转移，不是核对或转移已经完成的证据。答案即使流畅简短，也可能加入没有依据的完成状态、原因或紧急程度。"
      },
      {
        "en": "Review an error by separating omitted facts, altered details and added conclusions. Point to the exact wording that supports each retained claim, and leave unspecified facts unspecified. This is a practice strategy for reading supplied text; the module does not listen to callers or evaluate your spoken interviewing, note-taking under audio, emotional support or real incident management.",
        "zh": "复习时可分开查看遗漏事实、改变细节与新增结论。为每项保留的主张指出具体原文，没有说明的事实继续保留未说明。这是阅读所给文字的练习策略；本模块不聆听来电，也不评估口头访谈、听录音记笔记、情感支持或真实事件管理。"
      }
    ]
  },
  {
    "id": "written-evidence",
    "title": {
      "en": "Reading results: task counts are not a calibrated ability score",
      "zh": "结果怎样读：任务计数与能力尺度不同"
    },
    "paragraphs": [
      {
        "en": "Each question module reports correct, wrong and unanswered out of six; the counts always sum to six. Four correct, one wrong and one unanswered differs from four correct and two wrong, although the correct count is the same. Explicitly leaving an item blank and never reaching it both remain unanswered in this record. Unattempted modules have no completed count. Entry uses fields and characters, so combining its percentages with question counts would create an uncalibrated total.",
        "zh": "每个问答模块分别报告六题中的正确、错误、未答，三项之和恒为六。四对、一错、一未答，与四对、两错虽正确数相同，回答覆盖不同。明确留空与未到达的题，在本记录中均为未答。未尝试模块没有完成计数。录入使用字段与字符，将其百分比和问答计数合并会产生未经校准的总量。"
      },
      {
        "en": "Official applicant materials distinguish their own product, examples and test conditions from independent practice. [1][2][3] They do not validate this original bank. Reproducible keys and complete explanations establish how these responses are checked; they do not establish reliability, norms, hiring prediction, training transfer or English–Chinese measurement equivalence. There is no universal pass mark, percentile, dispatcher certification or conversion to another provider’s score on this page.",
        "zh": "官方申请者资料区分其产品、示例与施测条件，以及独立练习。[1][2][3] 这些资料不验证本站原创题库。可复算答案与完整解析说明如何核对作答，不证明信度、常模、招聘预测、训练迁移或英中文测量等值。本页没有通用通过线、百分位、调度员认证或其他提供方分数换算。"
      }
    ]
  },
  {
    "id": "written-review",
    "title": {
      "en": "Review one operation, with clear conditions and private records",
      "zh": "复习一个具体步骤，保留条件与私人记录"
    },
    "paragraphs": [
      {
        "en": "Start with untimed study if you want to understand the lookup, map or evidence rule. Locate one specific error, describe the operation to check and try it on a new fictional example. If you later use the timed mode, keep the same device and input method where practical and note prior exposure. This makes the comparison easier to describe, without proving equivalent attempts or a training effect. The roughly 18-minute page estimate includes instructions and one attempt per module, not optional full-guide reading or an observed completion-time study.",
        "zh": "想理解查找、地图或依据规则时，可先用不计时学习。定位一个具体错误，说明需要核对的步骤，再在新的虚构例子中尝试。之后使用计时模式时，可尽量保留设备、输入法并记下是否见过材料。这使比较条件更易说明，但不证明尝试等值或训练有效。页面约18分钟包含说明与每模块一轮，不包括可选全文阅读，也不是实测完成时间研究。"
      },
      {
        "en": "Use only the supplied fictional material. Inputs stay in page memory without saved drafts, answer submission or ordinary flow analytics; finishing removes raw inputs, and exit-and-clear removes all local exercise records. Refreshing, changing language or leaving loses the page attempt. Copying the public entry shares only the title and link. Choose a mode and a module to begin directly, with no additional consent checkbox; a timed module starts its clock when it opens.",
        "zh": "只使用所给虚构材料。输入留在页面内存，不存草稿、不提交答案、不采普通流程分析；完成移除原始输入，退出并清除删除全部本地练习记录。刷新、换语言或离开会丢失本页尝试。复制公开入口只分享标题与链接。选择模式与模块即可直接开始，无需额外同意勾选；计时模块打开时即开始计时。"
      }
    ]
  }
];
export const writtenLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What do the 32 cards and 30 questions mean?",
      "zh": "32张卡与30道题分别是什么？"
    },
    "answer": {
      "en": "The entry bank contains 32 fictional cards with four fields each for one fixed 60-second round. Five separate question modules contain six questions each. You can attempt any module independently; the cards are not 32 additional multiple-choice questions.",
      "zh": "录入题库提供32张虚构四字段卡，供固定60秒的一轮练习；五个独立问答模块各六题。可任意选一部分，不把32张卡算成额外32道选择题。"
    }
  },
  {
    "question": {
      "en": "When does the timer start, and can I pause?",
      "zh": "何时开始计时，可以暂停吗？"
    },
    "answer": {
      "en": "After choosing the mode, opening a module begins it directly. Entry always runs 60 seconds. Timed questions use 180 seconds per section except memory: nominal 15-second exposure plus 120 seconds to answer. Returning to an earlier question does not pause the clock. Backgrounding cancels the active timed attempt; untimed study is available for the five question modules.",
      "zh": "选择模式后，打开模块就直接开始。录入始终60秒；问答计时各180秒，记忆为目标15秒呈现加120秒回答。返回上一题不会暂停。进入后台会取消活动计时尝试；五个问答模块均可改选不计时学习。"
    }
  },
  {
    "question": {
      "en": "Why can field accuracy and complete records tell different stories?",
      "zh": "为什么字段准确率与完整记录数可能不同？"
    },
    "answer": {
      "en": "A card needs all four exact fields to be a complete exact record. Three matching fields and one mismatch give 75% field accuracy for that card and no exact record. The mismatch is checked as final text, not interpreted as carelessness or a stable trait.",
      "zh": "一张卡需四字段全精确才是完整精确记录。三个匹配、一个不匹配时，该卡字段准确率75%，完整精确记录为零。差异按最终文本核对，不据此解释为粗心或稳定特质。"
    }
  },
  {
    "question": {
      "en": "Does 6 out of 6 mean mastery or a high percentile?",
      "zh": "六题全对代表掌握能力或高百分位吗？"
    },
    "answer": {
      "en": "It means the six answers matched the keys under the selected conditions. Six items do not establish mastery, a population percentile or readiness for a job. Visible-source study, previous exposure and timed practice are different conditions and remain labelled.",
      "zh": "只说明在所选条件下，六个回答符合答案。六题不建立掌握标准、人群百分位或岗位准备度。可看来源学习、先前见过材料与计时练习的条件不同，需保留各自标记。"
    }
  },
  {
    "question": {
      "en": "Why are unanswered items kept apart from wrong answers?",
      "zh": "为什么未答与错误分开保留？"
    },
    "answer": {
      "en": "An unanswered item provides no selected answer to check. Four correct, one wrong and one unanswered differs from four correct and two wrong. Both the coverage and keyed answer matter; there is no overall penalty model or conversion to another exam.",
      "zh": "未答没有已选答案可核对。四对、一错、一未答不同于四对、两错；回答覆盖与答案都需看。本站没有总体扣分模型，也不换算其他考试成绩。"
    }
  },
  {
    "question": {
      "en": "Can I use the Chinese page without an English task?",
      "zh": "中文页面是否提供中文题目？"
    },
    "answer": {
      "en": "Instructions, feedback and full guides are bilingual, but the original task text, reference values and options remain English. Language familiarity can affect the attempt. Switching the page language does not create an equivalent translated performance test.",
      "zh": "说明、反馈与完整指南提供双语，原创任务文字、参照值及选项仍为英文。语言熟悉度可能影响尝试；切换页面语言不产生等值的中文表现测验。"
    }
  },
  {
    "question": {
      "en": "What should I review after a wrong answer?",
      "zh": "答错后应该复习什么？"
    },
    "answer": {
      "en": "Locate the exact source detail or rule that changes the answer: a lost lookup link, altered character, blocked edge, label order or unsupported summary claim. Practise that operation using fictional material. Do not turn one small section into a diagnosis of memory, attention or job suitability.",
      "zh": "定位改变答案的具体来源或规则：关联链丢失、字符改变、关闭边、标签顺序或总结中无依据的主张。用虚构材料练这个步骤，不把一个小部分变成记忆、注意力或岗位适合的诊断。"
    }
  },
  {
    "question": {
      "en": "Can I read all guides without entering information?",
      "zh": "不录入信息也能阅读全部指南吗？"
    },
    "answer": {
      "en": "Yes. All six full guides are public before practice, with no account, completed attempt or minimum count required. They explain tasks rather than selecting a score band. Copying a link points to public content and contains no personal record.",
      "zh": "可以。六篇全文在练习前即公开，无需账户、完成尝试或最低数量。它们解释任务，不按成绩选择档位。复制链接指向公开内容，不含个人记录。"
    }
  }
];
