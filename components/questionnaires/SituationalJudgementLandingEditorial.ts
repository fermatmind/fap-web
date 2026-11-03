import type { Questionnaire } from "@/lib/questionnaires/types";

export const situationalJudgementLandingSections: Questionnaire["guide"] = [
  {
    "id": "sjt-format-scope",
    "title": {
      "zh": "情境判断测试是什么？先区分作答任务与测量用途",
      "en": "What is a situational judgement test? Separate the response task from its use"
    },
    "paragraphs": [
      {
        "zh": "情境判断测试（SJT）通常给出工作场景，要求选择或评价行动。不同题本可能问“你会怎样做”“哪项最有效”，也可能要求排序或分别评级；这些指令不能互换。OPM将其与实际执行任务的工作样本区分，并说明常见开发方法涉及岗位专家和关键事件。[3] 这解释了测试形式，不构成本题本的验证结论。",
        "en": "Situational judgement tests (SJTs) present work scenarios and ask respondents to select or evaluate actions. What you would do, which action is most effective, ranking and independent ratings are different instructions. OPM distinguishes SJTs from actually performing a work sample and describes development using job experts and critical incidents.[3] That describes a method, rather than validating this bank."
      },
      {
        "zh": "本页是25道原创、条件明确的单选练习，每题四项行动，选择满足题定条件的一项。五组分别涉及优先顺序、责任交接、事实更新、职责范围与团队协作。答案来自对给定条件的核对；既不实施雇主专有题库，也不把你的屏幕选择转成稳定人格或真实岗位表现。",
        "en": "This page offers twenty-five original single-choice exercises, each with four actions and explicit conditions supporting one keyed response. The five groups cover priorities, ownership, factual updates, role boundaries and teamwork. Answers follow those supplied conditions. The bank neither administers an employer’s proprietary assessment nor converts screen choices into stable personality or observed job performance."
      }
    ]
  },
  {
    "id": "sjt-priority-capacity",
    "title": {
      "zh": "优先顺序：先识别约束，再检查承诺能否兑现",
      "en": "Priorities: identify the constraint before committing to a plan"
    },
    "paragraphs": [
      {
        "zh": "先从题面提取目标、期限、容量与前置条件，再判断它们之间的顺序。题目若明确先按级别、同级才按期限，就不能因为低优先级任务更早到期而把规则倒过来；如果题定先处理阻塞项，也不能只选最容易完成的一项。",
        "en": "Extract the goal, deadline, available capacity and prerequisites before comparing actions. When the stated rule puts priority before deadline, an earlier deadline on a lower-priority item does not reverse that rule. When a blocker takes precedence, the easiest task is not automatically the next task."
      },
      {
        "zh": "新例：可用60分钟，必须保留的核对需35分钟，另一任务需40分钟，合计75分钟，缺15分钟。若规则允许协调第二项改期，应提出可行安排，而不是承诺两项都在60分钟内完成。若把容量改成80分钟，原先的容量冲突便消失；这说明答案依赖条件，不是“永远拒绝新增工作”。",
        "en": "Fresh example: sixty minutes are available; a protected check takes thirty-five and another task takes forty. Seventy-five minutes of work leaves a fifteen-minute shortfall. If the rule permits rescheduling the second task, propose that feasible arrangement rather than promise both within sixty minutes. Changing capacity to eighty removes that particular conflict: the conclusion follows the conditions, not an instruction to always refuse more work."
      }
    ]
  },
  {
    "id": "sjt-handover-states",
    "title": {
      "zh": "责任交接：发出、接收与完成是三个状态",
      "en": "Ownership: sending, accepting and completing are different states"
    },
    "paragraphs": [
      {
        "zh": "练习中的交接约定可能要求明确接收。新例：Mina周一发出交接，Theo周二答应接收并在周五完成。若规则规定接收前仍由原负责人承担，周一不能只因邮件已发就删掉Mina；周二可登记Theo及约定日期，但工作仍未完成。",
        "en": "A handover exercise may require explicit acceptance. In a fresh example, Mina sends a handover on Monday; Theo accepts on Tuesday and agrees to finish by Friday. Under a rule retaining the original owner until acceptance, Monday’s message alone does not remove Mina. Tuesday’s acknowledgment supports naming Theo and the agreed date, while the work remains unfinished."
      },
      {
        "zh": "逐项核对当前状态、下一动作、具名负责人，以及题面要求的日期或验收条件。提供了很多背景，不代表下一步一定有人负责；已有交付，也不自动满足尚未发生的验收。这些区分用于读懂本题约定，真实团队的委派和自动验收机制应按实际规则处理。",
        "en": "Check the current state, next action, named owner and any required date or acceptance condition separately. Extensive background does not establish who owns the next step; delivery does not establish an acceptance that has not happened. These distinctions interpret the exercise agreement. Real delegation and automatic acceptance mechanisms follow the actual team’s rules."
      }
    ]
  },
  {
    "id": "sjt-evidence-updates",
    "title": {
      "zh": "事实与沟通：已知、未知与下一次更新分开说",
      "en": "Evidence and updates: separate known facts, uncertainty and the next check"
    },
    "paragraphs": [
      {
        "zh": "题目考查的信息区分包括：未取得数据与测得零、旧记录与当前事实、草稿与已核文档、风险与已发生结果。两份房间记录互相冲突时，计算平均数不能代替核实当前容量；选择应指向题定的可靠信息来源，而不是挑一个最方便的数字。",
        "en": "Information distinctions include unavailable data versus a measured zero, old records versus current facts, drafts versus checked documents, and risks versus outcomes. Averaging conflicting room-capacity records cannot establish current capacity. The action should follow the scenario’s reliable information source rather than the most convenient number."
      },
      {
        "zh": "新例：已观察到文件传输失败，原因尚未查明，约定11:20再更新。可以报告失败、原因待查和11:20的更新安排；不能改写为11:20前保证恢复，也不能先把责任归给某个人。复习时把每个动词与依据对应：“将检查”“已确认”“已完成”各需要不同证据。",
        "en": "Fresh example: a file transfer has failed, the cause is unknown and an update is agreed for 11:20. Report the observed failure, unresolved cause and update plan; do not turn the plan into a guaranteed repair by 11:20 or assign blame before evidence exists. During revision, match each verb to its support: will check, confirmed and completed require different observations."
      }
    ]
  },
  {
    "id": "sjt-roles-feedback",
    "title": {
      "zh": "职责与协作：按题定权限推进，按具体需要沟通",
      "en": "Roles and collaboration: act within the stated delegation and address the actual need"
    },
    "paragraphs": [
      {
        "zh": "职责范围题先问“该动作已经获授权吗”。题面若指定另一人批准，就交其决定并如实保留待处理状态；若已明确授权你处理，便不应自行添加一次批准。文件访问、新增交付和改期各有题定规则，不能背“永远上报”或“先做了再说”来替代逐项判断。",
        "en": "For a role-boundary item, first ask whether the action is already authorized. If the scenario assigns approval to someone else, route the decision there and preserve accurate pending status. If valid delegation already covers your action, do not invent another approval. Access, added deliverables and scheduling follow their stated rules, not a blanket always-escalate or act-first slogan."
      },
      {
        "zh": "团队协作题则检查接收者需要什么：文字说明、具体反馈、诚实的可用时间，或保留异议的决定记录。新例中，团队选择方案B而Kai仍有疑问，可同时记录决定及待回应疑问，不能把“决定推进”改成“全员没有疑虑”。对照最接近答案的选项，找它遗漏的具体条件，比凭措辞是否热情专业更有用。",
        "en": "Teamwork items examine the recipient’s actual need: a text explanation, specific feedback, honest capacity or a decision record retaining an objection. In a fresh example, a team chooses B while Kai’s concern remains open. Record both; a decision to proceed is not unanimous absence of concern. Identify the missing condition in the closest alternative rather than judging how friendly or professional it sounds."
      }
    ]
  },
  {
    "id": "sjt-count-example",
    "title": {
      "zh": "计分算例：25题总数与五项分项正确数",
      "en": "Worked scoring: twenty-five items and five section counts"
    },
    "paragraphs": [
      {
        "zh": "每题答案匹配记1，未匹配记0；各组五题，没有部分分、加权或速度加分。例：五组依次答对2、5、1、4、3题，则总计15/25，各分项依次为2/5、5/5、1/5、4/5、3/5。15/25可换算为这份题本的60%答对率，但不是第60百分位，也不是60%的职场胜任程度。",
        "en": "A matched answer contributes one and an unmatched answer zero. Each group has five items; there is no partial credit, weighting or speed bonus. Counts of 2, 5, 1, 4 and 3 give 15/25, with section counts 2/5, 5/5, 1/5, 4/5 and 3/5. That is sixty percent correct on this bank, not the sixtieth percentile or sixty percent workplace competence."
      },
      {
        "zh": "完成后可以查看25题的所选答案、正确答案和解释，以及五份完整指南共35节正文。即使零题答对，也不会少给某份指南。分项帮助定位这次漏读哪类条件，不能仅凭某组少对一题，就推断存在稳定的管理、诚实或共情差异。",
        "en": "Completion reveals your selections, all twenty-five keys and explanations, and five full guides containing thirty-five sections. Zero correct answers does not withhold a guide. Sections help locate missed conditions in this attempt; one fewer correct answer does not establish a stable difference in management, honesty or empathy."
      }
    ]
  },
  {
    "id": "sjt-evidence-comparison",
    "title": {
      "zh": "研究与版本区别：题目看起来真实，仍需对应测量证据",
      "en": "Evidence and versions: realistic scenarios still require relevant measurement research"
    },
    "paragraphs": [
      {
        "zh": "不同正式测试的作答和计分不同。英国Civil Service指南中的情境部分要求独立评价每个动作，可给多个动作相同评级；本页则每题选择一个答案，不能把两种作答规则混用。[1] 准备特定选拔时，应以那次邀请和官方说明为准，本页不提供其通过线或成绩预测。",
        "en": "Response and scoring formats differ. The UK Civil Service guide asks candidates to rate each action independently and allows equal ratings; this page instead requires one response per item.[1] Follow the actual invitation and official instructions for a selection process. This practice does not supply its pass mark or predict its result."
      },
      {
        "zh": "CIPD说明选择评估方法时需考虑岗位、资源与效度。[2] 本站目前没有本题本的常模、重测、独立专家共识或岗位表现效标研究。明确答案、可复算计分和完整解析支持核查练习本身；它们不能替代心理测量证据，也不支持招聘、晋升、诊断或能力认证。",
        "en": "CIPD identifies the role, resources and validity as considerations in choosing selection methods.[2] This bank currently has no population norms, retest study, independent expert consensus or job-performance criterion study. Explicit keys, reproducible counts and complete explanations make the practice inspectable; they do not replace measurement evidence or support hiring, promotion, diagnosis or ability certification."
      }
    ]
  },
  {
    "id": "sjt-revision-next",
    "title": {
      "zh": "怎样复习：从遗漏条件走到一个新的例子",
      "en": "How to revise: move from a missed condition to a fresh example"
    },
    "paragraphs": [
      {
        "zh": "先把错题归到具体原因：漏了容量、把沉默当接收、把旧数字当当前数据、忽略授权范围，或只满足了两个条件中的一个。然后不用答案原句，自行说明为什么另三项不符合。最后改一个条件，例如已获得授权或容量增加，检查结论是否随之改变。",
        "en": "Name the specific error first: missed capacity, silence treated as acceptance, an old figure treated as current data, overlooked delegation, or only one of two conditions met. Explain why the other actions fail without repeating the key verbatim. Then change one condition, such as available capacity or existing authorization, and reconsider the conclusion."
      },
      {
        "zh": "重做相同题目可能受答案记忆影响，不能只凭正确数上升宣布判断力提高。可以先读五份公开指南，再作答或复习；阅读不改变公式。开始按钮直接进入题目，不要求先注册或确认同意。作答只在浏览器内计分；临时保存进度须主动选择，24小时后失效，完成或重测清除。",
        "en": "Repeating the same items can reward answer memory; a higher count alone does not establish improved judgement. All five public guides can be read before or after practice without changing the formula. Start enters the questions directly without registration or a consent confirmation. Scoring stays in the browser; optional draft saving expires after twenty-four hours and is cleared on completion or retake."
      }
    ]
  }
];

