import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplement; source-bound original items, scoring and reports remain unchanged. */
export const darkTriadLandingSections: QuestionnaireSection[] = [
  {
    "id": "dark-research-form",
    "title": {
      "zh": "黑暗三角、SD3与本站原创题本：先分清研究对象",
      "en": "Dark Triad, SD3 and this original form: distinguish what is measured"
    },
    "paragraphs": [
      {
        "zh": "黑暗三角研究讨论自恋、马基雅维利主义和精神病态三个相关特质。Jones与Paulhus的SD3开发论文报告四项研究、共1063名社区与学生参与者，最终题本为27条。[1] 这些研究对应的是SD3及其分量表，不是所有带有“黑暗三角测试”名称的网页。这里使用的是18条费马原创题，既不是SD3的节选，也不是Dirty Dozen的改名版。",
        "en": "Dark Triad research concerns the related traits narcissism, Machiavellianism and psychopathy. Jones and Paulhus’s SD3 development paper reports four studies with 1,063 community and student participants and a final 27-item form.[1] That evidence concerns SD3 and its subscales, not every webpage called a Dark Triad Test. These eighteen FermatMind items are separately written, not an SD3 excerpt or a renamed Dirty Dozen."
      },
      {
        "zh": "本版把可回顾的具体做法整理成三个主题，没有证明它们分别等同于上述三个研究特质。论文中的因子、相关、信度或他评结果不能转移成本站的准确率。中英文题意配对便于阅读，但还不是跨语言测量等价性研究；本版尚未建立自身信度、效度和常模。",
        "en": "This edition groups observable approaches into three themes without establishing one-to-one equivalence with those research traits. Published factor, correlation, reliability and informant findings cannot become accuracy claims for this form. Paired English and Chinese wording supports reading but is not a cross-language measurement-equivalence study. This edition has no established form-specific reliability, validity or norms."
      }
    ]
  },
  {
    "id": "dark-themes-context",
    "title": {
      "zh": "三组各看什么？认可、影响与回应后果",
      "en": "What do the groups cover? Recognition, influence and responding to effects"
    },
    "paragraphs": [
      {
        "zh": "认可与形象组回顾受到质疑时先保护形象、比较获得的注意、把话题引回成绩，以及为获得认可少说不确定之处等做法。它不把希望被肯定或维护尊严本身视为问题。比如澄清别人误解你的事实，与为了形象而略过实际后果，需要用当时具体说法区分。",
        "en": "The recognition-and-image group covers protecting an image when questioned, comparing attention received, returning a conversation to achievements and withholding uncertainty to gain recognition. Wanting appreciation or dignity is not itself the issue. Clarifying a factual misunderstanding differs from overlooking consequences to protect an image; distinguish them through what was actually said."
      },
      {
        "zh": "信息与影响组回顾只给有利信息、借关系使请求难以拒绝、先取得承诺再解释意图，以及催促尚未充分了解情况的人决定等做法。清楚表达目标、协商交换或维护工作关系，不自动等于这些陈述。核对时可以问：对方知道哪些条件，有没有时间考虑，是否真的可以拒绝或修改约定？",
        "en": "The information-and-influence group covers giving only favourable information, invoking relationships to make refusal difficult, obtaining commitment before explaining intentions and rushing an insufficiently informed decision. Clear goals, negotiated exchanges and working relationships do not automatically fit these items. Check what the person knew, how much time they had and whether refusal or revision was genuinely available."
      },
      {
        "zh": "影响距离组回顾把他人的不适当成推进障碍、淡化担忧或边界、期待问题自行消失，以及道歉时只想结束话题等做法。暂时休息、保留私人空间或先平静再回应，可以有不同原因，不能直接等同于忽视影响。反过来，解释行为背景也不消除实际伤害：仍应核对具体影响、对方的选择和后续行动。",
        "en": "The impact-distance group covers treating discomfort as an obstacle, downplaying concerns or boundaries, hoping a problem fades and apologising mainly to end discussion. Rest, privacy and a pause before responding can have other reasons and are not automatically disregard. Conversely, context does not erase harm: concrete effects, the other person’s choices and follow-up actions still matter."
      }
    ]
  },
  {
    "id": "dark-accuracy-three",
    "title": {
      "zh": "近三个月怎样作答？3表示不确定或视情况",
      "en": "How to answer for three months: 3 means uncertainty or dependence on context"
    },
    "paragraphs": [
      {
        "zh": "选择的是陈述与你的符合程度，不是出现次数、严重程度或是否赞成某种价值观。1完全不符合，2比较不符合，3不确定或视情况，4比较符合，5非常符合。请参照你记得的近期做法，避免按“理想的自己”作答，也不要替伴侣、同事或陌生人评分。",
        "en": "Rate descriptive accuracy, not occurrence counts, severity or endorsement of a value. The options are 1 Very inaccurate, 2 Somewhat inaccurate, 3 Uncertain or depends on the situation, 4 Somewhat accurate and 5 Very accurate. Refer to remembered recent approaches rather than an ideal self. Do not rate a partner, colleague or stranger."
      },
      {
        "zh": "全选3会得到三个3.00，但它记录的是不确定或条件性回答，不证明中立、健康平衡或平均人格。相同均分也可能来自不同条目组合。独立的“不愿回答”选项只表示不计入该组数值；它不要求说明原因，也不能被解释为隐藏了某种倾向。",
        "en": "Choosing 3 throughout gives three means of 3.00 but records uncertainty or conditional answers, not neutrality, healthy balance or an average personality. Different item patterns can also produce an equal mean. The separate prefer-not-to-answer option simply excludes that item from the group’s numerical calculation. No reason is required, and nonresponse does not establish a concealed tendency."
      }
    ]
  },
  {
    "id": "dark-minimum-arithmetic",
    "title": {
      "zh": "六条至少答四条：1.75、1.67与资料不足算例",
      "en": "At least four of six: worked 1.75, 1.67 and insufficient results"
    },
    "paragraphs": [
      {
        "zh": "本卷18条均直接计分，没有反向题。认可组如果为1、2、2、2、不愿回答、不愿回答，原始和为7，有效条数4，7÷4＝1.75。影响距离组六条为1、1、1、2、2、3时，总和10，10÷6≈1.67。报告按实际有效条数计算并显示两位小数，不用一位小数的近似均分倒推。",
        "en": "All eighteen items are directly keyed without reversal. Recognition ratings of 1, 2, 2, 2 and two unscored responses give a sum of 7 across four ratings: 7÷4=1.75. Impact-distance ratings of 1, 1, 1, 2, 2, 3 give 10÷6≈1.67. Reports divide by the actual rated-item count and display two decimals rather than reconstructing a one-decimal approximation."
      },
      {
        "zh": "信息与影响组若只有4、4、4三条数值，另三条不愿回答，虽然数值相加为12，仍不足四条，因此不显示个人均分；另外两组不受影响。四条有效时原始和范围4—20，五条为5—25，六条为6—30。缺答不补零，不把不同分母的总和直接比较；三份九节完整指南始终可读，包括全部不愿回答的情况。",
        "en": "If the influence group has only three numerical ratings of 4 and three unscored responses, their sum is 12 but the four-rating minimum is unmet, so no personal mean is displayed. The other groups are unaffected. Possible sums are 4–20 for four ratings, 5–25 for five and 6–30 for six. Missing answers are not filled with zero, and sums with different denominators are not directly comparable. All three nine-section guides remain available, including after an entirely unscored attempt."
      }
    ]
  },
  {
    "id": "dark-reading-no-rank",
    "title": {
      "zh": "怎样读高低？三份指南不选最高人格",
      "en": "How to read values: three guides without a dominant personality"
    },
    "paragraphs": [
      {
        "zh": "均分较高，只说明本组实际计入的陈述更被自报为符合；缺答构成、情境和记忆仍需一起看。三组题意不同，不按最高均分宣布“自恋型”“操纵型”或“危险型”，也不相加为总黑暗值、转成恶意百分比或推断犯罪风险。全选5时三组各为5.00，不是某种能力满分。",
        "en": "A higher mean describes greater reported accuracy for the included items, still requiring attention to missing items, context and memory. Different group meanings prevent naming a narcissistic, manipulative or dangerous type from the largest mean. Groups are not added into total darkness, converted into an evil percentage or used to infer crime risk. Three means of 5.00 after choosing 5 throughout are not perfect ability scores."
      },
      {
        "zh": "这些结果不能与另一网站的SD3、Dirty Dozen、黑暗因素或光明三角分数互换。量表名称、条目、反应刻度和计分用途需要分别核对。尤其不能用“光明分数加黑暗分数等于100”理解两个不同题本，也不能把本站均分当临床诊断、招聘通过线或他人的安全证明。",
        "en": "These results are not interchangeable with another site’s SD3, Dirty Dozen, dark-factor or Light Triad scores. Names, items, response scales and scoring purposes each need checking. Distinct forms do not imply that light and dark scores sum to 100. These means are neither clinical diagnoses, hiring thresholds nor evidence that someone else is safe."
      }
    ]
  },
  {
    "id": "dark-private-direct",
    "title": {
      "zh": "开始、退出与隐私：不必开启可选统计",
      "en": "Start, exit and privacy: optional counts are not required"
    },
    "paragraphs": [
      {
        "zh": "点击开始直接进入第一条陈述，不要求额外同意、邮箱、注册、购买报告或先做其他测试。答案和个人结果只在当前页面内存中处理，不提供进度保存或个人结果分享。刷新、换语言或离开会失去本次作答；退出并清除或重新测试会重置本次回答。",
        "en": "Start opens the first statement directly without another agreement, email, account, report purchase or prerequisite test. Answers and personal results are handled in the current page’s memory, without saved drafts or personal-result sharing. Refreshing, changing language or leaving loses the attempt; exit-and-clear or retake resets the answers."
      },
      {
        "zh": "本页匿名动作统计默认关闭，旁边的勾选是可选项，未勾选也能完成全部题目和结果。若主动开启，还遵循全站分析选择，只统计开始、完成等允许动作，不含答案或结果内容，不回补之前的动作，离开本页后失效。它与作答资格无关，不应被当作另一道开始门槛。",
        "en": "Anonymous activity counts are off by default. The optional checkbox does not affect access to the questions or results. If enabled, counting also respects the site analytics choice and includes only permitted actions such as starts and completions, without answers or result content, retrospective backfilling or permission after leaving. It is not an eligibility or start requirement."
      }
    ]
  },
  {
    "id": "dark-small-check",
    "title": {
      "zh": "从主题回到具体行为：保留反例与后续行动",
      "en": "Return to behaviour: keep counterexamples and follow-up actions"
    },
    "paragraphs": [
      {
        "zh": "可选择一件你愿意回看的小事，区分事实、推测、自己的动作与实际影响。例如提出请求前补充不确定条件，明确对方可以拒绝并留出考虑时间；回应抱怨时先核对发生了什么，再讨论可以兑现的修正。不要用测试标签代替询问，也不要求对方原谅、公开私事或配合证明你的改变。",
        "en": "Choose a small event you are willing to revisit and separate facts, assumptions, your actions and actual effects. Before a request, clarify uncertain conditions, make refusal available and allow time. When responding to a complaint, check what happened before discussing a feasible correction. Do not replace questions with test labels or require forgiveness, private disclosures or cooperation to prove your change."
      },
      {
        "zh": "记录一件符合、一件不符合主题描述的例子，有助于避免只寻找支持结果的证据。这些是可选反思提示，不是本卷验证过的治疗或改善方案。重测时先比较三个月情境、语言、有效条目和具体回答；目前没有本版可靠变化阈值，均分变化不能直接证明人格改变或干预有效。",
        "en": "Keeping one fitting example and one counterexample can reduce selective confirmation. These are optional reflection prompts, not treatments or improvement programmes validated by this form. For a retake, first compare the three-month context, language, rated items and answers. No reliable-change threshold is established for this edition, so a difference cannot establish personality change or intervention effectiveness."
      }
    ]
  }
];

