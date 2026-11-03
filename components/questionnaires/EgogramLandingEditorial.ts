import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplement; source-bound original actions and reports remain unchanged. */
export const egogramLandingSections: QuestionnaireSection[] = [
  {
    "id": "ego-theory-form",
    "title": {
      "zh": "交互分析与自我状态图：理论、图形和题本是三件事",
      "en": "Transactional analysis, charts and questionnaires: distinguish the levels"
    },
    "paragraphs": [
      {
        "zh": "ITAA把父母、成人、儿童自我状态解释为相互交往中的思想、感受与行为系统。[2] TA101课程框架也分别列出自我状态结构模型、行为描述与自我状态图。[1] 因此，用五条横柱画出自报做法，是一种结果呈现；它不会自动证明已经识别了一个人的完整心理结构。",
        "en": "ITAA describes Parent, Adult and Child ego states as systems of thoughts, feelings and behaviours involved in interaction.[2] The TA101 outline distinguishes the structural model, behavioural descriptions and egograms.[1] Charting five groups of reported actions is therefore a presentation method, not automatic identification of someone’s complete psychological structure."
      },
      {
        "zh": "Dusay的1972年论文题名涉及自我状态图与“恒定假说”；这里核对的是出版记录，不把它当成本卷计分规则的实证支持。[3] 本站二十条为另写的频率观察，五组分别计算，没有固定总能量。也不是TEG3、Heyer量表或其他同名网站的标准短版，不能套用它们的常模、分界或人格代码。",
        "en": "Dusay’s 1972 publication concerns egograms and a “Constancy Hypothesis”; the bibliographic record does not establish evidence for this form’s scoring rules.[3] These twenty separately written frequency observations are scored in five groups without a fixed energy total. They are not TEG3, Heyer’s questionnaire or a standard short form of another site’s test, so those norms, thresholds and type codes do not transfer."
      }
    ]
  },
  {
    "id": "ego-five-actions",
    "title": {
      "zh": "五组分别观察什么？用同一次共同活动理解",
      "en": "What do the five groups observe? Follow one shared activity"
    },
    "paragraphs": [
      {
        "zh": "准备一次读书会时，CP规范表达可以是说清结束时间或保留一条约定；NP支持表达可以是先问暂时有困难的人是否需要帮助。前者不是指责人格，后者不是替别人决定。两组都可能常出现，也都需要回看具体措辞、是否得到同意，以及约定是否公平。",
        "en": "For a reading group, CP standards might involve stating the finish time or retaining an agreement; NP support might involve asking whether someone facing a temporary difficulty wants help. One is not a personal attack and the other is not deciding for someone else. Both can occur often, with wording, consent and fairness of agreements still needing examination."
      },
      {
        "zh": "A当下核对关注区分已知与待问、检查时间材料和随新事实修订判断；FC自主玩兴关注不打扰约定的小尝试与自愿表达。例如核对场地可用时间属于前者，试一种新的书签做法可能属于后者。A分数不测智力或成熟，FC分数也不测创造能力，更不要求忽视限制。",
        "en": "A checking concerns separating known from unknown, checking time and materials, and revising a judgement when facts change. FC play concerns small experiments and spontaneous expression without disrupting agreements. Checking venue availability illustrates the former; trying a new bookmark design may illustrate the latter. A measures neither intelligence nor maturity here, and FC establishes no creative ability or permission to ignore limits."
      },
      {
        "zh": "AC情境调整关注观察发言顺序、核对协调期待与暂时按共同次序配合。它可以与说清自己的要求同时存在，不等于总是服从或没有主见。五组描述本卷选定的具体做法；一次活动中的实际先后顺序、对方的回应及效果，不能仅凭五个均分还原。",
        "en": "AC adjustment concerns observing turn-taking, checking coordination expectations and temporarily following an agreed sequence. It can coexist with stating your own requirements, without implying universal obedience or no opinions. These groups describe actions selected for this form; five means cannot reconstruct their actual sequence, another person’s responses or the outcome."
      }
    ]
  },
  {
    "id": "ego-worked-mean",
    "title": {
      "zh": "四条怎样变成一组分数？7分与1.75算例",
      "en": "How do four ratings become a score? A worked 7 and 1.75"
    },
    "paragraphs": [
      {
        "zh": "每组四条都是正向频率题，没有反向计分。假设CP四条依次为1、1、2、3，总和为7，描述性均分7÷4＝1.75；同次其他组仍按各自四条计算。每组总和范围4—20，均分范围1—5，结果由未舍入总和计算并显示两位小数，不从通用的一位小数近似值倒推。",
        "en": "All four items in each group are directly keyed frequency ratings, with no reversal. CP ratings of 1, 1, 2, 3 give a sum of 7 and a descriptive mean of 7÷4=1.75; other groups use their own four ratings. Each sum ranges from 4 to 20 and each mean from 1 to 5. Results divide the unrounded sum and display two decimals rather than reconstructing them from a one-decimal approximation."
      },
      {
        "zh": "CP同为12分，可以来自3、3、3、3，也可以来自1、1、5、5。前者都是有时，后者在不同做法间差异很大。均分便于概括，但不能代替逐条回答，也不能把3.00解释为人群平均、最佳平衡或60%的心理能量。横柱长度对应频率刻度，不是占全部人格的比例。",
        "en": "A CP sum of 12 can arise from 3, 3, 3, 3 or 1, 1, 5, 5. The first describes Sometimes throughout; the second differs substantially across actions. A mean summarises without replacing item-level answers. A 3.00 establishes neither population average, ideal balance nor 60 percent psychic energy. Bar length follows a frequency scale, not a share of a whole personality."
      }
    ]
  },
  {
    "id": "ego-opportunity-na",
    "title": {
      "zh": "没有机会不等于从不：五组各自保留不足",
      "en": "No opportunity is not Never: each group keeps its own missing status"
    },
    "paragraphs": [
      {
        "zh": "“从不”表示有相应机会时没有这样做；“没有相应机会”表示缺少判断依据。例如四周没有参与新小组，不能仅因没有观察发言顺序的记录就认定AC低。应选NA，而不是用1或3补出完整图形。频率回答也不记录机会次数，因此不能从相同均分判断两人的行为总量相同。",
        "en": "Never means not doing an action when relevant opportunities arose; no opportunity means insufficient grounds to rate it. If you joined no new group in four weeks, no record of observing its turn-taking does not establish low AC. Use NA rather than 1 or 3 to complete a chart. Ratings do not record opportunity counts, so equal means establish no equal total amount of behaviour between people."
      },
      {
        "zh": "任一组有NA，该组不画个人频率柱，也不按三条估算或填零，其他四条齐全的组照常显示。五份九节全文不受影响。所有条目都选NA时也可以结束本次作答，看到资料不足和完整指南；这不是测试失败，更不是五种做法都不存在。",
        "en": "Any NA withholds that group’s personal frequency bar, without estimating from three items or inserting zero. Other fully rated groups remain visible, as do all five nine-section guides. An all-NA attempt can finish with insufficient information and the full guides. That establishes neither a failed test nor absence of all five practices."
      }
    ]
  },
  {
    "id": "ego-shapes-context",
    "title": {
      "zh": "高低、并排与图形：不选择一种最佳人格",
      "en": "Heights and chart shapes: no best personality is selected"
    },
    "paragraphs": [
      {
        "zh": "五组可以都高、都低或相同，不需要把一个分数转给另一个。全选5得到五组各20分、5.00均分，仍不是五项能力满分。较高只说明自报这些做法较频繁，较低也可能涉及机会、职责或表达方式；没有常模和预设分档，不给最高柱分配“主导人格”。",
        "en": "All five groups may be high, low or equal without transferring points between them. Choosing 5 throughout gives each group 20 and a mean of 5.00, not five perfect ability scores. Higher describes more frequently reported actions; lower may involve opportunities, responsibilities or ways of expressing them. Without norms or preset bands, the tallest bar receives no dominant-personality label."
      },
      {
        "zh": "看到CP和NP都较常出现，可以回想自己是否既说清标准，也先询问支持需要；再找一例没有做到的情境。不能因图形像M、N、W或山形，就套用其他工具的代码或认定关系命运。相同图形可能来自不同条目组合，也可能发生在完全不同的工作和家庭安排中。",
        "en": "If CP and NP are both frequent, review whether you stated standards and asked about support needs, then find a counterexample. Resemblance to an M, N, W or mountain shape does not license another tool’s codes or relationship predictions. Similar charts can arise from different item patterns and very different work or home arrangements."
      }
    ]
  },
  {
    "id": "ego-evidence-limits",
    "title": {
      "zh": "研究证据怎样对应版本？不能借其他题本的结论",
      "en": "How does evidence relate to editions? Another form’s findings do not transfer"
    },
    "paragraphs": [
      {
        "zh": "Heyer于1979年发表过自我状态问卷开发研究，公开摘要说明了该工具的研究应用。[4] 这支持存在不同问卷版本的事实，不证明本站二十条已经完成同样验证。理论课程、出版历史、流行程度与本题本的信度、效度、常模及中英文测量等价性，需要分开核对；本版尚未建立这些测量证据。",
        "en": "Heyer published questionnaire-development research in 1979, with a public abstract describing research applications of that instrument.[4] That establishes a distinct questionnaire, not equivalent validation of these twenty items. Theory courses, publication history and popularity must be distinguished from form-specific reliability, validity, norms and English–Chinese measurement equivalence. Those properties remain unestablished for this edition."
      },
      {
        "zh": "这里没有观察你的真实对话、让熟悉的人独立评分，或检验行为效果。父母、成人、儿童沿用功能标签，不指性别、真实年龄、家庭地位或童年原因；也不评定心理年龄、疾病、领导能力或工作适任性。可以用词汇讨论一次交往，不宜据此给他人定性或作招聘、诊断和关系裁决。",
        "en": "This form observes no actual conversations, collects no independent ratings from someone familiar with you and tests no behavioural effects. Parent, Adult and Child are functional labels, not gender, age, family rank or childhood causes. They establish neither mental age, illness, leadership nor job suitability. Use the vocabulary to discuss an interaction without labelling someone or deciding hiring, diagnosis or relationships."
      }
    ]
  },
  {
    "id": "ego-optional-review",
    "title": {
      "zh": "从图形回到一次交流：具体核对而非追高分",
      "en": "Return from the chart to an interaction: check specifics rather than raise scores"
    },
    "paragraphs": [
      {
        "zh": "选择双方愿意回看的小事，分别写出当时有什么约定、自己说了做了什么、对方如何回应、哪些还只是推测。比如把“你总是配合过度”换成“这次分工你愿意接哪一段？”先核对意愿，再协商调整。支持可以被拒绝，配合也可以有边界；没有哪一类高分要求你替别人负责或放弃休息。",
        "en": "Choose a small event both people are willing to revisit. Separate the agreement, what you said and did, their response and remaining assumptions. Replace “you always adapt too much” with a question about which part of this task they want to take. Check willingness before adjusting. Support can be declined and coordination can have limits; no high score requires taking over responsibility or giving up rest."
      },
      {
        "zh": "之后可以留意一次具体变化是否有帮助，同时记录不符合预期的例子。这些是可选观察问题，不是经过本卷验证的干预。重测时先比较四周情境、可用机会、语言和具体条目；分数变动尚无本版可靠变化阈值，不能直接解释为治疗、成长或某种能量转移。",
        "en": "Notice whether a specific adjustment helps, alongside an example that does not fit expectations. These are optional prompts rather than an intervention validated by this form. For a retake, first compare four-week circumstances, opportunities, language and actual items. There is no established reliable-change threshold for this edition, so score differences establish neither treatment effects, growth nor an energy transfer."
      }
    ]
  }
];