export const situationalJudgementLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "SJT、情境判断测试和情境练习是一回事吗？",
      "en": "Are SJT, situational judgement tests and scenario practice the same thing?"
    },
    "answer": {
      "zh": "SJT是情境判断测试的英文缩写，涵盖多种形式与用途。本页是按明示条件判断的原创单选练习；名称相近不代表与任何雇主或考试的题目、评分、效度等同。",
      "en": "SJT abbreviates situational judgement test, a family of formats and uses. This page provides original single-choice practice under explicit conditions. Similar naming does not establish equivalence to an employer’s or examination’s items, scoring or validity."
    }
  },
  {
    "question": {
      "zh": "本页要求选最像自己的做法，还是符合题目条件的做法？",
      "en": "Should I choose what resembles me or what meets the conditions?"
    },
    "answer": {
      "zh": "选择符合本题明确规则和事实的一项，不是自评通常怎样行动。别的测试可能另问行为倾向、最优最差、排序或逐项评级，作答前应读各自指令。",
      "en": "Choose the action meeting this item’s explicit facts and rules, rather than rate your usual behaviour. Other assessments may request tendencies, best and worst actions, rankings or independent ratings; read their respective instructions."
    }
  },
  {
    "question": {
      "zh": "是否所有题都应该找主管或等待批准？",
      "en": "Should every answer involve a manager or approval?"
    },
    "answer": {
      "zh": "不是。只在题目确实规定他人负责决定、授权不足或尚缺前置条件时，采用对应途径。已有授权不应重复求批；目标是完整满足题面，而非把谨慎当作唯一答案。",
      "en": "No. Use that route only when the item assigns the decision elsewhere, lacks delegation or specifies an unmet prerequisite. Existing authorization does not require another approval. The task is to satisfy the complete prompt, not always choose the most cautious wording."
    }
  },
  {
    "question": {
      "zh": "涉及分钟数的题目需要怎样计算？",
      "en": "How should I handle the minute-based examples?"
    },
    "answer": {
      "zh": "先加任务用时，再与可用容量比较；若超出，算出缺口并核题定的调整规则。新例35+40=75，可用60时差15分钟；算出缺口并不自动授权延期或加班。",
      "en": "Add task durations, compare them with available capacity, then check the stated adjustment rule. In the fresh example, 35 + 40 = 75 against sixty available minutes leaves fifteen missing. Finding a shortfall does not itself authorize rescheduling or overtime."
    }
  },
  {
    "question": {
      "zh": "15/25代表超过了60%的人吗？",
      "en": "Does 15/25 mean I outperformed sixty percent of people?"
    },
    "answer": {
      "zh": "不是。它表示本题本有15项与答案匹配，即60%答对率。没有参照样本，不能换算人群百分位，也不能由此给判断力档次或雇主通过线。",
      "en": "No. It means fifteen responses match the keys, a sixty-percent correct rate on this bank. Without a reference population, it cannot become a percentile, judgement band or employer pass mark."
    }
  },
  {
    "question": {
      "zh": "五份指南会只显示最弱或最强的一份吗？",
      "en": "Will I see only my strongest or weakest guide?"
    },
    "answer": {
      "zh": "五份全部提供，各有七节，共35节；公开页面也可直接阅读。完成结果还给全部25题解析，不按分数锁住内容或要求购买。",
      "en": "All five appear, with seven sections each, thirty-five in total. Public pages are directly readable too. Completion includes all twenty-five explanations without a score-based content lock or purchase requirement."
    }
  },
  {
    "question": {
      "zh": "答错能说明不负责任或不适合团队吗？",
      "en": "Does an incorrect answer show poor responsibility or team fit?"
    },
    "answer": {
      "zh": "不能。它只表示某项选择未匹配本题规则。可以回看漏掉的事实、前置条件或状态区分，不能把单题或五题分项解释为人格、真实行为或录用结论。",
      "en": "No. It indicates a response did not match this exercise’s conditions. Review the missed fact, prerequisite or state distinction; neither one item nor a five-item section establishes personality, observed behaviour or a hiring conclusion."
    }
  },
  {
    "question": {
      "zh": "练习前要提交真实工作资料吗？",
      "en": "Must I submit real workplace information before practising?"
    },
    "answer": {
      "zh": "不用。题目均为给定的虚构材料，不需单位名称、同事姓名、客户资料或内部文档。点击开始即作答；可选进度保存与是否开始无关。",
      "en": "No. The questions supply fictional material and need no employer name, colleague identity, customer information or internal document. Start enters the questions; optional draft saving is separate from starting."
    }
  }
];

export const situationalJudgementLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "美国OPM：情境判断测试的形式、岗位专家与开发考量",
      "en": "U.S. OPM: SJT formats, job experts and development considerations"
    },
    "url": "https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/situational-judgment-tests/"
  }
];
