import type { Questionnaire } from "@/lib/questionnaires/types";
export const workTraitsLandingSections: Questionnaire["guide"] = [
  {
    "id": "work-traits-purpose",
    "title": {
      "en": "Seven work themes: recent actions in a specific setting",
      "zh": "七类工作主题：具体情境中的近期行动"
    },
    "paragraphs": [
      {
        "en": "This original forty-two-item reflection records seven groups of work-related actions: responding under pressure, initiating agreed action, following through, making contact, considering other perspectives, clarifying agreements and exploring ideas. Each group contains six statements. The summaries concern what you recall doing in one setting, rather than a general description of what kind of person you are.",
        "zh": "本原创四十二题回顾记录七组工作相关行动：压力下回应、提出并开始约定内的行动、接续任务、发起联系、考虑他人视角、澄清与履行约定，以及探索想法。每组六条，摘要关注你回忆在一个情境中做过什么，而非概括你属于哪种人。"
      },
      {
        "en": "The result retains all seven groups in a fixed order, including groups with insufficient information. Each complete public guide discusses examples, context and possible next questions. There is no combined work-personality score, strongest trait, preferred employee type or recommended occupation.",
        "zh": "结果按固定顺序保留全部七组，包括资料不足的组。每篇完整公开指南讨论实例、情境与可继续思考的问题，不生成综合工作人格分、最强特质、理想员工类型或推荐职业。"
      }
    ]
  },
  {
    "id": "work-traits-reference",
    "title": {
      "en": "How to answer: four weeks, one setting and a real opportunity",
      "zh": "怎样作答：四周、同一情境与实际机会"
    },
    "paragraphs": [
      {
        "en": "Use one ordinary work, study or volunteer setting from the past four weeks throughout. Consider how often each action occurred when a relevant opportunity and room to choose existed. Do not alternate between a pressured job, a different study group and an ideal future role to assemble a more favorable description. No task names, employer details or private examples need to be entered.",
        "zh": "全程采用过去四周同一个普通工作、学习或志愿服务情境。考虑在相关机会及选择余地存在时，自己多常做出题中行动；不要在高压岗位、另一学习小组与理想未来角色间切换，以拼出更有利的描述。无需输入任务名称、雇主信息或私人实例。"
      },
      {
        "en": "Never means the opportunity existed but you did not take that action. Unscored is available when there was no relevant opportunity, you cannot judge or you decline to answer. A 3 means sometimes, not neutral or unknown. All forty-two prompts need a response, which may be unscored; this is different from requiring forty-two numeric ratings.",
        "zh": "从未表示机会存在但未做出该行动。没有相关机会、无法判断或不愿回答时可选未评分。3表示有时，不是中立或未知。四十二题均需回应，但每题都可选未评分；这与要求四十二条数字评分不同。"
      }
    ]
  },
  {
    "id": "work-traits-action",
    "title": {
      "en": "Pressure, initiative and follow-through: actions with different purposes",
      "zh": "压力、主动行动与任务接续：区分不同目的"
    },
    "paragraphs": [
      {
        "en": "Pressure-response items cover identifying the issue before replying, separating confirmed information from anticipation, considering specific feedback and identifying needed clarification. These actions do not establish emotional stability or an absence of distress. Initiative concerns proposing or starting a permitted next step, raising an unresolved issue and checking the permission needed for an improvement; it does not mean acting outside an agreed remit.",
        "zh": "压力回应题涉及回应前辨认问题、区分已知与预想、考虑具体反馈，以及识别所需澄清。这些行动不确立情绪稳定或没有困扰。主动行动关注提出或开始获准的下一步、提起未决事项，以及核对改进所需的权限，不表示越出约定范围行动。"
      },
      {
        "en": "Follow-through concerns resuming after manageable interruptions, reaching an agreed stopping point, leaving a clear place to restart and trying an affordable adjustment when an approach stalls. Staying longer on every task is not the intended conclusion. A changed priority, exhausted resources or a decision to stop can make continued effort inappropriate even when persistence was reported frequently.",
        "zh": "任务接续关注可处理的中断后恢复、到达约定停点、留下清楚的继续位置，以及方法停滞时尝试可负担的调整。结论不是每项任务都该坚持更久；优先级改变、资源不足或已决定停止时，即使曾常报告坚持，继续投入也可能不合适。"
      }
    ]
  },
  {
    "id": "work-traits-collaboration",
    "title": {
      "en": "Contact, consideration, agreements and curiosity: read the actual behaviors",
      "zh": "联系、他人视角、约定与探索：回到具体行为"
    },
    "paragraphs": [
      {
        "en": "Making contact includes appropriate introductions, clarification and reconnecting through agreed channels. It is not a sociability or popularity rating. Considering other perspectives includes inviting relevant views, checking an accessible communication format, leaving room for a response and respecting a reasonable boundary. Frequent contact and consideration can coexist; neither requires continual availability or agreement with every suggestion.",
        "zh": "发起联系包含合适的介绍、澄清及通过约定渠道重新联系，不是合群或受欢迎程度评分。考虑他人视角包含邀请相关意见、核对便于理解的沟通方式、留出回应空间及尊重合理边界。联系与体谅可以同时出现，也都不要求随时可联系或同意每项建议。"
      },
      {
        "en": "Keeping and clarifying agreements concerns reminders, checking capacity before a promise, timely updates, handover detail and correcting one’s own part. It does not certify trustworthiness. Exploring and learning concerns asking why a relevant procedure works, consulting permitted material, testing explanations and revisiting an assumption. These are recalled actions, not tests of intelligence, knowledge, creativity or learning speed.",
        "zh": "履行与澄清约定关注提醒、承诺前核对余量、及时更新、交接细节及修正自己的部分，不认证人的可信度。探索与学习关注询问相关流程为何有效、查阅允许的材料、检验解释及重看假设。它们是回忆的行动，不是智力、知识、创造力或学习速度测试。"
      }
    ]
  },
  {
    "id": "work-traits-arithmetic",
    "title": {
      "en": "Scoring: six items, at least five ratings, one decimal place",
      "zh": "计分：每组六题、至少五条数字、一位小数"
    },
    "paragraphs": [
      {
        "en": "Items are equally weighted and scored directly from 1 to 5, without reverse scoring. Sum only the numeric responses within each group, divide by their count and round to one decimal. For example, 1, 2, 4, 4, 5 and unscored give a raw sum of 16, five rated items and a displayed mean of 3.2. Four ratings of 5 give a sum of 20 but insufficient information for a mean.",
        "zh": "条目等权，直接按1至5计分，没有反向计分。每组只加数字回应，除以数字条数并保留一位小数。例如1、2、4、4、5及未评分，原始和为16、有效五题，均值显示3.2。只有四条5分虽有原始和20，仍不足以显示均值。"
      },
      {
        "en": "Unscored is excluded from both sum and denominator, never replaced with 0 or 3. The five-of-six minimum is this edition’s reporting rule, not a validated reliability threshold. Ratings 2, 2, 3, 4, 4 and unscored average 3.0, as do six ratings of 3; coverage and item patterns differ. Read the statements and rated count alongside the mean.",
        "zh": "未评分同时排除在原始和与分母之外，不补成0或3。六题至少五条是本版报告规则，不是经验证的信度门槛。2、2、3、4、4及未评分平均为3.0，六条3也为3.0，但覆盖及题间分布不同。应将具体陈述、有效题数与均值一起阅读。"
      }
    ]
  },
  {
    "id": "work-traits-interpretation",
    "title": {
      "en": "Interpretation: frequency, opportunity and effectiveness are distinct",
      "zh": "结果解释：频率、机会与实际效果分别看"
    },
    "paragraphs": [
      {
        "en": "The response options are ordered frequency categories. Their numeric mean is a descriptive convenience; it does not establish equal psychological intervals or the percentage of opportunities on which an action happened. The questionnaire does not count those opportunities or independently observe outcomes. More frequent endorsement alone cannot show better performance, sounder judgment or stronger leadership.",
        "zh": "选项是有序的频率类别，数字均值用于概括，不确立心理距离等距，也不表示某行动占全部机会的百分比。问卷没有统计这些机会或独立观察结果。更常认同题目，本身不能证明绩效更好、判断更妥当或领导力更强。"
      },
      {
        "en": "A high curiosity mean and a lower contact mean do not rank two abilities on a common scale: the items and available situations differ. When repeating the reflection, check the setting, four-week period, opportunities and individual responses before discussing changes. Without established test–retest and measurement-error evidence, a small numerical change cannot quantify personal development.",
        "zh": "探索均值较高、联系均值较低，并不是在共同尺度上给两种能力排序：题目与可用情境不同。重做时先核对情境、四周参照、机会及逐题回应，再讨论变化。尚无已建立的重测与测量误差证据，较小数字变化不能量化个人发展。"
      }
    ]
  },
  {
    "id": "work-traits-evidence",
    "title": {
      "en": "Research context: original behavior reflection and named personality instruments",
      "zh": "研究背景：原创行为回顾与具名人格工具"
    },
    "paragraphs": [
      {
        "en": "Hogan’s own HPI description identifies a personality instrument with seven primary scales and forty-two subscales. [1] Forty-two subscales do not mean forty-two questions, and matching a number of groups does not establish the same construct. This page administers forty-two original contextual frequency prompts, not HPI, HDS, MVPI or an official Hogan preparation assessment.",
        "zh": "Hogan的HPI产品说明列有七个主量尺与四十二个分量尺。[1] 四十二个分量尺不等于四十二道题，组数相同也不确立构念相同。本页施测四十二条原创情境频率题，不是HPI、HDS、MVPI或官方Hogan备考测评。"
      },
      {
        "en": "IPIP is a public-domain pool containing many distinct items and scales. [2] Its existence does not make any newly written seven-group form an IPIP-HPI measure. This edition has not established reliability, construct or predictive validity, population norms or English–Chinese measurement equivalence. Its bilingual arithmetic is reproducible, while scientific claims about individual differences require evidence for this particular form and use.",
        "zh": "IPIP是包含多种独立条目与量尺的公共领域题库。[2] 题库存在，不意味着任何新写的七组题表都是IPIP-HPI测量。本版尚未建立信度、构念或预测效度、人群常模或英中测量等值。双语计分可复算，而有关个体差异的科学解释需要本题本及具体用途的证据。"
      }
    ]
  },
  {
    "id": "work-traits-practice",
    "title": {
      "en": "A practical next step: one example and a chosen adjustment",
      "zh": "可选应用：一个实例、一项自行选择的调整"
    },
    "paragraphs": [
      {
        "en": "If useful, privately choose one statement and recall a specific occasion: what was requested, what choice was available, what you did and what happened afterward. Consider a different explanation, such as unclear permission or a change of priority, before concluding that the number describes a personal deficit. You may try a small adjustment, such as confirming a handover requirement, and evaluate its actual effect.",
        "zh": "如有帮助，可私下选择一条陈述，回想一次具体经历：要求是什么、有哪些选择、自己做了什么及后来发生什么。先考虑权限不清或优先级改变等其他解释，再决定是否将数字理解为个人不足。可以自选小调整，例如确认交接要求，再根据实际效果评价。"
      },
      {
        "en": "Start opens the first prompt directly without an extra agreement screen. All forty-two questions and seven full guides are free without registration. Saving a tab draft is optional, lasts up to twenty-four hours and clears on completion, clearing or retake. Public sharing contains the title and entry link, not your ratings or means. No employer disclosure, further test, course or purchase is required.",
        "zh": "点击开始直接进入第一题，无需额外同意页面。四十二题及七篇完整指南免费，无需注册。保存标签页草稿为可选，最多二十四小时，完成、清除或重测后删除。公开分享包含标题及入口，不含评分或均值。无需向雇主披露、继续其他测试、参加课程或购买服务。"
      }
    ]
  }
];
export const workTraitsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does Seven Work Themes Reflection measure?",
      "zh": "七类工作主题回顾记录什么？"
    },
    "answer": {
      "en": "It records self-reported frequency for forty-two original behaviors in one work, study or volunteer setting over the past four weeks. Seven separate descriptive summaries are available, without a general personality or performance score.",
      "zh": "记录过去四周同一工作、学习或志愿情境中，四十二条原创行为的自报频率。七项描述性摘要分别呈现，不生成总体人格或绩效分。"
    }
  },
  {
    "question": {
      "en": "Is this a forty-two-question Hogan HPI test?",
      "zh": "这是四十二题Hogan HPI测试吗？"
    },
    "answer": {
      "en": "No. HPI’s product description distinguishes primary scales and subscales. [1] Neither is a count of this page’s items. Our original prompts, groups and scoring do not administer HPI or provide official Hogan scores or preparation results.",
      "zh": "不是。HPI产品说明区分主量尺与分量尺，[1] 都不是本页题目数量。本原创题、分组及计分不施测HPI，不提供官方Hogan分数或备考结果。"
    }
  },
  {
    "question": {
      "en": "How should I answer when I never had the opportunity?",
      "zh": "没有机会出现的行为该怎样回答？"
    },
    "answer": {
      "en": "Choose unscored. Never is appropriate when the relevant opportunity existed but the action did not occur. Neither missing opportunity nor uncertainty should be recoded as a low frequency or a neutral 3.",
      "zh": "选未评分。相关机会存在但没有该行动时才用从未。不应将没有机会或不确定改记为低频率或中立的3。"
    }
  },
  {
    "question": {
      "en": "Why is my mean missing after four numeric answers?",
      "zh": "四条数字作答后为什么仍没有均值？"
    },
    "answer": {
      "en": "Each group contains six items and needs five numeric ratings. Four ratings of 5 have a raw sum of 20 but no mean. Other groups cannot supply the missing coverage, and all seven full guides remain readable.",
      "zh": "每组六题，至少五条数字才显示均值。四条5的原始和为20，但不显示均值；其他组不能补足缺失覆盖，七篇完整指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "How do I check the arithmetic?",
      "zh": "怎样核对计算？"
    },
    "answer": {
      "en": "For one group, 1, 2, 4, 4, 5 and unscored give 16/5=3.2. Missing is excluded from the sum and denominator. There are no reverse items, combined scores, population percentiles or pass marks.",
      "zh": "同组1、2、4、4、5及未评分得到16/5=3.2。缺失不进入原始和及分母。没有反向题、综合分、人群百分位或通过线。"
    }
  },
  {
    "question": {
      "en": "Can I identify my strongest work trait from the seven means?",
      "zh": "七项均值能确定我最强的工作特质吗？"
    },
    "answer": {
      "en": "No. Group items, opportunities and purposes differ and have not been calibrated to a common trait scale. Read the particular actions within each theme rather than rank the groups or infer leadership potential.",
      "zh": "不能。各组条目、机会及目的不同，尚未校准为共同特质尺度。应阅读每主题内的具体行动，不对各组排名或推断领导潜力。"
    }
  },
  {
    "question": {
      "en": "Does more frequent behavior always help?",
      "zh": "行为更频繁就一定更好吗？"
    },
    "answer": {
      "en": "No. Starting action needs appropriate permission, contact needs appropriate timing and persistence needs a worthwhile task and available resources. Frequency does not independently verify the quality or effect of those actions.",
      "zh": "不是。开始行动需要适当权限，联系需要适当时机，坚持需要值得继续的任务及可用资源。频率不独立验证行动质量或效果。"
    }
  },
  {
    "question": {
      "en": "Can English and Chinese results be compared across employees?",
      "zh": "能用中英文结果比较不同员工吗？"
    },
    "answer": {
      "en": "No cross-language measurement equivalence, population norms or hiring validity has been established for this form. Translation parity and the same formula do not establish interchangeable scores. Use it privately for one context, not employee ranking or selection.",
      "zh": "本题本尚未建立跨语言测量等值、人群常模或招聘效度。翻译对应、公式相同不确立分数可互换。可私下用于一个情境的回顾，不用于员工排序或筛选。"
    }
  }
];
