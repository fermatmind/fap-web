import type { Questionnaire } from "@/lib/questionnaires/types";

export const cbiLandingSections: Questionnaire["guide"] = [
  {
    "id": "cbi-selected-modules",
    "title": {
      "en": "Which burnout questionnaire is this? Two complete CBI modules",
      "zh": "这是哪种倦怠测试？两个完整CBI模块"
    },
    "paragraphs": [
      {
        "en": "The Copenhagen Burnout Inventory (CBI) distinguishes personal, work-related and client-related exhaustion. This page administers the complete personal six-item and work-related seven-item modules, preserving their original English wording and source scoring. It omits the six client-related items. Thirteen selected items therefore describe the scope of this presentation, not a newly validated short form or the complete nineteen-item inventory. [1][2]",
        "zh": "哥本哈根倦怠量表（CBI）区分个人、工作相关与服务对象相关耗竭。本页施测完整个人六题、工作相关七题，保留英文原题与源计分；未施测服务对象相关六题。因此十三条描述的是本呈现的范围，不是新验证短版或完整十九题。[1][2]"
      },
      {
        "en": "The two eight-section guides explain the modules independently, including higher, lower, partial and insufficient readings. They remain fully readable before answering and after any completed attempt. A page elsewhere called a burnout test may use a different instrument or original questions. Its number of bars, labels or advertised severity ranges cannot be transferred to these CBI means.",
        "zh": "两份各八节指南分别解释模块，包含较高、较低、部分有效与资料不足；作答前和完成后都完整可读。其他同名倦怠测试可能采用不同工具或原创题，其图表数量、标签或宣传的严重程度范围，不能移用到本页CBI均分。"
      }
    ]
  },
  {
    "id": "cbi-personal-work",
    "title": {
      "en": "Personal exhaustion and a perceived connection to work",
      "zh": "个人耗竭与本人感到的工作联系"
    },
    "paragraphs": [
      {
        "en": "Personal questions concern reported physical and psychological exhaustion without identifying its source. Work questions explicitly ask about experiences perceived as connected with work, including emotional exhaustion, frustration, the working day, mornings and leisure-time energy. [2] A respondent’s attribution is useful information about their experience; it is not a controlled comparison proving which conditions caused it.",
        "zh": "个人题涉及自述身体与心理耗竭，没有识别来源；工作题明确询问本人感到与工作相关的经历，涉及情绪耗竭、挫败、工作日、早晨与闲暇精力。[2] 本人归因是理解经历的信息，不是通过控制比较证明哪些条件造成了耗竭。"
      },
      {
        "en": "For a fictional person with both work and caring responsibilities, similar module means could accompany quite different experiences. A personal mean higher than the work mean does not calculate a non-work share; subtracting the means or dividing one by the other does not allocate causes. Neither module observes workload, sleep, health, staffing or job performance directly.",
        "zh": "例如一位同时有工作与照护责任的虚构作答者，两个模块均分相近，仍可能包含很不同的经历。个人均分高于工作均分，不计算工作以外的份额；相减或相除也不能分摊成因。两模块都未直接观察工作量、睡眠、健康、人手或工作表现。"
      }
    ]
  },
  {
    "id": "cbi-formats",
    "title": {
      "en": "Answer the displayed frequency or degree anchors",
      "zh": "根据实际显示的频率或程度作答"
    },
    "paragraphs": [
      {
        "en": "All personal items use frequency. The first three work items use degree, while the final four work items use frequency. Both have five source codes: 100, 75, 50, 25 and 0. Their verbal meanings differ, so follow the displayed labels rather than reusing the last answer mechanically. The source specifies no numerical recall period; this page does not add a last-week or last-month requirement. [2]",
        "zh": "个人题全部问频率。工作前三题问程度，后四题问频率；两种格式的五档源编码均为100、75、50、25、0，但文字含义不同，应按显示标签回答，不机械沿用上一题选项。源说明未规定数字化回忆期限，本页不另加过去一周或一月要求。[2]"
      },
      {
        "en": "The website interleaves the two modules and adds a separate unscored NA choice for an inapplicable, unable or unwilling response. These presentation choices and the working Chinese translation have not established measurement equivalence. Work questions need an applicable work situation; NA is available when there is none. Start opens the first question directly, with no additional agreement, account or payment.",
        "zh": "网站交错呈现两个模块，并增加单独未评分NA，供不适用、无法或不愿回答时选择。这些呈现选择与工作中译尚未建立测量等价。工作题需要适用工作情境，没有时可选NA。开始直接打开第一题，无需再次同意、账户或付款。"
      }
    ]
  },
  {
    "id": "cbi-exact-arithmetic",
    "title": {
      "en": "CBI scoring: one reversal and the actual valid denominator",
      "zh": "CBI计分：一条反向与实际有效分母"
    },
    "paragraphs": [
      {
        "en": "Only the final work item, about sufficient leisure-time energy for family and friends, is reversed: its contribution is 100 minus the selected code. All other selected items are direct. Add adjusted contributions separately within each module, divide by that module’s valid count and display two decimals from the unrounded mean. The personal minimum is three valid items; the work minimum is four. [2]",
        "zh": "只有工作最后一条关于闲暇时陪伴亲友精力是否充足的题反向，贡献为100减所选编码，其余所选条目正向。各模块分别相加调整后贡献，除以本模块有效题数，从未舍入均分显示两位小数；个人至少三项有效，工作至少四项。[2]"
      },
      {
        "en": "A fresh full personal sequence 75, 25, 50, 0, 100, 25 sums to 275; 275/6 displays 45.83. A fresh work sequence in source order 25, 75, 50, 25, 100, 0, 75 has a final adjusted contribution of 25 and sum 300; 300/7 displays 42.86. Do not average rounded module means into a new total, reverse the energy answer twice or read score points as probability.",
        "zh": "新的完整个人序列75、25、50、0、100、25，总和275，275/6显示45.83。按源顺序的工作序列25、75、50、25、100、0、75，最后一条调整为25，总和300，300/7显示42.86。不要把舍入后的模块均分再平均成总分、将精力题反向两次，或把分数点读成概率。"
      }
    ]
  },
  {
    "id": "cbi-partial-information",
    "title": {
      "en": "Partial responses: valid zero is different from missing",
      "zh": "部分有效回答：零分与缺失不同"
    },
    "paragraphs": [
      {
        "en": "All thirteen displayed questions need a selection, including NA where necessary. A module below its source minimum shows insufficient information rather than a personal sum or mean. Missing answers are not filled with zero or the midpoint. Three valid personal zeroes or four valid work zeroes produce 0.00; two personal or three work ratings remain insufficient even when all are zero.",
        "zh": "十三条显示题均需选择，必要时选NA。低于源最低有效数的模块，显示资料不足，不产生个人总和或均分；缺答不补零或中点。个人三项有效零或工作四项有效零得到0.00；只有两项个人或三项工作有效时，即使均为零仍不足。"
      },
      {
        "en": "For another example, three personal codes 75, 0 and 25 with the remaining items NA give 100/3 = 33.33. Four work responses 100, 50, 25 and 100, with the fourth referring to the reversed energy item and the other work items NA, give adjusted sum 175 and mean 43.75. Read which items contributed as well as the count; different partial sets are not identical evidence.",
        "zh": "另例个人三项编码75、0、25，其余NA，100/3显示33.33。工作四项回答100、50、25、100，其中第四项指反向精力题，其余工作题NA，调整总和175，均分43.75。除有效数外还应看贡献了哪些条目，不同部分题组不是相同证据。"
      }
    ]
  },
  {
    "id": "cbi-who-distinction",
    "title": {
      "en": "CBI and WHO occupational burnout describe different scopes",
      "zh": "CBI与WHO职业倦怠的范围不同"
    },
    "paragraphs": [
      {
        "en": "WHO describes burnout in ICD-11 as an occupational phenomenon associated with unsuccessfully managed chronic workplace stress, rather than classifying it as a medical condition. Its description includes exhaustion, job-related distance or cynicism, and reduced professional efficacy. [4] These are not the same as the CBI personal, work and client modules; this two-module page cannot assess the entire WHO description.",
        "zh": "WHO在ICD-11中将倦怠描述为与未成功管理的慢性职场压力相关的职业现象，不将其归类为医学疾病；其描述包括耗竭、与工作的心理疏离或消极态度，以及职业效能降低。[4] 这不等于CBI个人、工作、服务对象三个模块，本页两个模块也不评估完整WHO描述。"
      },
      {
        "en": "Personal exhaustion can be discussed without extending WHO’s occupational term to every area of life. The page does not determine whether fatigue has a physical, psychological, work-related or other explanation. A lower CBI mean is not a health certificate, and a higher mean does not settle a diagnosis, fitness for work or an individual’s future risk.",
        "zh": "讨论个人耗竭，不需要把WHO职业术语扩大到所有生活领域。本页不判定疲倦属于身体、心理、工作还是其他原因；较低CBI均分不是健康证明，较高均分也不确立诊断、工作适任性或个人未来风险。"
      }
    ]
  },
  {
    "id": "cbi-puma-evidence",
    "title": {
      "en": "What the PUMA research supports, and what it does not",
      "zh": "PUMA研究支持什么，不能推出什么"
    },
    "paragraphs": [
      {
        "en": "Borritz and colleagues’ 2006 report describes the design and baseline findings of the Danish PUMA project. Its abstract reports a five-year study framework comprising 2,391 human-service employees, an 80.1% baseline response rate and associations between work burnout, working conditions and absence. [3][7] Baseline associations are not a personal prediction or proof of the cause of one visitor’s exhaustion.",
        "zh": "Borritz等2006年报告介绍丹麦PUMA项目设计与基线发现，摘要描述纳入2,391名人群服务行业员工的五年研究框架，基线回应率80.1%，并报告工作倦怠、工作条件与缺勤的关联。[3][7] 基线关联不是对个人的预测，也不证明某位访客耗竭的原因。"
      },
      {
        "en": "Permission to use a source instrument, research about that instrument and evidence for a particular digital translation are different matters. NFA permits commercial and non-commercial CBI use with the specified PUMA citation. [1] This page retains that attribution and identifies its adaptations. The working Chinese, optional NA and interleaved presentation do not automatically inherit the original study’s measurement properties or population comparisons.",
        "zh": "源工具使用许可、关于该工具的研究，以及某个数字译本的测量证据，是不同事项。NFA允许商业及非商业使用CBI，条件是明确引用指定PUMA研究。[1] 本页保留署名，并说明自身改编；工作中译、自愿NA与交错呈现，不自动继承原研究的测量表现或人群比较。"
      }
    ]
  },
  {
    "id": "cbi-support-context",
    "title": {
      "en": "Use the description to prepare appropriate support",
      "zh": "用具体经历准备合适的支持"
    },
    "paragraphs": [
      {
        "en": "If useful, privately note one exhaustion experience, when it occurs and how it affects daily life. NHS guidance advises seeking medical advice when unexplained tiredness persists or affects everyday activities. [6] A health professional can consider information this questionnaire does not collect. You do not have to reach a particular score or complete another test before discussing a concern.",
        "zh": "如有帮助，可私下记下一项耗竭感受、出现情境及对生活的影响。NHS建议在疲倦持续且原因不明，或影响日常活动时寻求医疗建议。[6] 健康专业人员可考虑问卷未收集的信息；讨论困扰无需先达到某分数或完成另一测试。"
      },
      {
        "en": "Work-related concerns may also call for discussion of workload, control, staffing or support. WHO recommends organizational action on working conditions with meaningful worker involvement, alongside individual support. [5] Where appropriate and available, discuss the relevant conditions without being required to disclose questionnaire answers. Optional saving stays separate from answering; public guide links contain no personal responses or means.",
        "zh": "工作相关困扰也可能需要讨论工作量、自主空间、人手或支持。WHO建议对工作条件采取组织行动，让劳动者有意义地参与，同时提供个人支持。[5] 在合适且可获得的情况下，可讨论相关条件，而非被要求披露问卷答案。自愿保存与作答分开，公开指南链接不含个人回答或均分。"
      }
    ]
  }
];

