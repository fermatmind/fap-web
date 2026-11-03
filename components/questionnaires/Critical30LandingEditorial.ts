import type { Questionnaire } from "@/lib/questionnaires/types";
export const critical30LandingSections: Questionnaire["guide"] = [
  {
    "id": "critical30-purpose",
    "title": {
      "en": "Critical-thinking practice: identify the rule before judging a conclusion",
      "zh": "批判性思维练习：先辨认规则，再判断结论"
    },
    "paragraphs": [
      {
        "en": "This independent learning edition contains thirty original English questions, six each in inference, assumptions, deduction, interpretation and arguments. Every question repeats its response rule. After the attempt, every answer and bilingual explanation is free, and all five complete public study guides can also be read before answering.",
        "zh": "本独立学习版包含三十道原创英文题，推断、假设、演绎、解读与论证评价各六题。每题重复对应答题规则。结束后可免费查看全部答案与双语解析，五篇完整公开学习指南也可在作答前阅读。"
      },
      {
        "en": "The five families ask different questions: how well an inference is supported, what a statement takes for granted, what must follow, what the reported evidence warrants, and whether a reason matters to a stated decision. Reading fluency and familiarity with the rule can affect practice responses; a raw count does not isolate a general ability.",
        "zh": "五类题分别询问：推断得到多少支持、陈述预设什么、什么结论必然成立、已报告证据支持什么，以及某条理由是否影响指定决策。阅读熟练度与规则熟悉程度均可能影响作答，原始正确数不能单独分离出一般能力。"
      }
    ]
  },
  {
    "id": "critical30-inference",
    "title": {
      "en": "Inference: certainty, stated probability and missing information",
      "zh": "推断：确定性、明示概率与信息不足"
    },
    "paragraphs": [
      {
        "en": "Use this edition’s explicit convention: True or False requires certainty from the facts or model; Probably true or Probably false uses a known probability above or below one half, short of certainty. Insufficient data means the information supplies no justified direction. For a fresh example, four of five equally likely tiles are blue: an unseen selection is probably blue, not certainly blue.",
        "zh": "本版采用明示约定：真实或虚假需要从事实或模型得到确定结论；大概真实或大概虚假对应已知概率高于或低于二分之一，且未达到确定。信息不足表示资料没有给出有依据的方向。例如另造一个例子：五块等概率抽取的牌中四块为蓝色，未揭晓的抽牌大概是蓝色，却不确定。"
      },
      {
        "en": "This convention belongs to the original bank. The historical Pearson UK practice booklet allows commonly accepted knowledge in some probability judgments, whereas these questions bound the evidence explicitly. Do not carry this edition’s probability rule into a provider assessment without reading its instructions. Publisher practice is background, not an equivalent form or a validation of our keys.",
        "zh": "这套约定属于原创题本。Pearson历史英国版练习册允许在部分概率判断中使用公认常识，本题则明确限定证据。参加提供方测评时应重新阅读其说明，不能直接套用本站概率规则。提供方练习仅为背景，不是本站等价题本，也不验证本站答案。"
      }
    ]
  },
  {
    "id": "critical30-assumptions",
    "title": {
      "en": "Assumptions: distinguish a necessary presupposition from a plausible detail",
      "zh": "假设：区分必要预设与看似合理的细节"
    },
    "paragraphs": [
      {
        "en": "Ask whether the stated plan or reasoning depends on the proposed assumption. Temporarily deny that assumption while keeping the statement’s own goal and conditions. If the plan no longer works as claimed, that identifies a relevant dependency. This is not a request to decide whether the assumption happens to be true.",
        "zh": "检查陈述中的计划或推理是否依赖所提出的假设。暂时否定该假设，同时保留原陈述的目标与条件；若计划无法按所说方式成立，就找到相关依赖。这不是要求判断该假设在现实中恰好是否真实。"
      },
      {
        "en": "For example, a club expects every member to receive notices through its only mailing list. The expectation depends on every member being reachable there; it does not depend on the notice using a particular typeface. Keep the proposed assumption narrow: a helpful fact, a desirable outcome and a necessary presupposition are different.",
        "zh": "例如，社团预计通过唯一的邮件名单通知每位成员。这项预计依赖所有成员都能在该名单上收到信息，却不依赖通知使用某种字体。应限定所问假设：有帮助的事实、期望的结果与必要预设是不同问题。"
      }
    ]
  },
  {
    "id": "critical30-deduction",
    "title": {
      "en": "Deduction: try to construct a counterexample",
      "zh": "演绎：尝试构造反例"
    },
    "paragraphs": [
      {
        "en": "Treat each premise as true and ask whether the conclusion holds in every arrangement satisfying them. One arrangement with true premises and a false conclusion is enough to reject necessity. In this bank, some means at least one. A universal statement alone does not establish that its subject has any instances.",
        "zh": "把每条前提视为真实，检查结论是否在所有满足前提的安排中成立。只要找到一种前提真而结论假的安排，就足以否定必然性。本题本的有些表示至少一个；单独的全称陈述不保证其主项确有实例。"
      },
      {
        "en": "For a fresh example, every green folder is filed, and one green folder exists; therefore a filed folder exists. But knowing that a folder is filed does not establish that it is green. Write the direction of an implication before reversing it, and retain any explicit existence premise rather than silently adding one.",
        "zh": "例如另造一例：每个绿色文件夹均已归档，且存在一个绿色文件夹，因此存在已归档文件夹。但知道某文件夹已归档，不能证明它是绿色。应先写清蕴含方向再判断能否逆转，保留明示存在前提，不默默补上实例。"
      }
    ]
  },
  {
    "id": "critical30-interpretation",
    "title": {
      "en": "Interpretation: preserve population, time and causal scope",
      "zh": "解读：保留人群、时间与因果范围"
    },
    "paragraphs": [
      {
        "en": "This part asks whether the reported observations support the particular conclusion beyond reasonable doubt in the described setting. Locate the population, period, comparison and strength of the claim. A conclusion can overreach by changing any one of those, even if it sounds plausible outside the passage.",
        "zh": "本部分检查已报告观察是否在所述情境中足以排除合理怀疑地支持具体结论。应标出对象、时期、比较与主张强度。即使在短文之外听来合理，只要改变其中一个范围，结论也可能超出证据。"
      },
      {
        "en": "For example, a complete record says all eight workshop attendees returned a form. It supports a conclusion about those eight attendees, not everyone invited or next month’s workshop. A change after an intervention also does not by itself isolate the intervention as the cause. State the narrower finding first, then identify what extra evidence a broader claim would require.",
        "zh": "例如，一份完整记录说明八位工作坊参加者均交回表格。这支持关于这八人的结论，不支持所有受邀者或下月工作坊的结论。干预之后发生变化，也不能仅凭先后顺序分离出干预的因果作用。先表述较窄发现，再说明更宽主张还需要什么证据。"
      }
    ]
  },
  {
    "id": "critical30-arguments",
    "title": {
      "en": "Arguments: separate relevance from personal agreement",
      "zh": "论证评价：区分相关性与个人赞同"
    },
    "paragraphs": [
      {
        "en": "Accept the offered reason as true for the exercise, then compare it with the stated decision goal. A strong reason is both directly relevant and material to that goal; a weak one may be unrelated or concern a trivial detail. The question is not whether you like the proposal or its speaker.",
        "zh": "在练习中先把给定理由当作真实，再与明示决策目标比较。强理由既直接相关，又对目标有实质影响；弱理由可能无关，或仅涉及细枝末节。题目不问你是否喜欢提议或说话者。"
      },
      {
        "en": "For example, if the stated goal is to reduce room-booking clashes, a stipulated reduction in duplicate bookings is relevant, while the colour of the booking screen alone does not establish that benefit. A strong reason is a reason for the side specified, not proof that every alternative has been evaluated or that the proposal must be adopted in real life.",
        "zh": "例如，指定目标是减少会议室预约冲突，题设确认重复预约减少就与目标相关，预约界面的颜色本身却不能证明这项收益。强理由只是支持所指定一方的理由，不证明已经评估所有替代方案，也不意味着现实中必须采纳提议。"
      }
    ]
  },
  {
    "id": "critical30-clock",
    "title": {
      "en": "One start, one thirty-minute clock across all five parts",
      "zh": "一次开始，五部分共用三十分钟连续计时"
    },
    "paragraphs": [
      {
        "en": "Timed mode starts the whole attempt at 30:00 when you select Start test. Rule reading, movement between parts, revisiting and background tabs do not pause or restart it. You may change any response before the attempt closes, explicitly leave an item unanswered, or finish early. The deadline locks the record with blanks kept separate.",
        "zh": "计时模式在点击开始测试时启动整卷30:00。阅读规则、换部分、返回题目与切到后台均不暂停或重启。整份作答关闭前可修改任何回答、明确留空或提前结束；到时锁定记录，并单独保留未答。"
      },
      {
        "en": "Untimed study uses exactly the same fixed bank without a deadline. A device-clock inconsistency clears the attempt instead of producing a misleading timed record. Refreshing, leaving or changing language clears private on-page work; there is no draft save here. Paper and a calculator are allowed in this practice; actual assessment equipment, timing and assistance rules come from your invitation.",
        "zh": "不计时学习使用完全相同的固定题本，没有截止时间。设备时钟不一致时会清除本次记录，不生成误导性的计时结果。刷新、离开或换语言会清除当前页面内的私人作答，本练习不保存草稿。本站允许纸笔与计算器，正式测评的设备、时限与协助规则以实际邀请为准。"
      }
    ]
  },
  {
    "id": "critical30-review",
    "title": {
      "en": "Review the reasoning process, not an invented percentile",
      "zh": "复盘推理过程，不换算虚构百分位"
    },
    "paragraphs": [
      {
        "en": "Each part reports correct, wrong and unanswered counts that add to six; overall they add to thirty. For example, four correct, one wrong and one unanswered is a complete six-item record. Two-option and five-option questions have different response sets and have not been equated for difficulty. Equal raw counts do not establish equal ability, a weakest faculty or an employer pass probability.",
        "zh": "每部分报告正确、错误与未答，三项合计六题；整卷合计三十题。例如正确四题、错误一题、未答一题，就是完整六题记录。二选一与五选一的选项集合不同，难度也未经等值；相同原始正确数不能证明能力相同、某项能力最弱或正式测评通过概率。"
      },
      {
        "en": "After reading an explanation, name the first unsupported step: added premise, reversed implication, changed population, causal leap or irrelevant reason. Make a new example and explain what would change the answer. Repeating a fixed bank mixes familiarity with possible learning; it cannot prove transfer. Publisher practice itself distinguishes familiarisation from live scoring. Use its own instructions next, rather than treating this practice as a recruitment or professional-competence assessment.",
        "zh": "阅读解析后，指出第一个没有依据的步骤：添加前提、逆转蕴含、改变对象、跨越因果或采用无关理由。再编一个新例，解释什么条件会改变答案。固定题重测混合了熟悉与可能的学习，不能证明迁移。提供方练习也区分熟悉题型与正式计分。下一步应阅读其实际说明，不把本站练习当招聘或职业胜任测评。"
      }
    ]
  }
];
export const critical30LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this an official Watson–Glaser test or a calibrated mock?",
      "zh": "这是正式Watson–Glaser或经过校准的模拟吗？"
    },
    "answer": {
      "en": "No. It is an independent fixed thirty-question learning edition. The name describes the five question families being practised. Our six-per-part allocation, original keys, probability conventions and local clock have not been equated with a provider form.",
      "zh": "不是。这是独立固定三十题学习版，名称说明所练习的五类题。本站每部分六题的分配、原创答案、概率约定与本地计时，均未与提供方题本等值。"
    }
  },
  {
    "question": {
      "en": "Should I use common knowledge in inference questions?",
      "zh": "推断题要不要使用常识？"
    },
    "answer": {
      "en": "Follow the instruction in the actual item. This bank uses only stated facts or an explicit sampling model. The historical publisher booklet permits some common knowledge in certain likelihood judgments; that is a meaningful difference, not a rule to silently blend with ours.",
      "zh": "以实际题目说明为准。本题本只使用明示事实或明确抽样模型；历史提供方练习册允许部分可能性判断采用常识。这是实质差异，不应默默混合两套规则。"
    }
  },
  {
    "question": {
      "en": "Why are there two binary conclusion sections?",
      "zh": "为什么有两部分都是二选一结论题？"
    },
    "answer": {
      "en": "Deduction asks whether the conclusion is necessary in every model of the premises. Interpretation asks whether the supplied observations warrant the particular conclusion beyond reasonable doubt in context. Read each rule instead of treating the answer labels as identical tasks.",
      "zh": "演绎检查结论是否在所有满足前提的模型中必然成立；解读检查给定观察是否在具体情境中足以排除合理怀疑地支持结论。应读各自规则，不能因选项近似就当成同一任务。"
    }
  },
  {
    "question": {
      "en": "Does Start test open the questions without an agreement gate?",
      "zh": "点击开始测试会直接进入题目吗？"
    },
    "answer": {
      "en": "Yes. You can choose timed or untimed mode, then Start test opens question one immediately. No agreement or activity-counting checkbox is required. In timed mode that single click also starts the continuous whole-attempt clock.",
      "zh": "会。可先选择计时或不计时模式，再点击开始测试直接进入第一题，无需必选同意或使用计数复选框。计时模式下，这一次点击也会启动整卷连续计时。"
    }
  },
  {
    "question": {
      "en": "Can I go back after moving to another part?",
      "zh": "进入另一部分后还能返回修改吗？"
    },
    "answer": {
      "en": "Yes, until the entire attempt ends. This edition has one whole-attempt clock, not separate locked section clocks. Final submission or expiry locks all responses; a background tab does not pause time.",
      "zh": "可以，直到整份作答结束。本版只有整卷计时，不是各部分分别计时并锁定。最终提交或到时会锁定全部回答，切到后台不会暂停。"
    }
  },
  {
    "question": {
      "en": "Does leaving a question blank count as a wrong answer?",
      "zh": "留空会算成错误吗？"
    },
    "answer": {
      "en": "No. Unanswered is displayed separately from a wrong offered selection, including at expiry or early finish. Correct, wrong and unanswered still add to the item total. There is no speed bonus, guessing correction or percentile conversion.",
      "zh": "不会。未答与选中错误选项分开显示，到时或提前结束也一样。正确、错误与未答仍合计题目总数，不设速度奖励、猜测修正或百分位换算。"
    }
  },
  {
    "question": {
      "en": "Are the questions translated in the Chinese interface?",
      "zh": "中文界面会翻译英文题目吗？"
    },
    "answer": {
      "en": "No. Both interfaces present the same English stems and options. Instructions, explanations and full guides are bilingual. A Chinese interface therefore does not remove the English reading demand or establish cross-language measurement equivalence.",
      "zh": "不会。两种界面均呈现同一英文题干与选项，说明、解析和完整指南为双语。中文界面不消除英文阅读要求，也不证明跨语言测量等值。"
    }
  },
  {
    "question": {
      "en": "What can I share or retain from this attempt?",
      "zh": "本次练习能分享或保存什么？"
    },
    "answer": {
      "en": "The share control copies five public guide links, with no responses, counts or attempt identifier. Private work remains in the current page memory and clears when you leave or refresh. You may separately note a reasoning method without recording sensitive personal information.",
      "zh": "分享功能只复制五篇公开指南链接，不含答案、数量或作答标识。私人作答仅在当前页面内存，离开或刷新会清除。可另行记下推理方法，无需记录敏感个人资料。"
    }
  }
];
