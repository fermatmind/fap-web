import type { Questionnaire } from "@/lib/questionnaires/types";

export const dvmsq18LandingSections: Questionnaire["guide"] = [
  {
    "id": "dv-purpose",
    "title": {
      "en": "Misophonia test: a source-based record of reactions and impact",
      "zh": "厌声症测试：从源表记录声音反应与生活影响"
    },
    "paragraphs": [
      {
        "en": "This entry uses the Duke–Vanderbilt Misophonia Screening Questionnaire, DVMSQ v1.5, for an adult sound-sensitivity check-in. Begin with one screening question. Depending on your answer, the form ends there or opens eighteen prompts about reactions and impact. Reading the explanations is free before and after answering; no account is required.",
        "zh": "本页采用Duke–Vanderbilt Misophonia Screening Questionnaire（DVMSQ v1.5），供成年人进行声音敏感自评。从一个前置问题开始，根据回答直接结束或进入十八条反应与影响题。作答前后都可免费阅读完整说明，无需账户。"
      },
      {
        "en": "The useful question is not simply whether you dislike noise, but what you recall experiencing around particular sounds and how everyday activities are affected. Keep examples private. The form asks for your account of experience; it does not play a sound, measure hearing thresholds or determine the cause of a reaction.",
        "zh": "有用的问题不只是“是否讨厌噪声”，还包括你在特定声音出现时记得怎样的反应，以及日常活动受到什么影响。例子留在自己心里。本页记录个人体验，不播放声音、不测听阈，也不判断反应的病因。"
      }
    ]
  },
  {
    "id": "dv-gate",
    "title": {
      "en": "The first question is part of the questionnaire, not a consent barrier",
      "zh": "前置问题属于题本，不是额外同意步骤"
    },
    "paragraphs": [
      {
        "en": "Click Start test to enter the source screening question directly. Read its examples and clarification before choosing. The clarification excludes sounds that bother you only because they are too loud or physically painful; the entry therefore does not ask you to test your tolerance by listening again.",
        "zh": "点击“开始测试”直接进入来源前置题，先读示例与补充说明再选择。说明要求排除仅因太响或造成身体疼痛而困扰的声音，因此不需要重新聆听来测试忍耐程度。"
      },
      {
        "en": "Yes opens eighteen prompts. No ends with the source total of zero, with no administered subscores. The added unsure and prefer-not-to-answer choices end without a number. These are different records: an unanswered question is not a no, and a no does not establish that there is no difficulty requiring attention. Changing the gate clears later answers.",
        "zh": "“是”进入十八题；“否”按源规则以总分零结束，分项未施测。新增的“不确定”和“不愿回答”结束但无数字。这些记录含义不同：空白不等于否，否也不能证明不存在需要关注的困难。修改前置选择会清除后续回答。"
      }
    ]
  },
  {
    "id": "dv-context",
    "title": {
      "en": "Reaction frequency, seven-day interference and general impact",
      "zh": "反应频率、七天干扰与一般影响分别阅读"
    },
    "paragraphs": [
      {
        "en": "Prompts 1–10 concern reactions when you encounter the bothersome sounds you have in mind; prompt 11 asks how often you avoid situations where those sounds may occur. These frequency anchors run from Never to Very often, with no specified recent time window. Do not silently replace that question with how often the sound itself occurs: the omitted exposure-frequency question is a different question.",
        "zh": "第1—10题围绕接触心里所指困扰声音时的反应；第11题询问多常避免可能听到这些声音的情境。频率选项从“从不”到“非常经常”，没有指定近期时段。不要把它自行改成声音本身出现多频繁：本改编省略的暴露频率题属于另一问题。"
      },
      {
        "en": "Prompts 12–15 ask about interference over the past seven days. Prompts 16–18 retain general impact wording without a specified window. Follow each displayed context rather than imposing one month or one lifetime on everything. Opportunity matters: an unavailable activity is different from an activity you did with no interference; an added unscored choice preserves that uncertainty.",
        "zh": "第12—15题问过去七天的干扰，第16—18题保留未指定时段的一般影响措辞。按当前题目说明回答，不把全部题目统一改成一个月或一生。机会也重要：没有机会进行某项活动，与进行了却没有干扰不同；新增不计分选项用于保留这种不确定。"
      }
    ]
  },
  {
    "id": "dv-arithmetic",
    "title": {
      "en": "Read the three sums together with their item records",
      "zh": "结合逐条回答理解三个原始合计"
    },
    "paragraphs": [
      {
        "en": "The reaction sum counts ten items, the impact sum seven, and the total seventeen; fear or panic remains visible as item 3 but contributes to none of the sums. With yes at the gate and 2 on every counted item, reaction = 20, impact = 14 and total = 34. Changing only item 3 from 0 to 4 leaves all three sums unchanged.",
        "zh": "前置选是后，反应合计计入十题，影响合计七题，总分十七题；第3题恐惧或惊恐仍显示，但不进入任何合计。所有计入题都选2时，反应为20、影响为14、总分为34。只把第3题从0改为4，三个合计均不改变。"
      },
      {
        "en": "The ranges are 0–40, 0–28 and 0–68, respectively. A total of 34 is not a 50% probability, a population percentile or a passing mark. Two people can reach the same total through different item patterns. Read the individual responses and the relevant public guide before deciding which concrete circumstances you want to discuss.",
        "zh": "三个范围分别为0—40、0—28和0—68。总分34不是50%的患病概率、人群百分位或通过线。不同条目组合可能得到相同总分；先读逐条记录及对应公开指南，再整理希望讨论的具体情境。"
      }
    ]
  },
  {
    "id": "dv-missing",
    "title": {
      "en": "Zero, unscored and not administered are different states",
      "zh": "零分、不计分与未施测不能互换"
    },
    "paragraphs": [
      {
        "en": "Every displayed prompt needs an explicit choice, including the added unscored option. One unscored counted reaction item withholds the reaction sum and total; a fully numerical impact group still shows its sum. The form neither fills the missing answer with zero nor calculates a reduced-item mean.",
        "zh": "每条展示题都需明确选择，也可以选新增的不计分。一条计入反应合计的题选不计分，就暂不显示反应合计及总分；影响组若全部为数字，仍可显示其合计。本页不把缺值补零，也不计算缩减题量后的均分。"
      },
      {
        "en": "If only item 3 is unscored and all seventeen counted items are numerical, all three sums remain available. If every follow-up is unscored, the response record and full guides remain available without sums. A no at the initial question is a separate early-ending rule, not eighteen assumed zero answers.",
        "zh": "仅第3题不计分、其余十七条计入题都有数字时，三个合计仍可显示。十八条全部选不计分，也能阅读回答记录与完整指南，只是不显示合计。前置选否是独立的提前结束规则，不是把十八条都假定为零。"
      }
    ]
  },
  {
    "id": "dv-evidence",
    "title": {
      "en": "Published research, revised wording and this adaptation",
      "zh": "发表研究、修订措辞与本站改编的关系"
    },
    "paragraphs": [
      {
        "en": "Williams, Cascio and Woynaroski’s 2022 study examined dimensional structure and associations with other measures. It did not use an interview-based diagnostic standard and could not establish diagnostic sensitivity or specificity; its cross-sectional design did not test retest reliability or change over time. The paper also states that the added screening clarification had not been empirically tested.",
        "zh": "Williams、Cascio与Woynaroski的2022研究考察维度结构及与其他测量的关联，但未用访谈诊断标准，不能据此确立诊断敏感度或特异度；横断面设计也未检验重测信度或随时间的变化。论文还明确说明，补充后的前置澄清文字当时尚未经过实证检验。"
      },
      {
        "en": "FermatMind keeps the published English source wording and identifies its Chinese working translation and web changes. Neither that research nor an accurate implementation validates these changes, English–Chinese equivalence or a personal clinical decision. Read the linked source, edition and licence notices with the result; this site applies no provisional diagnostic algorithm.",
        "zh": "费马保留已发表英文源题，标明中文工作译文与网页改动。原研究或正确的程序实现均不能验证这些改动、中英文等值或个人临床决定。阅读结果时可同时核对来源、版本与许可说明；本站不运行临时诊断算法。"
      }
    ]
  },
  {
    "id": "dv-comparison",
    "title": {
      "en": "Why results from different sound-sensitivity tests cannot be swapped",
      "zh": "不同声音敏感测试的结果为何不能直接换算"
    },
    "paragraphs": [
      {
        "en": "DVMSQ v1.5 is not the 86-item Duke Misophonia Questionnaire, MisoQuest, an Amsterdam scale or an original online quiz using a similar label. The number of prompts, response anchors, recall windows, missing-data rules and reported quantities can differ. A label such as misophonia test does not make their scores interchangeable.",
        "zh": "DVMSQ v1.5不同于86题Duke Misophonia Questionnaire、MisoQuest、阿姆斯特丹系列量表或采用类似名称的网页原创测验。题量、回答选项、回忆时段、缺答规则及报告指标都可能不同；都叫“厌声症测试”不意味着分数能互换。"
      },
      {
        "en": "This page offers three explanations of the same response set: total, reactions and impact. They are not three diagnoses, competing types or a requirement to take another test. The optional sensory-processing entry concerns a separate questionnaire; nothing from this check-in is transferred to it or used to infer a broader sensory or neurodevelopmental identity.",
        "zh": "本页三篇指南分别解释同一组回答的总分、反应与影响，不是三种诊断、竞争类型，也不要求继续测试。可选的感觉加工入口属于另一份问卷，本页回答不会传递过去，也不用于推断更广泛的感觉或神经发育身份。"
      }
    ]
  },
  {
    "id": "dv-private",
    "title": {
      "en": "Use a private record to prepare a concrete conversation",
      "zh": "用私人记录整理具体沟通内容"
    },
    "paragraphs": [
      {
        "en": "A practical reading starts with an existing situation: which ordinary activity was interrupted, what reaction you recall, what you did next, and what you would like to be different. You need not recreate a sound or disclose a private example here. A response about an urge describes an experience, not an action you must take or a judgment about another person.",
        "zh": "可以从一件已发生的事阅读：哪项日常活动被打断、记得怎样的反应、随后做了什么，以及希望哪里有所不同。不需要重现声音，也不需要在这里透露私人例子。关于冲动的回答描述一种体验，不是必须执行的行动，也不是对他人的判决。"
      },
      {
        "en": "If the experiences concern you or interfere with everyday life, discuss the circumstances with an appropriate health professional without waiting for a score threshold. This page cannot select treatment or assess hearing or pain. Answers remain in page memory; refresh, language change, leaving and retaking clear them. Sharing copies public guide links only. Optional anonymous action counts stay off unless you choose them.",
        "zh": "若这些体验令人担忧或干扰日常，可按实际情境向适当的健康专业人员咨询，无需等待某个分数阈值。本页不能选择治疗，也不评估听力或疼痛。答案只留页面内存，刷新、换语言、离开及重测清除；分享只复制公开指南链接。可选匿名动作计数默认关闭，由你自行选择。"
      }
    ]
  }
];

