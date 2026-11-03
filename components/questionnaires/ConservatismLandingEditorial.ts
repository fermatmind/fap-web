import type { Questionnaire } from "@/lib/questionnaires/types";

export const conservatismLandingSections: Questionnaire["guide"] = [
  {
    "id": "secs-measure",
    "title": {
      "zh": "保守主义测试测什么？议题感受与身份认同分别看",
      "en": "What does this conservatism test assess? Issue feelings and identity are separate"
    },
    "paragraphs": [
      {
        "zh": "本页呈现Everett于2013年发表的Social and Economic Conservatism Scale（SECS）完整12个议题词语。你评价对词语的正负感受，而不是回答知识题或赞同某项详细政策。结果按原始分组给出社会与经济两个领域，帮助回看本次回答所体现的议题取向，不要求先认定自己是保守派或自由派。",
        "en": "This page presents all twelve issue terms from Everett’s 2013 Social and Economic Conservatism Scale (SECS). You rate positive or negative feelings about terms, rather than answering knowledge questions or agreeing with detailed policies. Results retain separate social and economic groupings to help review the issue responses in this attempt; you need not first identify as conservative or liberal."
      },
      {
        "zh": "例如，对“财政责任”感到正面的人，可能赞成不同的预算安排；对“家庭”感到正面，也不指定支持哪种法律。词语温度没有询问这些细节。可以把结果当作澄清“我当时把这个词理解成什么”的起点，不用均分替自己补出未作答的政策、政党或行为。",
        "en": "For example, people who feel positively about fiscal responsibility may favor different budgets; positive feelings about family do not specify a legal position. Term warmth does not ask those details. Use the result to clarify what you understood a term to mean, without letting a mean supply policy positions, party affiliation or behavior you never reported."
      }
    ]
  },
  {
    "id": "secs-thermometer",
    "title": {
      "zh": "0—100温度标尺：感受、中性与NA有什么不同？",
      "en": "The 0–100 feeling thermometer: warmth, neutrality and NA"
    },
    "paragraphs": [
      {
        "zh": "本版每项提供0至100、间隔10分的11个数值选择，0表示非常负面，50中性，100非常正面，没有默认值。请评价词语本身给你的感受，而不是把100理解成“完全正确”或“最符合社会期待”。这不是测验答对率，也没有需要争取的高分。",
        "en": "Each item offers eleven numeric choices from zero to one hundred in ten-point steps: very negative, neutral at fifty, and very positive. None is preselected. Rate your feeling toward the term instead of treating one hundred as completely correct or socially desirable. This is not an accuracy test and has no high score to pursue."
      },
      {
        "zh": "明确感受中性时可以选50；不知道词语的含义、觉得当前语境不适用或不愿回答时，可以选独立NA。50会作为有效数值进入均分，NA则使所属领域保留资料不足。二者在界面和算法中分开，不能为了得到完整分数把“不知道”自动换成中性。",
        "en": "Choose fifty for a genuinely neutral feeling. Use the separate NA when a term is unfamiliar, does not make sense in your context or is something you prefer not to answer. Fifty contributes a valid number; NA withholds its domain’s score. The interface and calculation distinguish them, rather than replacing uncertainty with neutrality to produce a complete score."
      }
    ]
  },
  {
    "id": "secs-groups",
    "title": {
      "zh": "社会7项与经济5项：保留原附录的分组",
      "en": "Seven social and five economic items: preserve the original appendix grouping"
    },
    "paragraphs": [
      {
        "zh": "社会组包括堕胎、军事与国家安全、宗教、传统婚姻、传统价值观、家庭这一社会单位和爱国主义；经济组包括有限政府、福利补助、拥有枪支、财政责任和商业。分组与两处反向键均可在完整原附录中核对。[2] 它记录的是该历史题本的结构，不是宣称所有地区都应把这些议题划入同一领域。",
        "en": "The social set comprises abortion, military and national security, religion, traditional marriage, traditional values, the family unit and patriotism. The economic set comprises limited government, welfare benefits, gun ownership, fiscal responsibility and business. Both group membership and the two reverse keys can be checked in the complete source appendix.[2] They document this historical bank, rather than prescribing categories for every region."
      },
      {
        "zh": "“拥有枪支”保留在经济组，“军事与国家安全”保留在社会组。不要凭当下语感重排后继续称为同一份SECS，也不要仅凭社会与经济两个名称，把本页结果换成其他政治坐标。两组分别计分不等于两种观念统计独立，更不表示必须一组高、另一组低。",
        "en": "Gun ownership remains economic and military and national security remains social. Reassigning them by current intuition would change the bank. The social and economic names do not make these results interchangeable with another political coordinate system. Separate scoring establishes neither statistical independence nor a requirement that a high score in one accompany a low score in the other."
      }
    ]
  },
  {
    "id": "secs-reversals",
    "title": {
      "zh": "反向计分怎样复算？先定向，再分别求均值",
      "en": "How can I reproduce scoring? Reverse the keyed terms, then average separately"
    },
    "paragraphs": [
      {
        "zh": "只有堕胎与福利补助采用100减所选温度，其余十项保留所选数值。社会七项有效时，定向后的和除7；经济五项有效时，和除5。结果用未舍入的和计算，最后显示两位小数。反向是题本的计算方向，不是判定某个回答好坏、正确或值得认可。",
        "en": "Only abortion and welfare benefits use one hundred minus the selected warmth; the other ten retain the chosen number. With seven valid social ratings, divide their keyed sum by seven; with five economic ratings, divide by five. Calculate from the unrounded sum and display two decimals at the end. Reversal is a scoring convention, not a judgment that an answer is good, correct or deserving approval."
      },
      {
        "zh": "另设所有项先评50，再将堕胎评30、福利补助评70。社会组为70加六个50，得370÷7＝52.86；经济组为30加四个50，得230÷5＝46.00。若把堕胎原评分从30升到40，社会和减少10，均值变化为−10÷7；不能把温度增加误说成所有结果都增加。",
        "en": "As a fresh example, start with every item at fifty, then rate abortion thirty and welfare benefits seventy. Social scoring becomes seventy plus six fifties: 370/7, displayed as 52.86. Economic scoring becomes thirty plus four fifties: 230/5, or 46.00. Increasing the raw abortion rating from thirty to forty lowers the social sum by ten and the mean by 10/7; a warmer response does not always raise the keyed result."
      }
    ]
  },
  {
    "id": "secs-same-means",
    "title": {
      "zh": "同为50，回答也可能不同：中点不是人口平均",
      "en": "The same mean can conceal different responses: fifty is not a population average"
    },
    "paragraphs": [
      {
        "zh": "经济组五项全部评50时，定向和为250，均值50。另一个人若有限政府评80、福利补助评80、其余三项评50，定向后为80、20、50、50、50，和仍为250。相同均值可以来自不同议题反应，不能由此断言两个人持有相同理由或政策立场。",
        "en": "Five economic ratings of fifty yield a keyed sum of 250 and mean fifty. Another person could rate limited government eighty and welfare benefits eighty, with the remaining three at fifty: keyed values become eighty, twenty, fifty, fifty and fifty, again totaling 250. Equal means can reflect different issue responses and do not establish shared reasons or policies."
      },
      {
        "zh": "0—100是回答标尺，不是“百分之多少保守”、人群百分位、政治正确概率或民调支持率。50只是标尺中点，不是研究样本平均，也不是经认证的温和派界线。本页不把两组相加，不用较大的一组挑主导身份，不把相近均值强行合并成并列类型。",
        "en": "Zero to one hundred is the response scale, not a percentage conservative, population percentile, probability of being politically correct or polling share. Fifty is its midpoint, not a sample average or certified moderate cutoff. This page neither adds the domains nor selects the larger as a dominant identity, and does not turn similar means into a tied type."
      }
    ]
  },
  {
    "id": "secs-research",
    "title": {
      "zh": "原研究提供什么证据？样本、结构与使用边界",
      "en": "What evidence did the original research supply? Sample, structure and scope"
    },
    "paragraphs": [
      {
        "zh": "原研究先请41名美国参与者提出相关议题，后在美国MTurk招募的样本中开发并检验量表，最终分析291人。论文报告两因素结构、内部一致性及与其他测量的关联。[1] 这些是特定样本中的证据，不是“全球公认准确率”，也不是每个人的政治身份判定。",
        "en": "The original work elicited issue nominations from forty-one U.S. participants, then developed and evaluated the scale in a U.S. MTurk sample with 291 analyzed respondents. It reported a two-factor structure, internal consistency and associations with other measures.[1] These are sample-specific findings, not a globally established accuracy rate or an individual political identity verdict."
      },
      {
        "zh": "论文的探索与验证性因素分析使用同一研究数据；不能把“做过CFA”写成已完成独立样本复现。原作者同时讨论了议题随时地变化的限制。[1] 本站保留2013年美国版本，中文为试译，固定顺序、NA规则与均分呈现尚未经本站独立验证。[3]",
        "en": "Exploratory and confirmatory analyses used the same study data; conducting CFA does not establish independent-sample replication. The author also discussed time and place dependence.[1] We retain the 2013 U.S. edition with a trial Chinese translation. Our fixed order, NA handling and mean presentation have not been independently validated here.[3]"
      }
    ]
  },
  {
    "id": "secs-context",
    "title": {
      "zh": "历史美国议题怎样阅读？不要把译名当成本地政策",
      "en": "How should historical U.S. issues be read? Translation is not policy localization"
    },
    "paragraphs": [
      {
        "zh": "“有限政府”“传统价值观”等短语没有在题面中指定某个当下国家的政策方案。若你无法在自己的语境中理解，选择NA比猜测作者想听什么更合适。中文试译帮助阅读，但语言能读懂不等于题目的社会含义、难度或结构已在中文人群中相同。",
        "en": "Terms such as limited government and traditional values do not specify a present-day national policy program in the item. If they are not meaningful in your context, NA is preferable to guessing what the author wants. A trial translation aids reading; comprehensibility alone does not establish equivalent social meaning, difficulty or structure in Chinese-speaking populations."
      },
      {
        "zh": "若另行研究当下或其他地区的政治态度，应重新核对议题覆盖、翻译理解、样本与用途。悄悄更换一项后套用原研究，或把较低均值定义成某个完整的自由主义体系，都超出了这十二个词语能回答的问题。本站保留历史标识，不给投票建议、政党匹配或对个人品格的评价。",
        "en": "Research on current attitudes or another region would require checking issue coverage, translation comprehension, sampling and intended use. Quietly replacing an item while borrowing the original evidence, or treating a lower mean as a complete liberal ideology, exceeds what these twelve terms answer. The historical label remains; no voting advice, party matching or character judgment is generated."
      }
    ]
  },
  {
    "id": "secs-completion",
    "title": {
      "zh": "12次选择与两份完整指南：可以保留未评分领域",
      "en": "Twelve selections and two full guides: a domain can remain unscored"
    },
    "paragraphs": [
      {
        "zh": "十二项都需作出数值或NA选择才结束本次。社会域七项全有效、经济域五项全有效时，分别显示该域和与均值；某域有一个NA便不计算该域个人分数，另一完整域仍可显示。两份各八节指南始终可阅读，全部NA也不需要补答才能解锁内容。",
        "en": "Complete the attempt with a numeric or NA selection for each of twelve terms. Social needs seven valid numeric ratings and economic five before that domain’s sum and mean appear. One NA withholds its own domain while the other can remain scored. Both eight-section guides are readable even with all NA; no forced completion of numeric ratings unlocks content."
      },
      {
        "zh": "点击开始直接进入题目，不收身份、地点、政党或个人经历，无需额外同意、邮箱或付款。默认不保存作答，主动临时保存才可在当前标签页24小时内恢复；完成、重测或退出清除会删除。分享只包含测试标题与公开链接，不包含评分或均值。约4分钟为预计阅读作答时间，没有倒计时。",
        "en": "Start opens the questions directly, without collecting identity, location, party or a personal story, or requiring another agreement, email or payment. Answers are not saved by default. Optional temporary saving permits recovery in the current tab for twenty-four hours and is cleared on completion, retake or explicit exit/clear. Sharing includes the test title and public link, not ratings or means. About four minutes is an estimate, without a countdown."
      }
    ]
  }
];

