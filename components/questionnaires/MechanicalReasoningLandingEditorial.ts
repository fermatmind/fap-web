import type { Questionnaire } from "@/lib/questionnaires/types";

export const mechanicalReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "mechanical-scope",
    "title": {
      "zh": "机械推理测试练什么？五类模型、30道文字与数量题",
      "en": "What does mechanical reasoning practice cover? Five models and thirty written tasks"
    },
    "paragraphs": [
      {
        "zh": "机械推理需要先识别结构与已知条件，再选择物理关系推算未知量。本页按杠杆、外啮合齿轮、滑轮、线性弹簧和流体分组，每组六道原创四选一。题干以文字和数值明确力臂、轴连接、支持绳股、形变量及压强条件；插图用于识别主题，不是答题必须量取的工程图。",
        "en": "Mechanical reasoning starts by identifying the arrangement and given conditions, then choosing a physical relation to find an unknown. This bank has six original four-option items each on levers, external gears, pulleys, linear springs and fluids. Text and numbers specify arms, shaft connections, supporting segments, deformation and pressure conditions. The illustration identifies the topic; it is not an engineering drawing to measure for an answer."
      },
      {
        "zh": "练习不计时，可用草图、纸笔和计算器；约18分钟是编辑估计。完成全部30题后，免费查看所选答案、正确答案、每题解析、五项各六题的正确数，以及五份完整指南。电路、内齿圈、材料试验和真实装置操作不在本版题目范围内。",
        "en": "The practice is untimed, and sketches, paper and a calculator are allowed. About eighteen minutes is an editorial estimate. After all thirty responses, you can read your choices, keys, every rationale, five six-item correct counts and all five full guides free. Circuits, internal ring gears, material testing and operating real equipment are outside this edition."
      }
    ]
  },
  {
    "id": "mechanical-levers-gears",
    "title": {
      "zh": "杠杆与齿轮：分开力矩、转速、扭矩和方向",
      "en": "Levers and gears: separate moments, speed, torque and direction"
    },
    "paragraphs": [
      {
        "zh": "杠杆平衡取支点到力线的垂直距离，按转向加力矩，不能只比较力大小。另设无重水平梁左0.50米处向下24牛、右0.30米处向下施力，平衡需40牛：两侧力矩均为12牛米。两力都向下，仍可因处于支点两侧而产生相反转向。[1]",
        "en": "For lever balance, use perpendicular distance from the pivot to each force line and add signed moments. In a fresh massless horizontal-beam example, 24 N downward at 0.50 m left balances 40 N downward at 0.30 m right: each moment is 12 N m. Both forces point down, but their turning effects oppose. [1]"
      },
      {
        "zh": "齿轮须分别判断大小与方向。另设理想外啮合主动轮24齿、200转/分，从动轮60齿，转速为80转/分；若输入扭矩1.5牛米且无损，输出为3.75牛米。转速用反齿数比、扭矩用正齿数比；从同侧看，每次外啮合反向。同轴、内啮合或打滑结构不能直接照搬这些条件。[2]",
        "en": "Keep gear magnitude separate from turning direction. A fresh ideal external pair with a 24-tooth driver at 200 rpm and a 60-tooth output gives 80 rpm; lossless input torque of 1.5 N m gives 3.75 N m output. Speed and torque use opposite tooth ratios. Viewed from one side, each external engagement reverses direction. Shared shafts, internal gears or slip require their own stated arrangement. [2]"
      }
    ]
  },
  {
    "id": "mechanical-pulleys",
    "title": {
      "zh": "滑轮：先数支持动块的绳股，再核对行程与功",
      "en": "Pulleys: count supporting segments, then check travel and work"
    },
    "paragraphs": [
      {
        "zh": "判断省力比应先画出动块与支持它的绳段。只改变绳方向的定滑轮不会自行增加支持股数；同一理想绳的等张力竖直支持段，才可按股数相加。题设明确总重含动块时，不再重复加入设备重量。[1]",
        "en": "Isolate the moving block and the rope segments supporting it. A fixed pulley that only redirects a rope does not itself add support. Add the upward forces of the stated equal-tension vertical segments. If the given total already includes the block, do not add its weight again. [1]"
      },
      {
        "zh": "另设四股理想竖直绳支持总重280牛，匀速上升0.30米：每股张力70牛，自由端拉过1.20米，输入功70×1.20与负载功280×0.30都为84焦。省力对应增加行程，不会增加能量。这个纸上例子不确定真实起吊装置的承载条件。",
        "en": "For a fresh ideal example, four vertical segments support a total 280 N load rising steadily through 0.30 m. Tension is 70 N, free-rope travel is 1.20 m, and both 70 × 1.20 and 280 × 0.30 give 84 J. Less effort is exchanged for more travel, not additional energy. This paper example does not determine a real hoist’s capacity."
      }
    ]
  },
  {
    "id": "mechanical-springs",
    "title": {
      "zh": "弹簧：区分形变量、全长、力的大小与回复方向",
      "en": "Springs: distinguish deformation, total length, magnitude and direction"
    },
    "paragraphs": [
      {
        "zh": "本页只在题定线性范围内使用胡克关系。力的大小为劲度乘相对原长的形变量；带符号的回复力与位移方向相反。劲度单位牛/米，因此厘米、毫米须先换成米。静止悬挂题要先把千克质量乘题给g换成牛顿重量。[3]",
        "en": "Hooke’s relation is used only within the stated linear range. Force magnitude is stiffness times deformation from natural length; signed restoring force opposes displacement. With stiffness in N/m, convert centimetres or millimetres to metres first. A stationary hanging mass must be converted to weight using the stated g. [3]"
      },
      {
        "zh": "另设劲度320牛/米、伸长15毫米，回复力大小为320×0.015=4.8牛；若同一稳态力改作用于640牛/米的独立理想弹簧，伸长为7.5毫米。保持不变的是外力，变化的是劲度；两根独立弹簧也不能擅自看成串联。",
        "en": "A fresh spring with stiffness 320 N/m and extension 15 mm has restoring-force magnitude 320 × 0.015 = 4.8 N. The same steady force on a separate ideal 640 N/m spring produces 7.5 mm extension. Force stays fixed while stiffness changes; separate springs must not silently be treated as a series assembly."
      }
    ]
  },
  {
    "id": "mechanical-fluids",
    "title": {
      "zh": "流体：液深压强、附加压强与活塞行程分别求解",
      "en": "Fluids: distinguish depth pressure, added pressure and piston travel"
    },
    "paragraphs": [
      {
        "zh": "静止、定密度液体的液柱压强增量按ρgΔh求，Δh取竖直高差。增量与绝对压强不同，后者还须考虑表面压强。另设密度850千克/立方米、g=10牛/千克、深0.60米，液柱增量为5100帕；若表面为100000帕，绝对值才为105100帕。[4]",
        "en": "For a stationary constant-density liquid, the column-pressure increase is ρgΔh using vertical separation. Absolute pressure additionally needs surface pressure. A fresh example with density 850 kg/m³, g = 10 N/kg and depth 0.60 m gives an increase of 5100 Pa; a stated surface pressure of 100000 Pa makes the absolute value 105100 Pa. [4]"
      },
      {
        "zh": "理想液压同高活塞传递相同附加压强，不是相同力。另设面积5与25平方厘米，小活塞附加力16牛，则大活塞附加力80牛；不可压、无漏时小端行4厘米，大端行0.8厘米。两端功均为0.64焦。不同高度、摩擦和流动损失需另建条件。[5]",
        "en": "Ideal equal-height hydraulic pistons share an added pressure, not a force. With fresh areas of 5 and 25 cm², an extra 16 N at the small piston gives 80 N at the large one. In an incompressible leak-free system, 4 cm input travel gives 0.8 cm output travel: both works are 0.64 J. Height differences, friction and flow losses need additional conditions. [5]"
      }
    ]
  },
  {
    "id": "mechanical-counts",
    "title": {
      "zh": "怎样读成绩？总正确数、五项计数与完整题解",
      "en": "How should the result be read? Total, five topic counts and full explanations"
    },
    "paragraphs": [
      {
        "zh": "每题答对加一，其余有效选择加零，无倒扣、部分分或速度修正。总数为0—30，各主题为0—6；例如五项为2、5、3、1、4，总正确数就是15/30。该向量同时保留哪些主题答对较多的信息，不能只看总数。缺选不是错题，须完成全部选择才生成报告。",
        "en": "Each correct answer adds one and another valid choice adds zero, without penalties, partial credit or speed adjustments. The total ranges from 0–30 and each topic from 0–6. Counts of 2, 5, 3, 1 and 4 total 15/30, while retaining differences between topics. A missing selection is not an incorrect answer; all choices are required before the report appears."
      },
      {
        "zh": "报告逐题展示实际所选、正确选项及推导，方便检查条件、方向、单位和计算。零分、部分分与满分开放完全相同的30题题解及五份七节指南，共35节。分项只有六题，少一道不能诊断稳定弱项；相同总数也可能来自不同答题路径。",
        "en": "The report shows the actual selection, correct option and reasoning for each item, allowing review of conditions, directions, units and arithmetic. Zero, partial and perfect counts unlock the same thirty rationales and five seven-section guides: thirty-five sections. Six-item groups cannot diagnose a stable weakness from one miss, and equal totals can come from different response paths."
      }
    ]
  },
  {
    "id": "mechanical-evidence",
    "title": {
      "zh": "物理依据与测量证据：正确算式能说明什么",
      "en": "Physics foundations and measurement evidence: what a correct calculation establishes"
    },
    "paragraphs": [
      {
        "zh": "OpenStax教材与MIT机械讲义提供本页相关物理关系的背景。题目必须保留各自模型假设，不能因为公式来自教材就声称这份原创题本已建立信度、效度或人群常模。本站内容分组是复习组织方式，尚不是五个经过心理测量验证的能力分量表。[1][2][3][4][5]",
        "en": "OpenStax texts and MIT mechanical lecture notes supply background for the relevant physical relations. Each problem still depends on its own model assumptions. A textbook formula does not establish this original bank’s reliability, validity or population norms. These content groups organise revision; they are not five psychometrically validated ability subscales. [1][2][3][4][5]"
      },
      {
        "zh": "文字数量练习、图示理解题、限时招聘量表和现场操作任务需要不同证据。本页记录在所述条件下答对多少，不转换为智商、百分位、职业匹配或设备操作资格。真实任务还可能涉及未在题中测量的摩擦、材料变形、部件状态与动态负载；这些不能从答对数推断。",
        "en": "Written quantitative practice, diagram comprehension, timed selection instruments and hands-on tasks need different evidence. This page records correctness under stated conditions, without converting it to IQ, percentile, occupational fit or equipment qualification. Real tasks may involve friction, deformation, component condition and dynamic loads that this bank does not measure; those cannot be inferred from its correct count."
      }
    ]
  },
  {
    "id": "mechanical-review",
    "title": {
      "zh": "完整复习路径：用新条件检查理解，中英文保持同一题本",
      "en": "A complete revision route: check new conditions within one bilingual bank"
    },
    "paragraphs": [
      {
        "zh": "先定位错题所问量，写出单位与保持不变的条件，再看解析。复习时可另写假想数值，只改一个条件，先预测增减再计算，并将结果代回原关系。齿轮转速×齿数、滑轮两端功、液压排出体积可作各自模型中的复核；一次只核一类关系。",
        "en": "First identify what a missed item asks for, its unit and fixed conditions, then read its rationale. Write fresh hypothetical numbers, change one condition, predict the direction of change and calculate, then substitute back. Speed times tooth count, pulley work and displaced hydraulic volume provide checks within their respective models. Check one relation at a time."
      },
      {
        "zh": "中英文共用相同题号、选项身份、答案与计分，说明按各自语言展开；换语言不提供另一套难度。进度仅在主动保存后于本标签页保留24小时，完成、清除或重测即删除；分享仅为公开标题与链接。重做可能受记忆影响，涨分本身不证明迁移到新题或岗位表现。",
        "en": "English and Chinese share item IDs, option identities, keys and scoring, with explanations in each language; changing language does not select another difficulty. Drafts persist in this tab for twenty-four hours only after an explicit save, and completion, clearing or retaking removes them. Sharing uses the public title and link only. Recall may affect retakes, so a higher count alone does not establish transfer to new tasks or work."
      }
    ]
  }
];

