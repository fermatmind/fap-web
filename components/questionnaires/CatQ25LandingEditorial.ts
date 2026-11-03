import type { Questionnaire } from "@/lib/questionnaires/types";
export const catQ25LandingSections: Questionnaire["guide"] = [
  {
    "id": "catq-reading-purpose",
    "title": {
      "en": "Masking Test (CAT-Q): a structured reflection on social experiences",
      "zh": "社交伪装测试（CAT-Q）：有结构地回看社交体验"
    },
    "paragraphs": [
      {
        "en": "The Camouflaging Autistic Traits Questionnaire is an adult self-report questionnaire about experiences during social interactions. This page presents the original twenty-five English statements in their published order, alongside a new FermatMind working Chinese translation. Its four readings cover the complete total and the Compensation, Masking and Assimilation parts.",
        "zh": "社交伪装问卷是面向成年人的自评问卷，询问社交互动中的体验。本页按发表顺序呈现原始二十五条英文陈述，并附费马新作中文工作译文；四份读法分别说明完整总分，以及补偿、掩饰与融入三个部分。"
      },
      {
        "en": "You can use the statements to identify experiences you want to understand more clearly without having to disclose a diagnosis or identity. Responses summarize agreement with particular wording. They do not measure how successfully others think you socialise, how authentic you are or whether you belong to a particular diagnostic group.",
        "zh": "可以借助陈述辨认自己希望进一步理解的体验，无需披露诊断或身份。回答汇总的是对特定措辞的同意程度，不测量别人认为你社交得多成功、你有多真实，也不判定你属于哪种诊断群体。"
      }
    ]
  },
  {
    "id": "catq-reading-parts",
    "title": {
      "en": "Compensation, Masking and Assimilation: related but distinct readings",
      "zh": "补偿、掩饰与融入：相关但分别阅读的三个部分"
    },
    "paragraphs": [
      {
        "en": "Compensation contains nine statements about strategies used to navigate social situations, such as drawing on learned ways of interacting. Masking contains eight statements about monitoring or adjusting how one comes across. These labels group the source statements; a part name alone cannot explain why a particular person uses a strategy.",
        "zh": "补偿包含九条与应对社交情境的策略有关的陈述，例如借助学到的互动方式；掩饰包含八条与留意或调整对外表现有关的陈述。名称用于归类原始题文，仅凭部分名称不能解释某个人为什么采用某种策略。"
      },
      {
        "en": "Assimilation contains eight statements concerning experiences of fitting into social situations, including feeling that interaction requires a performance. Read the actual statements and their wording rather than treating the three parts as mutually exclusive types. A person can endorse material across several parts, and the page does not select a dominant masking type.",
        "zh": "融入包含八条与融入社交情境的体验有关的陈述，包括感觉互动需要表演。应结合实际题文理解，而不是把三个部分当成互斥类型；同一个人可以在多个部分表达认同，页面不分配主导伪装类型。"
      }
    ]
  },
  {
    "id": "catq-reading-response",
    "title": {
      "en": "Seven agreement choices, with an explicit option to skip",
      "zh": "七级同意程度，以及明确跳过选项"
    },
    "paragraphs": [
      {
        "en": "Each statement offers seven responses, from Strongly Disagree to Strongly Agree. The middle response means neither agreeing nor disagreeing; it is not the same as leaving an item blank or choosing to skip it. Use the source instruction about your experiences during social interactions rather than adding a past-week or past-month reporting period.",
        "zh": "每条陈述提供从非常不同意到非常同意的七种回答。中间选项表示既不赞同也不反对，不等同于留白或选择跳过。按原始说明回看社交互动中的体验，不额外加上过去一周或一个月的报告时段。"
      },
      {
        "en": "You may explicitly skip any statement and still finish the page, including skipping all twenty-five. An unanswered blank pauses progression so you can choose a response or a skip deliberately. This distinguishes a missing answer from a chosen nonresponse without asking you to explain the reason. All public guides remain available.",
        "zh": "可以明确跳过任意条目后继续完成页面，包括全部二十五条都跳过。留白时会暂停前进，让你主动选择答案或跳过；这样区分尚未回答与主动不回答，无需说明理由。全部公开指南始终可读。"
      }
    ]
  },
  {
    "id": "catq-reading-reverse",
    "title": {
      "en": "Reverse scoring: why all-one and all-seven are not the endpoints",
      "zh": "反向计分：为什么全选一或全选七不是端点"
    },
    "paragraphs": [
      {
        "en": "The five reverse-keyed statements are numbered three, twelve, nineteen, twenty-two and twenty-four. Their scored value is eight minus the selected number: one becomes seven, two becomes six, and four stays four. The remaining twenty statements keep their selected number. Reversal follows the published key, not an assessment of whether an answer is truthful.",
        "zh": "五条反向计分陈述的编号为三、十二、十九、二十二与二十四，计入值为八减所选数值：一变七、二变六、四仍为四。其余二十条保留所选数值。反向处理遵循发表计分键，不判断回答是否真实。"
      },
      {
        "en": "Selecting one on every item produces twenty ordinary ones and five reversed sevens, totaling fifty-five. Selecting seven throughout produces twenty sevens and five reversed ones, totaling one hundred forty-five. The mathematical endpoints twenty-five and one hundred seventy-five require responding in opposite directions on the reverse-keyed items. There is no reason to aim for an endpoint.",
        "zh": "每条全选一，会得到二十个普通一分与五个反向七分，合计五十五；全选七则为二十个七分与五个反向一分，合计一百四十五。数学端点二十五与一百七十五需要在反向条目上采用相反方向的数值，但无需以端点为作答目标。"
      }
    ]
  },
  {
    "id": "catq-reading-sums",
    "title": {
      "en": "Read sums and means with their different item counts",
      "zh": "结合不同题数阅读合计与均分"
    },
    "paragraphs": [
      {
        "en": "A complete total sums all twenty-five recoded values and ranges from twenty-five to one hundred seventy-five. Compensation sums nine items, giving a range of nine to sixty-three; Masking and Assimilation each sum eight, giving ranges of eight to fifty-six. Every complete mean is the relevant unrounded sum divided by its own item count, displayed to two decimal places.",
        "zh": "完整总分汇总二十五个重编码值，范围为二十五至一百七十五。补偿汇总九项，范围九至六十三；掩饰与融入各汇总八项，范围八至五十六。每个完整均分均由对应未舍入合计除以自身题数，显示两位小数。"
      },
      {
        "en": "With the midpoint four selected throughout, the parts are thirty-six, thirty-two and thirty-two, and the total is one hundred. The total mean is four. One hundred is a consequence of that response pattern, not a diagnostic cutoff. Because the parts have different lengths, the total mean is not obtained by simply averaging their three means.",
        "zh": "全选中点四时，三个部分分别为三十六、三十二与三十二，总分一百，总均分四。一百是该回答模式的算术结果，不是诊断切点。由于部分题数不同，总均分不能通过简单平均三个部分的均分得到。"
      }
    ]
  },
  {
    "id": "catq-reading-missing",
    "title": {
      "en": "Skipped items: keep complete parts, withhold incomplete numbers",
      "zh": "跳过题项：保留完整部分，暂不给出不完整数字"
    },
    "paragraphs": [
      {
        "en": "This site shows a part’s sum and mean only when every item in that part has a numeric response. If one Assimilation item is skipped while all other responses are numeric, Compensation and Masking remain scorable; Assimilation and the overall total are withheld. The page still shows how many items received numeric responses and how many were skipped.",
        "zh": "本站仅在某部分全部题项都有数字回答时显示该部分合计与均分。例如跳过一条融入题、其余都有数值，补偿与掩饰仍可计分，融入及整体总分暂不给出；页面仍会说明有多少数字回答、跳过多少项。"
      },
      {
        "en": "No skipped value is replaced with zero, a midpoint or the average of other answers. All-skip produces no numeric total or part mean, while all four full explanations remain readable. This is the site’s explicit missing-data rule, not a validated short form or a claim that the remaining responses represent the omitted statements.",
        "zh": "跳过值不会补为零、中点或其他回答的平均数。全部跳过时不产生任何总分或部分均分，但四份完整解释仍可读。这是本站明确的缺失处理规则，不是经过验证的短版，也不声称剩余回答代表了被跳过条目。"
      }
    ]
  },
  {
    "id": "catq-reading-research",
    "title": {
      "en": "Original findings, later construct research and current use",
      "zh": "原始研究、后续构念研究与当前用途"
    },
    "paragraphs": [
      {
        "en": "The original paper developed and tested a three-part questionnaire in autistic and non-autistic adult samples. A later factor-analytic study of three hundred eight autistic adults supported distinctions from most items about social anxiety, fear of negative evaluation and autistic social traits, while finding overlap for some Assimilation content. Related constructs can overlap without being identical.",
        "zh": "原始论文在自闭症与非自闭症成年人样本中发展并检验三部分问卷。后续一项涉及三百零八位自闭症成年人的因素分析，支持其与多数社交焦虑、负面评价担忧及自闭症社交特质题项的区别，同时发现部分融入内容存在重叠。相关构念可以重叠，但不等于同一对象。"
      },
      {
        "en": "The developers’ twenty-twenty-six perspective describes research value alongside unresolved cultural and construct questions, and cautions against scores being used for diagnostic decisions or intervention outcomes. These findings concern particular studies and uses. They do not validate this new Chinese working translation or allow a numerical score to settle an individual’s identity, needs or clinical status.",
        "zh": "原作者团队二〇二六年的观点文章在肯定研究价值的同时，指出文化与构念问题仍待研究，并提醒不将分数用于诊断决定或干预结果判断。这些结论对应特定研究与用途，不验证本次新中文工作译文，也不让数字替个人决定身份、需要或临床状态。"
      }
    ]
  },
  {
    "id": "catq-reading-use",
    "title": {
      "en": "Use the readings as context, without a target score",
      "zh": "让读法提供情境，不设置目标分数"
    },
    "paragraphs": [
      {
        "en": "If a statement feels relevant, you may privately note what was happening, whether the strategy felt chosen or expected, and what would make the interaction more comfortable. A questionnaire response alone does not reveal effort, success, harm or the reason behind an action. There is no requirement to disclose an example, force eye contact or remove a strategy to improve a score.",
        "zh": "若某条陈述与你有关，可以私下记录当时发生什么、策略是自主选择还是出于期待，以及怎样的条件会让互动更舒适。仅凭问卷回答不能判断投入、成功、伤害或行为原因；不要求披露实例、强迫眼神接触或撤去策略来改善分数。"
      },
      {
        "en": "All answers and calculated numbers remain in this page’s memory and clear on leaving, reloading, switching language, exiting or retaking. There is no draft or account result. Copying includes only public explanation links. If you want to discuss support, your needs and preferences are a sufficient starting point; you do not need to reach a CAT-Q threshold first.",
        "zh": "所有答案与计算数字仅留在本页内存，离开、刷新、换语、退出或重做会清除，不建立草稿或账户结果。复制只含公开解释链接。若希望讨论支持，自身需要与意愿就可以作为起点，不必先达到某个CAT-Q阈值。"
      }
    ]
  }
];
export const catQ25LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Why do five items run in the opposite direction?",
      "zh": "为什么五条题目反向计算？"
    },
    "answer": {
      "en": "The published scoring key reverses those items so their contribution follows the scale’s scoring direction. A selected value of six becomes two on a reverse item, while an ordinary item keeps six.",
      "zh": "发表计分键对这些条目反向处理，使其贡献遵循量表计分方向。反向题所选六会计为二，普通题则保留六。"
    }
  },
  {
    "question": {
      "en": "Is the midpoint the same as skipping?",
      "zh": "中点等于跳过吗？"
    },
    "answer": {
      "en": "No. The midpoint is the numeric response four, meaning neither agree nor disagree. A skip supplies no numeric value and can withhold its part and the total.",
      "zh": "不是。中点是数字四，表示既不赞同也不反对；跳过不提供数字，会使所在部分与总分暂不计分。"
    }
  },
  {
    "question": {
      "en": "Why can a part have a larger sum but the same mean?",
      "zh": "为什么某部分合计更大，均分却相同？"
    },
    "answer": {
      "en": "Compensation has nine items while the other two parts have eight. At a mean of four, their sums are thirty-six and thirty-two. Compare the item counts and wording, not just the raw totals.",
      "zh": "补偿有九项，其余两个部分各八项。均分同为四时，合计分别为三十六与三十二。应结合题数和措辞理解，不能只比原始合计。"
    }
  },
  {
    "question": {
      "en": "Does a high result mean my social strategies succeed?",
      "zh": "分数高意味着社交策略很成功吗？"
    },
    "answer": {
      "en": "No. The score summarizes agreement with the statements. It does not establish how others perceive you, whether a strategy achieves its purpose or what it costs in a specific situation.",
      "zh": "不意味着。分数汇总对陈述的同意程度，不确定别人怎样看你、策略是否达到目的或在具体情境付出多少。"
    }
  },
  {
    "question": {
      "en": "Is the total mean the average of the three part means?",
      "zh": "总均分等于三个部分均分的平均吗？"
    },
    "answer": {
      "en": "Not generally. The parts have nine, eight and eight items. The total mean uses the combined unrounded sum divided by twenty-five; giving the three part means equal weight would ignore their different lengths.",
      "zh": "通常不是。三个部分题数为九、八、八，总均分按未舍入总和除以二十五计算；直接等权平均三个部分会忽略题数差异。"
    }
  },
  {
    "question": {
      "en": "Can a different score after retaking measure improvement?",
      "zh": "重做分数不同就能测量改善吗？"
    },
    "answer": {
      "en": "No such interpretation is made here. Different circumstances, recall and choices can affect answers, and this page does not provide a validated treatment-outcome comparison or a minimum meaningful change.",
      "zh": "本页不作这种解释。情境、回忆与选择可能影响回答；页面不提供经过验证的治疗结果比较或最小有意义变化值。"
    }
  },
  {
    "question": {
      "en": "Does the English research validate this Chinese translation?",
      "zh": "英文研究验证了这个中文译本吗？"
    },
    "answer": {
      "en": "No. This is a new working translation. Research on one language, sample or translation cannot automatically establish equivalence for another. The English original and full source attribution remain available.",
      "zh": "没有。本版是新的工作译文；一种语言、样本或译本的研究不能自动证明另一译本等值。英文原文与完整来源署名仍可查阅。"
    }
  },
  {
    "question": {
      "en": "Do I have to agree to tracking or give a diagnosis before starting?",
      "zh": "开始前必须同意追踪或提供诊断吗？"
    },
    "answer": {
      "en": "No. Start test opens the first statement directly. Anonymous activity counts are separately optional and off by default. You can explicitly skip any statement and read every public guide without supplying a diagnosis.",
      "zh": "不需要。“开始测试”直接打开第一条；匿名动作统计另设为可选，默认关闭。可明确跳过任意条目，不提供诊断也能阅读全部公开指南。"
    }
  }
];