export const cbiLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Are thirteen items a validated short CBI?",
      "zh": "十三题就是经过验证的CBI短版吗？"
    },
    "answer": {
      "en": "This page selects two complete source modules, not a new short-form validation. It omits the client module while retaining personal six and work seven. Names alone do not establish equivalence to another thirteen-item product.",
      "zh": "本页选择两个完整源模块，不代表新的短版验证；保留个人六题、工作七题，未施测服务对象模块。同为十三题的名称不建立产品等价。"
    }
  },
  {
    "question": {
      "en": "Should I use a last-month recall period?",
      "zh": "需要统一回想过去一个月吗？"
    },
    "answer": {
      "en": "The selected source does not specify a numerical recall period. Follow the displayed frequency or degree wording. A four-week instruction on another website is not part of this selected source. [2]",
      "zh": "所选源没有数字化回忆期限，请按显示的频率或程度措辞作答；其他网站的四周说明不是本选定源的组成部分。[2]"
    }
  },
  {
    "question": {
      "en": "Does choosing zero on the energy question mean zero exhaustion?",
      "zh": "精力题选零，就计零耗竭吗？"
    },
    "answer": {
      "en": "No. The work-energy item reverses: a raw zero contributes 100, while a raw 100 contributes zero. Neither is missing. It contributes once, alongside the other valid work items.",
      "zh": "不是。工作精力题反向，原编码0贡献100，原编码100贡献0；两者都非缺失，仅与其他有效工作题一起计入一次。"
    }
  },
  {
    "question": {
      "en": "Why can three personal ratings be enough but three work ratings are not?",
      "zh": "为什么个人三项可以，工作三项不行？"
    },
    "answer": {
      "en": "The source sets different minima for the six- and seven-item modules: three and four valid ratings respectively. Average only valid contributions after meeting the module’s minimum. [2]",
      "zh": "源对六题与七题模块设置不同最低数，分别为三项与四项；达到所属最低数后，只用有效贡献求平均。[2]"
    }
  },
  {
    "question": {
      "en": "Does 42.86 out of 100 mean a 42.86 percent risk?",
      "zh": "42.86／100表示42.86%的风险吗？"
    },
    "answer": {
      "en": "No. It is a mean on the source’s score-point coding, not a probability or percentile. Two decimals show the arithmetic; they do not establish equally precise clinical knowledge.",
      "zh": "不是。它是源分数点编码的均分，不是概率或百分位。两位小数显示算术结果，不代表同样精度的临床判断。"
    }
  },
  {
    "question": {
      "en": "Can personal minus work show the non-work cause?",
      "zh": "个人分减工作分能算工作以外的原因吗？"
    },
    "answer": {
      "en": "No. The modules ask different questions, and one asks about a perceived work connection. Subtraction does not divide exhaustion into causal shares.",
      "zh": "不能。模块问题不同，其中一个还询问本人感到的工作联系，相减不能把耗竭分成因果份额。"
    }
  },
  {
    "question": {
      "en": "Does a low mean mean I should ignore persistent tiredness?",
      "zh": "均分低，就可以忽略持续疲倦吗？"
    },
    "answer": {
      "en": "No. A lower reported mean cannot exclude health concerns or explain fatigue. Appropriate professional advice can be sought for persistent unexplained or disruptive tiredness independently of the score. [6]",
      "zh": "不能。较低自报均分不排除健康困扰，也不解释疲倦。持续、原因不明或妨碍生活时，可独立于分数寻求合适专业建议。[6]"
    }
  },
  {
    "question": {
      "en": "Must I consent again or register after Start?",
      "zh": "点击开始后还要再同意或注册吗？"
    },
    "answer": {
      "en": "No. Start opens question one directly. All thirteen items and both complete guides are free; temporary saving is separate and voluntary. Source attribution stays visible without becoming an entry gate.",
      "zh": "不需要。开始直接打开第一题，十三条及两份完整指南免费；临时保存另行自愿选择，来源署名可见但不成为作答门槛。"
    }
  }
];

export const cbiLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "NFA research record: Borritz et al. (2006), PUMA baseline abstract",
      "zh": "NFA研究记录：Borritz等（2006）PUMA基线摘要"
    },
    "url": "https://nfa.elsevierpure.com/en/publications/burnout-among-employees-in-human-service-work-design-and-baseline/"
  }
];