export const dvmsq18LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does Start test require an agreement checkbox?",
      "zh": "点击开始后还要勾选同意吗？"
    },
    "answer": {
      "en": "No. Start opens the source screening question directly. Its yes/no choices are part of the questionnaire, not permission to collect answers. Optional action counts are separate and off by default.",
      "zh": "不需要。“开始测试”直接进入来源前置题。是／否属于题本回答，不是收集答案的许可；可选动作计数独立设置，默认关闭。"
    }
  },
  {
    "question": {
      "en": "Why can the form finish after one question?",
      "zh": "为什么只答一题就可能结束？"
    },
    "answer": {
      "en": "The source form ends after no, with total 0 and no administered subscores. Added unsure or decline also end, but without a number. Only yes opens eighteen follow-ups. An early ending does not provide a diagnostic exclusion.",
      "zh": "源表前置选否就以总分0结束，分项未施测；新增不确定或不愿回答也会结束，但无数字。只有是进入十八条后续题；提前结束不构成诊断排除。"
    }
  },
  {
    "question": {
      "en": "Is 34 out of 68 a 50% chance of misophonia?",
      "zh": "34／68表示有50%的厌声症概率吗？"
    },
    "answer": {
      "en": "No. It is an arithmetic total of seventeen 0–4 responses, not a probability or norm. With 2 on every counted item, the sums are 20, 14 and 34; item 3 remains separate.",
      "zh": "不是。它只是十七条0—4回答的算术合计，不是概率或常模。所有计入题都选2时，三个合计为20、14、34；第3题单独保留。"
    }
  },
  {
    "question": {
      "en": "Should I answer everything for the past month?",
      "zh": "所有题都按过去一个月回答吗？"
    },
    "answer": {
      "en": "No. Follow the displayed source context: reaction frequency has no stated recent window, items 12–15 concern seven days, and 16–18 use general impact wording. Keep these frames distinct.",
      "zh": "不要。按当前来源说明回答：反应频率未设近期时段，第12—15题问七天，第16—18题为一般影响；这些时段分别理解。"
    }
  },
  {
    "question": {
      "en": "Do I need to listen to chewing or another sound?",
      "zh": "需要播放咀嚼声等声音再判断吗？"
    },
    "answer": {
      "en": "No audio or exposure task is provided or required. Recall existing experience, keep examples private and use an unscored choice if you cannot judge. Do not manufacture an experience to complete an item.",
      "zh": "不提供也不要求音频或暴露任务。回顾已有经验，例子留在自己心里；无法判断可选不计分，不需要为完成题目制造体验。"
    }
  },
  {
    "question": {
      "en": "Why is a complete impact sum shown when total is withheld?",
      "zh": "总分不显示时为何还能有影响合计？"
    },
    "answer": {
      "en": "Completeness is checked separately for each scored group. One unscored reaction item withholds reaction and total, while seven numerical impact responses can still be summed. Missing is not zero.",
      "zh": "每个计分组单独检查完整性。反应组一条计入题不计分会暂不显示反应及总分；影响组七条都有数字仍可相加。缺答不作零。"
    }
  },
  {
    "question": {
      "en": "Can I compare this number with MisoQuest or an Amsterdam scale?",
      "zh": "能和MisoQuest或阿姆斯特丹量表比分数吗？"
    },
    "answer": {
      "en": "Not by numerical conversion. Different item sets, anchors and scoring rules produce different quantities. Use the edition named on the original result and read its own interpretation rather than importing another scale’s bands.",
      "zh": "不能直接换算。不同题目、选项及计分规则产生不同指标，应按原结果标明的版本阅读其解释，不套用另一量表的分段。"
    }
  },
  {
    "question": {
      "en": "Can a retest prove improvement or recovery?",
      "zh": "重测能证明改善或恢复吗？"
    },
    "answer": {
      "en": "A changed raw sum records changed answers. Opportunity, recall and the source’s different time frames can affect comparisons. This adaptation has no established change threshold and does not measure treatment effects or recovery.",
      "zh": "原始合计变化记录的是回答变化。机会、回忆和源表不同时段会影响比较。本改编未建立变化阈值，不测治疗效果或恢复。"
    }
  }
];