export const darkTriadLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这18题就是SD3黑暗三角量表吗？",
      "en": "Are these eighteen items the SD3 scale?"
    },
    "answer": {
      "zh": "不是。SD3论文的最终版本为27条。[1] 本站18条原创陈述整理三个观察主题，不借用SD3的验证结论，也不直接输出其三个研究特质分数。",
      "en": "No. The final SD3 form has 27 items.[1] These eighteen original statements organise three reflection themes without borrowing SD3 validation or directly producing its three research-trait scores."
    }
  },
  {
    "question": {
      "zh": "3分表示正常或有时吗？",
      "en": "Does 3 mean normal or Sometimes?"
    },
    "answer": {
      "zh": "不是。这里3表示不确定或视情况，是符合度题的一个数值选项；它不表示频率、人群平均或健康中点。",
      "en": "No. Here 3 is the numerical accuracy option Uncertain or depends on the situation. It establishes neither frequency, population average nor a healthy midpoint."
    }
  },
  {
    "question": {
      "zh": "只答四条，怎么得到1.75？",
      "en": "How can four ratings give 1.75?"
    },
    "answer": {
      "zh": "1、2、2、2加两条不愿回答，总和7、有效4条，7÷4＝1.75。两条缺答不补零，也不除以六。",
      "en": "Ratings of 1, 2, 2, 2 with two unscored responses give sum 7 across four ratings: 7÷4=1.75. Missing answers add no zeros and the denominator is not six."
    }
  },
  {
    "question": {
      "zh": "某组六条只愿答三条，会影响其他组吗？",
      "en": "Does rating only three items in one group affect the others?"
    },
    "answer": {
      "zh": "该组保留资料不足，不显示个人均分；达到至少四条的其他组各自显示，三份九节完整指南全部保留。",
      "en": "That group retains insufficient information without a personal mean. Other groups with at least four ratings still display, and all three nine-section guides remain available."
    }
  },
  {
    "question": {
      "zh": "三组最高的就是我的黑暗人格吗？",
      "en": "Is the highest group my dark personality?"
    },
    "answer": {
      "zh": "不是。三组题意不同，不加总、不排序、不派最高型；均分只概括该组有效陈述的自报符合程度。",
      "en": "No. Groups have different meanings and are not added, ranked or assigned a dominant type. Each mean summarises reported accuracy for that group’s rated statements."
    }
  },
  {
    "question": {
      "zh": "可以用结果判断伴侣或同事吗？",
      "en": "Can I use the result to judge a partner or colleague?"
    },
    "answer": {
      "zh": "不能替他人作答或据此诊断。核对具体行为、信息是否充分、是否可以拒绝以及实际影响，比给人贴测试标签更有用。",
      "en": "Do not answer for or diagnose another person. Check concrete behaviour, available information, freedom to refuse and actual effects rather than applying a test label."
    }
  },
  {
    "question": {
      "zh": "开始前必须勾选匿名统计吗？",
      "en": "Must I enable anonymous counts before starting?"
    },
    "answer": {
      "zh": "不必。默认关闭，开始直接进入18条题目，完整结果免费。该选项只涉及可选动作统计，不发送答案或结果内容。",
      "en": "No. Counts are off by default. Start opens eighteen items directly with full free results. The option concerns activity counts only, without answers or result content."
    }
  },
  {
    "question": {
      "zh": "刷新后能恢复答案，或者分享个人分数吗？",
      "en": "Can I restore answers after refresh or share personal scores?"
    },
    "answer": {
      "zh": "本页不保存进度、不分享个人结果；答案只留当前页面内存，刷新、换语言或离开后不能恢复。可以不作答，直接读公开指南。",
      "en": "This page saves no drafts and offers no personal-result sharing. Answers remain in current-page memory and cannot be restored after refresh, language change or departure. Public guides can be read without answering."
    }
  }
];