export const mechanicalReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "机械推理需要哪些知识？",
      "en": "What knowledge does this practice use?"
    },
    "answer": {
      "zh": "本版涉及力矩平衡、齿数与转速比、支持绳股、线性弹簧、静液压强与理想液压。每主题六题，均以题内明确的理想条件为准，可用草图和计算器；不含电路或真实装置试验。",
      "en": "It uses moment balance, tooth/speed ratios, supporting rope segments, linear springs, hydrostatic pressure and ideal hydraulics. Each topic has six tasks under explicit ideal conditions, with sketches and a calculator allowed. Circuits and apparatus trials are not included."
    }
  },
  {
    "question": {
      "zh": "这是图形机械测试还是文字题？",
      "en": "Is this a diagram test or written practice?"
    },
    "answer": {
      "zh": "本版是文字与数量题，关键结构通过题干明确说明，不需要测量页面插图。它与要求解读工程图、视觉旋转或限时招聘量表的工具不同，成绩不能互换。",
      "en": "This edition uses words and numbers with key arrangements stated in the prompt. You do not measure the page illustration. It differs from engineering-diagram, visual-rotation and timed selection instruments, and scores are not interchangeable."
    }
  },
  {
    "question": {
      "zh": "省力是否代表减少所需能量？",
      "en": "Does less effort mean less energy is required?"
    },
    "answer": {
      "zh": "在题定无损模型中，省力通常对应增加施力行程。另设四股绳支持280牛、升0.30米，70牛拉1.20米，两端功都为84焦。真实损失需另考虑。[1]",
      "en": "In the stated lossless model, reduced effort is exchanged for greater input travel. Four segments supporting 280 N through 0.30 m require 70 N over 1.20 m: both works are 84 J. Real losses need separate consideration. [1]"
    }
  },
  {
    "question": {
      "zh": "为什么齿轮速度与扭矩使用不同的比？",
      "en": "Why do speed and torque use opposite ratios?"
    },
    "answer": {
      "zh": "理想外啮合两轮单位时间经过的齿数相同，较多齿的从动轮转速较低；同切向力下，其较大半径对应较大扭矩。方向仍要按同一观察侧的外啮合次数另判。[2]",
      "en": "Meshing ideal gears pass equal numbers of teeth per unit time, so the larger driven gear rotates more slowly. At equal tangential force its larger radius gives greater torque. Direction still requires counting external engagements from the same viewing side. [2]"
    }
  },
  {
    "question": {
      "zh": "为什么必须区分厘米、毫米和平方米？",
      "en": "Why distinguish centimetres, millimetres and square metres?"
    },
    "answer": {
      "zh": "劲度牛/米搭配米的形变量，压强帕搭配平方米面积。面积比可使用相同面积单位，直接求压强却须统一到牛/平方米。先写单位再代入，避免数值正确却对应另一物理量。",
      "en": "Stiffness in N/m requires deformation in metres, while pressure in pascals uses square metres. Area ratios may use matching area units, but pressure calculations need N/m². Write units before substitution so a plausible number does not conceal a different quantity."
    }
  },
  {
    "question": {
      "zh": "能否只看总分判断最弱主题？",
      "en": "Can the total identify my weakest topic?"
    },
    "answer": {
      "zh": "总数只汇总这30题，须结合五项计数和每题解析。相同总分可能错在不同主题，六题中的一次错误也可能涉及单位、阅读或计算，不能仅凭分数诊断原因。",
      "en": "The total summarises these thirty items. Read it with five topic counts and item rationales. Equal totals may contain different missed topics, and one miss in six can involve units, reading or arithmetic; the count alone does not diagnose its cause."
    }
  },
  {
    "question": {
      "zh": "是否需要先同意、注册或付款才开始？",
      "en": "Is an agreement, signup or payment required to start?"
    },
    "answer": {
      "zh": "点击开始即可进入第一题，不另设同意、注册、邮箱或付款步骤。临时保存是可选项，完整答案与五份指南不以保存或账户为条件。",
      "en": "Start opens the first question directly, without an additional agreement, account, email or payment step. Temporary saving is optional, and complete answers and five guides do not depend on saving or having an account."
    }
  },
  {
    "question": {
      "zh": "英文版和中文版可以直接比较能力吗？",
      "en": "Do English and Chinese results establish comparable ability?"
    },
    "answer": {
      "zh": "两种语言共用答案与计分，并不自动证明跨语言测量等值。阅读熟悉度、物理背景与重复作答都会影响表现；可逐题核对理解，不把两种语言的次数差解释为能力变化。",
      "en": "Shared keys and scoring do not themselves establish cross-language measurement equivalence. Reading familiarity, physics background and repeated exposure can affect performance. Compare item understanding without treating a count difference between languages as an ability change."
    }
  }
];
