import type { Questionnaire } from "@/lib/questionnaires/types";

export const sens16LandingSections: Questionnaire["guide"] = [
  {
    "id": "sens-purpose",
    "title": {
      "en": "Sensory sensitivity test: four ways of responding in everyday settings",
      "zh": "感官敏感测试：回顾日常环境中的四类反应"
    },
    "paragraphs": [
      {
        "en": "This sixteen-prompt reflection is for adults recalling ordinary occasions in the past four weeks. It separates noticing a cue later, deliberately adding input, being interrupted by input, and deliberately reducing input. All four response records and complete guides are free. You can read the guides before answering, and no account or additional assessment is required.",
        "zh": "这份十六题回顾面向成年人，围绕过去四周的普通场合，分别观察较晚察觉线索、主动增加输入、被输入打断与主动减少输入。四组记录与完整指南全部免费，作答前即可阅读，不需要账户或额外测评。"
      },
      {
        "en": "These are independently authored behaviour descriptions, not measurements of all your senses. Sound, light, texture, temperature, movement and scent appear in particular situations; they do not form separate calibrated hearing, vision or touch tests. Read each response with its situation and stated reason rather than treating sensitivity as one property that explains every experience.",
        "zh": "这些是独立写作的行为描述，不是对全部感官的测量。声音、光线、质地、温度、活动与气味出现在具体情境中，并不组成独立校准的听力、视力或触觉测试。结合情境与题述原因理解回答，不把敏感当成解释所有体验的单一属性。"
      }
    ]
  },
  {
    "id": "sens-topics",
    "title": {
      "en": "Noticing, adding, distraction and reducing are different questions",
      "zh": "察觉、增加、打断与减少分别回答什么"
    },
    "paragraphs": [
      {
        "en": "Noticing later concerns becoming aware after another cue or another person draws attention to a change. Adding input concerns choosing a sensation for the input itself when a comfortable choice is available. Neither description establishes a high neurological threshold, inattention or a need for stronger stimulation. For example, choosing movement for a practical task is different from choosing it for the sensation described in an item.",
        "zh": "晚察觉关注在另一线索或他人提醒后才意识到变化；增加输入关注有舒适选择时，为了感觉本身而主动选择某种输入。两者均不确立高神经阈值、注意缺陷或需要更强刺激。比如，为完成实际任务而活动，与因题述感觉原因选择活动不同。"
      },
      {
        "en": "Interruption concerns input repeatedly drawing attention away while you remain in the setting. Reducing input concerns intentionally changing an optional setting or material because you want less input. A person may recall both, or neither, across different settings. Reducing sound for a shared meeting rule is not automatically the sensory reason named in a prompt.",
        "zh": "被打断关注留在原情境时，输入反复把注意力从活动中拉开；减少输入关注因为希望输入更少而主动改变可选环境或材料。一个人在不同情境中可能两者都有，也可能都没有。为了会议共同规则而减小声音，不自动等于题目所说的感官原因。"
      }
    ]
  },
  {
    "id": "sens-occasion",
    "title": {
      "en": "Answer for relevant opportunities, not an assumed percentage of time",
      "zh": "按相关机会回答，不估算时间百分比"
    },
    "paragraphs": [
      {
        "en": "Use the past four weeks and ask whether both the situation and stated reason applied. Then choose Never, Rarely, Sometimes, Often or Almost always on relevant occasions. A quiet task with no choice over its setup gives different information from a task where you could choose input but did not want to add any. No relevant occasion, uncertainty and declining are valid unscored choices.",
        "zh": "按过去四周回想，先确认情境与题述原因是否适用，再选择有相关机会时从未、很少、有时、经常或几乎总如此。无法决定环境的安静任务，与可以选择却不想增加输入的任务，提供的信息不同。没有相关机会、不确定或不愿回答，都是有效的不计分选择。"
      },
      {
        "en": "Do not create an exposure or change a familiar routine just to generate an answer. The prompts require recollection, not a hearing, balance, smell or tolerance task. Relevant opportunities may differ between home and work or between two four-week periods. Keep that context in mind before comparing records; the page does not count how many opportunities occurred.",
        "zh": "不要为了产生答案制造暴露或改变熟悉的日常安排。题目要求回忆，不要求听力、平衡、嗅觉或耐受任务。家庭与工作、两个不同的四周时段，相关机会都可能不同。比较记录前保留这些背景；本页不统计实际发生了多少次机会。"
      }
    ]
  },
  {
    "id": "sens-arithmetic",
    "title": {
      "en": "Four separate sums and means, with a concrete example",
      "zh": "四组合计与均分：用算例理解读数"
    },
    "paragraphs": [
      {
        "en": "Each topic contains four direct 0–4 responses. If its answers are 0, 1, 3 and 4, its sum is 8 out of a possible 16 and its displayed mean is 2.00 on the 0–4 response scale. This is arithmetic on ordered frequency labels, not proof that the response happens on 50% of occasions or that your sensory threshold is halfway up a population distribution.",
        "zh": "每组四条直接题，数字为0—4。例如一组选择0、1、3、4，合计为8（范围0—16），显示均分2.00（范围0—4）。这是对有序频率标签进行的算术概括，不证明有50%的机会发生该反应，也不表示感官阈值处于人群中间。"
      },
      {
        "en": "The other three topics are calculated independently. The page does not add all sixteen items into a sensitivity total, subtract seeking from avoiding, create threshold axes or choose a dominant pattern. Equal means stay equal without a tie-breaker; different item combinations with the same mean can still describe different situations.",
        "zh": "其余三组独立计算。本页不把十六条相加成为敏感总分，不以寻求减回避，不建立阈值轴，也不选主导模式。均分相同就保留相同，不强分先后；相同均分也可能来自不同条目组合，描述不同情境。"
      }
    ]
  },
  {
    "id": "sens-missing",
    "title": {
      "en": "Why one skipped item withholds its own group",
      "zh": "为什么跳过一题会暂不显示本组数字"
    },
    "paragraphs": [
      {
        "en": "All four responses in a topic must be numerical for its sum and mean to appear. If 0, 1 and 3 are followed by an unscored choice, the page does not divide their sum by three, add an assumed fourth value or treat the skip as zero. It shows the numeric and skipped counts and preserves the full guide.",
        "zh": "本组四条全部为数字，才显示合计与均分。若选择0、1、3及一条不计分，本页不会把已有合计除以三，不补一个假定值，也不把跳过当零；会显示数字回答与跳过条数，并保留完整指南。"
      },
      {
        "en": "A complete other group remains readable. You may complete all sixteen prompts with unscored choices and receive the explanations without numbers. Blank is different: you must explicitly choose an answer or the unscored option to continue. Zero means the described response never occurred on relevant occasions; it does not mean no opportunity or no sensory experience.",
        "zh": "另一组若完整，仍可阅读其数字。十六条全部选择不计分，也能完成并获得说明，只是不显示数字。空白则不同：继续前需要明确选择数字或不计分。零表示有相关机会时未出现题述反应，不表示没有机会或没有感官体验。"
      }
    ]
  },
  {
    "id": "sens-research",
    "title": {
      "en": "Questionnaires and sensory laboratory measures answer different questions",
      "zh": "问卷与感官实验测量回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Dwyer and colleagues’ 2022 study compared questionnaires, psychophysical thresholds and event-related potentials in 46 autistic and 21 typically developing 11- to 14-year-olds. The different measures largely did not converge, and questionnaire scores were not associated with sensory acuity. The groups were not matched on cognitive ability. These findings concern that research sample, not validation of this adult reflection.",
        "zh": "Dwyer等人的2022研究在46名自闭症与21名典型发育的11—14岁参与者中，比较问卷、心理物理阈值及事件相关电位。不同测量大多未呈现收敛，问卷分数未与感官敏锐度相关；两组认知能力也未匹配。这些结论针对该研究样本，不是对本站成年人回顾的验证。"
      },
      {
        "en": "A practical implication for reading this page is to keep the quantities distinct: a reported interruption is a recalled experience, while detecting the faintest stimulus requires a different method. Neither a journal citation nor correct arithmetic establishes this original item bank’s reliability, English–Chinese equivalence, norms or sensitivity to change. The page therefore offers descriptive records without diagnostic cutoffs.",
        "zh": "阅读本页时，应把指标分别理解：自述被打断是回忆的体验，检出最微弱刺激则需要另一种方法。文献引用或正确计算均不能确立本站原创题本的信度、中英文等值、常模或变化敏感性，因此这里提供描述性记录，不设诊断切点。"
      }
    ]
  },
  {
    "id": "sens-differences",
    "title": {
      "en": "Sensory Profile, SPQ and highly sensitive person tests are not interchangeable",
      "zh": "Sensory Profile、SPQ与高敏感测试不能直接互换"
    },
    "paragraphs": [
      {
        "en": "Dunn’s framework is conceptual background here. The separate professional Adolescent/Adult Sensory Profile contains sixty items, fifteen per quadrant, and uses its own normative classification and professional interpretation. FermatMind’s sixteen original statements neither reproduce that item bank nor generate its official scores, axes or classifications. A shared four-topic vocabulary does not create an equivalent short form.",
        "zh": "Dunn框架在这里仅供概念背景。单独的专业Adolescent/Adult Sensory Profile有六十题，每象限十五题，使用自身常模分类与专业解释。费马十六条原创陈述不复现该题本，也不产生其正式分数、轴或分类。使用相近的四主题词汇，不等于形成等值短版。"
      },
      {
        "en": "SPQ92 concerns sensory-perception self-reports, HSP entries discuss a different sensitivity framework, and the sound-sensitivity check-in focuses on particular sound-linked reactions and impact. None can verify a sensory identity assigned by this page, because no such identity is assigned. Choose a separate entry only when its actual question fits what you want to understand.",
        "zh": "SPQ92关注感知自述，HSP入口讨论另一敏感性框架，声音敏感自评聚焦特定声音相关反应与影响。本页不分配感官身份，因此也不需要其他测试来验证身份。只有另一入口的实际问题符合你的探索需要时，再自行选择。"
      }
    ]
  },
  {
    "id": "sens-application",
    "title": {
      "en": "Use the record to discuss a task and an optional adjustment",
      "zh": "围绕具体任务讨论可选调整"
    },
    "paragraphs": [
      {
        "en": "Choose one existing situation and name the task, the input, what happened to your attention or action, and what choice was available. A possible conversation is: “The changing background video keeps interrupting this reading task. Could I use the seat facing the plain wall?” This is a specific request to discuss, not a treatment recommendation based on a score.",
        "zh": "选一件已经发生的事，说明任务、输入、注意或行动发生了什么，以及当时有什么选择。比如：“背景视频不断变化，会打断我阅读；能否使用朝向空白墙面的座位？”这是可讨论的具体请求，不是按分数开出的治疗建议。"
      },
      {
        "en": "Any adjustment should be voluntary, reversible and compatible with shared tasks and safety signals; the guide does not prescribe more or less stimulation for a type of person. Persistent discomfort, sudden changes or daily interference merit advice about the actual experience rather than a questionnaire threshold. Answers remain in page memory and clear on refresh, language change, leaving or retaking; copying shares only four public links.",
        "zh": "调整应自愿、可撤销，并兼顾共同任务与安全信号；指南不为某类人规定必须增加或减少刺激。持续不适、突然变化或日常干扰，应按实际体验寻求相应意见，不依赖问卷阈值。答案留在页面内存，刷新、换语言、离开或重测清除；复制分享只含四篇公开链接。"
      }
    ]
  }
];

