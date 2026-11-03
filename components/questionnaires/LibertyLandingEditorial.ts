import type { Questionnaire } from "@/lib/questionnaires/types";

export const libertyLandingSections: Questionnaire["guide"] = [
  {
    "id": "liberty-scope",
    "title": {
      "en": "What does this Libertarian Test explore? Four separate topics",
      "zh": "自由意志主义测试探索什么？四类原则与独立结果"
    },
    "paragraphs": [
      {
        "en": "This original edition asks about autonomy and consent, voluntary cooperation, property claims and rectification, and the justification of public coercion. Each topic contains eight propositions. They concern what institutions ought to permit or justify, not whether you enjoy independence, work well in a team or possess a particular personality. The four headings organize the discussion; they are not empirically established psychological factors.",
        "zh": "本原创版本分别讨论自主与同意、自愿合作、财产权主张与纠错，以及公共强制的论证，每组八条命题。问题询问制度应允许什么、强制需要什么理由，不是在问你是否喜欢独立、善于团队合作，或具有某种人格。四个标题用于组织讨论，不是经过经验研究确立的心理因子。"
      },
      {
        "en": "All thirty-two items and four complete eight-section guides are free without registration. About eight minutes is an editorial reading estimate, not a time limit or measured average. Start opens question one directly. You may read the public guides first; personal figures appear only after every item has a selection, and a topic needs eight valid ratings for its own sum and mean.",
        "zh": "全部32题及四份各八节的完整指南均免费，无须注册。约八分钟是编辑对阅读用时的估计，不是限时或实测平均。点击开始直接进入第一题，也可先读公开指南。每条都有选择才生成报告；某组还需八项有效评分，才显示该组总和与均分。"
      }
    ]
  },
  {
    "id": "liberty-autonomy",
    "title": {
      "en": "Autonomy and consent: identify the permission being discussed",
      "zh": "自主与同意：先确定讨论的是哪项许可"
    },
    "paragraphs": [
      {
        "en": "Political libertarianism includes disputes about rights over the person and over external resources; one does not settle the other automatically. The philosophical discussion also differs from the metaphysical question of free will. [1] Here the autonomy items concern peaceful association, personal effort, limited permission and paternalistic reasons. An answer endorses or questions the particular proposition, rather than proving that any real arrangement is voluntary.",
        "zh": "政治自由意志主义包含关于个人权利与外部资源权利的争论，两者不能自动互相解决；这种政治讨论也不同于形而上学的自由意志问题。[1] 本组具体询问和平结社、个人付出、特定许可及“为本人好”的理由。回答是在认同或质疑所给命题，不能证明某项真实安排已经自愿。"
      },
      {
        "en": "For a fresh hypothetical example, someone agrees to prepare a reading list but not to host a public meeting. Agreement to the first activity does not itself specify permission for the second. A reader might support that distinction while disagreeing about obligations in an emergency. Write the missing condition separately: the five response categories do not collect it. This is an illustration for interpreting the wording, not a legal ruling or an instruction to adopt a position.",
        "zh": "另举虚构例子：某人同意整理书单，并没有同意主持公开会议。前一项同意本身没有说明后一项许可。读者可以认可这种区别，同时对紧急情境下的义务持不同意见。可在页面之外写下缺少的条件，五个回答类别并不收集这些限定。这个例子用于理解表述，不是法律裁决，也不要求采纳某种立场。"
      }
    ]
  },
  {
    "id": "liberty-cooperation",
    "title": {
      "en": "Voluntary cooperation: willingness, disclosure and third parties",
      "zh": "自愿合作：意愿、知情与第三方条件"
    },
    "paragraphs": [
      {
        "en": "The cooperation items address room to form or decline peaceful arrangements, disclosure of material terms, alternatives and official substitution. These conditions are distinct. A printed signature alone cannot tell the questionnaire whether information was adequate, whether a threat occurred or whether others were affected. A topic mean describes the eight coded judgments; it does not certify contracts, compare employers or rate anyone’s honesty.",
        "zh": "合作组讨论建立或拒绝和平安排的空间、重要条件披露、替代选择及官方取代。这些条件彼此不同。仅有签字，问卷无法知道信息是否充分、有无威胁，或是否影响其他人。该组均分描述八项编码判断，不认证合同、不比较雇主，也不评定任何人的诚实。"
      },
      {
        "en": "Imagine two fictional book-exchange groups. In one, participants know the terms and can decline; in the other, an undisclosed condition affects a non-participant. The phrase voluntary exchange does not erase that difference. To review a difficult item, separate disagreement with its stated principle from doubt about an unstated fact. If the offered wording cannot represent your view, NA preserves that limitation without counting it as neutral or disagreement.",
        "zh": "设想两个虚构换书小组：一个说明条件且允许拒绝，另一个有未披露条件影响未参加者。“自愿交换”这个说法不会消除两者的区别。回看难题时，可分开记录对原则的不同意见，以及对未说明事实的不确定。给定表述无法代表观点时，NA会保留这种边界，不把它计成中立或不同意。"
      }
    ]
  },
  {
    "id": "liberty-property",
    "title": {
      "en": "Property and rectification: a claim has a history",
      "zh": "财产权与纠错：权利主张也有历史"
    },
    "paragraphs": [
      {
        "en": "The philosophical debate distinguishes initial acquisition, later transfer and rectification of wrongful taking. Libertarian approaches disagree about natural-resource entitlements and compensation. [1] In this bank, legitimate is a condition to examine, not a finding about the current holder. Several items explicitly make force, deception and earlier wrongs relevant; a higher mean cannot be read as approval of every existing distribution.",
        "zh": "哲学讨论区分最初取得、后续转让与不当取得后的纠错；不同自由意志主义进路对自然资源权利及补偿存在分歧。[1] 本题中的“正当”是需要考察的条件，不是对现持有人的认定。多条命题明确要求考虑强制、欺骗和先前错误，较高均分不能解读为认可所有既有分配。"
      },
      {
        "en": "For a fresh fictional archive, a transfer record says who received an object but omits whether the transferor had the right to give it away. One reader may question the starting claim; another may dispute the remedy even after agreeing on the history. Those are different disagreements. The eight responses do not establish ownership of an actual asset, calculate compensation or resolve the relevant evidence. Keep the principle and missing facts distinct.",
        "zh": "另设虚构档案：转让记录写明谁收到一件物品，却没有说明转让者是否有权处置。一位读者可能质疑最初主张，另一位即使认可历史事实，仍可能不同意纠错方式；这是不同分歧。八条回答不能认定真实资产归属、计算补偿或解决证据问题，应将原则与缺少的事实分开。"
      }
    ]
  },
  {
    "id": "liberty-coercion",
    "title": {
      "en": "Public coercion: reasons, limits and political theory",
      "zh": "公共强制：理由、边界与政治理论"
    },
    "paragraphs": [
      {
        "en": "Political-philosophy accounts distinguish defenses of a minimal state, anarchist alternatives and arguments giving government a wider role; rights-based and consequence-based justifications also differ. [2] This questionnaire does not adjudicate among those theories. Its public-coercion group asks about reasons, official status, challenge procedures and individual rights within specific propositions. Supporting a demand for reasons does not uniquely identify a political tradition.",
        "zh": "政治哲学讨论区分最小国家论证、无政府替代进路及允许更广泛政府作用的论证，也区分权利取向与后果取向的理由。[2] 本问卷不裁决这些理论，公共强制组只围绕具体命题询问理由、官方身份、质疑程序及个人权利。支持说明理由的要求，并不唯一对应某个政治传统。"
      },
      {
        "en": "In a fictional institution, two readers both request an explanation for a compulsory rule. One considers the institution’s permissible role narrow; the other accepts a broader role with review and accountability. Their selected response can coincide while the reasoning differs. Likewise, disagreement with an item can concern its assumptions rather than approval of arbitrary force. The result is neither a test of obedience nor advice about current law.",
        "zh": "在虚构机构中，两位读者都要求解释一项强制规则。一位认为机构作用应很有限，另一位接受更广泛作用但要求复核与问责。两人的选择可能相同，理由仍不同。同样，不同意某题可能是在质疑前提，而非认可任意强制。结果既不是服从程度测试，也不是关于现行法律的建议。"
      }
    ]
  },
  {
    "id": "liberty-arithmetic",
    "title": {
      "en": "Recalculate each topic: reverse keys, sums and exact means",
      "zh": "逐组复算：反向键、总和与准确均分"
    },
    "paragraphs": [
      {
        "en": "Five agreement categories receive codes 1–5. Within each topic’s eight-item order, positions two, four, six and eight are reversed using 6 minus the selected code. The topics are interleaved on screen, so these are group positions, not simply even-numbered questions in the full bank. Every adjusted value contributes once. A complete topic has sum 8–40 and mean equal to its unrounded sum divided by eight, displayed to two decimals.",
        "zh": "五个同意类别编码为1—5。按各组八题内部顺序，第二、四、六、八项采用6减所选编码反向。页面四组交错呈现，因此说的是组内位置，不能简单理解为整份问卷的所有偶数题。每个调整值只计一次，完整组总和8—40，未舍入总和除8得到均分，显示两位小数。"
      },
      {
        "en": "A fresh topic example selects 5,4,2,1,3,2,4,3. Reverse-key adjustment gives 5,2,2,5,3,4,4,3: sum 28 and mean 3.50. Changing the first response from 5 to 4 yields 27 ÷ 8 = 3.375, displayed 3.38. Changing that response to NA instead withholds this topic’s personal figures; the program does not divide the remaining seven values by seven. The other complete topics and all four guides remain available.",
        "zh": "另例按某组顺序选择5、4、2、1、3、2、4、3，调整后为5、2、2、5、3、4、4、3，总和28，均分3.50。第一项从5改为4，总和变27，27÷8＝3.375，显示3.38；若改为NA，则该组个人数字保留不足，不把剩余七项除以7。其他完整组及全部四份指南仍可阅读。"
      }
    ]
  },
  {
    "id": "liberty-patterns",
    "title": {
      "en": "Read the responses behind a mean, not a winning identity",
      "zh": "看见均分背后的回答，不选“胜出身份”"
    },
    "paragraphs": [
      {
        "en": "Eight adjusted values of 3 give 24/8 = 3.00. Four adjusted values of 1 and four of 5 also give 3.00. The same average can therefore represent uniform middle responses or sharply differentiated judgments. Neither pattern alone establishes moderation, contradiction or poor reasoning. The result has four separate topic readings, without a highest-topic winner, combined total, purity percentage, party match or population percentile.",
        "zh": "八项调整值都为3，得到24÷8＝3.00；四项为1、四项为5，也得到3.00。因此同一个平均值可能来自一致的中间回答，也可能来自区别鲜明的判断。任何一种都不能单独证明温和、矛盾或推理欠佳。结果提供四组独立读法，不按最高组选身份，不合成总分、纯度百分比、政党匹配或人口百分位。"
      },
      {
        "en": "A complete guide accompanies every topic, whether personal numbers are present or withheld. Each has eight sections covering scope, higher and lower readings, mixed responses, a worked example, a counterexample, comparison and method/privacy: thirty-two sections in total. Higher and lower describe more or less endorsement of the stated keyed propositions; they are not labels for better people or more authentic beliefs.",
        "zh": "无论个人数字完整或不足，每组都有完整指南，各八节，涵盖范围、较高与较低读法、混合回答、算例、反例、比较及方法与隐私，合计32节。较高与较低只描述对所给键向命题认同程度的差异，不评价人更好，或信念更“正宗”。"
      }
    ]
  },
  {
    "id": "liberty-research",
    "title": {
      "en": "Research evidence, sampling and bilingual interpretation",
      "zh": "研究证据、抽样与中英文解释"
    },
    "paragraphs": [
      {
        "en": "Iyer and colleagues’ 2012 study compared self-identified political groups in an opt-in web sample including 11,994 U.S.-raised libertarian respondents. Not everyone completed every measure. The authors explicitly note nonrepresentative sampling and heavy reliance on self-report. [3] Those comparisons concern groups in that study; they do not validate these thirty-two new propositions, supply a global norm or allow an individual personality to be inferred from this page.",
        "zh": "Iyer等2012年研究在自愿参加的网络样本中比较自报政治身份的群体，其中包含11,994名在美国成长的自由意志主义自报者，并非每人都完成每项测量。作者明确说明样本不代表一般人口，且较依赖自报。[3] 群体比较不能验证本站32条新命题、提供全球常模，或据此推断当前作答者的人格。"
      },
      {
        "en": "This bank has no established reliability, factor-structure, population-norm or Chinese–English measurement-equivalence evidence. Matching item IDs and formulas make the arithmetic shared, not the interpretation culturally interchangeable. Normative agreement, a prediction about consequences and a factual claim require different arguments or evidence. If retaking, note the version and assumptions that changed rather than treating a difference as proof of an ideological transformation.",
        "zh": "本题尚无已建立的信度、因子结构、人口常模或中英文测量等价证据。共用题号和公式确保算术一致，不证明文化解释可互换。规范判断、后果预测与事实主张需要不同论证或证据。重测时可记录版本与发生变化的假设，不将一次分差当作意识形态转变的证明。"
      }
    ]
  }
];

