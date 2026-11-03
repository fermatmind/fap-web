import type { Questionnaire } from "@/lib/questionnaires/types";
export const activityLandingSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "What activity engagement means in this form",
      "zh": "本页的活动参与方式指什么"
    },
    "paragraphs": [
      {
        "en": "This original self-report concerns ordinary activities you could choose during the past four weeks. It records starting an idea, responding to an opportunity, moving between interests, contributing when invited and observing a setting. These are five descriptions of reported actions, not five categories of people.",
        "zh": "本原创自评关注过去四周能够自主选择的普通活动，分别记录发起想法、回应机会、在兴趣间切换、受邀作出贡献与观察环境。这是五类自报行动的描述，不是五种人群分类。"
      },
      {
        "en": "One person may report several patterns in the same period, or use different patterns in different settings. Read the five results alongside opportunities and examples. A frequent behaviour does not establish greater capability, a better role or the amount of energy available to you.",
        "zh": "同一个人在同一时期可能报告多种方式，在不同情境也可能采用不同方式。应结合机会与实例阅读五项结果；某种行为较频繁，不代表能力更高、角色更好或拥有更多能量。"
      }
    ]
  },
  {
    "id": "start-respond",
    "title": {
      "en": "Starting an idea and responding to an offer can coexist",
      "zh": "自主发起与回应机会可以同时出现"
    },
    "paragraphs": [
      {
        "en": "Self-starting concerns taking a first small step on your own idea when you had a choice. Responding concerns engaging with a concrete opportunity or offer. The distinction is the described route into an activity, rather than a ranking of initiative or independence.",
        "zh": "自主发起关注有选择时，为自己的想法迈出小小第一步；回应机会关注面对具体机会或提议时参与其中。区别在于题目描述的活动入口，不是主动性或独立性的高低排序。"
      },
      {
        "en": "For example, you might propose a weekend sketching project and later accept a friend’s invitation to draw together. Both can occur. An idea can also have several influences; recall the actual action rather than rewriting its history to make it purely self-generated or purely reactive.",
        "zh": "例如，先提出周末速写计划，随后接受朋友一起画画的邀请，两种方式均可出现。一个想法也可能受到多种影响，应回看实际行动，不必将经历重新解释成纯粹自主或纯粹被动。"
      }
    ]
  },
  {
    "id": "other-patterns",
    "title": {
      "en": "Interest shifts, invited input and observation describe different actions",
      "zh": "兴趣切换、受邀贡献与环境观察描述不同动作"
    },
    "paragraphs": [
      {
        "en": "Moving between interests concerns the activities described in its four statements. It does not by itself show unfinished work, attention problems or unusual creativity. Invited contribution concerns offering input in response to an invitation; receiving fewer invitations is not evidence that you lack useful knowledge.",
        "zh": "兴趣切换关注对应四条陈述中的活动，不单凭这一项判断未完成任务、注意问题或非凡创造力。受邀贡献关注回应邀请而提供意见，收到邀请较少并不证明缺乏有用知识。"
      },
      {
        "en": "Observing the setting concerns noticing a situation before or during participation. Observation may happen before starting or accepting an offer. These descriptions do not require exclusive roles, and observing is not proof of reading other people’s feelings, predicting outcomes or absorbing an environment’s energy.",
        "zh": "环境观察关注参与前后留意具体情境，也可能发生在发起活动或接受提议之前。各类描述不要求互斥角色，观察环境不证明能读出他人感受、预测结果或吸收环境能量。"
      }
    ]
  },
  {
    "id": "opportunity",
    "title": {
      "en": "Use the four-week window and genuine opportunities",
      "zh": "结合四周时间范围与真实机会作答"
    },
    "paragraphs": [
      {
        "en": "Use the past four weeks rather than a lifetime identity or an ideal version of yourself. Consider optional ordinary activities in which you could genuinely choose. Work instructions, caregiving, access, money and available invitations may shape what happened; a frequency answer alone cannot separate all those influences.",
        "zh": "请回想过去四周，不以终身身份或理想自我作答。关注真正能够选择的普通自选活动。工作要求、照顾责任、可用资源、经济条件与收到的邀请，都可能影响经历；单项频率回答不能分离这些因素。"
      },
      {
        "en": "The scale runs from 1 Never to 5 Almost Always; 3 means Sometimes, not neutral agreement. Use Unscored for no suitable opportunity, uncertainty or a declined answer. Having no invitation to recall is different from repeatedly declining invitations that were available.",
        "zh": "选项从1“从不”至5“几乎每次”，3是“有时”，不是中立认同。没有合适机会、无法判断或不愿回答时可选未评分。没有可回想的邀请，与收到邀请却多次不参加，含义不同。"
      }
    ]
  },
  {
    "id": "means-example",
    "title": {
      "en": "Five separate means, with a visible coverage requirement",
      "zh": "五项均值分别计算，并保留覆盖要求"
    },
    "paragraphs": [
      {
        "en": "Each part contains four directly scored statements, without reversals. At least three numeric answers are required for that part: sum the rated values and divide by their number, then show one decimal. With 1, 2, 4 and Unscored, the sum is 7 over three ratings and the displayed mean is 2.3 / 5.",
        "zh": "每部分有四条直接计分陈述，无反向题。该部分至少需要三个数字回答：把已评分数值相加，除以评分条数，显示一位小数。例如1、2、4与未评分，合计7、评分三条，展示均值2.3 / 5。"
      },
      {
        "en": "With 5, 5 and two unscored answers, the part is Insufficient information, not 5.0. Unscored answers are excluded from the sum and denominator, not assigned zero or Never. Completing twenty explicit responses can validly leave all five means unavailable while every full guide remains open.",
        "zh": "若回答为5、5和两个未评分，则该部分显示资料不足，不显示5.0。未评分不进入分子或分母，不替换为零或“从不”。二十条均明确作答后，五项均资料不足也可成为完整记录，五篇指南仍然开放。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What a mean can and cannot establish",
      "zh": "均值能够说明什么"
    },
    "paragraphs": [
      {
        "en": "A mean summarises your ratings of these particular statements. The numeric spacing of the response labels is an implementation convention; 4.0 does not establish twice as much engagement as 2.0. Two people or two parts can have the same mean from different answers, opportunities and coverage.",
        "zh": "均值概括对这几条陈述的回答。选项标签的等距数值是计分约定，4.0不说明参与程度是2.0的两倍。不同的人或部分，可能由不同回答、机会与覆盖得到相同均值。"
      },
      {
        "en": "This original edition has no established norms, factor-structure evidence, reliability estimates or validated decision thresholds. It does not produce an overall score, highest type, percentile, diagnosis or job-fit verdict. Transparent arithmetic supports checking the output; it does not establish a scientifically validated human classification.",
        "zh": "本原创版本尚无常模、因素结构证据、信度估计或经验证的决策阈值，不生成总分、最高类型、百分位、诊断或岗位适配结论。透明算术支持核对输出，不等于建立经科学验证的人群分类。"
      }
    ]
  },
  {
    "id": "chart-distinction",
    "title": {
      "en": "How this differs from a Human Design chart",
      "zh": "与Human Design出生图表的方法区别"
    },
    "paragraphs": [
      {
        "en": "Jovian Archive describes Human Design Type and Strategy within its own framework, and a separate chart method using birth data. Those pages explain that system’s terminology and calculation inputs. They do not validate the five frequency themes in this questionnaire. [1][2]",
        "zh": "Jovian Archive在其自身框架中解释Human Design的Type与Strategy，并另行介绍使用出生数据的图表方法。这些页面说明该体系的术语与计算输入，不验证本问卷五项频率主题。[1][2]"
      },
      {
        "en": "Our twenty answers do not calculate a BodyGraph, centres, channels, authority or birth type. Similar words such as initiating, responding or invitation do not make the methods interchangeable. No result tells you to wait for permission, follow a birth-based strategy or delay an important decision for a cycle.",
        "zh": "本页二十条回答不计算BodyGraph、中心、通道、权威或出生类型。发起、回应、邀请等词语相似，不代表方法可互换。结果不要求等待许可、服从出生类型策略或按某个周期推迟重要决定。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Read a recent example without turning it into a fixed rule",
      "zh": "用近期实例核对，不转为固定规则"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one recent optional activity and describe privately what happened before you joined: an idea, a concrete offer, a change of interest, a request for input or a period of observation. Several descriptions may apply. Look for another example that does not fit; you need not force either event into a type.",
        "zh": "如有帮助，可私下回看一次近期自选活动，描述参与之前发生了什么：一个想法、具体提议、兴趣变化、征求意见，或一段观察。多种描述可以同时适用，也可寻找另一个不符合的例子，不必把任何经历塞进类型。"
      },
      {
        "en": "All five guides are free before answering. Answers remain in page memory without saved drafts, personal-result sharing or quiz-flow statistics; refreshing or changing language starts fresh. You may keep a useful observation, compare a guide or finish. No private note, birth information or follow-up purchase is requested.",
        "zh": "五篇指南在作答前均免费开放。回答仅留页面内存，不保存草稿、不分享个人结果，也不发送测试流程统计；刷新或换语言后重新开始。可以保留有用观察、比较指南或结束，不要求提交私人笔记、出生信息或购买后续服务。"
      }
    ]
  }
];
export const activityLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can several patterns be frequent?",
      "zh": "多项都频繁可以吗？"
    },
    "answer": {
      "en": "Yes. The five parts are independent, and the same activity can involve several described actions. No highest type is selected.",
      "zh": "可以。五部分独立，同一次活动也可涉及多个动作，不挑选最高类型。"
    }
  },
  {
    "question": {
      "en": "Is 3 a neutral answer?",
      "zh": "3表示中立吗？"
    },
    "answer": {
      "en": "No. In this frequency scale it means Sometimes. It is not a neutral opinion about whether a statement is good.",
      "zh": "不是。本频率选项中3表示有时，不是对陈述好坏的中立意见。"
    }
  },
  {
    "question": {
      "en": "How are 1, 2, 4 and Unscored handled?",
      "zh": "1、2、4与未评分怎样计算？"
    },
    "answer": {
      "en": "Three numeric ratings meet the minimum. The mean is 7 divided by 3, displayed as 2.3 / 5; the unscored item is excluded.",
      "zh": "三条数字达到最低要求，7除以3显示2.3 / 5，未评分条目不参与计算。"
    }
  },
  {
    "question": {
      "en": "Can two ratings of 5 produce 5.0?",
      "zh": "两条5能显示5.0吗？"
    },
    "answer": {
      "en": "No. Each four-item part requires at least three numeric answers. Two ratings produce Insufficient information.",
      "zh": "不能。四条一组至少需三个数字回答，两条显示资料不足。"
    }
  },
  {
    "question": {
      "en": "Does a high observation mean reveal others’ feelings?",
      "zh": "环境观察均值高能揭示他人感受吗？"
    },
    "answer": {
      "en": "No. It describes your answers about observing a setting; other people’s feelings require their own communication and context.",
      "zh": "不能。它描述对环境观察陈述的回答，他人感受仍需结合其表达与情境。"
    }
  },
  {
    "question": {
      "en": "Does changing interests measure attention or talent?",
      "zh": "切换兴趣测注意力或天赋吗？"
    },
    "answer": {
      "en": "No. These four statements describe reported activity patterns, without a diagnostic or ability score.",
      "zh": "不测。四条陈述描述自报活动方式，不生成诊断或能力分数。"
    }
  },
  {
    "question": {
      "en": "Can this determine my Human Design type?",
      "zh": "能确定Human Design类型吗？"
    },
    "answer": {
      "en": "No. It uses recent self-reports, not birth-chart calculations. Five independent means do not convert into a Type or Authority.",
      "zh": "不能。本页使用近期自评，不计算出生图表，五项独立均值不换算Type或Authority。"
    }
  },
  {
    "question": {
      "en": "Should a retest change guide my decisions?",
      "zh": "重测变化应该决定行动吗？"
    },
    "answer": {
      "en": "No. Check the recall window, opportunities and individual answers. Without measurement-error evidence, a change alone does not establish a stable personal change or a decision rule.",
      "zh": "不应。先核对回想时间、机会与具体回答；缺少测量误差证据时，单次差异不能确立稳定个人变化或决策规则。"
    }
  }
];
