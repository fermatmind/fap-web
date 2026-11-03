import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const culturalSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Cultural dimensions: a personal reflection in one chosen group",
      "zh": "文化维度测试：围绕一个小组的个人反思"
    },
    "paragraphs": [
      {
        "en": "This original 36-statement questionnaire asks how you would prefer an ordinary voluntary group to arrange decisions, personal choice, achievement and care, uncertain meanings, inherited practices and enjoyment. Keep one real or imagined group in mind throughout. The result summarises your own preferred arrangements, rather than describing every member or identifying the culture of a country.",
        "zh": "这份36条原创问卷，询问你希望一个普通自愿小组怎样安排决定、个人选择、成就与照顾、未确定的含义、沿用做法及日常享受。整份请围绕同一个真实或假设的小组；结果整理你自己的安排偏好，不代表每位成员，也不识别某国文化。"
      },
      {
        "en": "Hofstede’s national-culture model supplies background themes, not these items or their scoring. The VSM guidance concerns comparisons between matched groups from different societies and explicitly distinguishes that purpose from a personality questionnaire. This page provides six separate readings without a national index or country match. [1] [2]",
        "zh": "Hofstede国别文化模型提供背景主题，不提供本站题文或计分。VSM指引讨论不同社会之间匹配群体的比较，并明确区分这种用途与人格问卷。本页分别提供六组读法，不生成国别指数或国家匹配。[1] [2]"
      }
    ]
  },
  {
    "id": "authority",
    "title": {
      "en": "Power distance theme: final authority and room to question",
      "zh": "权力距离主题：最终决定权与提问空间"
    },
    "paragraphs": [
      {
        "en": "The authority statements contrast stronger final authority for a coordinator or senior member with opportunities to question decisions, influence a shared choice and ask for reasons. The mean concerns these particular arrangements. It does not measure leadership ability or decide whether an actual decision was fair.",
        "zh": "权限条目比较协调者或资深成员拥有更大最终决定权，与质疑决定、影响共同选择、询问理由的空间。均值只涉及这些具体安排，不测领导能力，也不裁定真实决定是否公平。"
      },
      {
        "en": "Imagine a reading group choosing its next book. You might want a coordinator to finalise the timetable while still expecting them to explain the choice. Those preferences can coexist. Read the actual responses before describing yourself as always accepting hierarchy or always opposing it.",
        "zh": "以读书小组选书为例，你可能希望协调者敲定时间表，同时希望其说明选择理由，两种期待可以共存。应先回看逐条回答，再讨论是否在这件事上偏好某种权限分配，不把自己概括为总接受或总反对等级。"
      }
    ]
  },
  {
    "id": "autonomy",
    "title": {
      "en": "Individualism and collectivism theme: choice and agreed duties",
      "zh": "个人主义与集体主义主题：本人选择与约定义务"
    },
    "paragraphs": [
      {
        "en": "This group asks about personal choice, responsibility for agreed tasks, coordinating important decisions and continuing membership duties. It does not equate individualism with selfishness or collectivism with warmth. Wanting to choose an optional hobby project does not tell us whether someone will support a friend or keep a promise.",
        "zh": "本组涉及本人选择、负责约定任务、协调重要决定与持续成员义务，不把个人主义等同自私，也不把集体主义等同温暖。希望自主选择可选爱好项目，不能说明是否支持朋友、是否守约。"
      },
      {
        "en": "For one shared activity, separate what was freely agreed from what is merely expected by the usual circle. Someone can favour choosing their own project and still complete the setup they promised to do. Ask what the common task actually requires instead of treating a mean as permission to disregard a commitment.",
        "zh": "可把一项共同活动中自愿约定的内容，与熟悉圈子的惯常期待分开。有人可以自主选项目，也完成答应的共同布置。实际应问共同任务需要什么，不把均值当作忽视承诺的理由。"
      }
    ]
  },
  {
    "id": "achievement",
    "title": {
      "en": "Achievement and role expectations: read the two aspects separately",
      "zh": "成就与角色期待：两个面向要分别回看"
    },
    "paragraphs": [
      {
        "en": "Three statements concern competitive recognition versus care and everyday quality of life; three concern whether emotional roles should differ by gender. These are distinct discussion areas inside one original group. Its mean cannot show whether endorsement concerns a prize, a sustainable pace or expectations about how people may express themselves.",
        "zh": "三条涉及竞争认可与成员照顾、日常生活质量，另三条涉及情绪角色是否应按性别区分。它们是同一原创分组中的不同讨论面向；均值不能说明认同的是奖项、可持续节奏，还是对人们表达方式的期待。"
      },
      {
        "en": "A person may enjoy a competition while wanting people of every gender to have equal room to be assertive, caring or uncertain. Another may prioritise helping a member who fell behind. Inspect the individual statements; this result creates no gender, fairness, ambition or moral-worth score.",
        "zh": "一个人可以喜欢比赛，也希望任何性别都同样可以坚定表达、关心别人或承认拿不准；另一个人可能优先帮助暂时落后的成员。应逐条阅读，本结果不产生性别、公平、抱负或道德价值分数。"
      }
    ]
  },
  {
    "id": "certainty",
    "title": {
      "en": "Uncertainty avoidance theme: unresolved meanings in ordinary situations",
      "zh": "不确定性规避主题：普通情境中暂未确定的含义"
    },
    "paragraphs": [
      {
        "en": "These prompts concern wanting one definite interpretation, reducing ambiguity before continuing, or allowing several meanings to remain open while learning more. They do not test risk tolerance, anxiety or obedience to rules. Wanting clarification of a vague message can be specific to that message.",
        "zh": "题文涉及希望形成确定解释、继续之前减少模糊，或在了解更多信息时暂时保留多种含义，不测试风险承受、焦虑或服从规则。想澄清一条含糊消息，可能只针对这条消息。"
      },
      {
        "en": "If a club message could mean changing the topic or postponing the meeting, asking the sender is one option; briefly retaining both interpretations is another. The questionnaire cannot decide how much information the actual arrangement needs. Keep the reference ordinary rather than substituting an emergency or a safety-critical decision.",
        "zh": "例如，社团消息既可能指换主题，也可能指推迟见面，可以询问发送者，也可以短暂保留两种解释。问卷不决定实际安排需要多少信息；应保持普通情境参照，不改成应急事件或安全决策。"
      }
    ]
  },
  {
    "id": "adaptation",
    "title": {
      "en": "Long-term and normative orientation theme: revising a practice",
      "zh": "长期与规范取向主题：修改做法还是沿用参照"
    },
    "paragraphs": [
      {
        "en": "The adaptation group concerns revising inherited practices when conditions change, preparing for future conditions and valuing established standards or continuity. It does not measure planning skill, patience, thrift or educational success. An unfamiliar alternative may need more information before you can judge it.",
        "zh": "调整条目关注条件变化时是否修改沿用做法、为未来条件准备，以及重视既有标准或延续，不测计划能力、耐心、节俭或教育成就。面对不熟悉的替代方案，也可能需要更多信息才好评价。"
      },
      {
        "en": "A club’s regular meeting time may no longer suit its members. Trying a different time and asking why the old routine was established can both be useful. Compare what each arrangement preserves and changes; endorsing revision does not prove superior foresight, and valuing continuity does not mean rejecting every new idea.",
        "zh": "例如，社团固定见面时间已不适合成员。试另一个时间，与先了解旧惯例为何建立，都可以有用。可比较各安排保留和改变什么；赞成修改不证明更有远见，重视延续也不等于拒绝一切新想法。"
      }
    ]
  },
  {
    "id": "enjoyment",
    "title": {
      "en": "Indulgence and restraint theme: room for ordinary enjoyment",
      "zh": "享乐与克制主题：给普通享受留下多少空间"
    },
    "paragraphs": [
      {
        "en": "The enjoyment statements ask about social permission for leisure and small pleasures when agreed responsibilities are met, compared with continuing emphasis on duty or restraint. A response is about the group norm you would prefer, not a record of your spending, health, self-control or current happiness.",
        "zh": "享受条目关注约定责任完成后，休闲和小乐趣可以获得多少合理空间，与继续重视尽责或克制的规范作比较。回答描述希望的小组规范，不记录花费、健康、自控或当前幸福程度。"
      },
      {
        "en": "A short optional break may be enough for one group; another may prefer a different way to rest. People have different resources and responsibilities. A mean does not require anyone to spend money, join an activity or justify a personal boundary, and it does not establish an ideal work–life balance.",
        "zh": "对一个小组而言，自愿短休息可能已经足够，另一个小组可能喜欢不同休息方式。每个人的资源与责任不同；均值不要求花钱、参加活动或证明个人边界合理，也不确立理想工作生活平衡。"
      }
    ]
  },
  {
    "id": "calculation",
    "title": {
      "en": "Reverse keys, numeric coverage and a worked calculation",
      "zh": "反向换算、数字覆盖与复算示例"
    },
    "paragraphs": [
      {
        "en": "Within each six-item group, the first three values are direct and the last three become 6 minus the response. For 4, 5, 3, 1, 2, 4, the contributions are 4, 5, 3, 5, 4, 2: sum 23, count 6 and a one-decimal mean of 3.8. A reversed item changes direction; it is not a trick or a preference for a “better” answer.",
        "zh": "每组六条中，前三项直接计入，后三项按6减作答换算。回答4、5、3、1、2、4，贡献为4、5、3、5、4、2，和23、数字项数6，均值显示3.8。反向题用于方向对齐，不是陷阱，也不表示存在“更好”的答法。"
      },
      {
        "en": "With responses 4, 5, 3, 1, unscored, unscored, the sum is 17 across four numeric items, giving 4.3 after rounding. Fewer than four numeric answers withholds that group’s mean; unscored is excluded rather than zero-filled. All 36 prompts still need a response, including the unscored option, before the six summaries appear.",
        "zh": "回答4、5、3、1、不评分、不评分时，四项数字合计17，舍入后显示4.3。数字少于四项则该组不计算均值，不评分被排除，不补零。仍需回应全部36条，包括可选不评分，之后才呈现六组摘要。"
      }
    ]
  },
  {
    "id": "levels",
    "title": {
      "en": "Individual, group and country are different levels of evidence",
      "zh": "个人、小组与国家：分析层级不能互换"
    },
    "paragraphs": [
      {
        "en": "One member’s preferred arrangement does not tell us what everyone else prefers, how the group actually works or what a whole society expects. For example, a country-level tendency toward hierarchy cannot tell us whether a particular classmate wants an equal vote. Moving from a group average to that individual would require evidence the average does not supply. [2]",
        "zh": "一名成员希望的安排，不能说明其他人怎样想、小组实际怎样运作，或整个社会期待什么。例如，国家层面的等级倾向，不能告诉我们某位同学是否希望平等投票；从群体平均跳到这个人，需要平均值本身未提供的证据。[2]"
      },
      {
        "en": "Individual-level research therefore needs its own measurement work. Yoo, Donthu and Lenartowicz’s 2011 CVSCALE publication describes a separate 26-item, five-dimensional individual measure. This 36-item, six-theme reflection does not reproduce that instrument or inherit its validation; familiar topic names do not make forms interchangeable. [3]",
        "zh": "个人层面的研究因此需要相应测量工作。Yoo、Donthu与Lenartowicz在2011年的CVSCALE论文介绍的是另一份26条、五维的个人工具。本站36条、六主题反思不复刻它，也不继承其验证；主题名称熟悉，不使不同题本可以互换。[3]"
      }
    ]
  },
  {
    "id": "reading",
    "title": {
      "en": "Equal means, mixed answers and the limits of comparison",
      "zh": "相同均值、混合回答与比较的限度"
    },
    "paragraphs": [
      {
        "en": "Six middle responses and keyed contributions alternating 5 and 1 both average 3.0. Their patterns differ. The achievement group can also hide agreement with competition alongside disagreement with gendered roles. Read which statements produced the number before calling it moderate, balanced or a coherent personal characteristic.",
        "zh": "六个中间回答，与5、1交替的换算贡献，均值都为3.0，回答模式却不同。成就组也可能隐藏支持竞争、但反对按性别划分角色的区别。应先看数字来自哪些条目，不直接叫作温和、平衡或一致个人特征。"
      },
      {
        "en": "The six groups have no established common calibration, meaningful-gap threshold or population norms. Neither a larger mean nor a tie makes a theme dominant. The four-answer rule controls missing information on this website; it does not prove that the remaining items reliably represent a latent cultural trait or that the response scale has equal intervals.",
        "zh": "六组没有已建立的共同标定、有意义差值阈值或人群常模。较大均值或并列，都不使某主题成为主导。至少四项是网站处理资料缺失的规则，不证明剩余题目能够可靠代表潜在文化特质，也不证明作答量尺等距。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "Turn one response into a question about an arrangement",
      "zh": "把一条回答转成针对安排的具体问题"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one statement and privately note the arrangement, what you would prefer and which conditions remain unknown. You might ask how a reading group will finalise its book choice and how members can offer suggestions. That discussion can use evidence about the actual task instead of assigning a cultural identity to anyone.",
        "zh": "有用时，可选一条陈述，私下记下涉及什么安排、自己希望什么，以及哪些条件仍未知。例如，询问读书小组怎样最终选书、成员可以怎样提建议。讨论可以参考实际任务证据，而不是替人分配文化身份。"
      },
      {
        "en": "You do not have to contact the group, disclose your answers or change behavior to match a mean. If you later retake, keep the setting and wording in view; a changed response can reflect circumstances rather than a measured cultural transformation. Both language versions lack established equivalence, and the public guides contain no visitor’s private scores.",
        "zh": "无需联系小组、披露回答或按均值改变行为。之后重做时应保留对情境与题文的关注；回答变化可能来自处境，不是已测得的文化转变。两种语言尚未建立等值，公开指南不含访客私人分数。"
      }
    ]
  }
];
export const culturalFaq = [
  {
    "question": {
      "en": "What does this cultural dimensions test measure?",
      "zh": "这份文化维度测试测什么？"
    },
    "answer": {
      "en": "It summarises responses about six kinds of preferred arrangement in one real or imagined voluntary group. It does not observe a group or identify an individual’s or a nation’s culture.",
      "zh": "它汇总对同一个真实或假设自愿小组中六类安排的偏好回答，不观察整个小组，不识别个人或国家文化。"
    }
  },
  {
    "question": {
      "en": "How should I choose the setting?",
      "zh": "作答参照什么情境？"
    },
    "answer": {
      "en": "Choose one ordinary voluntary group, such as a hobby club or reading group, and keep it throughout. You do not need to enter its name or any member details. This form sets no past-month reporting period.",
      "zh": "可选普通自愿小组，例如兴趣社团、读书小组，整份保持同一背景，不输入名称或成员资料。本题本没有规定回顾过去一个月。"
    }
  },
  {
    "question": {
      "en": "Does selecting a higher number always increase a mean?",
      "zh": "选更大的数一定提高均值吗？"
    },
    "answer": {
      "en": "No. The last three statements per group use 6 minus the chosen value. A 5 contributes 1 on those items. Read the wording; the form has no desired result or better response.",
      "zh": "不一定。每组后三条按6减所选数，选5贡献1。请阅读题文，没有应当达到的结果或更好的答案。"
    }
  },
  {
    "question": {
      "en": "Can I answer every statement with unscored?",
      "zh": "全部选不评分也能完成吗？"
    },
    "answer": {
      "en": "Yes. Each prompt still has a response, so the attempt can finish. No group mean is calculated, and all six complete guides remain available. Missing information is not converted into a zero or a middle response.",
      "zh": "可以。每条已有回应，因此能结束作答；六组不计算均值，完整指南仍可阅读，缺失资料不补零，也不补中间回答。"
    }
  },
  {
    "question": {
      "en": "Why do achievement and role expectations need special care?",
      "zh": "成就与角色期待为什么要特别注意？"
    },
    "answer": {
      "en": "The group combines competitive-recognition statements with gendered-role expectations. Similar overall means can conceal different views on those aspects. Read the individual statements; no separate gender or moral score is produced.",
      "zh": "本组同时包含竞争认可与按性别区分角色的陈述。相似总体均值可能隐藏对两者不同的看法，应逐条回看；不另算性别或道德分数。"
    }
  },
  {
    "question": {
      "en": "Does uncertainty avoidance mean fear or risk avoidance?",
      "zh": "不确定性规避就是害怕或规避风险吗？"
    },
    "answer": {
      "en": "Not in this form. These original prompts concern unresolved meanings in ordinary group situations. They do not assess anxiety, financial risk appetite, safety competence or emotional regulation.",
      "zh": "本题本不是这样定义。原创题关注普通小组情境中尚未明确的含义，不评估焦虑、财务风险偏好、安全能力或情绪调节。"
    }
  },
  {
    "question": {
      "en": "Can I use the means to choose a country or a job?",
      "zh": "能凭均值选国家或职业吗？"
    },
    "answer": {
      "en": "No country-match or job-fit model is defined. Decisions need actual information about the place, task, requirements and your circumstances. Another product’s country-comparison feature cannot be inferred from this response summary.",
      "zh": "本题本没有定义国家匹配或岗位契合模型。决定需要地点、任务、要求与个人处境的实际信息，不能从这份回答摘要推导其他产品的国家比较功能。"
    }
  },
  {
    "question": {
      "en": "Is the highest of the six means my main cultural type?",
      "zh": "六个均值里最大的是主导文化类型吗？"
    },
    "answer": {
      "en": "No. They summarise different statements without a common calibrated scale. The page keeps a fixed order, with no total, ranking, dominant type or meaningful-gap cutoff.",
      "zh": "不是。各组概括不同陈述，没有共同标定量尺。页面保留固定顺序，不设总分、排名、主导类型或有意义差值截点。"
    }
  },
  {
    "question": {
      "en": "Does Start test require another agreement?",
      "zh": "点击开始还需要再勾选同意吗？"
    },
    "answer": {
      "en": "No. The button opens the first question directly. Optional 24-hour tab-draft saving remains a separate choice during the attempt and is not required to answer or read results.",
      "zh": "不需要。按钮直接打开第一题；24小时标签页草稿是作答中的独立可选项，不是作答或查看结果的条件。"
    }
  },
  {
    "question": {
      "en": "Can the group names be shared in a link?",
      "zh": "分享链接会带上小组名称吗？"
    },
    "answer": {
      "en": "The form never asks you to enter a group name. Copying shares only the public test title and entry link, without answers, means or the setting you imagined.",
      "zh": "题本没有要求输入小组名称。复制只分享公开测试标题与入口链接，不包含回答、均值或私下想到的背景。"
    }
  }
];
export const culturalSummaries: Record<string, Text> = {
  "authority": {
    "en": "The authority statements contrast stronger final authority for a coordinator or senior member with opportunities to question decisions, influence a shared choice and ask for reasons. The mean concerns these particular arrangements. It does not measure leadership ability or decide whether an actual decision was fair.",
    "zh": "权限条目比较协调者或资深成员拥有更大最终决定权，与质疑决定、影响共同选择、询问理由的空间。均值只涉及这些具体安排，不测领导能力，也不裁定真实决定是否公平。"
  },
  "autonomy": {
    "en": "This group asks about personal choice, responsibility for agreed tasks, coordinating important decisions and continuing membership duties. It does not equate individualism with selfishness or collectivism with warmth. Wanting to choose an optional hobby project does not tell us whether someone will support a friend or keep a promise.",
    "zh": "本组涉及本人选择、负责约定任务、协调重要决定与持续成员义务，不把个人主义等同自私，也不把集体主义等同温暖。希望自主选择可选爱好项目，不能说明是否支持朋友、是否守约。"
  },
  "achievement": {
    "en": "Three statements concern competitive recognition versus care and everyday quality of life; three concern whether emotional roles should differ by gender. These are distinct discussion areas inside one original group. Its mean cannot show whether endorsement concerns a prize, a sustainable pace or expectations about how people may express themselves.",
    "zh": "三条涉及竞争认可与成员照顾、日常生活质量，另三条涉及情绪角色是否应按性别区分。它们是同一原创分组中的不同讨论面向；均值不能说明认同的是奖项、可持续节奏，还是对人们表达方式的期待。"
  },
  "certainty": {
    "en": "These prompts concern wanting one definite interpretation, reducing ambiguity before continuing, or allowing several meanings to remain open while learning more. They do not test risk tolerance, anxiety or obedience to rules. Wanting clarification of a vague message can be specific to that message.",
    "zh": "题文涉及希望形成确定解释、继续之前减少模糊，或在了解更多信息时暂时保留多种含义，不测试风险承受、焦虑或服从规则。想澄清一条含糊消息，可能只针对这条消息。"
  },
  "adaptation": {
    "en": "The adaptation group concerns revising inherited practices when conditions change, preparing for future conditions and valuing established standards or continuity. It does not measure planning skill, patience, thrift or educational success. An unfamiliar alternative may need more information before you can judge it.",
    "zh": "调整条目关注条件变化时是否修改沿用做法、为未来条件准备，以及重视既有标准或延续，不测计划能力、耐心、节俭或教育成就。面对不熟悉的替代方案，也可能需要更多信息才好评价。"
  },
  "enjoyment": {
    "en": "The enjoyment statements ask about social permission for leisure and small pleasures when agreed responsibilities are met, compared with continuing emphasis on duty or restraint. A response is about the group norm you would prefer, not a record of your spending, health, self-control or current happiness.",
    "zh": "享受条目关注约定责任完成后，休闲和小乐趣可以获得多少合理空间，与继续重视尽责或克制的规范作比较。回答描述希望的小组规范，不记录花费、健康、自控或当前幸福程度。"
  }
};
export const culturalExtraReferences = [
  {
    "url": "https://sites.hofstra.edu/boonghee-yoo/cvscale/",
    "title": {
      "en": "Yoo, Donthu & Lenartowicz (2011): CVSCALE — individual-level instrument identity",
      "zh": "Yoo、Donthu与Lenartowicz（2011）：CVSCALE个人工具身份"
    }
  }
];
