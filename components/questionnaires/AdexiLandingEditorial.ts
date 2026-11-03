import type { Questionnaire } from "@/lib/questionnaires/types";

export const adexiLandingSections: Questionnaire["guide"] = [
  {
    "id": "adexi-context-identity",
    "title": {
      "en": "Executive Function Test: what the ADEXI self-report records",
      "zh": "执行功能测试：ADEXI自评记录什么"
    },
    "paragraphs": [
      {
        "en": "Executive functioning is a broad area of research into regulating action toward a goal. This page uses one particular adult self-report: the fourteen-item Adult Executive Functioning Inventory, or ADEXI. Its two keyed parts are working memory and inhibition. Completing a questionnaire records your judgments of the statements; it does not observe your performance in a memory, reaction-time or planning task. [1][4]",
        "zh": "执行功能是研究如何围绕目标调节行动的广泛领域。本页采用其中一份具体的成人自评工具：14项成人执行功能量表，英文简称ADEXI。其计分键分工作记忆与抑制控制两部分。完成问卷记录的是你对陈述的判断，不是记忆、反应时或计划任务中的实际表现。[1][4]"
      },
      {
        "en": "The three complete public guides cover the overall raw sum and the two parts separately. You can read them without taking the form. A result is a way to organise experiences for further thought, not a measure of intelligence, moral effort or personal value. Two people with the same total can endorse quite different statements; read the parts and particular experiences as well.",
        "zh": "三篇公开完整指南分别解释整体原始合计与两个分项，不完成问卷也可阅读。结果用于整理经历和继续思考，不测智力、道德努力或个人价值。相同总和可能来自不同陈述的符合程度，还应看分项及具体经历。"
      }
    ]
  },
  {
    "id": "adexi-context-answers",
    "title": {
      "en": "How to answer: truth ratings rather than frequency counts",
      "zh": "作答方法：贴切程度，而非发生次数"
    },
    "paragraphs": [
      {
        "en": "Choose how well each statement describes you as a person. The original five numeric choices run from definitely not true to definitely true, with partially true at 3. No fixed past-week or past-month window is added here. The source asks for your own view even when people who know you might think differently. Four minutes is an estimated reading time, not a deadline. [1][2]",
        "zh": "按陈述与你本人有多贴切作答。原五个数值选项从完全不正确到完全正确，3对应部分正确；本站不另设过去一周或一个月的期限。来源要求选择自己的看法，即使熟悉你的人可能看法不同。约四分钟为阅读作答估计，不是截止时间。[1][2]"
      },
      {
        "en": "For instance, remembering a written list but finding a long spoken instruction difficult need not yield the same judgment as forgetting both. Think about the statement actually shown rather than an ideal version of yourself. The separate prefer-not-to-answer option is a website addition with no numeric value; choosing it is different from the valid midpoint 3. You do not need to force an answer.",
        "zh": "例如，记得书面清单但难记长段口头指示，与两者都难记未必对应相同判断。请对照当前陈述，而非理想中的自己。独立的“暂不回答”是网站附加的不计分选项，与有效中点3不同；无需勉强作答。"
      }
    ]
  },
  {
    "id": "adexi-context-memory",
    "title": {
      "en": "Working memory: nine statements and their situations",
      "zh": "工作记忆：九项陈述与实际情境"
    },
    "paragraphs": [
      {
        "en": "The official working-memory key contains items 1, 2, 5, 7, 8, 9, 11, 12 and 13. The content includes retaining instructions, keeping an activity in mind, organising steps and considering alternatives or consequences. Planning-related wording within this group does not create a separate planning score. Nor does its label establish how many items you can hold in memory during a laboratory task. [4]",
        "zh": "官方工作记忆计分键包含第1、2、5、7、8、9、11、12、13项。内容涉及保留指示、记住正在进行的活动、组织步骤，以及考虑替代办法或后果；其中与计划有关的措辞不产生独立计划分，也不确定实验任务中能记住多少信息。[4]"
      },
      {
        "en": "An optional ordinary example is assembling materials for a non-urgent household task. You could note the intended step, information that was available, what was lost and any written cue already in use. Completing the task after consulting a list is an observable event, not proof of either an impaired or an excellent memory system. The questionnaire cannot identify the cause from that event alone.",
        "zh": "可选的普通例子是为不紧急的家务准备材料：记录原本步骤、已有信息、遗漏处，以及是否使用书面提示。参考清单后完成任务，是一个可观察事件，不证明记忆系统受损或优秀；仅凭这件事，问卷也无法确定原因。"
      }
    ]
  },
  {
    "id": "adexi-context-inhibition",
    "title": {
      "en": "Inhibition: five statements without a moral ranking",
      "zh": "抑制控制：五项陈述与具体行为"
    },
    "paragraphs": [
      {
        "en": "Items 3, 4, 6, 10 and 14 form the official inhibition part. They address acting before considering consequences, stopping an enjoyable activity, restraining laughter in a particular setting and descriptions from others. These situations differ. Being described as lively is not, on its own, evidence of impairment, and an endorsed stopping difficulty does not determine its motive. [4]",
        "zh": "第3、4、6、10、14项构成官方抑制控制分项，涉及考虑后果前行动、停止喜欢的活动、特定场合抑制笑声，以及来自别人的描述。这些情境各不相同；单是被说活泼，不证明功能受损，认同停止困难也不确定其动机。[4]"
      },
      {
        "en": "You might privately compare an intended stopping time with what actually happened during an ordinary hobby. Note whether there was a clear stopping cue and another agreed task, rather than describing yourself as lazy. Trying one visible reminder is optional; this form cannot promise that a reminder will work or measure a treatment effect. You can finish the reflection without adopting any strategy.",
        "zh": "可私下比较普通爱好中原定停下的时间与实际情况，记录当时是否有清楚提示、是否另有已约定任务，而非概括自己懒惰。自愿时可以尝试一个可见提醒；本问卷不保证提醒有效，也不测治疗效果。不采用任何策略也可以结束反思。"
      }
    ]
  },
  {
    "id": "adexi-context-arithmetic",
    "title": {
      "en": "A worked example: unequal item counts, sums and means",
      "zh": "完整算例：不同题数、原始和与均分"
    },
    "paragraphs": [
      {
        "en": "All fourteen items are scored forward from 1 to 5. There are no reverse-scored items. If the nine working-memory answers in their keyed order are 5, 1, 4, 2, 3, 1, 2, 4 and 3, their sum is 25 and their mean is 25 ÷ 9 = 2.78 when displayed to two decimals. If the five inhibition answers are 1, 2, 4, 3 and 2, their sum is 12 and mean 12 ÷ 5 = 2.40.",
        "zh": "14项均按1—5直接计分，没有反向题。若九项工作记忆回答按计分题序为5、1、4、2、3、1、2、4、3，原始和为25，均分25÷9，显示两位小数为2.78；五项抑制控制回答为1、2、4、3、2，原始和12，均分12÷5＝2.40。"
      },
      {
        "en": "The fourteen-item overall sum is 25 + 12 = 37. It is not the average of 2.78 and 2.40. Working-memory sums range from 9 to 45, inhibition sums from 5 to 25 and the total from 14 to 70. Larger values mean more endorsement of the difficulty statements, not better executive performance. Different item counts make raw part sums unsuitable for choosing a strongest or weakest capacity. [3][4]",
        "zh": "14项整体原始合计为25＋12＝37，不是2.78与2.40的平均。工作记忆原始和范围9—45，抑制控制5—25，整体14—70。数值较大表示更认同困难陈述，不表示执行表现更好；分项题数不同，不能用原始和大小挑选最强或最弱能力。[3][4]"
      }
    ]
  },
  {
    "id": "adexi-context-missing",
    "title": {
      "en": "Skipping an item: which results remain available",
      "zh": "跳过一题：哪些结果仍可阅读"
    },
    "paragraphs": [
      {
        "en": "For the example above, choosing prefer not to answer on item 2 withholds the working-memory sum and mean and the overall total. The complete inhibition part remains 12 and 2.40. Skipping item 3 instead withholds inhibition and the overall, while complete working memory remains 25 and 2.78. No zero, midpoint or estimated replacement is inserted.",
        "zh": "沿用上例，第2项选择暂不回答时，工作记忆原始和、均分及整体合计不显示；完整抑制控制仍为12与2.40。若改为第3项跳过，则抑制控制与整体暂不可用，完整工作记忆仍为25与2.78。不填入零、中点或估计替代值。"
      },
      {
        "en": "Each part requires every item in its own group to have a numeric response; the overall sum requires all fourteen. All fourteen can be explicitly skipped and the attempt can still finish, with no numeric scores and all three guides available. This is the website’s transparent completeness policy, not a validated missing-data threshold. An unanswered item still needs a choice before moving on; it is not silently treated as a skip.",
        "zh": "各分项要求本组全部题目有数值回答，整体合计要求14项全有。14项都明确跳过也可结束，届时无数值成绩，三份指南仍可读。这是网站明确的完整度规则，不是经验证的缺失阈值。尚未选择的题目需要先选一项才能继续，不会自动当作跳过。"
      }
    ]
  },
  {
    "id": "adexi-context-evidence",
    "title": {
      "en": "Published evidence: self-report and performance are complementary",
      "zh": "发表研究：自评与实测提供不同信息"
    },
    "paragraphs": [
      {
        "en": "Holst and Thorell’s published ADEXI study reports two factors, high internal consistency and adequate retest reliability. Self-ratings and other-ratings agreed less strongly; associations with neuropsychological tests were weak and often not statistically significant. These findings support treating ratings and task performance as complementary information rather than interchangeable scores. [6]",
        "zh": "Holst与Thorell发表的ADEXI研究报告两个因素、较高内部一致性与适当的重测信度；自评与他评一致性较低，与神经心理任务的关联弱且多未达统计显著。这支持把问卷与任务表现视为互补信息，而非可相互换算的成绩。[6]"
      },
      {
        "en": "The study also reports relatively low sensitivity despite high specificity in its ADHD comparison. A small score therefore cannot rule out ADHD, and a large score cannot establish it. These findings do not validate this website or establish English–Chinese equivalence. No diagnostic cutoff, age percentile or change threshold is applied here; the original study’s abstract does not supply evidence for such uses on this site. [6]",
        "zh": "该研究的ADHD比较还报告了特异度高而敏感度相对低；因此，较低成绩不能排除ADHD，较高成绩也不确诊。研究不验证本网站，也不建立英中等值。本页不套诊断切点、年龄百分位或变化阈值；原研究摘要没有提供支持本站这些用途的证据。[6]"
      }
    ]
  },
  {
    "id": "adexi-context-versions",
    "title": {
      "en": "English, simplified Chinese and optional next steps",
      "zh": "英文、简体中文与自选下一步"
    },
    "paragraphs": [
      {
        "en": "The authors’ website supplies the adopted English self-report and Angela Siu simplified-Chinese translation. Availability there permits use of an existing language version under the stated instructions; it is not certification of this website. The site also cautions that the existence of a translation does not guarantee every wording is correct. Item wording, order and anchors are retained here. [1][2][5]",
        "zh": "作者官网提供所采用的英文自评与Angela Siu简体中文译本；按其说明使用现有语言版本，不等于本站获得认证。官网亦提醒，译本存在不保证每处措辞都正确。本站保留题目措辞、顺序与选项锚点。[1][2][5]"
      },
      {
        "en": "A useful private note can describe one situation, the intended action, what happened and what support was available. You may take that note into a professional conversation if difficulties persist or affect everyday functioning, regardless of the numeric score. For repeated attempts, record the language and circumstances rather than assume a difference proves improvement or decline. There is no required retest, further test or disclosure to anyone.",
        "zh": "有用的私人记录可以写一个情境、原定行动、实际经过与当时可用支持。若困难持续或影响日常功能，无论数值多少，都可自愿带着例子向专业人员讨论。重复作答时记录语言与背景，不把差分直接当改善或下降。无需重测、继续其他测试或向任何人披露。"
      }
    ]
  }
];