export const sens16LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can I start without agreeing to tracking?",
      "zh": "不勾选统计也能开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first prompt directly. Optional anonymous action counts are separate and off by default; no answer, sum or mean is included in them.",
      "zh": "可以。“开始测试”直接进入第一题。可选匿名动作计数独立设置、默认关闭，不包含答案、合计或均分。"
    }
  },
  {
    "question": {
      "en": "Is a 2.00 mean equivalent to 50% sensory sensitivity?",
      "zh": "均分2.00等于50%的感官敏感吗？"
    },
    "answer": {
      "en": "No. For example, 0+1+3+4=8 and 8÷4=2.00. Ordered frequency choices do not provide a percentage of occasions, a calibrated threshold or a population percentile.",
      "zh": "不是。例如0+1+3+4=8，8÷4=2.00。有序频率选择不能给出发生机会百分比、校准阈值或人群百分位。"
    }
  },
  {
    "question": {
      "en": "Does noticing later prove weak hearing or low awareness?",
      "zh": "晚察觉能证明听力差或觉察不足吗？"
    },
    "answer": {
      "en": "No. These prompts concern recollected changes noticed after another cue. They do not measure detection thresholds or identify why a cue was noticed later. Context and the particular opportunity matter.",
      "zh": "不能。这些题回顾在另一提示后才察觉变化的情况，不测检出阈值，也不识别晚察觉的原因；需要结合具体情境与机会。"
    }
  },
  {
    "question": {
      "en": "Can I seek some input and reduce other input?",
      "zh": "可以既增加某些输入又减少另一些吗？"
    },
    "answer": {
      "en": "Yes. The statements concern different choices across situations. The page retains four separate records, without forcing opposite types, subtracting one topic from another or choosing a winner.",
      "zh": "可以。题目讨论不同情境下的选择，四组记录分别保留，不强派相反类型，不以一组减另一组，也不选赢家。"
    }
  },
  {
    "question": {
      "en": "What if I had no chance to choose my environment?",
      "zh": "没机会决定环境时怎么答？"
    },
    "answer": {
      "en": "Use the unscored choice when a prompt’s situation or reason did not apply or you cannot judge. Do not count lack of opportunity as Never, and do not create a new situation to complete the test.",
      "zh": "题述情境或原因不适用，或无法判断时，可选不计分。不要把没有机会当作从未，也不需要为完成测试制造新情境。"
    }
  },
  {
    "question": {
      "en": "Can you calculate a group from three numeric answers?",
      "zh": "一组只有三条数字能计算吗？"
    },
    "answer": {
      "en": "No. Each group requires four numeric answers. An unscored choice withholds only that group’s sum and mean; other complete groups and every full guide remain available.",
      "zh": "不能。每组需要四条数字回答。不计分仅使本组合计与均分暂不显示，其他完整组及全部完整指南仍可读。"
    }
  },
  {
    "question": {
      "en": "Does this reproduce the sixty-item professional Sensory Profile?",
      "zh": "这里复现六十题专业Sensory Profile了吗？"
    },
    "answer": {
      "en": "No. The sixteen prompts and guides are original. Their arithmetic, recall window and missing-answer policy are site choices, not the professional instrument’s item bank or norm-based classification.",
      "zh": "没有。十六条题目与指南为原创，计算、回忆时段与缺答政策是本站选择，不是专业工具的题本或常模分类。"
    }
  },
  {
    "question": {
      "en": "Does a lower score on a retest establish improvement?",
      "zh": "重测变低就代表改善吗？"
    },
    "answer": {
      "en": "It establishes changed answers, not improvement. Different opportunities and situations can alter a record. This original bilingual reflection has no validated treatment-response or meaningful-change threshold.",
      "zh": "它说明回答变化，不证明改善。机会和情境差异也会改变记录。本原创双语回顾未验证治疗反应或有意义变化阈值。"
    }
  }
];