export const conservatismLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "为什么标题保留2013年与美国议题？",
      "en": "Why retain 2013 and U.S. issues in the title?"
    },
    "answer": {
      "zh": "它标明本页使用的历史题本，不是声称该版本适用于任何时间地点。议题含义可能改变，原研究不能直接证明今天中文呈现的效度。",
      "en": "They identify this historical bank, rather than claiming applicability everywhere and always. Issue meanings can change; the original study does not directly validate today’s Chinese presentation."
    }
  },
  {
    "question": {
      "zh": "为什么拥有枪支在经济组？",
      "en": "Why is gun ownership in the economic domain?"
    },
    "answer": {
      "zh": "这是完整原附录标注的组别，军事与国家安全则在社会组。本页保留原结构；按当前直觉重分会得到另一份题本，不能仍借同一套源证据。",
      "en": "That is its grouping in the complete source appendix; military and national security is social. Reassigning by current intuition changes the bank and cannot simply borrow the same source evidence."
    }
  },
  {
    "question": {
      "zh": "NA和中性50都表示没意见吗？",
      "en": "Are NA and a neutral fifty the same?"
    },
    "answer": {
      "zh": "不是。50是有效的中性感受；NA表示不熟悉、含义不明或不愿回答，使所属域资料不足，不参与该域个人均分，也不补50。",
      "en": "No. Fifty is a valid neutral feeling. NA denotes unfamiliarity, unclear meaning or declining to answer, leaving its domain insufficient rather than imputing fifty."
    }
  },
  {
    "question": {
      "zh": "七项与五项不同，能直接比较原始和吗？",
      "en": "Can I directly compare the seven-item and five-item sums?"
    },
    "answer": {
      "zh": "不能。社会和范围0—700，经济和0—500；分别除7与5才得到各自0—100标尺上的均值。即使均值标尺相同，两域内容不同，也不用于选最强政治倾向。",
      "en": "No. Social sums range from zero to seven hundred and economic from zero to five hundred. Divide by seven and five separately. Even means on the same response scale concern different content and do not select a strongest political orientation."
    }
  },
  {
    "question": {
      "zh": "反向计分是不是在惩罚某个观点？",
      "en": "Does reverse scoring penalize an opinion?"
    },
    "answer": {
      "zh": "不是。100减所选温度只是统一该题本的键向，没有正确答案、奖惩或道德排序。你仍应按对词语的真实感受选择，而不是猜怎样得到高分。",
      "en": "No. One hundred minus warmth aligns this bank’s scoring direction. It provides no correct answer, reward, punishment or moral ranking. Rate the term rather than guessing how to obtain a high score."
    }
  },
  {
    "question": {
      "zh": "两组分数相同，就说明政治观点平衡吗？",
      "en": "Do equal domain means demonstrate balanced political views?"
    },
    "answer": {
      "zh": "不说明。不同题目组合能有相同均值；相同数字也不意味着理由一致、内心矛盾或某种理想平衡。分别看题意和实际回答，不需破同分。",
      "en": "No. Different response patterns can produce the same mean. Equal numbers establish neither shared reasons, internal conflict nor an ideal balance. Read terms and responses separately; no tie-breaker is needed."
    }
  },
  {
    "question": {
      "zh": "结果变化能证明政治身份改变吗？",
      "en": "Does a changed result prove a changed political identity?"
    },
    "answer": {
      "zh": "不能仅凭均值下结论。可先核对词语理解、版本和参照语境，再看具体评分。本版没有可靠变化阈值或当前中文重测研究，数字变化不能直接定性身份变化。",
      "en": "Not from means alone. Check term interpretations, version and reference context before comparing ratings. This edition has no reliable-change threshold or current Chinese retest study to convert numeric changes into identity change."
    }
  },
  {
    "question": {
      "zh": "它和政治坐标、8values或人格测试能换算吗？",
      "en": "Can these results be converted into political coordinates, 8values or personality scores?"
    },
    "answer": {
      "zh": "不能。它们的题目、概念、权重与输出不同。两个领域名称相似或与其他测量存在群体相关，都不能建立个人分数换算或政党匹配。",
      "en": "No. Items, constructs, weights and outputs differ. Similar domain names or group-level correlations do not establish individual score conversion or party matching."
    }
  }
];