export const egogramLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "CP、NP、A、FC、AC就是五种固定人格吗？",
      "en": "Are CP, NP, A, FC and AC five fixed personalities?"
    },
    "answer": {
      "zh": "不是。本页分别观察规范表达、支持、当下核对、玩兴和情境配合。它们可在同一次活动先后出现，不按最高柱给人分类。[1][2]",
      "en": "No. They organise standards, support, present-focused checking, play and situational adjustment here. They can occur in sequence within one activity; the tallest bar assigns no personality class.[1][2]"
    }
  },
  {
    "question": {
      "zh": "为什么CP总分7、均分1.75？",
      "en": "Why can CP have a sum of 7 and mean of 1.75?"
    },
    "answer": {
      "zh": "四条为1、1、2、3时直接相加得7，7÷4＝1.75。本卷没有反向题，其他组分别计算。",
      "en": "Ratings of 1, 1, 2, 3 sum directly to 7; 7÷4=1.75. This form has no reverse items, and the other groups are scored separately."
    }
  },
  {
    "question": {
      "zh": "五组都选5，会互相挤占分数吗？",
      "en": "Do five groups rated 5 throughout compete for points?"
    },
    "answer": {
      "zh": "不会。五组都可各20分、5.00均分，记录频率，不是能力满分或固定能量份额。",
      "en": "No. Each can have a sum of 20 and mean of 5.00. These record frequency, not perfect ability or shares of fixed energy."
    }
  },
  {
    "question": {
      "zh": "没有参加新小组，可以选从不吗？",
      "en": "Can I choose Never if I joined no new group?"
    },
    "answer": {
      "zh": "如果没有相应机会，应选NA。1表示有机会时从不这样做，3表示有时，都不能代替无法判断。",
      "en": "Choose NA if the relevant opportunity did not arise. A 1 means Never when there was an opportunity and a 3 means Sometimes; neither substitutes for inability to judge."
    }
  },
  {
    "question": {
      "zh": "CP少一条，其他四组还能看吗？",
      "en": "Can I see the other four groups if one CP rating is missing?"
    },
    "answer": {
      "zh": "可以。CP保留资料不足，四条齐全的其他组照常显示；五份九节完整指南全部开放。",
      "en": "Yes. CP retains insufficient information, other fully rated groups still display, and all five nine-section guides remain open."
    }
  },
  {
    "question": {
      "zh": "成人最高，是否表示更成熟或聪明？",
      "en": "Does the highest Adult score establish maturity or intelligence?"
    },
    "answer": {
      "zh": "不表示。A只汇总本卷四种当下核对做法的自报频率。儿童和父母也不是实际年龄或家庭身份。[2]",
      "en": "No. A summarises reported frequency of four checking actions in this form. Child and Parent are not actual ages or family identities either.[2]"
    }
  },
  {
    "question": {
      "zh": "已有自我状态问卷研究，为什么本版还需验证？",
      "en": "Why does this edition need evidence if ego-state questionnaires have been studied?"
    },
    "answer": {
      "zh": "Heyer研究采用的是另一份问卷。[4] 名称相同不代表题目、语言、反应刻度与用途相同，不能借其验证本版。",
      "en": "Heyer studied a different questionnaire.[4] Shared labels establish no equivalence of items, language, response scales or uses and cannot validate this edition."
    }
  },
  {
    "question": {
      "zh": "开始后还需填写邮箱、同意或其他测评吗？",
      "en": "Does Start require an email, another agreement or assessment?"
    },
    "answer": {
      "zh": "不需要，直接进入20条题目，全部结果免费。无需提交对话、童年经历或第三人资料，也可以先读五份指南。",
      "en": "No. Start opens twenty items directly and all results are free. No conversations, childhood experiences or third-party details are submitted. All five guides can also be read first."
    }
  }
];