export const libertyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a free-will or personality test?",
      "zh": "这是自由意志能力或人格测试吗？"
    },
    "answer": {
      "en": "No. It is an original reflection on political principles concerning institutions and rights. It does not assess metaphysical free will, independence as a personality trait, moral worth or political knowledge.",
      "zh": "不是。本版用于反思制度与权利相关的政治原则，不测形而上学的自由意志、独立人格特质、道德价值或政治知识。"
    }
  },
  {
    "question": {
      "en": "Are the four topics the same as four political-compass axes?",
      "zh": "四组议题等于政治罗盘的四个轴吗？"
    },
    "answer": {
      "en": "No. They are four authored groups of eight propositions, not coordinates, complementary poles or validated factors. Results from another questionnaire cannot be converted into these topic means.",
      "zh": "不等于。这里是四个自编的八题议题分组，不是坐标、互补端点或已验证因子；另一问卷的结果不能换算为本题各组均分。"
    }
  },
  {
    "question": {
      "en": "Which questions use reverse scoring?",
      "zh": "哪些题目采用反向计分？"
    },
    "answer": {
      "en": "Within each topic, positions two, four, six and eight use 6 minus the selected code. Because topics alternate, the full-bank reverse blocks are questions 5–8,13–16,21–24 and29–32. Reversal aligns the stated topic direction; it is not a lie detector.",
      "zh": "每组内部第二、四、六、八项采用6减所选编码。四组交错呈现，整份题本对应第5—8、13—16、21—24、29—32题。反向用于统一命题方向，不是测谎。"
    }
  },
  {
    "question": {
      "en": "Why not calculate a mean from seven ratings?",
      "zh": "为什么七项有效也不计算均分？"
    },
    "answer": {
      "en": "This edition requires all eight ratings for a topic’s personal figures. A missing response changes the available content, so it is not filled with neutral or averaged over a shortened group. Other complete topics remain visible.",
      "zh": "本版规定某组八项均有效才显示个人数字。缺失改变可用命题范围，因此不补成中立，也不对缩短后的分组另求均分；其他完整组仍可显示。"
    }
  },
  {
    "question": {
      "en": "Does selecting the same option on every item produce an extreme?",
      "zh": "每道题都选相同选项会得到极端结果吗？"
    },
    "answer": {
      "en": "With four direct and four reverse items per topic, any identical numeric response across all eight produces sum24 and mean3.00. This arithmetic neither detects carelessness nor proves a philosophical center.",
      "zh": "每组四项正向、四项反向，八项均选同一个数字编码，都得到总和24、均分3.00。这项算术既不检出粗心，也不证明处于哲学中间立场。"
    }
  },
  {
    "question": {
      "en": "Does agreement with a principle establish a policy outcome?",
      "zh": "赞成原则能证明政策效果吗？"
    },
    "answer": {
      "en": "No. An ought claim and a prediction of what would happen are different. This questionnaire collects agreement with stated principles, not causal evidence about real policies or the legal status of an actual case.",
      "zh": "不能。“应当怎样”与“实施后会怎样”是不同问题。本问卷收集对所给原则的认同，不提供真实政策的因果证据，也不认定案件的法律状态。"
    }
  },
  {
    "question": {
      "en": "Do I need another agreement, signup or payment to start?",
      "zh": "开始前还需同意、注册或付款吗？"
    },
    "answer": {
      "en": "Start enters the first question directly. All items and full guides are free. Saving is a separate voluntary choice for this browser tab, not a condition for answering or reading results.",
      "zh": "点击开始直接进入第一题，全部题目与完整指南免费。保存是本标签页的另一个自愿选项，不是作答或阅读结果的条件。"
    }
  },
  {
    "question": {
      "en": "Can group-level research reveal my personality or voting behavior?",
      "zh": "群体研究能确定我的人格或投票行为吗？"
    },
    "answer": {
      "en": "No. A study of self-selected political groups does not supply an individual diagnostic rule for this original bank. Its sample, measures and uncertainty must be considered separately from the arithmetic of your responses. [3]",
      "zh": "不能。自选政治身份群体的研究，不为本原创题本提供个人诊断规则；应区分研究的样本、测量与不确定性，以及本次回答的算术汇总。[3]"
    }
  }
];

export const libertyLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Internet Encyclopedia of Philosophy: libertarian theories and their diversity",
      "zh": "互联网哲学百科：自由意志主义理论及其分歧"
    },
    "url": "https://iep.utm.edu/libertar/"
  },
  {
    "title": {
      "en": "Iyer et al. (2012): self-identified libertarians, web sampling and limitations",
      "zh": "Iyer等（2012）：自报自由意志主义、网络抽样与研究局限"
    },
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0042366"
  }
];