export const adexiLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is ADEXI a computer memory or reaction-time task?",
      "zh": "ADEXI是电脑记忆或反应时任务吗？"
    },
    "answer": {
      "en": "No. It records self-reported judgments of fourteen statements. No task accuracy, memory span or reaction time is measured.",
      "zh": "不是。它记录对14项陈述的自报判断，不测任务正确率、记忆广度或反应时。"
    }
  },
  {
    "question": {
      "en": "Does 3 mean I skipped the statement?",
      "zh": "选3表示跳过吗？"
    },
    "answer": {
      "en": "No. Partially true is a valid numeric response of 3. The separate prefer-not-to-answer option has no score.",
      "zh": "不是。部分正确是有效数值3，独立的暂不回答不计分。"
    }
  },
  {
    "question": {
      "en": "Why are there nine working-memory and five inhibition items?",
      "zh": "为什么工作记忆九项、抑制控制五项？"
    },
    "answer": {
      "en": "These are the groups in the adopted official key. A larger raw part sum can reflect its greater item count; it does not rank capacities. [4]",
      "zh": "这是所采用官方计分键的分组。分项原始和较大可能与题数较多有关，不据此排名能力。[4]"
    }
  },
  {
    "question": {
      "en": "Can I average the two displayed means to get the total?",
      "zh": "能平均两个均分得到总分吗？"
    },
    "answer": {
      "en": "No. The overall raw sum adds all fourteen numeric responses. In the example, 25 plus 12 equals 37.",
      "zh": "不能。整体原始合计相加14项数值回答；算例中25加12等于37。"
    }
  },
  {
    "question": {
      "en": "Does a high score identify which condition caused the difficulty?",
      "zh": "高分能确定是什么状况导致困难吗？"
    },
    "answer": {
      "en": "No. The form does not establish a cause or a diagnosis. Interpret particular experiences in their wider context.",
      "zh": "不能。问卷不确定原因或诊断，还需把具体经历放在更广背景理解。"
    }
  },
  {
    "question": {
      "en": "If my score changes, has my executive ability changed?",
      "zh": "分数变化就代表执行能力改变吗？"
    },
    "answer": {
      "en": "Not necessarily. Judgments and circumstances may differ. This website applies no validated individual-change threshold.",
      "zh": "未必。自身判断与背景可能不同；本站不采用经验证的个体变化阈值。"
    }
  },
  {
    "question": {
      "en": "Must someone else agree with my answers?",
      "zh": "作答必须获得别人同意吗？"
    },
    "answer": {
      "en": "No. The self-report asks for your own view. Another person’s perspective is separate information and must not be substituted for your answers. [1]",
      "zh": "不必。自评要求自己的看法；他人视角是另一份信息，不替换你的回答。[1]"
    }
  },
  {
    "question": {
      "en": "Does Start open question one directly?",
      "zh": "点击开始会直接进入第一题吗？"
    },
    "answer": {
      "en": "Yes. There is no second agreement, signup or payment step. Saving progress remains optional.",
      "zh": "会。无需再次同意、注册或付款，保存进度仍为自选。"
    }
  }
];

export const adexiLandingReferences: NonNullable<Questionnaire["references"]> = [];
